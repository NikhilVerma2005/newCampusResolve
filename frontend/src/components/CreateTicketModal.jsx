import { useState, useEffect } from "react";
import API from "../api";
import "../App.css";

function CreateTicketModal({ studentId, close }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ========================= */
  /* LIVE SUGGESTIONS */
  /* ========================= */

  useEffect(() => {
    if (!title || !location) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await API.get(
          `/tickets/suggestions?query=${encodeURIComponent(
            title
          )}&location=${encodeURIComponent(location)}`
        );
        setSuggestions(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSuggestions();
  }, [title, location]);

  /* ========================= */
  /* CREATE NEW */
  /* ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/tickets", {
        title,
        location,
        description,
        student_id: studentId,
      });

      close();
    } catch (err) {
      alert("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  /* ========================= */
  /* JOIN EXISTING */
  /* ========================= */

  const handleJoin = async (ticketId) => {
    try {
      await API.post(`/tickets/${ticketId}/join`, {
        student_id: studentId,
        description: description || "Joined existing complaint",
      });

      alert("Successfully joined existing complaint");
      close();
    } catch (err) {
      alert(err.response?.data?.error || "Join failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card-advanced">

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Raise a Complaint</h2>
            <p className="modal-description">
              You can join an existing complaint if similar.
            </p>
          </div>
          <button className="modal-close" onClick={close}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* TITLE */}
          <div className="form-group">
            <label>Complaint Title *</label>
            <input
              className="form-input"
              placeholder="e.g., WiFi not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>Location *</label>
            <select
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">Select Location</option>
              <option value="Hostel 1">Hostel 1</option>
              <option value="Hostel 2">Hostel 2</option>
              <option value="TB-6">TB-6</option>
              <option value="TB-7">TB-7</option>
              <option value="Library">Library</option>
              <option value="Auditorium">Auditorium</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe your complaint..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* SUGGESTIONS WITH JOIN */}
          {suggestions.length > 0 && (
            <div
              style={{
                marginTop: 20,
                maxHeight: 180,
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 15,
                background: "#f9fafb"
              }}
            >
              <strong>Similar Complaints Found:</strong>

              {suggestions.map((s) => (
                <div
                  key={s.ticket_id}
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: "white",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      Reports: {s.report_count}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleJoin(s.ticket_id)}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT NEW */}
          <button
            type="submit"
            className="submit-btn-advanced"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit New Complaint"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateTicketModal;
