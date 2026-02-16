import { useEffect, useState } from "react";
import API from "../api";

function TimelineModal({ ticketId, close }) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    API.get(`/tickets/${ticketId}/timeline`)
      .then(res => setTimeline(res.data))
      .catch(err => console.error(err));
  }, [ticketId]);

  return (
    <div style={{
      position: "fixed",
      top: 50,
      left: "30%",
      width: "40%",
      background: "#fff",
      padding: 20,
      border: "1px solid #ccc",
      borderRadius: 8,
      maxHeight: "70vh",
      overflowY: "auto",
      zIndex: 1000
    }}>
      <h3>Ticket Timeline</h3>

      {timeline.length === 0 && <p>No history available.</p>}

      {timeline.map((item, index) => (
        <div key={index} style={{
          marginBottom: 15,
          padding: 10,
          borderBottom: "1px solid #eee"
        }}>
          <strong>{item.action}</strong>

          {item.old_status && (
            <p>
              {item.old_status} → {item.new_status}
            </p>
          )}

          {item.note && (
            <p>Note: {item.note}</p>
          )}

          <small>{new Date(item.timestamp).toLocaleString()}</small>
        </div>
      ))}

      <button onClick={close}>Close</button>
    </div>
  );
}

export default TimelineModal;
