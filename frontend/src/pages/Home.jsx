import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="home-glow" aria-hidden="true"></div>

      <section className="hero">
        <span className="hero-stamp">CAMPUS LOST &amp; FOUND NETWORK</span>
        <h1 className="hero-title">
          Lost something?<br />Someone may have already found it.
        </h1>
        <p className="hero-subtitle">
          Post what you lost or found, and we'll match them automatically —
          no more checking a random box at the security desk.
        </p>
        <div className="hero-actions">
          <Link to="/post-lost" className="btn">I lost something</Link>
          <Link to="/post-found" className="btn btn-outline">I found something</Link>
        </div>
      </section>

      <section className="steps">
        <div className="step-card">
          <span className="step-number">01</span>
          <h3>Post it</h3>
          <p>Describe what you lost or found — category, location, date, and a photo if you have one.</p>
        </div>
        <div className="step-card">
          <span className="step-number">02</span>
          <h3>Get matched</h3>
          <p>Our matching engine compares descriptions, location, and timing to surface likely matches.</p>
        </div>
        <div className="step-card">
          <span className="step-number">03</span>
          <h3>Verify &amp; claim</h3>
          <p>Answer the finder's verification question. Contact details are shared only once they approve.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;