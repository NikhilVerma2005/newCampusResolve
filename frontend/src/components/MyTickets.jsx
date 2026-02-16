import { useEffect, useState } from "react";
import API from "../api";
import TimelineModal from "./TimelineModal";
import "../App.css";

function MyTickets({ studentId }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    API.get(`/users/${studentId}/tickets`)
      .then(res => setTickets(res.data || []))
      .catch(err => console.error(err));
  }, [studentId]);

  const sortedTickets = [...tickets].sort((a, b) => {
    const timeA = new Date(a.due_at).getTime();
    const timeB = new Date(b.due_at).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });

  if (tickets.length === 0) {
    return <p style={{ marginTop: 20 }}>No complaints raised yet.</p>;
  }

  return (
    <div style={{ marginTop: 30 }}>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25
      }}>
        <h2 style={{ margin: 0 }}>My Complaints</h2>

        <button
          className="sort-btn"
          onClick={() => setAscending(!ascending)}
        >
          Sort by Time
          <span className="sort-arrow">
            {ascending ? "↑" : "↓"}
          </span>
        </button>
      </div>

      {sortedTickets.map(t => (
        <div
          key={t.ticket_id}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 24,
            marginBottom: 24,
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            transition: "0.2s ease"
          }}
        >

          {/* Title + Badges */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h3 style={{ margin: 0 }}>{t.title}</h3>

            <div style={{ display: "flex", gap: 8 }}>
              <Badge label={t.priority} type="priority" />
              <Badge label={t.status} type="status" />
            </div>
          </div>

          {/* Details */}
          <p style={{ marginTop: 14 }}>
            <strong>Description:</strong> {t.description}
          </p>

          <p>
            <strong>Location:</strong> {t.location}
          </p>

          <p>
            <strong>Due:</strong>{" "}
            {new Date(t.due_at).toLocaleString()}
          </p>

          {/* Rejection Reason */}
          {t.status === "REJECTED" && t.rejection_reason && (
            <div
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 12,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c"
              }}
            >
              <strong>Rejection Reason:</strong> {t.rejection_reason}
            </div>
          )}

          {/* Overdue */}
          {t.is_overdue && (
            <p style={{ color: "#ef4444", marginTop: 10 }}>
              ⚠ Complaint overdue
            </p>
          )}

          {/* Actions */}
          <div style={{ marginTop: 18 }}>
            <button
              className="secondary-btn"
              onClick={() => setSelectedTicket(t.ticket_id)}
            >
              View Timeline
            </button>
          </div>

        </div>
      ))}

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
/* BADGE COMPONENT */
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
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600
      }}
    >
      {label}
    </span>
  );
}

export default MyTickets;
