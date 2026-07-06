import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const TABS = ['My Lost Items', 'My Found Items'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claimsByItem, setClaimsByItem] = useState({});
  const [claimsLoading, setClaimsLoading] = useState({});
  const [claimsError, setClaimsError] = useState({});
  const [revealedContacts, setRevealedContacts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch lost + found items
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const authHeader = { Authorization: `Bearer ${user.token}` };

    Promise.all([
      fetch('/api/lost-items/mine', { headers: authHeader }).then((r) => r.json()),
      fetch('/api/found-items/mine', { headers: authHeader }).then((r) => r.json()),
    ])
      .then(([lost, found]) => {
        setLostItems(Array.isArray(lost) ? lost : []);
        setFoundItems(Array.isArray(found) ? found : []);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  // Define loadClaims BEFORE any effect that depends on it
  const loadClaims = useCallback(
    async (foundItemId) => {
      setClaimsLoading((prev) => ({ ...prev, [foundItemId]: true }));
      setClaimsError((prev) => ({ ...prev, [foundItemId]: null }));

      try {
        const res = await fetch(`/api/claims/found/${foundItemId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        console.log('response status:', res.status);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error('Failed to load claims:', res.status, data);
          setClaimsError((prev) => ({
            ...prev,
            [foundItemId]: data?.message || `Failed to load claims (${res.status})`,
          }));
          setClaimsByItem((prev) => ({ ...prev, [foundItemId]: [] }));
          return;
        }

        setClaimsByItem((prev) => ({ ...prev, [foundItemId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error('Error loading claims:', err);
        setClaimsError((prev) => ({ ...prev, [foundItemId]: 'Something went wrong loading claims.' }));
        setClaimsByItem((prev) => ({ ...prev, [foundItemId]: [] }));
      } finally {
        setClaimsLoading((prev) => ({ ...prev, [foundItemId]: false }));
      }
    },
    [user]
  );

  const decideClaim = useCallback(
    async (claimId, foundItemId, decision) => {
      try {
        const res = await fetch(`/api/claims/${claimId}/${decision}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error('Failed to decide claim:', res.status, data);
          setClaimsError((prev) => ({ ...prev, [foundItemId]: data?.message || 'Action failed' }));
          return;
        }

        if (decision === 'approve' && data?.claimantContact) {
          setRevealedContacts((prev) => ({
            ...prev,
            [claimId]: { finderContact: data.finderContact, claimantContact: data.claimantContact },
          }));
        }
      } catch (err) {
        console.error('Error deciding claim:', err);
      } finally {
        loadClaims(foundItemId);
      }
    },
    [user, loadClaims]
  );

  if (!user) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track your reports and review claims on things you've found.</p>
      </div>

      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="page-subtitle">Loading…</p>
      ) : activeTab === 'My Lost Items' ? (
        lostItems.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No lost items reported</p>
          </div>
        ) : (
          <div className="dash-list">
            {lostItems.map((item) => (
              <div key={item._id} className="card dash-row">
                <div>
                  <p className="dash-item-title">{item.category} — {item.description}</p>
                  <p className="dash-item-meta">Lost at {item.location} · {new Date(item.dateLost).toLocaleDateString()}</p>
                </div>
                <span className={`badge badge-${item.status}`}>{item.status}</span>
              </div>
            ))}
          </div>
        )
      ) : foundItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No found items reported</p>
        </div>
      ) : (
        <div className="dash-list">
          {foundItems.map((item) => (
            <div key={item._id} className="card dash-found-block">
              <div className="dash-row">
                <div>
                  <p className="dash-item-title">{item.category} — {item.description}</p>
                  <p className="dash-item-meta">Found at {item.location} · {new Date(item.dateFound).toLocaleDateString()}</p>
                </div>
                <div className="dash-row-actions">
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                  {item.status === 'open' && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => loadClaims(item._id)}
                      disabled={claimsLoading[item._id]}
                    >
                      {claimsLoading[item._id] ? 'Loading…' : 'View claims'}
                    </button>
                  )}
                </div>
              </div>

              {claimsError[item._id] && (
                <p className="page-subtitle" style={{ color: 'crimson' }}>
                  {claimsError[item._id]}
                </p>
              )}

              {claimsByItem[item._id] && (
                <div className="claims-list">
                  {claimsByItem[item._id].length === 0 ? (
                    <p className="page-subtitle">No claims yet.</p>
                  ) : (
                    claimsByItem[item._id].map((claim) => (
                      <div key={claim._id} className="claim-row">
                        <div>
                          <p className="claim-answer">"{claim.submittedAnswer}"</p>
                          <p className="claim-meta">
                            by {claim.claimedBy?.name} · confidence: {claim.confidence}
                          </p>
                          {revealedContacts[claim._id] && (
                            <p className="claim-meta" style={{ color: 'green' }}>
                              Approved — contact: {revealedContacts[claim._id].claimantContact.email}
                              {revealedContacts[claim._id].claimantContact.phone
                                ? ` · ${revealedContacts[claim._id].claimantContact.phone}`
                                : ''}
                            </p>
                          )}
                        </div>
                        {claim.status === 'pending' ? (
                          <div className="claim-actions">
                            <button className="btn btn-sm" onClick={() => decideClaim(claim._id, item._id, 'approve')}>
                              Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => decideClaim(claim._id, item._id, 'reject')}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;