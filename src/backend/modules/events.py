# Imports
import uuid
from datetime import datetime
from modules.database import database
from modules.engine import give_recommendation

# Variables
events_database = database("Events")
users_database = database("Users")
EVENT_TITLE_MAX_LENGTH = 32
EVENT_HOST_MAX_LENGTH = 64
EVENT_LOCATION_MAX_LENGTH = 128
EVENT_DESCRIPTION_MAX_LENGTH = 1024
AI_CHOICE_MAX_LENGTH = 64

# Functions
def _parse_event_datetime(date: str):
    try:
        return datetime.fromisoformat(date)
    except ValueError:
        raise ValueError("Invalid event date and time")

def _same_event_minute(first_date: str, second_date: str):
    first_time = _parse_event_datetime(first_date).replace(second=0, microsecond=0)
    second_time = _parse_event_datetime(second_date).replace(second=0, microsecond=0)
    return first_time == second_time

def _validate_event_window(start_date: str, end_date: str, allow_existing_past_start: bool = False):
    start_time = _parse_event_datetime(start_date)
    end_time = _parse_event_datetime(end_date)
    current_minute = datetime.now(start_time.tzinfo).replace(second=0, microsecond=0)

    if not allow_existing_past_start and start_time < current_minute:
        raise ValueError("Event date and time cannot be in the past")
    if end_time < start_time:
        raise ValueError("End date and time cannot be before the start")

    return start_date, end_date

def _normalize_location_types(location_types):
    if location_types is None:
        return []

    if not isinstance(location_types, list):
        raise ValueError("Invalid event location type")

    allowed = []
    for item in location_types:
        if not isinstance(item, str):
            continue
        normalized = item.strip()
        if normalized in {"on-campus", "off-campus"} and normalized not in allowed:
            allowed.append(normalized)

    return allowed

def _normalize_event_description(description: str):
    if not isinstance(description, str):
        raise ValueError("Description must be a string")

    trimmed = description.strip()
    if len(trimmed) > EVENT_DESCRIPTION_MAX_LENGTH:
        raise ValueError("Event description is too long")

    return trimmed

def _normalize_event_title(title: str):
    if not isinstance(title, str):
        raise ValueError("Title must be a string")

    normalized = " ".join(title.replace("\r", " ").replace("\n", " ").split())
    if not normalized:
        raise ValueError("Title is required")
    if len(normalized) > EVENT_TITLE_MAX_LENGTH:
        raise ValueError("Event title is too long")

    return normalized

def _normalize_event_host(host: str):
    if not isinstance(host, str):
        raise ValueError("Host must be a string")

    normalized = " ".join(host.strip().split())
    if not normalized:
        raise ValueError("Host is required")
    if len(normalized) > EVENT_HOST_MAX_LENGTH:
        raise ValueError("Event host is too long")

    return normalized

def _normalize_event_location(location: str):
    if not isinstance(location, str):
        raise ValueError("Location must be a string")

    trimmed = location.rstrip()
    if not trimmed:
        raise ValueError("Location is required")
    if len(trimmed) > EVENT_LOCATION_MAX_LENGTH:
        raise ValueError("Event location is too long")

    return trimmed

def _event_expiry_time(event: dict):
    end_date = event.get("end_date") or event.get("date")
    if not end_date:
        return None
    return _parse_event_datetime(end_date)

def _normalize_interest_queries(interests: str):
    if not isinstance(interests, str):
        return []

    normalized = interests.replace("\r", "\n")
    parts = []
    for raw_part in normalized.replace(";", ",").splitlines():
        for chunk in raw_part.split(","):
            cleaned = " ".join(chunk.strip().split())
            if cleaned and cleaned not in parts:
                parts.append(cleaned)

    if not parts:
        fallback = " ".join(normalized.split())
        return [fallback] if fallback else []

    return parts[:8]

def _normalize_event_type_to_tags(event_type: str):
    if event_type == "both":
        return {"on-campus", "off-campus"}
    if event_type in {"on-campus", "off-campus"}:
        return {event_type}
    return set()

def _event_matches_tags(event: dict, allowed_tags: set[str]):
    if not allowed_tags:
        return False

    event_tags = {
        str(tag).strip()
        for tag in (event.get("location_types") or [])
        if isinstance(tag, str) and str(tag).strip()
    }
    if not event_tags:
        return False

    return bool(event_tags & allowed_tags)

def _first_sentence(description: str):
    normalized = (description or "").strip()
    if not normalized:
        return ""

    sentence = normalized.splitlines()[0].strip()
    for marker in [". ", "! ", "? "]:
        if marker in sentence:
            return sentence.split(marker, 1)[0].strip() + marker.strip()

    return sentence

def _event_recommendation_text(event: dict):
    title = " ".join(str(event.get("title", "")).split())
    first_sentence = _first_sentence(str(event.get("description", "")))
    combined = f"{title}. {first_sentence}".strip() if first_sentence else title
    return combined[:AI_CHOICE_MAX_LENGTH].rstrip()

def _extract_ranked_scores(result: dict):
    output = result.get("output")
    if isinstance(output, list):
        return output
    return []

