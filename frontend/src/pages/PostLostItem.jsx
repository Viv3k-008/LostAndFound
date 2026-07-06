import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import '../styles/postitem.css';

const PostLostItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/lost-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ category, description, location, dateLost }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(data.matches || []);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Report a lost item</h1>
        <p className="page-subtitle">We'll check it against everything already found so far.</p>
      </div>

      {matches ? (
        <div className="card result-card">
          <h3 className="result-heading">
            {matches.length > 0
              ? `We found ${matches.length} possible match${matches.length > 1 ? 'es' : ''}`
              : 'No matches yet — we\'ll notify you by email if one turns up'}
          </h3>

          {matches.length > 0 && (
            <div className="match-list">
              {matches.map((m) => (
                <div key={m.foundItemId} className="match-item">
                  {m.imageUrl && <img src={m.imageUrl} alt={m.category} className="match-thumb" />}
                  <div>
                    <p className="match-category">{m.category}</p>
                    <p className="match-location">Found at {m.location}</p>
                  </div>
                  <span className="match-score">{m.score}% match</span>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Go to my dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card item-form">
          <label className="field">
            <span className="field-label">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Black leather wallet with a few cards inside"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Location lost</span>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Library, 2nd floor" required />
          </label>

          <label className="field">
            <span className="field-label">Date lost</span>
            <input type="date" value={dateLost} onChange={(e) => setDateLost(e.target.value)} required />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Checking for matches…' : 'Post lost item'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PostLostItem;