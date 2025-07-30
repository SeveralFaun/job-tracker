import { useState, useEffect } from "react";

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
    
  const [registerForm, setRegisterForm] = useState({ email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("dateDesc");
  

  // Fetch jobs from backend based on user authentication
  useEffect(() => {
    fetch("http://localhost:3000/csrf-token", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCsrfToken(data.csrfToken);
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
      });
    
    (async () => {
      const userFetched = await fetchUser();
      if (userFetched) {
        await fetchJobs();
      }
    })();
  }, []);


  const fetchUser = async () => {
    try {
        const res = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            setLoading(false);
            return false;
          }
          throw new Error("Failed to fetch user");
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
  const fetchJobs = async () => {
      
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/jobs", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch jobs");
        }
        
        const jobsData = await res.json();
        setJobs(jobsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setLoading(false);
      }
    };

  // Add new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/jobs", {
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

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/jobs/${id}`, {
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

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/jobs/${id}`, {
        method: "DELETE",
        headers: { "CSRF-Token": csrfToken },
        credentials: "include",
      });
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Registering user:", registerForm);
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(registerForm),
      });
      console.log("Registration response:", res);
      if (res.ok) {
        alert("Registration successful! Please login.");
        setRegisterForm({ email: "", password: "" });
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
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
      } else {
        alert("Login failed. Please check your credentials.");
      }

      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
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

  return (
    <div style={{ padding: "20px" }}>
      {!user && !loading && (
        <div style={{ marginBottom: "20px" }}>
          <h2>Login or Register</h2>

          <form onSubmit={handleRegister}>
            <h3>Register</h3>
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, password: e.target.value })
              }
              required
            />
            <button type="submit">Register</button>
          </form>
          <form onSubmit={handleLogin}>
            <h3>Login</h3>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      )}
      {user && !loading && (
        <div style={{ marginBottom: "20px" }}>
          <h1>Job Application Tracker</h1>

          <button onClick={handleLogout}>Logout</button>

          <form onSubmit={handleSubmit}>
            <input
              name="companyName"
              placeholder="Company"
              value={jobForm.companyName}
              onChange={(e) =>
                setJobForm({ ...jobForm, companyName: e.target.value })
              }
              required
            />
            <input
              name="jobTitle"
              placeholder="Job Title"
              value={jobForm.jobTitle}
              onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
              required
            />
            <select
              name="status"
              value={jobForm.status}
              onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
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
            style={{
              marginTop: "10px",
              marginBottom: "20px",
              padding: "5px",
              width: "200px",
            }}
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
              .filter((job) => {
                return (
                  (job.companyName ?? "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  (job.jobTitle ?? "")
                    .toLowerCase() 
                    .includes(searchQuery.toLowerCase())
                );
              })
              .map((job) => (
                <li key={job._id}>
                  {editingId === job._id ? (
                    <>
                      <input
                        value={editForm.companyName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            companyName: e.target.value,
                          })
                        }
                      />
                      <input
                        value={editForm.jobTitle}
                        onChange={(e) =>
                          setEditForm({ ...editForm, jobTitle: e.target.value })
                        }
                      />
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                      >
                        <option>Applied</option>
                        <option>Interview</option>
                        <option>Rejected</option>
                        <option>Offer</option>
                      </select>
                      <button onClick={() => handleUpdate(job._id)}>
                        ✅ Save
                      </button>
                      <button onClick={() => setEditingId(null)}>
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <strong>{job.jobTitle}</strong> @ {job.companyName} —{" "}
                      {job.status}
                      <br />
                      <em>
                        Applied on:{" "}
                        {job.appliedDate
                          ? new Date(job.appliedDate).toLocaleDateString()
                          : "N/A"}
                      </em>
                      <br />
                      <button
                        onClick={() => {
                          setEditingId(job._id);
                          setEditForm({
                            companyName: job.companyName,
                            jobTitle: job.jobTitle,
                            status: job.status,
                          });
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(job._id)}>❌</button>
                    </>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
