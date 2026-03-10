import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="login-logo">
          <span>🗓️</span>
          <span className="login-logo-text">Event Planners</span>
        </div>
        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to your account</p>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <span className="forgot-link" onClick={() => navigate('/forgotpassword')}>Forgot password?</span>
            </div>
            <input type="password" id="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <span className="login-link" onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
