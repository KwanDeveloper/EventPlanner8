import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OnboardingPage.css';
import '../styles/ProfilePage.css';
import '../styles/SignupPage.css';
import SignedInNavbar from '../components/SignedInNavbar';
import { getAuthSession, setOnboardingState } from '../utils/authSession';

function OnboardingPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [interests, setInterests] = useState('');
  const [eventType, setEventType] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.signedIn) {
      navigate('/login');
      return;
    }

    if (session.onboardingComplete) {
      navigate('/dashboard');
    }
  }, [navigate, session.onboardingComplete, session.signedIn]);

  if (!session.signedIn || session.onboardingComplete) {
    return null;
  }

  const handleSave = async () => {
    if (!eventType) {
      setError('Please select an event preference.');
      return;
    }

    setError('');
    let data;

    try {
      const res = await fetch('http://localhost:8000/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.email,
          first_name: session.firstName,
          last_name: session.lastName,
          interests,
          event_type: eventType,
          password: '',
          confirm_password: '',
          onboarding_complete: true,
        }),
      });
      data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to save.');
        return;
      }
    } catch {
      setError('Could not connect to server.');
      return;
    }

    setOnboardingState(Boolean(data.user?.onboarding_complete));
    setSaved(true);
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="onboarding">
      <SignedInNavbar title="Onboarding" />

      <main className="onboarding-content">
        <div className="onboarding-header">
          <h1 className="onboarding-heading">Onboarding</h1>
          <p className="onboarding-sub">
            Help us personalize your experience. Tell us what you&apos;re into and where
            you like to explore, we&apos;ll use it to surface events that are actually
            worth your time.
          </p>
        </div>

        <div className="onboarding-card">
          <div className="card-label-row">
            <span className="card-icon-bubble icon-blue" aria-hidden="true">✨</span>
            <h2 className="card-section-title">Your Interests</h2>
          </div>
          <p className="card-section-sub">
            What topics, activities, or themes get you excited? The more specific, the better.
          </p>
          <textarea
            className="interests-input"
            placeholder="e.g. live music, hackathons, cooking, film screenings, community volunteering..."
            value={interests}
            onChange={(e) => setInterests(e.target.value.slice(0, 256))}
            rows={4}
            maxLength={256}
          />
          <p className="interests-char-count">{interests.length} / 256</p>
        </div>

        <div className="onboarding-card">
          <div className="card-label-row">
            <span className="card-icon-bubble icon-pink" aria-hidden="true">📍</span>
            <h2 className="card-section-title">Event Preferences</h2>
          </div>
          <p className="card-section-sub">
            What kind of events are you looking for?
          </p>
          <div className="event-type-buttons">
            <button
              className={`event-type-btn ${eventType === 'on-campus' ? 'active' : ''}`}
              onClick={() => setEventType('on-campus')}
            >
              On-Campus
            </button>
            <button
              className={`event-type-btn ${eventType === 'off-campus' ? 'active' : ''}`}
              onClick={() => setEventType('off-campus')}
            >
              Off-Campus
            </button>
            <button
              className={`event-type-btn ${eventType === 'both' ? 'active' : ''}`}
              onClick={() => setEventType('both')}
            >
              Both
            </button>
          </div>
        </div>

        <div className="onboarding-card event-leader-card">
          <div className="card-label-row">
            <span className="card-icon-bubble icon-green" aria-hidden="true">🎯</span>
            <h2 className="card-section-title">Become an Event Leader</h2>
          </div>
          <p className="card-section-sub">
            Do you run clubs, organize meetups, or want to host events for your community?
            Register as an event leader to get access to hosting tools, verified visibility,
            and a dedicated organizer dashboard.
          </p>
          <button
            className="event-leader-btn"
            onClick={() => navigate('/host-registeration', { state: { from: 'onboarding' } })}
          >
            Register as an Event Leader →
          </button>
        </div>

        {error && <p className="signup-error onboarding-error-banner">⚠ {error}</p>}

        <div className="onboarding-actions">
          <button className="save-btn" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Preferences'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default OnboardingPage;


