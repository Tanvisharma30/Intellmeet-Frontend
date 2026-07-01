import { useState } from "react";

export default function ScheduleMeetingModal({
  open,
  onClose,
  onScheduled,
}: {
  open: boolean;
  onClose: () => void;
  onScheduled: (data: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [participants, setParticipants] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const roomId = Math.random().toString(36).substring(2, 8);

    const payload = {
      title,
      description,
      date,
      time,
      roomId,
      participants: participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      createdBy: user?.name || "Guest",
    };

    const res = await fetch("http://localhost:5000/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    onScheduled(data);
    onClose();

    // reset
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setParticipants("");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>📅 Schedule Meeting</h2>

        <input
          placeholder="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Participants (comma separated)"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          style={styles.input}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSubmit} style={styles.btn}>
            Schedule
          </button>

          <button onClick={onClose} style={styles.cancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "350px",
    background: "#111",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#000",
    color: "white",
  },

  btn: {
    flex: 1,
    padding: "8px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  cancel: {
    flex: 1,
    padding: "8px",
    background: "#444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};