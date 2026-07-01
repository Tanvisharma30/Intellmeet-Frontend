import { useEffect, useState } from "react";

export default function MeetingHistory() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/history")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 20, color: "white", background: "#000", minHeight: "100vh" }}>
      <h2>📜 Meeting History</h2>

      {data.map((m) => (
        <div
          key={m._id}
          style={{
            border: "1px solid #333",
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          <h3>Room: {m.roomId}</h3>
          <p><b>Summary:</b> {m.summary || "No summary"}</p>
          <p><b>Transcript:</b> {m.transcript || "No transcript"}</p>
          <small>{new Date(m.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

const styles: any = {
  page: {
    padding: 20,
    background: "#0a0a0a",
    color: "white",
    minHeight: "100vh",
  },

  title: {
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
  },

  card: {
    background: "#111",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #222",
  },

  section: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 8,
  },

  date: {
    marginTop: 10,
    fontSize: 11,
    opacity: 0.5,
  },
};