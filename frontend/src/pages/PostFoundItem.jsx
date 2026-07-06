import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import '../styles/postitem.css';

const PostFoundItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateFound, setDateFound] = useState('');
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!image) {
      setError('Please attach a photo of the item.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('dateFound', dateFound);
      formData.append('verificationQuestion', verificationQuestion);
      formData.append('verificationAnswer', verificationAnswer);
      formData.append('image', image);

      const res = await fetch('/api/found-items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data);
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
        <h1 className="page-title">Report a found item</h1>
        <p className="page-subtitle">Set a private verification question only the real owner could answer.</p>
      </div>

      {success ? (
        <div className="card result-card">
          <h3 className="result-heading">Thanks — posted successfully</h3>
          <p className="page-subtitle">
            {success.matchesNotified > 0
              ? `We notified ${success.matchesNotified} possible owner(s) who reported a matching lost item.`
              : "No matching lost-item reports yet — we'll notify someone automatically if one is posted."}
          </p>
          <button className="btn btn-outline" onClick={() => navigate('/browse')}>
            View found items feed
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card item-form" encType="multipart/form-data">
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
              placeholder="e.g. Brown leather wallet, a few cards inside"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Location found</span>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Library, 2nd floor" required />
          </label>

          <label className="field">
            <span className="field-label">Date found</span>
            <input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} required />
          </label>

          <label className="field">
            <span className="field-label">Photo of the item</span>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
          </label>

          <div className="verification-block">
            <p className="verification-label">Verification question</p>
            <p className="verification-hint">
              Ask something visible only to the real owner — not something shown in your photo or description.
            </p>
            <label className="field">
              <span className="field-label">Question</span>
              <input
                type="text"
                value={verificationQuestion}
                onChange={(e) => setVerificationQuestion(e.target.value)}
                placeholder="e.g. What's written on the inside cover?"
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Answer (kept private)</span>
              <input
                type="text"
                value={verificationAnswer}
                onChange={(e) => setVerificationAnswer(e.target.value)}
                placeholder="Only you will see this"
                required
              />
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Posting…' : 'Post found item'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PostFoundItem;