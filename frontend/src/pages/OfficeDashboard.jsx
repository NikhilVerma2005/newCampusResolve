import { useEffect, useState } from "react";
import API from "../api";
import TimelineModal from "../components/TimelineModal";
import "../App.css";

function OfficeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const officeName = localStorage.getItem("officeName");
  const role = localStorage.getItem("role");

  if (!officeName || role !== "STAFF") {
    return <p>Unauthorized. Please login as staff.</p>;
  }

  const fetchData = async () => {
    try {
      const ticketsRes = await API.get(`/offices/${officeName}/tickets`);
      setTickets(ticketsRes.data || []);

      const statsRes = await API.get(`/offices/${officeName}/stats`);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [officeName]);

  const updateStatus = async (ticketId, newStatus) => {
    try {
      if (newStatus === "REJECTED") {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        await API.patch(`/tickets/${ticketId}/status`, {
          status: "REJECTED",
          reason,
        });
      } else {
        await API.patch(`/tickets/${ticketId}/status`, {
          status: newStatus,
        });
      }

      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading dashboard...</p>;

  const pending = tickets.filter(t => t.status === "OPEN");
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS");
  const completed = tickets.filter(
    t => t.status === "RESOLVED" || t.status === "REJECTED"
  );

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          {officeName.replace("_", " ")} Office
        </div>

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
        {stats && (
          <div className="stats-row">
            <StatCard
              title="Total Complaints"
              value={stats.total_tickets}
              color="#10b981"
            />
            <StatCard
              title="Active"
              value={stats.active}
              color="#3b82f6"
            />
            <StatCard
              title="Pending"
              value={stats.open}
              color="#f59e0b"
            />
            <StatCard
              title="In Progress"
              value={stats.in_progress}
              color="#6366f1"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              color="#059669"
            />
          </div>
        )}

        {/* SECTIONS */}
        <Section
          title="Pending Complaints"
          tickets={pending}
          updateStatus={updateStatus}
          openTimeline={setSelectedTicket}
        />

        <Section
          title="In Progress"
          tickets={inProgress}
          updateStatus={updateStatus}
          openTimeline={setSelectedTicket}
        />

        <Section
          title="Completed"
          tickets={completed}
          updateStatus={updateStatus}
          openTimeline={setSelectedTicket}
        />

      </div>

      {selectedTicket && (
        <TimelineModal
          ticketId={selectedTicket}
          close={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

/* ========================= */
/* SECTION */
/* ========================= */

function Section({ title, tickets, updateStatus, openTimeline }) {
  return (
    <div className="section-card">
      <div className="section-title">{title}</div>

      {tickets.length === 0 && (
        <p style={{ color: "#6b7280" }}>No complaints here.</p>
      )}

      {tickets.map(t => (
        <TicketCard
          key={t.ticket_id}
          ticket={t}
          updateStatus={updateStatus}
          openTimeline={openTimeline}
        />
      ))}
    </div>
  );
}

/* ========================= */
/* TICKET CARD */
/* ========================= */

function TicketCard({ ticket, updateStatus, openTimeline }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>{ticket.title}</h3>

        <div>
          <Badge label={ticket.priority} type="priority" />
          <Badge label={ticket.status} type="status" />
        </div>
      </div>

      <p style={{ marginTop: 12 }}>
        <strong>Location:</strong> {ticket.location}
      </p>

      {/* ✅ Always show description section */}
      <div style={{
        marginTop: 12,
        padding: 12,
        background: "#f9fafb",
        borderRadius: 12,
        border: "1px solid #e5e7eb"
      }}>
        <strong>Description:</strong>
        <p style={{ marginTop: 6, color: "#374151" }}>
          {ticket.description ? ticket.description : "No description provided"}
        </p>
      </div>

      <p style={{ marginTop: 12 }}>
        <strong>Reports:</strong> {ticket.report_count}
      </p>

      {ticket.is_overdue && (
        <p style={{ color: "#ef4444", fontWeight: 600 }}>
          ⚠ Overdue
        </p>
      )}

      <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
        <button
          className="secondary-btn"
          onClick={() => openTimeline(ticket.ticket_id)}
        >
          Timeline
        </button>

        {ticket.status === "OPEN" && (
          <>
            <button
              className="primary-btn"
              onClick={() => updateStatus(ticket.ticket_id, "IN_PROGRESS")}
            >
              Start
            </button>

            <button
              style={{
                padding: "12px 22px",
                borderRadius: 12,
                border: "none",
                background: "#ef4444",
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
              onClick={() => updateStatus(ticket.ticket_id, "REJECTED")}
            >
              Reject
            </button>
          </>
        )}

        {ticket.status === "IN_PROGRESS" && (
          <button
            className="primary-btn"
            onClick={() => updateStatus(ticket.ticket_id, "RESOLVED")}
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
}


/* ========================= */
/* STAT CARD */
/* ========================= */

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card-fixed">
      <div className="stat-top-row">
        <div className="stat-title-fixed">{title}</div>

        <div
          className="stat-circle"
          style={{ borderColor: color }}
        >
          <div
            className="stat-dot"
            style={{ background: color }}
          ></div>
        </div>
      </div>

      <div className="stat-number-fixed">{value ?? 0}</div>
    </div>
  );
}

/* ========================= */
/* BADGE */
/* ========================= */

function Badge({ label, type }) {
  let bg = "#9ca3af";

  if (type === "priority") {
    if (label === "HIGH") bg = "#ef4444";
    else if (label === "MEDIUM") bg = "#f59e0b";
    else bg = "#6b7280";
  }

  if (type === "status") {
    if (label === "OPEN") bg = "#f59e0b";
    else if (label === "IN_PROGRESS") bg = "#3b82f6";
    else if (label === "RESOLVED") bg = "#10b981";
    else if (label === "REJECTED") bg = "#ef4444";
  }

  return (
    <span
      style={{
        background: bg,
        color: "white",
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: 12,
        marginLeft: 8
      }}
    >
      {label}
    </span>
  );
}

export default OfficeDashboard;
