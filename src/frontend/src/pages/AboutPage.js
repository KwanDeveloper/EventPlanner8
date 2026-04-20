import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/AboutPage.css';
import SiteNavbar from '../components/SiteNavbar';

function setMetaAttribute(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
}

function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const previousTitle = document.title;
    const selectors = {
      description: 'meta[name="description"]',
      ogTitle: 'meta[property="og:title"]',
      ogDescription: 'meta[property="og:description"]',
      twitterTitle: 'meta[name="twitter:title"]',
      twitterDescription: 'meta[name="twitter:description"]',
      canonical: 'link[rel="canonical"]'
    };
    const previousValues = {
      description: document.head.querySelector(selectors.description)?.getAttribute('content') ?? '',
      ogTitle: document.head.querySelector(selectors.ogTitle)?.getAttribute('content') ?? '',
      ogDescription: document.head.querySelector(selectors.ogDescription)?.getAttribute('content') ?? '',
      twitterTitle: document.head.querySelector(selectors.twitterTitle)?.getAttribute('content') ?? '',
      twitterDescription: document.head.querySelector(selectors.twitterDescription)?.getAttribute('content') ?? '',
      canonical: document.head.querySelector(selectors.canonical)?.getAttribute('href') ?? ''
    };

    document.title = 'EventPlanner8';
    setMetaAttribute(
      selectors.description,
      'content',
      'Learn how EventPlanner8 is built, meet the student developers behind the AI-powered event platform, and explore the frontend, backend, database, and machine learning work behind local event discovery.'
    );
    setMetaAttribute(
      selectors.ogTitle,
      'content',
      'About EventPlanner8 AI Event Platform and Developers'
    );
    setMetaAttribute(
      selectors.ogDescription,
      'content',
      'Meet the EventPlanner8 developers and see how the student-built AI-powered platform combines React, FastAPI, MongoDB, and machine learning for local event discovery.'
    );
    setMetaAttribute(
      selectors.twitterTitle,
      'content',
      'About EventPlanner8 AI Event Platform and Developers'
    );
    setMetaAttribute(
      selectors.twitterDescription,
      'content',
      'Meet the developers behind EventPlanner8 and learn how its AI-powered local event discovery platform is built.'
    );
    setMetaAttribute(selectors.canonical, 'href', 'http://eventplanner8.com/about');

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About EventPlanner8',
      url: 'http://eventplanner8.com/about',
      description: 'About the EventPlanner8 platform, its AI-powered event discovery system, and the developers who built it.',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'Person',
            name: 'Carlos Salcedo',
            jobTitle: 'Frontend Developer'
          },
          {
            '@type': 'Person',
            name: 'Kwanyoung Kim',
            jobTitle: 'Backend Developer'
          },
          {
            '@type': 'Person',
            name: 'Joseph Reilly',
            jobTitle: 'Frontend/Backend Developer'
          },
          {
            '@type': 'Person',
            name: 'Rishabh Fuke',
            jobTitle: 'Machine Learning Researcher and Backend Developer'
          }
        ]
      }
    };

    const structuredDataScript = document.createElement('script');
    structuredDataScript.type = 'application/ld+json';
    structuredDataScript.setAttribute('data-page-schema', 'about');
    structuredDataScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(structuredDataScript);

    return () => {
      document.title = previousTitle;
      setMetaAttribute(selectors.description, 'content', previousValues.description);
      setMetaAttribute(selectors.ogTitle, 'content', previousValues.ogTitle);
      setMetaAttribute(selectors.ogDescription, 'content', previousValues.ogDescription);
      setMetaAttribute(selectors.twitterTitle, 'content', previousValues.twitterTitle);
      setMetaAttribute(selectors.twitterDescription, 'content', previousValues.twitterDescription);
      setMetaAttribute(selectors.canonical, 'href', previousValues.canonical);
      structuredDataScript.remove();
    };
  }, []);

  return (
    <div className="app">
      <SiteNavbar />

      <section className="hero about-hero">
        <h1 className="hero-heading">
          Built for people who<br />
          <span className="highlight">love great events.</span>
        </h1>
        <p className="hero-sub">
          <strong>EventPlanner8</strong> is a student-built platform from the <strong>University of Florida</strong> connecting people with local events tailored to their interests, powered by smart recommendations and a verified host ecosystem.
        </p>

        <div className="hero-buttons about-actions">
          <button className="btn-primary about-back-btn" onClick={() => navigate('/')}>← Go Back</button>
        </div>

        <div className="cards" style={{ marginBottom: '56px' }}>
          <div className="card">
            <div className="card-icon icon-pink">⭐</div>
            <h3>Personalized Suggestions</h3>
            <p>Get event suggestions tailored to your interests, so you can quickly find things you actually enjoy.</p>
          </div>
          <div className="card">
            <div className="card-icon icon-blue">📍</div>
            <h3>Location-Based Events</h3>
            <p>See events near you and discover what&apos;s happening around campus and in your local area.</p>
          </div>
          <div className="card">
            <div className="card-icon icon-green">🛡️</div>
            <h3>Security in Mind</h3>
            <p>Verified hosts and active moderation keep listings trustworthy, so the community stays safe and welcoming.</p>
          </div>
        </div>

        <div className="about-section">
          <h2 className="about-heading">How It&apos;s Built</h2>
          <p className="about-text">
            EventPlanner8 is built with a modern web stack and designed to be simple,
            fast, and reliable for discovering and hosting local events.
            We keep recommendations helpful, moderation strong, and the overall
            experience focused on community.
          </p>
          <p className="about-text">
            EventPlanner8 is open source here:{' '}
            <a
              className="about-link"
              href="https://github.com/josephreilly22/cen3031-teamproject"
              target="_blank"
              rel="noreferrer"
            >
              github.com/josephreilly22/cen3031-teamproject
            </a>
          </p>
        </div>

        <div className="about-section about-team-section">
          <h2 className="about-heading">Meet the Developers</h2>
          <p className="about-text about-team-intro">
            EventPlanner8 was built by a student team at the University of Florida,
            with each developer owning a core part of the product across frontend,
            backend, infrastructure, and machine learning. Go Gators! 🐊
          </p>

          <div className="developer-grid">
            <article className="developer-card">
              <div className="developer-badge" aria-hidden="true">UI</div>
              <div className="developer-content">
                <h3 className="developer-name">Carlos Salcedo</h3>
                <ul className="developer-list">
                  <li><strong>Main</strong> frontend developer</li>
                  <li><strong>Assistant</strong> for frontend/backend connection and routing</li>
                  <li><strong>Designer</strong> for React UI and project testing</li>
                </ul>
              </div>
            </article>

            <article className="developer-card">
              <div className="developer-badge" aria-hidden="true">DB</div>
              <div className="developer-content">
                <h3 className="developer-name">Kwanyoung Kim</h3>
                <ul className="developer-list">
                  <li><strong>Main</strong> backend developer</li>
                  <li><strong>Manager</strong> for MongoDB database</li>
                  <li><strong>Assistant</strong> for ML integration, hosting, and project organization</li>
                </ul>
              </div>
            </article>

            <article className="developer-card">
              <div className="developer-badge" aria-hidden="true">API</div>
              <div className="developer-content">
                <h3 className="developer-name">Joseph Reilly</h3>
                <ul className="developer-list">
                  <li><strong>Main</strong> frontend/backend connector and FastAPI routing owner</li>
                  <li><strong>Co-frontend</strong> developer</li>
                  <li><strong>Manager</strong> for repository and SCRUM planning</li>
                </ul>
              </div>
            </article>

            <article className="developer-card">
              <div className="developer-badge" aria-hidden="true">AI</div>
              <div className="developer-content">
                <h3 className="developer-name">Rishabh Fuke</h3>
                <ul className="developer-list">
                  <li><strong>Main</strong> machine learning researcher and designer</li>
                  <li><strong>Co-backend</strong> developer</li>
                  <li><strong>Designer</strong> for interest-based event personalization and sorting</li>
                </ul>
              </div>
            </article>
          </div>
        </div>

      </section>
    </div>
  );
}

export default AboutPage;
