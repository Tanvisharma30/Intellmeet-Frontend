import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); 

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });  
      const data = await res.json();


      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));  

      const finalUser = {
        name:
          data.user?.name ||
          data.user?.email?.split("@")[0] ||
          email.split("@")[0] ||
          "Guest",
        email: data.user?.email || email,
      };








      localStorage.setItem("user", JSON.stringify(finalUser));
      navigate("/dashboard");
    } catch (err){ 
        console.log(err);
    } finally{
      setLoading(false);
      
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "25px",
          background: "rgba(17, 24, 39, 0.9)",
          borderRadius: "14px",
          border: "1px solid #7c3aed55",
          boxShadow: "0 0 30px rgba(124, 58, 237, 0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* TITLE */}
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Welcome Back
        </h2>

        {/* EMAIL */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #374151",
            background: "#111827",
            color: "white",
            outline: "none",
          }}
        />

        {/* PASSWORD */}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #374151",
            background: "#111827",
            color: "white",
            outline: "none",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: loading ? "#4c1d95" : "#7c3aed",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* FOOTER */}
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          No account?{" "}
          <Link
            to="/register"
            style={{ color: "#a78bfa", textDecoration: "none" }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}