import { useState, useEffect } from 'react';

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    status: 'Applied',
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    companyName: '',
    jobTitle: '',
    status: 'Applied'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');

  // Fetch jobs from backend on page load
  useEffect(() => {
    fetch('http://localhost:3000/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error('Error fetching jobs:', err));
  }, []);

  // Add new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const newJob = await res.json();
      setJobs([...jobs, newJob]);
      setForm({ companyName: '', jobTitle: '', status: 'Applied' });
    } catch (err) {
      console.error('Error adding job:', err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const updated = await res.json();
      setJobs(jobs.map((job) => (job._id === id ? updated : job)));
      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/jobs/${id}`, {
        method: 'DELETE'
      });
      setJobs(jobs.filter(job => job._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };
  
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortOption === 'dateDesc') {
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    } else if (sortOption === 'dateAsc') {
      return new Date(a.appliedDate) - new Date(b.appliedDate);
    } else if (sortOption === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Job Application Tracker</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Company"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          required
        />
        <input
          placeholder="Job Title"
          value={form.jobTitle}
          onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          required
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Applied</option>
          <option>Interview</option>
          <option>Rejected</option>
          <option>Offer</option>
        </select>
        <button type="submit">Add Job</button>
      </form>

      <h2>Applications</h2>
      <input
        type="text"
        placeholder="Search by job title or company"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginTop: '10px', marginBottom: '20px', padding: '5px', width: '200px' }}
      />
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="dateDesc">Sort by Date (Newest)</option>
        <option value="dateAsc">Sort by Date (Oldest)</option>
        <option value="status">Sort by Status (A-Z)</option>
      </select>
      <ul>
        {sortedJobs
          .filter(job => {
            return job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .map((job) => (
          <li key={job._id}>
            {editingId === job._id ? (
              <>
                <input
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                />
                <input
                  value={editForm.jobTitle}
                  onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                />
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Rejected</option>
                  <option>Offer</option>
                </select>
                <button onClick={() => handleUpdate(job._id)}>✅ Save</button>
                <button onClick={() => setEditingId(null)}>❌ Cancel</button>
              </>
            ) : (
              <>
                <strong>{job.jobTitle}</strong> @ {job.companyName} — {job.status}
                <br />
                <em>Applied on: {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : "N/A"}</em>
                <br />
                <button onClick={() => {
                  setEditingId(job._id);
                  setEditForm({
                    companyName: job.companyName,
                    jobTitle: job.jobTitle,
                    status: job.status
                  });
                }}>✏️ Edit</button>
                <button onClick={() => handleDelete(job._id)}>❌</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;