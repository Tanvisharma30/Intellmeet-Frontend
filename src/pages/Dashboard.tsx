import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { io } from "socket.io-client"; 

import ScheduleMeetingModal from "../components/ScheduleMeetingModal";

export default function Dashboard() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [openNotif, setOpenNotif] = useState(false); 

  const [open, setOpen] = useState(false); 
  const [scheduledMeetings, setScheduledMeetings] = useState<any[]>([]);

  const socket = useRef<any>(null);

  const createMeeting = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/lobby?id=${roomId}`);
  };

  const joinMeeting = () => {
    const roomId = prompt("Enter Meeting ID");
    if (roomId) navigate(`/lobby?id=${roomId}`);
  };

  // history 
  useEffect(() => {
    fetch("http://localhost:5000/api/history/all") 
      .then(async (res) => { 
        const data = await res.json();
        return Array.isArray(data) ? data : []; 
      })
      .then(setMeetings)
      .catch(() => setMeetings([]));
  }, []); 

  //upcoming meet
  useEffect(() => { 
    fetch("http://localhost:5000/api/meetings") 
      .then(async (res) => { 
        const data = await res.json();
        return Array.isArray(data) ? data : []; 
      })
      .then(setScheduledMeetings)
      .catch(() => setScheduledMeetings([]));
  }, []);



  // notifications
  useEffect(() => {
    const fetchNotifications = () => {
      fetch("http://localhost:5000/api/notifications")
        .then((res) => res.json())
        .then(setNotifications)
        .catch(console.log);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`http://localhost:5000/api/notifications/${id}`, {
      method: "PUT",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, read: true } : n
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={styles.page}>

      {/* notifying bell */}
      <div style={styles.bellWrapper}>
        <div style={styles.bell} onClick={() => setOpenNotif(!openNotif)}>
          🔔
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount}</span>
          )}
        </div>

        {openNotif && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownTitle}>Notifications</div>

            {notifications.length === 0 && (
              <div style={{ opacity: 0.6 }}>No notifications</div>
            )}

            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  ...styles.notifItem,
                  opacity: n.read ? 0.5 : 1,
                }}
                onClick={() => markAsRead(n._id)}
              >
                <div>
                  <b>{n.type}</b>
                  <div>
                    {n.type === "task" ? "🟡 " : "🔵 "}
                    {n.message}
                  </div>
                  <small style={{ opacity: 0.6 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </div>

                <span
                  style={styles.close}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(n._id);
                  }}
                >
                  ❌
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* for sidebar*/}
      <div style={styles.sidebar}>
        <div style={styles.logo}>IntellMeet</div>

        <button style={styles.primaryBtn} onClick={createMeeting}>
          New Meeting
        </button>

        <button style={styles.secondaryBtn} onClick={joinMeeting}>
          Join Meeting
        </button> 

        <button  style={{ ...styles.primaryBtn, background: "#7c3aed" }} onClick={() => setOpen(true)}
        >
          📅 Schedule Meeting 
        </button>

      </div>

      {/* MAIN  */}
      <div style={styles.main}>
        <h1 style={styles.title}>Welcome Here...</h1>
        <p style={styles.subtitle}>Start or manage meetings</p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Instant Meeting</h3>
            <button style={styles.cardBtn} onClick={createMeeting}>
              Start
            </button>
          </div>

          <div style={styles.card}>
            <h3>Join Meeting</h3>
            <button style={styles.cardBtn} onClick={joinMeeting}>
              Join
            </button>
          </div>
        </div>

        <div style={styles.history}>
          <h2>📅 Meeting History</h2>

          {meetings.length === 0 && (
            <p style={{ opacity: 0.6 }}>No meetings yet</p>
          )}

          {meetings.map((m) => (
            <div
              key={m._id}
              style={styles.historyCard}
              onClick={() => navigate(`/history/view?id=${m._id}`)}
            >
              <b>Room:</b> {m.roomId}

              <div style={styles.summary}>
                {m.summary?.slice(0, 120)}
              </div>

              <div style={styles.meta}>
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div> 

        <div style={styles.history}>
          <h2>📅 Upcoming Meetings</h2> 
          {scheduledMeetings.length === 0 && ( 
            <p style={{ opacity: 0.6 }}>No upcoming meetings</p> 
          )} 
          {scheduledMeetings.map((m) => ( 
            <div key={m._id} style={styles.historyCard}> 
              <div  
                style={{ 
                  display: "flex",  
                  justifyContent: "space-between",  
                  alignItems: "center"  
                }} 
              > 

                <b>{m.title || "Meeting"}</b>  
                <span 
                  style={{ 
                    cursor: "pointer",
                    color: "red",
                    fontSize: "16px",
                    marginLeft: "10px"
                  }}  
                  title="Cancel meeting"
                  onClick={(e) => { 
                    e.stopPropagation();
                    setScheduledMeetings((prev) =>
                      prev.filter((x) => x._id !== m._id)
                    ); 
                  }} 
                >  
                  ❌
                </span> 
              </div>
              <div style={styles.summary}> 
                📅 {new Date(m.date || m.createdAt).toLocaleString()} 
              </div> 
              <div style={styles.meta}>
                Room: {m.roomId} 
              </div> 
            </div> 
          ))}
        </div> 
      </div>

      <ScheduleMeetingModal 
        open={open}
        onClose={() => setOpen(false)}
        onScheduled={(newMeeting) => { 
          setScheduledMeetings((prev) => [newMeeting, ...prev]); 
        }} 
      />
    </div>
  );
}

/* style ui */
const styles: any = {
  page: {
    height: "100vh",
    display: "flex",
    background: "#0a0a0a",
    color: "white",
    overflow: "hidden",
  },

  /*  NOTIFICATION SYSTEM */
  bellWrapper: {
    position: "fixed",
    top: 15,
    right: 15,
    zIndex: 9999,
  },

  bell: {
    cursor: "pointer",
    fontSize: 22,
    position: "relative",
    background: "#111",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #333",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "red",
    color: "white",
    borderRadius: "50%",
    fontSize: 10,
    padding: "2px 5px",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: 45,
    width: 320,
    maxHeight: 400,
    overflowY: "auto",
    background: "#111",
    border: "1px solid #333",
    borderRadius: 10,
    padding: 10,
  },

  dropdownTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  notifItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: 10,
    borderBottom: "1px solid #222",
    cursor: "pointer",
  },

  close: {
    cursor: "pointer",
  },

  /* REST IS EXACTLY YOUR CODE */
  sidebar: {
    width: 240,
    padding: 20,
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  logo: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
  },

  main: {
    flex: 1,
    padding: 30,
    overflowY: "auto",
  },

  title: {
    fontSize: 24,
    marginBottom: 5,
  },

  subtitle: {
    opacity: 0.6,
    marginBottom: 20,
  },

  grid: {
    display: "flex",
    gap: 15,
  },

  card: {
    flex: 1,
    background: "#111",
    padding: 15,
    borderRadius: 10,
    border: "1px solid #222",
  },

  cardBtn: {
    marginTop: 10,
    padding: "6px 10px",
    background: "#3b82f6",
    border: "none",
    color: "white",
    borderRadius: 6,
  },

  primaryBtn: {
    padding: 10,
    background: "#3b82f6",
    border: "none",
    borderRadius: 8,
    color: "white",
  },

  secondaryBtn: {
    padding: 10,
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
  },

  history: {
    marginTop: 30,
  },

  historyCard: {
    marginTop: 10,
    padding: 10,
    background: "#111",
    borderRadius: 8,
    border: "1px solid #222",
    cursor: "pointer",
  },

  summary: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
  },

  meta: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
  },
};