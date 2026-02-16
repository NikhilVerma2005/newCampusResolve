import { useEffect, useState } from "react";
import API from "../api";
import "../App.css";

function StatsCards({ studentId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get(`/users/${studentId}/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, [studentId]);

  if (!stats) return null;

  const cards = [
    {
      title: "Total Complaints",
      value: stats.total_reported,
      color: "#6b7280"
    },
    {
      title: "Open",
      value: stats.open,
      color: "#f59e0b"
    },
    {
      title: "In Progress",
      value: stats.in_progress,
      color: "#3b82f6"
    },
    {
      title: "Resolved",
      value: stats.resolved,
      color: "#10b981"
    },
    {
      title: "Rejected",
      value: stats.rejected,
      color: "#ef4444"
    }
  ];

  return (
    <div className="stats-row">
      {cards.map((card, index) => (
        <div key={index} className="stat-card-fixed">

          <div className="stat-top-row">
            <span className="stat-title-fixed">{card.title}</span>

            <div
              className="stat-circle"
              style={{
                backgroundColor: `${card.color}20`,
                borderColor: card.color
              }}
            >
              <div
                className="stat-dot"
                style={{ backgroundColor: card.color }}
              />
            </div>
          </div>

          <div className="stat-number-fixed">
            {card.value}
          </div>

        </div>
      ))}
    </div>
  );
}

export default StatsCards;
