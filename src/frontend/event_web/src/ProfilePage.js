import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

function ProfilePage() {
  const navigate = useNavigate();
  return (
    <div className="placeholder-page">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>Profile</h1>
      <p>Coming soon.</p>
    </div>
  );
}

export default ProfilePage;
