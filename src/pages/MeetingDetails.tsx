import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MeetingDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/meetings`);
        const data = await res.json();

        const found = data.find((m: any) => m._id === id);

        setMeeting(found || null);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMeeting();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.page}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div style={styles.page}>
        <h2>Meeting not found</h2>

        <button
          style={styles.button}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button
        style={styles.button}
        onClick={() => navigate("/dashboard")}
      >
        ← Back
      </button>

      <h1>Meeting Details</h1>

      <div style={styles.card}>
        <h3>Room ID</h3>
        <p>{meeting.roomId}</p>
      </div>

      <div style={styles.card}>
        <h3>Created</h3>
        <p>{new Date(meeting.createdAt).toLocaleString()}</p>
      </div>

      <div style={styles.card}>
        <h3>Transcript</h3>
        <p>{meeting.transcript || "No transcript available"}</p>
      </div>

      <div style={styles.card}>
        <h3>Summary</h3>
        <p>{meeting.summary || "No summary available"}</p>
      </div>

      <div style={styles.card}>
        <h3>Action Items</h3>

        {meeting.actionItems?.length > 0 ? (
          <ul>
            {meeting.actionItems.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No action items</p>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "white",
    padding: 30,
  },

  button: {
    padding: "10px 16px",
    marginBottom: 20,
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
};