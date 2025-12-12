import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  Send,
  Paperclip,
  ShieldCheck,
  Download,
  Banknote,
  LayoutDashboard,
  MessageSquare,
  Check,
  X,
} from "lucide-react";

function App() {
  const [view, setView] = useState("chat");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! InstaLoan mein swagat hai. Kitna loan chahiye?",
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // --- CHAT LOGIC ---
  const processBotResponse = async (userInput) => {
    try {
      setIsTyping(true);
      // UDPATE 1: Chat API URL updated
      const response = await fetch(
        "https://instaloan-ap7e.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userInput }),
        }
      );
      const data = await response.json();

      let botMsg = {
        sender: "bot",
        text: data.reply,
        action: data.action,
        amount: data.amount,
        timestamp: "Now",
      };

      if (data.action === "download_sanction") {
        botMsg.actionLabel = "Download Sanction Letter";
        // UPDATE 2: Download Link updated
        botMsg.actionUrl = `https://instaloan-ap7e.onrender.com/api/download-sanction?amount=${data.amount}`;
      } else if (data.action === "upload_docs") {
        botMsg.actionLabel = "Upload Salary Slip";
        setCurrentAmount(data.amount);
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setIsTyping(false);
    }
  };

  // --- ADMIN ACTIONS ---
  const handleAdminAction = async (id, action) => {
    // UPDATE 3: Admin Action URL updated
    await fetch("https://instaloan-ap7e.onrender.com/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    fetchAdminData(); // Refresh table
  };

  const fetchAdminData = async () => {
    // UPDATE 4: Admin Fetch URL updated
    const res = await fetch(
      "https://instaloan-ap7e.onrender.com/api/admin/applications"
    );
    setAdminData(await res.json());
  };

  useEffect(() => {
    if (view === "admin") fetchAdminData();
  }, [view]);

  // Standard handlers...
  const handleFileUpload = async (e) => {
    /* Same as before */
  };
  const handleSend = () => {
    /* Same as before */
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input, timestamp: "Now" },
    ]);
    setInput("");
    processBotResponse(input);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="main-wrapper">
      <button
        className="toggle-view-btn"
        onClick={() => setView(view === "chat" ? "admin" : "chat")}
      >
        {view === "chat" ? (
          <LayoutDashboard size={20} />
        ) : (
          <MessageSquare size={20} />
        )}
        {view === "chat" ? " Admin Dashboard" : " Live Chat"}
      </button>

      {view === "chat" ? (
        <div className="chat-container">
          {/* Same Chat UI as before */}
          <div className="header">
            <div className="logo-circle">
              <Banknote size={24} />
            </div>
            <div className="header-info">
              <h2>InstaLoan Prime</h2>
              <div className="verified-badge">
                <ShieldCheck size={14} /> Verified Agent
              </div>
            </div>
          </div>
          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.sender}`}>
                <div className="bubble">
                  {msg.text}
                  {msg.actionLabel && (
                    <button
                      className="action-btn"
                      onClick={() => {
                        if (msg.actionLabel.includes("Download"))
                          window.open(msg.actionUrl);
                        else
                          document.querySelector('input[type="file"]').click();
                      }}
                    >
                      {msg.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="bubble" style={{ fontStyle: "italic" }}>
                Running Risk Analysis...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type here..."
            />
            <button className="send-btn" onClick={handleSend}>
              <Send size={20} />
            </button>
          </div>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
      ) : (
        // --- UPGRADED ADMIN UI ---
        <div className="admin-container">
          <div className="header" style={{ background: "#1e293b" }}>
            <h2>🏦 Risk & Loan Dashboard</h2>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Amt</th>
                  <th>Risk Score</th>
                  <th>System Decision</th>
                  <th>Actions (Override)</th>
                </tr>
              </thead>
              <tbody>
                {adminData.map((app) => (
                  <tr key={app.id}>
                    <td>₹{app.amount}</td>
                    <td>
                      <span
                        style={{
                          color: app.riskScore < 650 ? "red" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {app.riskScore}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {app.status}
                      </div>
                      <div style={{ fontSize: "10px", color: "gray" }}>
                        {app.reason}
                      </div>
                    </td>
                    <td>
                      {app.status.includes("PENDING") && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleAdminAction(app.id, "APPROVE")}
                            style={{
                              background: "#dcfce7",
                              color: "green",
                              border: "none",
                              padding: "5px",
                              cursor: "pointer",
                            }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAdminAction(app.id, "REJECT")}
                            style={{
                              background: "#fee2e2",
                              color: "red",
                              border: "none",
                              padding: "5px",
                              cursor: "pointer",
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      {app.status.includes("Manual") && (
                        <span style={{ fontSize: "10px" }}>
                          Admin Action Taken
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
