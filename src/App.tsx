import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MeetingLobby from "./pages/MeetingLobby";
import MeetingRoom from "./pages/MeetingRoom";
import MeetingHistory from "./pages/MeetingHistory";
import MeetingDetails from "./pages/MeetingDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Meeting */}
        <Route path="/lobby" element={<MeetingLobby />} />
        <Route path="/meeting" element={<MeetingRoom />} />

        {/* Meeting History */}
        <Route path="/history" element={<MeetingHistory />} />

        {/* Individual Meeting Details */}
        <Route path="/history/view" element={<MeetingDetails />} />
      </Routes>
    </BrowserRouter>
  );
}