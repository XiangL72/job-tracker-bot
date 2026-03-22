import { useState, useEffect } from 'react'
import './App.css' // We are importing a CSS file now!

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5001/api/jobs/recent')
      .then(response => response.json())
      .then(data => {
        setJobs(data)
        setLoading(false)
      })
      .catch(error => console.error("Error fetching jobs:", error))
  }, [])

  // Helper function to color-code the experience levels
  const getBadgeClass = (level) => {
    const lowerLevel = level?.toLowerCase() || '';
    if (lowerLevel.includes('intern') || lowerLevel.includes('co-op')) return 'badge-intern';
    if (lowerLevel.includes('entry')) return 'badge-entry';
    if (lowerLevel.includes('senior') || lowerLevel.includes('staff') || lowerLevel.includes('principal')) return 'badge-senior';
    return 'badge-mid';
  }

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
            <span className="job-count">{jobs.length} roles found</span>
          </div>
          
          <div className="job-grid">
            {jobs.map((job) => (
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