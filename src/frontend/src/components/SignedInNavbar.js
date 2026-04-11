import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardPage.css';
import { clearAuthSession, getAuthSession, setOnboardingState, setUserRole } from '../utils/authSession';

function SignedInNavbar({ title, actionLabel, actionPath, actions, onBeforeNavigate, onBeforeLogout }) {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [role, setRole] = useState(session.role);
  const [onboardingComplete, setOnboardingComplete] = useState(session.onboardingComplete);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      if (!session.signedIn || !session.email) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/profile?email=${encodeURIComponent(session.email)}`);
        const data = await response.json();

        if (!cancelled && data.success) {
          const nextRole = data.role || session.role || 'user';
          const nextOnboardingComplete = Boolean(data.onboarding_complete);

          setRole(nextRole);
          setOnboardingComplete(nextOnboardingComplete);
          setUserRole(nextRole);
          setOnboardingState(nextOnboardingComplete);
        }
      } catch {
        // Keep the cookie-backed session if the profile lookup fails.
      }
    };

    syncSession();

    return () => {
      cancelled = true;
    };
  }, [session.email, session.role, session.signedIn]);

  const guardedNavigate = (path) => {
    if (onBeforeNavigate && onBeforeNavigate(path) === false) {
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    if (onBeforeLogout && onBeforeLogout() === false) {
      return;
    }
    clearAuthSession();
    navigate('/');
  };

  const buttons = actions || (actionLabel && actionPath ? [{ label: actionLabel, path: actionPath }] : []);
  const resolvePath = (path) => {
    if (path === '/dashboard' && !onboardingComplete) {
      return '/onboarding';
    }
    return path;
  };

  return (
    <nav className="dashboard-navbar">
      <div className="logo signed-in-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="Event Planner" className="logo-icon" />
        <span className="logo-text">Event Planners</span>
      </div>
      <span className="navbar-title">{title}</span>
      <div className="nav-buttons">
        {(role === 'hoster' || role === 'admin') && (
          <button className="nav-cta" onClick={() => guardedNavigate('/my-events')}>My Events</button>
        )}
        {role === 'admin' && (
          <button className="nav-cta" onClick={() => guardedNavigate('/admin')}>Admin Dashboard</button>
        )}
        {buttons.map(({ label, path }) => (
          <button key={path} className="nav-cta" onClick={() => guardedNavigate(resolvePath(path))}>{label}</button>
        ))}
        <button className="nav-logout" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}

export default SignedInNavbar;