def _normalize_attendee_emails(attendee_emails):
    if not isinstance(attendee_emails, list):
        return []

    normalized = []
    for email in attendee_emails:
        if not isinstance(email, str):
            continue
        cleaned = email.strip().lower()
        if cleaned and cleaned not in normalized:
            normalized.append(cleaned)
    return normalized

def _ensure_event_defaults(event: dict):
    if not isinstance(event, dict):
        return event

    if "attendee_emails" not in event or not isinstance(event.get("attendee_emails"), list):
        event["attendee_emails"] = []
    else:
        event["attendee_emails"] = _normalize_attendee_emails(event.get("attendee_emails"))

    if event.get("created_at") and not event.get("published_at"):
        event["published_at"] = event["created_at"]
    elif event.get("published_at") and not event.get("created_at"):
        event["created_at"] = event["published_at"]

    return event

def _ensure_user_defaults(user: dict):
    if not isinstance(user, dict):
        return user

    if "attending_event_ids" not in user or not isinstance(user.get("attending_event_ids"), list):
        user["attending_event_ids"] = []
    else:
        user["attending_event_ids"] = [str(event_id) for event_id in user.get("attending_event_ids", []) if str(event_id).strip()]

    return user

def _attendee_payload(user: dict, email: str):
    return {
        "email": email,
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "role": user.get("role", "user"),
    }

def _purge_expired_events():
    now = datetime.now()
    for doc in events_database.get_collection():
        event = doc.get("value")
        if not isinstance(event, dict):
            continue

        expiry_time = _event_expiry_time(event)
        if expiry_time is not None and expiry_time < now:
            events_database.remove_document(doc.get("key"))

def _can_manage_event(actor_email: str, event: dict):
    if event.get("owner_email") == actor_email:
        return True

    user, _ = users_database.get_document(actor_email)
    return isinstance(user, dict) and user.get("role") == "admin"

def create_event(owner_email: str, title: str, host: str, date: str, end_date: str, location: str, location_types, description: str):
    title = _normalize_event_title(title)
    host = _normalize_event_host(host)
    date, end_date = _validate_event_window(date, end_date)
    location = _normalize_event_location(location)
    location_types = _normalize_location_types(location_types)
    description = _normalize_event_description(description)
    if not location_types:
        raise ValueError("Select at least one event location type")
    event_id = str(uuid.uuid4())
    published_at = datetime.utcnow().isoformat()
    event = {
        "id": event_id,
        "owner_email": owner_email,
        "title": title,
        "host": host,
        "date": date,
        "end_date": end_date,
        "location": location,
        "location_types": location_types,
        "description": description,
        "published_at": published_at,
        "created_at": published_at,
        "attendee_emails": [],
    }
    events_database.set_document(event_id, event)
    return {"success": True, "message": "Event created", "event": event}

def get_events_by_host(owner_email: str):
    _purge_expired_events()
    all_events = events_database.get_collection()
    events = []
    for doc in all_events:
        event = doc.get("value")
        if not isinstance(event, dict):
            continue
        event = _ensure_event_defaults(event)
        if event.get("owner_email") == owner_email:
            events.append(event)
    events.sort(key=lambda e: e.get("created_at", ""), reverse=True)
    return {"success": True, "events": events}

def get_all_events():
    _purge_expired_events()
    all_events = events_database.get_collection()
    events = []
    for doc in all_events:
        event = doc.get("value")
        if not isinstance(event, dict):
            continue
        event = _ensure_event_defaults(event)
        events.append(event)

    events.sort(key=lambda e: e.get("date", ""))
    return {"success": True, "events": events}

async def get_recommended_events(email: str):
    user, _ = users_database.get_document(email)
    if user is None:
        return {"success": False, "message": "User not found"}

    interests = str(user.get("interests", "")).strip()
    event_type = str(user.get("event_type", "")).strip()
    allowed_tags = _normalize_event_type_to_tags(event_type)
    if not interests or not allowed_tags:
        return {"success": True, "events": [], "ai_ranked": False}

    all_events_response = get_all_events()
    events = all_events_response.get("events", [])
    candidate_events = [event for event in events if _event_matches_tags(event, allowed_tags)]
    if not candidate_events:
        return {"success": True, "events": [], "ai_ranked": False}

    interest_queries = _normalize_interest_queries(interests)
    if not interest_queries:
        return {"success": True, "events": [], "ai_ranked": False}

    event_texts = []
    event_lookup = {}
    for event in candidate_events:
        summary = _event_recommendation_text(event)
        if not summary:
            continue
        if summary in event_lookup:
            summary = f"{summary} [{event.get('id', '')}]"
        event_texts.append(summary)
        event_lookup[summary] = event

    if not event_texts:
        return {"success": True, "events": [], "ai_ranked": False}

    prompts = [f"I want to attend events related to {query}." for query in interest_queries]

    try:
        result = await give_recommendation(prompts, event_texts)
    except Exception:
        return {"success": True, "events": [], "ai_ranked": False}

    ranked_batches = _extract_ranked_scores(result)
    event_scores = {}
    for batch in ranked_batches:
        if not isinstance(batch, list):
            continue

        for item in batch:
            if not isinstance(item, dict):
                continue

            label = item.get("label")
            score = item.get("score")
            if not isinstance(label, str) or not isinstance(score, (int, float)):
                continue
            if score <= 0.25:
                continue

            previous = event_scores.get(label, float("-inf"))
            if score > previous:
                event_scores[label] = float(score)

    ranked_events = []
    for label, score in sorted(event_scores.items(), key=lambda pair: pair[1], reverse=True):
        event = event_lookup.get(label)
        if not event:
            continue

        ranked_event = dict(event)
        ranked_event["ai_ranked"] = True
        ranked_event["ai_score"] = score
        ranked_events.append(ranked_event)

    return {"success": True, "events": ranked_events[:5], "ai_ranked": True}

