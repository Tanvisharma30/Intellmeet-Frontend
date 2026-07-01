import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

export default function MeetingRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("id") || "";

   
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socket = useRef<any>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const peersRef = useRef<any>({});
  const [remoteStreams, setRemoteStreams] = useState<any[]>([]);

  const [tasks, setTasks] = useState<any[]>([]);
  const [taskInput, setTaskInput] = useState("");

  // ---------------- WEBRTC ----------------
  const createPeerConnection = (id: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peersRef.current[id] = pc;

    streamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, streamRef.current!);
    });

    pc.ontrack = (event) => {
      const stream = event.streams[0];

      setRemoteStreams((prev) => {
        const exists = prev.find((p) => p.id === id);
        if (exists) return prev;
        return [...prev, { id, stream }];
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          to: id,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  // ---------------- SOCKET + WEBRTC ----------------
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL);

    socket.current.on("connect", () => {
      socket.current.emit("join-room",{  
        roomId,
        name:user?.name || "Guest",
      });
    });

    socket.current.on("room-users", (users: any[]) => { 
      const names = users.map((u) => u.name || "Guest");
      setParticipants(users);
    });

    socket.current.on("receive-message", (data: any) => {
      setMessages((p) => [...p, data]);
    });

    // WEBRTC SIGNALING
    socket.current.on("user-joined", async (userId: string) => {
      if (userId === socket.current.id) return;

      const pc = createPeerConnection(userId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.current.emit("offer", {
        to: userId,
        from: socket.current.id,
        offer,
      });
    });

    socket.current.on("offer", async ({ from, offer }) => {
      const pc = createPeerConnection(from);

      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.current.emit("answer", {
        to: from,
        from: socket.current.id,
        answer,
      });
    });

    socket.current.on("answer", async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) await pc.setRemoteDescription(answer);
    });

    socket.current.on("ice-candidate", async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc && candidate) {
        await pc.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [roomId]);

  // ---------------- CAMERA ----------------
  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    };

    start();
  }, []);

  // ---------------- TASKS ----------------
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/tasks?roomId=${roomId}`)
      .then((res) => res.json())
      .then(setTasks)
      .catch(console.log);
  }, [roomId]);

  // ---------------- CHAT ----------------
  const sendMessage = () => {
    if (!input.trim()) return;

    socket.current.emit("send-message", {
      roomId,
      message: input,
      sender: user?.name || "You",
    });

    setMessages((p) => [...p, { sender: "You", message: input }]);
    setInput("");
  };

  // ---------------- CONTROLS ----------------
  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((p) => !p);
  };

  const toggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCameraOff((p) => !p);
  };

  const startShare = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    streamRef.current = screen;
    if (videoRef.current) videoRef.current.srcObject = screen;
    setIsSharing(true);
  };

  const stopShare = async () => {
    const cam = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = cam;
    if (videoRef.current) videoRef.current.srcObject = cam;
    setIsSharing(false);
  };

  // ---------------- TASKS ----------------
  const createTask = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        title: taskInput,
        status: "todo",
      }),
    });

    const data = await res.json();
    setTasks((p) => [...p, data]);
    setTaskInput("");
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const updated = await res.json();

    setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
  };

  // ---------------- RECORDING ----------------
  const startRecording = () => {
    if (!streamRef.current) return;

    const rec = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => chunksRef.current.push(e.data);

    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting-${roomId}.webm`;
      a.click();
    };

    rec.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ---------------- AI ----------------
  const generateTranscript = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioText: messages.map((m) => m.message).join(" "),
      }),
    });

    const data = await res.json();
    setTranscript(data.transcript);
  };

  const generateSummary = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = await res.json();
    setSummary(data.summary);
    setActionItems(data.actionItems);
  };

  // ---------------- SAVE + LEAVE ----------------
  const saveMeeting = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/history/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        transcript,
        summary,
        actionItems,
      }),
    });
  };

  const leaveMeeting = async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop()); 
    Object.values(peersRef.current).forEach((pc: any) => { 
      pc.close();
    });
    socket.current.emit("leave-room", roomId);
    await saveMeeting();
    navigate("/dashboard");
  }; 

  // ---------------- UI ----------------
  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <div>IntellMeet</div>
        <div>Room: {roomId}</div>
      </div> 

      <div style={styles.body}>
        <div style={styles.videoGrid}>
        {/* LOCAL VIDEO */}
          <div style={styles.videoCard}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />
            <div style={styles.nameTag}>You</div>
         </div>

         {/* REMOTE USERS */}
         {remoteStreams.map((user) => (
            <div key={user.id} style={styles.videoCard}>
              <video
                autoPlay
                playsInline
                style={styles.video}
                ref={(el) => {
                  if (el && user.stream) {
                    el.srcObject = user.stream;
                  }
                }}
              />
              <div style={styles.nameTag}>
                {user.id}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.side}>
          {/* PARTICIPANTS */}
          <div style={styles.card}>
            <div>Participants ({participants.length})</div>
            {participants.map((p) => (
              <div key={p.id}>🟢 {p.name}</div>
            ))}
          </div>

          {/* CHAT */}
          <div style={styles.card}>
            <div style={styles.chatBox}>
              {messages.map((m, i) => (
                <div key={i}>
                  <b>{m.sender}</b>: {m.message}
                </div>
              ))}
            </div> 
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
              placeholder="Message..."
            />
            <button onClick={sendMessage} style={styles.btn}>
              Send
            </button>
          </div>

          {/* TASKS */}
          <div style={styles.card}>
            <div>Tasks</div>
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              style={styles.input}
              placeholder="New task..."
            />
            <button onClick={createTask} style={styles.btn}>
              Add Task
            </button>

            <div style={{ marginTop: 10 }}>
              {tasks.map((t) => (
                <div key={t._id} style={{ marginBottom: 8 }}>
                  <b>{t.title}</b> - {t.status}
                  <div>
                    <button
                      onClick={() => updateTaskStatus(t._id, "todo")}
                      style={styles.btn}
                    >
                      Todo
                    </button>
                    <button
                      onClick={() => updateTaskStatus(t._id, "doing")}
                      style={styles.btn}
                    >
                      Doing
                    </button>
                    <button
                      onClick={() => updateTaskStatus(t._id, "done")}
                      style={styles.btn}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI */}
          <div style={styles.card}>
            <div>AI Features</div>
            <button onClick={generateTranscript} style={styles.btn}>
              AI Transcribe
            </button>
            <button onClick={generateSummary} style={styles.btn}>
              AI Summary
            </button>

            <div style={styles.aiBox}>
              {loadingAI && <p>Processing...</p>}
              {transcript && (
                <p>
                  <b>Transcript:</b> {transcript}
                </p>
              )}
              {summary && (
                <p>
                  <b>Summary:</b> {summary}
                </p>
              )}
              {actionItems.length > 0 && (
                <ul>
                  {actionItems.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        <button onClick={toggleMute} style={styles.btn}>
            {isMuted ? " Unmute" : " Mute"}
        </button>
        <button onClick={toggleCamera} style={styles.btn}>
            {isCameraOff ? "Start Camera" : " Stop Camera"}
        </button>
        <button
          onClick={isSharing ? stopShare : startShare}
          style={styles.btn}
        >
          Share
        </button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={styles.btn}
        >
          Record
        </button>
        <button onClick={leaveMeeting} style={styles.leave}>
          Leave
        </button>
      </div> 
    </div>
  ); 
}

/* ---------------- STYLES (UNCHANGED, ONLY SAFE FIXS) ---------------- */
const styles: any = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0a0a0a",
    color: "white",
    overflow: "hidden",
  },

  top: {
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #1f1f1f",
  },

  body: {
    flex: 1,
    display: "flex",
    gap: 12,
    padding: 12,
    overflow: "hidden",
  },

  videoArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },


  side: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },

  card: {
    background: "#111",
    borderRadius: 12,
    padding: 12,
    border: "1px solid #222",
  },

  chatBox: {
    height: 140,
    overflowY: "auto",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    padding: 6,
    background: "#000",
    color: "white",
    border: "1px solid #333",
  },

  btn: {
    marginTop: 6,
    marginRight: 5,
    padding: "6px 10px",
    background: "transparent",
    border: "1px solid #333",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
  },

  leave: {
    padding: "6px 10px",
    background: "red",
    border: "none",
    color: "white",
    borderRadius: 6,
  },

  aiBox: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.85,
  },

  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    padding: 10,
    borderTop: "1px solid #1f1f1f",
  }, 


  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px",
    width: "100%",
    padding: "10px",
  },

  videoCard: {
    position: "relative",
    background: "#111827",
    borderRadius: "12px",
    overflow: "hidden",
    height: "200px",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  nameTag: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "6px",
  },

};