import { useState, useEffect } from 'react'

function App() {
  // 1. Set up our state variables
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. The 'useEffect' hook runs once when the page loads
  useEffect(() => {
    // This is the bridge! We ask our Node server for the data.
    fetch('http://localhost:5001/api/jobs/recent')
      .then(response => response.json())
      .then(data => {
        setJobs(data) // Save the data to our React state
        setLoading(false) // Turn off the loading screen
      })
      .catch(error => console.error("Error fetching jobs:", error))
  }, [])

  // 3. What the user actually sees (The UI)
  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🇨🇦 Canada Tech Command Center</h1>
      
      {loading ? (
        <p>Connecting to database... grabbing the latest jobs.</p>
      ) : (
        <div>
          <h3>Recent Openings ({jobs.length} found)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* 4. We loop through the array of jobs and create a "Card" for each one */}
            {jobs.map((job) => (
              <div key={job.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>{job.company} - {job.title}</h2>
                <p style={{ margin: '5px 0' }}><strong>📍 Location:</strong> {job.location}</p>
                <p style={{ margin: '5px 0' }}><strong>⭐ Level:</strong> {job.experience_level}</p>
                <p style={{ margin: '5px 0' }}><strong>💻 Tech Stack:</strong> {job.tech_stack}</p>
                
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px'}}
                >
                  View Application
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App