import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../../services/authService";

import Sidebar from "../../components/Sidebar/Sidebar";
import CreateProject from "../../components/CreateProject/CreateProject";

import "./Dashboard.css";

function Dashboard() {
  // current logged-in user
  const [user, setUser] = useState(null);

  // profile menu
  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();

  // load current user
  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  }

  // logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="dashboard">
      {/* sidebar: dashboard, recent projects */}
      <Sidebar />

      <main className="main">
        {/* top bar */}
        <div className="topbar">
          <div className="dashboard-heading">
            <h1>
              Welcome back —
              {user ? ` ${user.name}!` : ""}
            </h1>
          </div>

          <div className="profile-section">
            <button className="profile-btn" onClick={logout} title="Logout">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* create project */}
        <section className="dashboard-content">
          <CreateProject />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;