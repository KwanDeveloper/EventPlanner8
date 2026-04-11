import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyEventsPage.css';
import SignedInNavbar from '../components/SignedInNavbar';
import { getAuthSession } from '../utils/authSession';

function MyEventsPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session.signedIn) { navigate('/login'); return; }
    if (session.role !== 'hoster' && session.role !== 'admin') { navigate('/dashboard'); return; }

    fetch(`http://localhost:8000/events/host?email=${encodeURIComponent(session.email)}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setEvents(data.events); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate, session.signedIn, session.role, session.email]);

  if (!session.signedIn || (session.role !== 'hoster' && session.role !== 'admin')) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    const dateOnly = new Date(`${dateStr}T00:00:00`);
    if (!Number.isNaN(dateOnly.getTime())) {
      return dateOnly.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return dateStr;
  };

  const formatEventWindow = (start, end) => {
    const startLabel = formatDate(start);
    const endLabel = formatDate(end);
    return { startLabel, endLabel };
  };

  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${encodeURIComponent(eventId)}`);
  };

  return (
    <div className="my-events-page">
      <SignedInNavbar title="My Events" actionLabel="Dashboard" actionPath="/dashboard" />

      <main className="my-events-content">
        <div className="my-events-header">
          <h1 className="my-events-heading">My Events</h1>
          <p className="my-events-sub">All events you've created, in one place.</p>
          <button className="my-events-create-btn" onClick={() => navigate('/create-event')}>
            + Create Event
          </button>
        </div>

        {loading ? (
          <p className="my-events-loading">Loading your events...</p>
        ) : events.length === 0 ? (
          <div className="my-events-empty">
            <span className="my-events-empty-icon">📅</span>
            <p>You haven't created any events yet.</p>
            <button className="my-events-create-btn" onClick={() => navigate('/create-event')}>
              Create your first event
            </button>
          </div>
        ) : (
          <div className="my-events-grid">
            {events.map((event) => (
              <div className="my-event-tile" key={event.id}>
                <div className="my-event-title-row">
                  <h3 className="my-event-title">{event.title}</h3>
                  <button
                    type="button"
                    className="my-event-menu-btn"
                    onClick={() => handleEditEvent(event.id)}
                    aria-label={`Edit ${event.title}`}
                    title="Edit event"
                  >
                    ...
                  </button>
                </div>
                <div className="my-event-meta-group">
                  <p className="my-event-meta">{event.host}</p>
                  {(() => {
                    const { startLabel, endLabel } = formatEventWindow(event.date, event.end_date);
                    return (
                      <>
                        {startLabel && <p className="my-event-date"><span>Starts:</span> {startLabel}</p>}
                        {endLabel && <p className="my-event-date"><span>Ends:</span> {endLabel}</p>}
                      </>
                    );
                  })()}
                </div>
                <p className="my-event-location">📍 {event.location}</p>
                <p className="my-event-desc">{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyEventsPage;


