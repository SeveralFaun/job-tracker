import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function App() {
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [jobForm, setJobForm] = useState({
    companyName: "",
    jobTitle: "",
    status: "Applied",
  });
  const [editForm, setEditForm] = useState({
    companyName: "",
    jobTitle: "",
    status: "Applied",
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [registerForm, setRegisterForm] = useState({ email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("dateDesc");

  // Fetch CSRF token
  const fetchCsrfToken = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setCsrfToken(data.csrfToken);
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err);
    }
  };

  // Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return false;
      }

      const userData = await res.json();
      setUser(userData);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await res.json();
      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchCsrfToken();
    (async () => {
      const userFetched = await fetchUser();
      if (userFetched) {
        await fetchJobs();
      }
    })();
  }, []);

  // Add new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(jobForm),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error);
        return;
      }
      const newJob = await res.json();
      setJobs([...jobs, newJob]);
      setJobForm({ companyName: "", jobTitle: "", status: "Applied" });
    } catch (err) {
      console.error("Error adding job:", err);
    }
  };

  // Update a job
  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(editForm),
        credentials: "include",
      });
      const updated = await res.json();
      setJobs(jobs.map((job) => (job._id === id ? updated : job)));
      setEditingId(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Delete a job
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: { "CSRF-Token": csrfToken },
        credentials: "include",
      });
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(registerForm),
      });
      if (res.ok) {
        alert("Registration successful! Please login.");
        setRegisterForm({ email: "", password: "" });
        setShowLoginForm(true);
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  // Login user
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setLoginForm({ email: "", password: "" });
        await fetchJobs();
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "CSRF-Token": csrfToken },
        credentials: "include",
      });
      setUser(null);
      setJobs([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortOption === "dateDesc") {
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    } else if (sortOption === "dateAsc") {
      return new Date(a.appliedDate) - new Date(b.appliedDate);
    } else if (sortOption === "status") {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  const filteredJobs = sortedJobs.filter((job) => {
    return (
      (job.companyName ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (job.jobTitle ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="app-container">
      {!user ? (
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="app-title">Job Tracker</h1>
            <p className="app-subtitle">Track your job applications</p>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${showLoginForm ? "active" : ""}`}
                onClick={() => setShowLoginForm(true)}
              >
                Login
              </button>
              <button
                className={`auth-tab ${!showLoginForm ? "active" : ""}`}
                onClick={() => setShowLoginForm(false)}
              >
                Register
              </button>
            </div>

            {showLoginForm ? (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="main-container">
          <header className="app-header">
            <div className="header-content">
              <h1 className="app-title">Job Tracker</h1>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </header>

          <main className="app-main">
            <div className="add-job-section">
              <h2>Add New Application</h2>
              <form onSubmit={handleSubmit} className="job-form">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      name="companyName"
                      placeholder="Company Name"
                      value={jobForm.companyName}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, companyName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      name="jobTitle"
                      placeholder="Job Title"
                      value={jobForm.jobTitle}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, jobTitle: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <select
                      name="status"
                      value={jobForm.status}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, status: e.target.value })
                      }
                    >
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Rejected</option>
                      <option>Offer</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Add Job
                  </button>
                </div>
              </form>
            </div>

            <div className="jobs-section">
              <div className="jobs-header">
                <h2>Your Applications</h2>
                <div className="controls">
                  <input
                    type="text"
                    placeholder="Search by title or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="sort-select"
                  >
                    <option value="dateDesc">Newest First</option>
                    <option value="dateAsc">Oldest First</option>
                    <option value="status">Status (A-Z)</option>
                  </select>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="no-jobs">
                  <p>No applications yet. Start tracking your job applications!</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {filteredJobs.map((job) => (
                    <div key={job._id} className="job-card">
                      {editingId === job._id ? (
                        <div className="job-edit-mode">
                          <div className="form-group">
                            <input
                              value={editForm.companyName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  companyName: e.target.value,
                                })
                              }
                              placeholder="Company Name"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              value={editForm.jobTitle}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  jobTitle: e.target.value,
                                })
                              }
                              placeholder="Job Title"
                            />
                          </div>
                          <div className="form-group">
                            <select
                              value={editForm.status}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  status: e.target.value,
                                })
                              }
                            >
                              <option>Applied</option>
                              <option>Interview</option>
                              <option>Rejected</option>
                              <option>Offer</option>
                            </select>
                          </div>
                          <div className="edit-actions">
                            <button
                              onClick={() => handleUpdate(job._id)}
                              className="btn btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn btn-cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="job-info">
                            <h3>{job.jobTitle}</h3>
                            <p className="company-name">{job.companyName}</p>
                            <div className={`status-badge status-${job.status.toLowerCase()}`}>
                              {job.status}
                            </div>
                            <p className="applied-date">
                              Applied:{" "}
                              {job.appliedDate
                                ? new Date(job.appliedDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="job-actions">
                            <button
                              onClick={() => {
                                setEditingId(job._id);
                                setEditForm({
                                  companyName: job.companyName,
                                  jobTitle: job.jobTitle,
                                  status: job.status,
                                });
                              }}
                              className="btn btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="btn btn-delete"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
