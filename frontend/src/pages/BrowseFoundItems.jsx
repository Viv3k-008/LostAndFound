import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/browse.css';

const BrowseFoundItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/found-items')
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Found items</h1>
        <p className="page-subtitle">Browse everything reported found so far.</p>
      </div>

      {loading ? (
        <p className="page-subtitle">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Nothing posted yet</p>
          <p>Be the first to report a found item.</p>
        </div>
      ) : (
        <div className="found-grid">
          {items.map((item) => (
            <Link to={`/found/${item._id}`} key={item._id} className="found-card">
              <img src={item.imageUrl} alt={item.category} className="found-thumb" />
              <div className="found-body">
                <span className="badge badge-open">{item.category}</span>
                <p className="found-location">{item.location}</p>
                <p className="found-date">{new Date(item.dateFound).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseFoundItems;