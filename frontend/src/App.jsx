import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('') 
  const [filterLevel, setFilterLevel] = useState('All')
  
  // NEW: State to track our sorting preference
  const [sortOrder, setSortOrder] = useState('default')
  
  const [copiedId, setCopiedId] = useState(null)

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

  // UPDATED: We filter the jobs, and then immediately sort them!
  const filteredAndSortedJobs = jobs.filter(job => {
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
    return 0; // Do nothing if "default" is selected
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
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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

              {/* NEW: The Sorting Dropdown */}
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline