import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <div className="placeholder-page">
      <button className="back-btn" onClick={() => navigate('/login')}>← Back</button>
      <h1>Forgot Password</h1>
      <p>Coming soon.</p>
    </div>
  );
}

export default ForgotPasswordPage;