def get_event(event_id: str):
    event, _ = events_database.get_document(event_id)
    if event is None:
        return {"success": False, "message": "Event not found"}
    event = _ensure_event_defaults(event)
    events_database.set_document(event_id, event)
    return {"success": True, "event": event}

def get_event_attendees(event_id: str):
    event, _ = events_database.get_document(event_id)
    if event is None:
        return {"success": False, "message": "Event not found"}

    event = _ensure_event_defaults(event)
    events_database.set_document(event_id, event)

    attendees = []
    for email in event.get("attendee_emails", []):
        user, _ = users_database.get_document(email)
        if not isinstance(user, dict):
            continue
        user = _ensure_user_defaults(user)
        users_database.set_document(email, user)
        attendees.append(_attendee_payload(user, email))

    attendees.sort(key=lambda person: (person.get("first_name", ""), person.get("last_name", ""), person.get("email", "")))
    return {"success": True, "event_id": event_id, "attendees": attendees, "attendee_count": len(attendees)}

def attend_event(event_id: str, email: str):
    event, _ = events_database.get_document(event_id)
    if event is None:
        return {"success": False, "message": "Event not found"}

    user, _ = users_database.get_document(email)
    if user is None:
        return {"success": False, "message": "User not found"}

    event = _ensure_event_defaults(event)
    user = _ensure_user_defaults(user)

    event_attendees = event.get("attendee_emails", [])
    if email not in event_attendees:
        event_attendees.append(email)
    event["attendee_emails"] = _normalize_attendee_emails(event_attendees)

    attending_ids = user.get("attending_event_ids", [])
    if event_id not in attending_ids:
        attending_ids.append(event_id)
    user["attending_event_ids"] = [str(value) for value in attending_ids if str(value).strip()]

    events_database.set_document(event_id, event)
    users_database.set_document(email, user)

    return {"success": True, "message": "Attending event", "attending": True, "attendee_count": len(event["attendee_emails"]) }

def unattend_event(event_id: str, email: str):
    event, _ = events_database.get_document(event_id)
    if event is None:
        return {"success": False, "message": "Event not found"}

    user, _ = users_database.get_document(email)
    if user is None:
        return {"success": False, "message": "User not found"}

    event = _ensure_event_defaults(event)
    user = _ensure_user_defaults(user)

    event["attendee_emails"] = [attendee for attendee in event.get("attendee_emails", []) if attendee != email]
    user["attending_event_ids"] = [event_ref for event_ref in user.get("attending_event_ids", []) if event_ref != event_id]

    events_database.set_document(event_id, event)
    users_database.set_document(email, user)

    return {"success": True, "message": "Unattending event", "attending": False, "attendee_count": len(event["attendee_emails"]) }

def update_event(event_id: str, owner_email: str, title: str, host: str, date: str, end_date: str, location: str, location_types, description: str):
    event, _ = events_database.get_document(event_id)
    if event is None:
        return {"success": False, "message": "Event not found"}

    if not _can_manage_event(owner_email, event):
        return {"success": False, "message": "You can only edit your own events"}

    title = _normalize_event_title(title)
    host = _normalize_event_host(host)
    allow_existing_past_start = _same_event_minute(date, event.get("date"))
    date, end_date = _validate_event_window(date, end_date, allow_existing_past_start=allow_existing_past_start)
    location = _normalize_event_location(location)
    location_types = _normalize_location_types(location_types)
    description = _normalize_event_description(description)
    if not location_types:
        raise ValueError("Select at least one event location type")

    event.update({
        "title": title,
        "host": host,
        "date": date,
        "end_date": end_date,
        "location": location,
        "location_types": location_types,
        "description": description,
    })
    events_database.set_document(event_id, event)
    return {"success": True, "message": "Event updated", "event": event}

def delete_event(event_id: str, owner_email: str):
    event, _ = events_database.get_document(event_id)
    if event is None:
        return {"success": False, "message": "Event not found"}

    if not _can_manage_event(owner_email, event):
        return {"success": False, "message": "You can only delete your own events"}

    events_database.remove_document(event_id)
    return {"success": True, "message": "Event deleted"}

# Initialize
__all__ = [
    "create_event",
    "get_events_by_host",
    "get_all_events",
    "get_recommended_events",
    "get_event",
    "get_event_attendees",
    "attend_event",
    "unattend_event",
    "update_event",
    "delete_event",
]
