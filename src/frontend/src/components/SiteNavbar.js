import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import { getAuthSession } from '../utils/authSession';

function SiteNavbar({
  title,
  primaryLabel,
  primaryPath,
  secondaryLabel,
  secondaryPath,
}) {
  const navigate = useNavigate();
  const session = getAuthSession();

  const resolvedSecondaryLabel = session.signedIn
    ? (secondaryLabel === undefined ? 'Dashboard' : secondaryLabel)
    : (secondaryLabel === undefined ? 'Sign In' : secondaryLabel);
  const resolvedSecondaryPath = session.signedIn
    ? (secondaryPath === undefined
        ? (session.onboardingComplete ? '/dashboard' : '/onboarding')
        : secondaryPath)
    : (secondaryPath === undefined ? '/login' : secondaryPath);

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="Event Planner" className="logo-icon" />
        <span className="logo-text">Event Planners</span>
      </div>
      {title && <span className="site-navbar-title">{title}</span>}
      <div className="nav-buttons">
        {primaryLabel && primaryPath && (
          <button className="btn-secondary nav-cta" onClick={() => navigate(primaryPath)}>{primaryLabel}</button>
        )}
        {resolvedSecondaryLabel && resolvedSecondaryPath && (
          <button className="nav-register" onClick={() => navigate(resolvedSecondaryPath)}>{resolvedSecondaryLabel}</button>
        )}
      </div>
    </nav>
  );
}

export default SiteNavbar;
