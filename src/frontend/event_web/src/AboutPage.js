import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="placeholder-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <h1>About</h1>
      <p>Coming soon.</p>
    </div>
  );
}

export default AboutPage;
