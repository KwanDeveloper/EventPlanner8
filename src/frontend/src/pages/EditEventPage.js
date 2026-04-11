import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/CreateEventPage.css';
import SignedInNavbar from '../components/SignedInNavbar';
import { getAuthSession } from '../utils/authSession';

function EditEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const session = getAuthSession();
  const getMinDateTime = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };
  const getEndMinDateTime = () => form.date || getMinDateTime();

  const [form, setForm] = useState({
    title: '',
    host: session.fullName || session.email,
    date: '',
    end_date: '',
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [initialForm, setInitialForm] = useState(null);

  const normalizeDateTime = (value) => {
    if (!value) return '';

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const pad = (num) => String(num).padStart(2, '0');
      const year = parsed.getFullYear();
      const month = pad(parsed.getMonth() + 1);
      const day = pad(parsed.getDate());
      const hours = pad(parsed.getHours());
      const minutes = pad(parsed.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return value.slice(0, 16);
  };

  const plusOneHour = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    parsed.setHours(parsed.getHours() + 1);
    return normalizeDateTime(parsed.toISOString());
  };

  useEffect(() => {
    if (!session.signedIn) {
      navigate('/login');
      return;
    }
    if (session.role !== 'hoster' && session.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetch(`http://localhost:8000/events/${encodeURIComponent(eventId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const event = data.event;
          if (event.owner_email !== session.email) {
            setError('You can only edit your own events.');
            return;
          }

          setForm({
            title: event.title || '',
            host: event.host || session.fullName || session.email,
            date: normalizeDateTime(event.date),
            end_date: normalizeDateTime(event.end_date || plusOneHour(event.date)),
            location: event.location || '',
            description: event.description || '',
          });
          setInitialForm({
            title: event.title || '',
            host: event.host || session.fullName || session.email,
            date: normalizeDateTime(event.date),
            end_date: normalizeDateTime(event.end_date || plusOneHour(event.date)),
            location: event.location || '',
            description: event.description || '',
          });
          setLoaded(true);
        } else {
          setError(data.message || 'Event not found.');
        }
      })
      .catch(() => setError('Could not connect to server.'))
      .finally(() => setLoading(false));
  }, [eventId, navigate, session.email, session.fullName, session.role, session.signedIn]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const hasUnsavedChanges = Boolean(
    initialForm && (
      form.title !== initialForm.title ||
      form.host !== initialForm.host ||
      form.date !== initialForm.date ||
      form.end_date !== initialForm.end_date ||
      form.location !== initialForm.location ||
      form.description !== initialForm.description
    )
  );

  const confirmLeave = () => {
    if (!hasUnsavedChanges) {
      return true;
    }

    return window.confirm('You have unsaved event changes. Leave without saving?');
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.host.trim() || !form.date.trim() || !form.location.trim() || !form.description.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!form.end_date.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (new Date(form.date) < new Date()) {
      setError('Event date and time cannot be in the past.');
      return;
    }

    if (new Date(form.end_date) < new Date(form.date)) {
      setError('End date and time cannot be before the start.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/events/${encodeURIComponent(eventId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_email: session.email,
          title: form.title,
          host: form.host,
          date: form.date,
          end_date: form.end_date,
          location: form.location,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/my-events');
      } else {
        setError(data.message || 'Failed to update event.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) {
      return;
    }

    setError('');
    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:8000/events/${encodeURIComponent(eventId)}?owner_email=${encodeURIComponent(session.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        navigate('/my-events');
      } else {
        setError(data.message || 'Failed to delete event.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  if (!session.signedIn || (session.role !== 'hoster' && session.role !== 'admin')) return null;

  return (
    <div className="create-event-page">
      <SignedInNavbar
        title="Edit Event"
        actionLabel="Dashboard"
        actionPath="/dashboard"
        onBeforeNavigate={confirmLeave}
        onBeforeLogout={confirmLeave}
      />

      <main className="create-event-content">
        <div className="create-event-header">
          <h1 className="create-event-heading">Edit Event</h1>
          <p className="create-event-sub">
            Update the details for this event and keep everything current for your audience.
          </p>
        </div>

        {loading ? (
          <p className="ce-loading">Loading event...</p>
        ) : loaded ? (
          <form className="create-event-form" onSubmit={handleSubmit} noValidate>
            <div className="ce-field">
              <label>Event Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Spring Hackathon 2025"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ce-field">
              <label>Host</label>
              <input
                type="text"
                name="host"
                placeholder="e.g. John Doe, Jane Doe, Gator Events Club"
                value={form.host}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ce-field">
              <label>Start Date and Time</label>
              <input
                type="datetime-local"
                name="date"
                min={getMinDateTime()}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            {form.date && (
              <div className="ce-field">
                <label>End Date and Time</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  min={getEndMinDateTime()}
                  value={form.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="ce-field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Reitz Union Room 2365, or Off-Campus address"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ce-field">
              <label>Event Description</label>
              <textarea
                name="description"
                rows={5}
                placeholder="Tell people what to expect, the vibe, the agenda, who it's for, and why they shouldn't miss it."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="ce-error">{error}</p>}

            <div className="ce-actions">
              <button type="submit" className="ce-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes →'}
              </button>
              <button type="button" className="ce-btn-secondary ce-btn-danger" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
              <button type="button" className="ce-btn-secondary" onClick={() => { if (confirmLeave()) navigate('/my-events'); }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          error && <p className="ce-error">{error}</p>
        )}
      </main>
    </div>
  );
}

export default EditEventPage;


