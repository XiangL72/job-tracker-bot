import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('') 
  const [filterLevel, setFilterLevel] = useState('All')
  const [sortOrder, setSortOrder] = useState('default')
  const [copiedId, setCopiedId] = useState(null)

  const [savedJobIds, setSavedJobIds] = useState(() => {
    const saved = localStorage.getItem('canadaCommandCenterPins');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem('canadaCommandCenterPins', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    fetch('http://localhost:5001/api/jobs/recent')
      .then(response => response.json())
      .then(data => {
        setJobs(data)
        setLoading(false)
      })
      .catch(error => console.error("Error fetching jobs:", error))
  }, [])

  const getBadgeClass = (level) => {
    const lowerLevel = level?.toLowerCase() || '';
    if (lowerLevel.includes('intern') || lowerLevel.includes('co-op')) return 'badge-intern';
    if (lowerLevel.includes('entry')) return 'badge-entry';
    if (lowerLevel.includes('senior') || lowerLevel.includes('staff') || lowerLevel.includes('principal')) return 'badge-senior';
    return 'badge-mid';
  }

  const handleCopyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  const togglePin = (id) => {
    setSavedJobIds(prev => 
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  }

  // NEW FEATURE: A math function that turns a company name into a consistent beautiful color!
  const getAvatarColor = (companyName) => {
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  const allTech = jobs.flatMap(job => (job.tech_stack || '').split(',').map(t => t.trim()).filter(t => t !== 'Not listed' && t !== ''));
  const techCounts = allTech.reduce((acc, tech) => {
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {});
  const topTech = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(t => t[0]);

  const filteredAndSortedJobs = jobs.filter(job => {
    if (showSavedOnly && !savedJobIds.includes(job.id)) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (job.company && job.company.toLowerCase().includes(searchLower)) ||
      (job.title && job.title.toLowerCase().includes(searchLower)) ||
      (job.tech_stack && job.tech_stack.toLowerCase().includes(searchLower))
    );
    
    const matchesLevel = filterLevel === 'All' || 
                         (job.experience_level && job.experience_level.toLowerCase().includes(filterLevel.toLowerCase()));
    
    return matchesSearch && matchesLevel;
  }).sort((a, b) => {
    if (sortOrder === 'a-z') return a.company.localeCompare(b.company);
    if (sortOrder === 'z-a') return b.company.localeCompare(a.company);
    return 0; 
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1>🇨🇦 Canada Tech Command Center</h1>
            <p>Market Intelligence & Active Opportunities</p>
          </div>
          
          <button 
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            style={{
              padding: '10px 16px',
              backgroundColor: showSavedOnly ? '#fef08a' : '#f1f5f9',
              color: showSavedOnly ? '#854d0e' : '#475569',
              border: showSavedOnly ? '1px solid #eab308' : '1px solid #cbd5e1',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {showSavedOnly ? '📌 Showing Pinned' : '📍 Show Pinned Only'} 
            <span style={{ backgroundColor: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {savedJobIds.length}
            </span>
          </button>
        </div>
      </header>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Syncing with AI Database...</p>
        </div>
      ) : (
        <main className="dashboard-main">
          <div className="summary-bar">
            <div>
              <h2>Latest Openings</h2>
              
              {topTech.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>🔥 Trending:</span>
                  {topTech.map(tech => (
                    <button 
                      key={tech}
                      onClick={() => setSearchTerm(tech)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        backgroundColor: searchTerm === tech ? 'var(--primary-accent)' : '#e2e8f0',
                        color: searchTerm === tech ? 'white' : '#334155',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tech}
                    </button>
                  ))}
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '15px' }}>
              <input 
                type="text" 
                placeholder="Search company, title, or tech..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '220px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none' }}
              />
              
              <select 
                value={filterLevel} 
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
              >
                <option value="All">All Levels</option>
                <option value="intern">Intern / Co-op</option>
                <option value="entry">Entry Level</option>
                <option value="senior">Senior / Staff</option>
              </select>

              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: '500' }}
              >
                <option value="default">Sort: Newest First</option>
                <option value="a-z">Company: A to Z</option>
                <option value="z-a">Company: Z to A</option>
              </select>
            </div>

            <span className="job-count" style={{ marginTop: '15px', display: 'inline-block' }}>{filteredAndSortedJobs.length} roles found</span>
          </div>
          
          {filteredAndSortedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '2px dashed #cbd5e1', marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '10px' }}>No roles found 🕵️‍♂️</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>We couldn't find any jobs matching your current search or filters.</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterLevel('All'); setSortOrder('default'); setShowSavedOnly(false); }}
                style={{ padding: '10px 20px', backgroundColor: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="job-grid">
              {filteredAndSortedJobs.map((job) => {
                const isPinned = savedJobIds.includes(job.id);
                
                return (
                  <div key={job.id} className="job-card" style={{ border: isPinned ? '2px solid #fbbf24' : '1px solid var(--border-color)' }}>
                    
                    {/* NEW: The Upgraded Card Header with the Colored Avatar! */}
                    <div className="card-header" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          backgroundColor: getAvatarColor(job.company),
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <span className="company-name" style={{ margin: 0 }}>{job.company}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${getBadgeClass(job.experience_level)}`}>
                          {job.experience_level}
                        </span>
                        <button 
                          onClick={() => togglePin(job.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0', transition: 'transform 0.1s' }}
                          title={isPinned ? "Unpin Job" : "Pin Job"}
                        >
                          {isPinned ? '📌' : '📍'}
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="job-title">{job.title}</h3>
                    
                    <div className="job-details">
                      <p><strong>📍 Location:</strong> {job.location}</p>
                      {job.salary !== "Not listed" && (
                        <p><strong>💰 Salary:</strong> {job.salary}</p>
                      )}
                      
                      <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(job.tech_stack || 'Not listed').split(',').map((tech, index) => (
                          <span 
                            key={index} 
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '500',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="apply-btn"
                        style={{ flex: 1, margin: 0 }}
                      >
                        View App &rarr;
                      </a>
                      
                      <button
                        onClick={() => handleCopyLink(job.id, job.url)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: copiedId === job.id ? '#dcfce7' : '#f1f5f9',
                          color: copiedId === job.id ? '#166534' : '#475569',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {copiedId === job.id ? '✅ Copied!' : '🔗 Copy'}
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </main>
      )}
    </div>
  )
}

export default App