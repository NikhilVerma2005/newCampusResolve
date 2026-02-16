import { useEffect, useState } from "react";
import API from "../api";

function TopIssues() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    API.get("/tickets/top")
      .then(res => {
        const sorted = res.data
          .sort((a, b) => {
            const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .slice(0, 6);

        setTickets(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Top Active Issues</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tickets.map(t => (
          <div 
            key={t.ticket_id}
            style={{
              padding: 15,
              border: "1px solid #ddd",
              borderRadius: 6
            }}
          >
            <strong>{t.title}</strong>
            <p>Priority: {t.priority}</p>
            <p>Status: {t.status}</p>
            <p>Reports: {t.report_count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopIssues;
