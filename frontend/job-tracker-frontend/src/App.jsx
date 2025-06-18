import { useState, useEffect } from 'react';

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    status: 'Applied',
  });

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
      <ul>
        {jobs.map((job, i) => (
          <li key={i}>
            <strong>{job.jobTitle}</strong> @ {job.companyName} — {job.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;