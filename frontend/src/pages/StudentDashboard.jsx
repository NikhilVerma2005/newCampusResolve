import { useState } from "react";
import StatsCards from "../components/StatsCards";
import TopIssues from "../components/TopIssues";
import CreateTicketModal from "../components/CreateTicketModal";
import MyTickets from "../components/MyTickets";
import "../App.css";

function StudentDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [showMyComplaints, setShowMyComplaints] = useState(false);

  const studentId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!studentId || role !== "STUDENT") {
    return <p>Unauthorized. Please login as Student.</p>;
  }

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-title">Student Portal</div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-wrapper">

        {/* STATS */}
        <StatsCards studentId={studentId} />

        {/* MAIN PANEL */}
        <div className="section-card">

          <div className="action-buttons">
            <div>
              <div className="section-title">My Complaints</div>
              <p style={{ color: "#6b7280", marginTop: "-10px" }}>
                View and manage all your submitted complaints
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowModal(true)}
            >
              + Raise New Complaint
            </button>
          </div>

          <button
            className="secondary-btn"
            onClick={() => setShowMyComplaints(!showMyComplaints)}
            style={{ marginBottom: 20 }}
          >
            {showMyComplaints ? "Hide Complaints" : "View My Complaints"}
          </button>

          {showMyComplaints && (
            <MyTickets studentId={studentId} />
          )}

        </div>

        {/* TRENDING */}
        <div className="section-card">
          <div className="section-title">Trending Campus Complaints</div>
          <TopIssues />
        </div>

        {showModal && (
          <CreateTicketModal
            studentId={studentId}
            close={() => setShowModal(false)}
          />
        )}

      </div>
    </div>
  );
}

export default StudentDashboard;
