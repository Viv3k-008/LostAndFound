import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/detail.css';
import '../styles/postitem.css';

const FoundItemDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    fetch(`/api/found-items/${id}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .catch(() => setItem(null));
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ foundItemId: id, submittedAnswer: answer }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimResult(data);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="page">
        <p className="page-subtitle">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="detail-layout">
        <img src={item.imageUrl} alt={item.category} className="detail-image" />

        <div className="detail-content">
          <span className="badge badge-open">{item.category}</span>
          <h1 className="page-title detail-title">{item.description}</h1>
          <p className="detail-meta">Found at {item.location} · {new Date(item.dateFound).toLocaleDateString()}</p>

          {item.status !== 'open' ? (
            <div className="card">
              <p className="page-subtitle">This item has already been claimed.</p>
            </div>
          ) : claimResult ? (
            <div className="card result-card">
              <h3 className="result-heading">Claim submitted</h3>
              <p className="page-subtitle">
                The finder will review your answer (confidence: {claimResult.confidence}) and get back to you.
                You'll see their contact details here once approved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleClaim} className="card claim-form">
              <p className="verification-label">Is this yours?</p>
              <p className="verification-hint">{item.verificationQuestion}</p>

              <label className="field">
                <span className="field-label">Your answer</span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer"
                  required
                />
              </label>

              {error && <p className="form-error" role="alert">{error}</p>}

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit claim'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoundItemDetail;