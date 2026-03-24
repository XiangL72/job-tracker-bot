import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Our two filter states
  const [searchTerm, setSearchTerm] = useState('') 
  const [filterLevel, setFilterLevel] = useState('All')

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

  // The math that filters by BOTH the search box and the dropdown
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (job.company && job.company.toLowerCase().includes(searchLower)) ||
      (job.title && job.title.toLowerCase().includes(searchLower)) ||
      (job.tech_stack && job.tech_stack.toLowerCase().includes(searchLower))
    );
    
    const matchesLevel = filterLevel === 'All' || 
                         (job.experience_level && job.experience_level.toLowerCase().includes(filterLevel.toLowerCase()));
    
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🇨🇦 Canada Tech Command Center</h1>
        <p>Market Intelligence & Active Opportunities</p>
      </header>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Syncing with AI Database...</p>
        </div>
      ) : (
        <main className="dashboard-main">
          <div className="summary-bar">
            <h2>Latest Openings</h2>
            
            {/* The new Search and Filter Controls */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search company, title, or tech..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '260px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none' }}
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
            </div>

            <span className="job-count">{filteredJobs.length} roles found</span>
          </div>
          
          <div className="job-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="card-header">
                  <span className="company-name">{job.company}</span>
                  <span className={`badge ${getBadgeClass(job.experience_level)}`}>
                    {job.experience_level}
                  </span>
                </div>
                
                <h3 className="job-title">{job.title}</h3>
                
                <div className="job-details">
                  <p><strong>📍 Location:</strong> {job.location}</p>
                  <p><strong>💻 Stack:</strong> {job.tech_stack}</p>
                  {job.salary !== "Not listed" && (
                    <p><strong>💰 Salary:</strong> {job.salary}</p>
                  )}
                </div>
                
                <a href={job.url} target="_blank" rel="noreferrer" className="apply-btn">
                  View Application &rarr;
                </a>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  )
}

export default App