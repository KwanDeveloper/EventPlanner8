import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="signup-page">
      <div className="signup-card">
        <button className="back-btn" onClick={() => navigate('/login')}>← Back</button>
        <div className="signup-logo">
          <span>🗓️</span>
          <span className="signup-logo-text">Event Planners</span>
        </div>
        <h2 className="signup-heading">Create an account</h2>
        <p className="signup-sub">Join the community today</p>

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" placeholder="John" />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" placeholder="Doe" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" placeholder="(555) 000-0000" />
          </div>

          <div className="terms-row">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              I agree to the <span className="terms-link">Terms and Conditions</span>
            </label>
          </div>

          <button type="submit" className="signup-btn">Create Account</button>
        </form>

        <p className="signup-footer">
          Already have an account?{' '}
          <span className="signup-link" onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
