import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateEventPage.css';
import SignedInNavbar from '../components/SignedInNavbar';
import { getAuthSession } from '../utils/authSession';

function CreateEventPage() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/events', {
        method: 'POST',
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
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to create event.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="create-event-page">
        <SignedInNavbar title="Create Event" actionLabel="Dashboard" actionPath="/dashboard" />
        <main className="create-event-content">
          <div className="create-event-success">
            <span className="create-event-success-icon">🎉</span>
            <h2>Event Created!</h2>
            <p><strong>{form.title}</strong> has been published and is now live.</p>
            <div className="create-event-success-actions">
              <button className="ce-btn-primary" onClick={() => navigate('/my-events')}>View My Events</button>
              <button className="ce-btn-secondary" onClick={() => { setSubmitted(false); setForm({ title: '', host: session.fullName || session.email, date: '', end_date: '', location: '', description: '' }); }}>
                Create Another
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <SignedInNavbar title="Create Event" actionLabel="Dashboard" actionPath="/dashboard" />

      <main className="create-event-content">
        <div className="create-event-header">
          <h1 className="create-event-heading">Create Event</h1>
          <p className="create-event-sub">
          Every great event starts with a story. Fill in the details below and
          we'll match it with the right audience, putting your event in front
          of the people who'll actually show up.
          </p>
        </div>

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
            <button type="submit" className="ce-btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Event →'}
            </button>
            <button type="button" className="ce-btn-secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateEventPage;


