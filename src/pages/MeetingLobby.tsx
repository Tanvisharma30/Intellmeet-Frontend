import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MeetingLobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("id") || "";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    const start = async () => {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    };

    start();
  }, []);

  const toggleMic = () => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((p) => !p);
  };

  const toggleCam = () => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((p) => !p);
  };

  const joinMeeting = () => {
    navigate(`/meeting?id=${roomId}`, {
      state: { micOn, camOn },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        {/* HEADER (NEW UI ONLY) */}
        <div style={styles.header}>
          <h2 style={styles.title}> IntellMeet Lobby</h2>
          <p style={styles.subtitle}>Room ID: {roomId}</p>
        </div>

        {/* VIDEO WRAPPER (NEW UI ONLY) */}
        <div style={styles.videoWrapper}>
          <video ref={videoRef} autoPlay playsInline style={styles.video} />

          <div style={styles.overlay}>
            {camOn ? " Camera On" : " Camera Off"}
          </div>
        </div>

        {/* CONTROLS (UI UPGRADE ONLY) */}
        <div style={styles.controls}>
          <button onClick={toggleMic} style={micOn ? styles.btnOn : styles.btnOff}>
              {micOn ? "Mic On" : "Mic Off"}
          </button>

          <button onClick={toggleCam} style={camOn ? styles.btnOn : styles.btnOff}>
              {camOn ? "Cam On" : "Cam Off"}
          </button>
        </div>

        {/* JOIN BUTTON (ENHANCED STYLE ONLY) */}
        <button onClick={joinMeeting} style={styles.join}>
            Join Meeting
        </button>

      </div>
    </div>
  );
} 
const styles: any = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at top, #1e293b, #0f172a)",
    color: "white",
    fontFamily: "Arial",
  },

  card: {
    width: 420,
    padding: 22,
    borderRadius: 16,
    background: "rgba(17, 24, 39, 0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 40px rgba(59,130,246,0.15)",
    backdropFilter: "blur(12px)",
    textAlign: "center",
  },

  header: {
    marginBottom: 12,
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },

  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },

  videoWrapper: {
    position: "relative",
    marginTop: 15,
  },

  video: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },

  overlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    background: "rgba(0,0,0,0.5)",
    padding: "5px 10px",
    borderRadius: 8,
    fontSize: 12,
  },

  controls: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },

  btnOn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#10b981",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  btnOff: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  join: {
    marginTop: 15,
    width: "100%",
    padding: 12,
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s",
  },
};