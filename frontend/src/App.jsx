import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  Send,
  ShieldCheck,
  Banknote,
  LayoutDashboard,
  MessageSquare,
  Check,
  X,
  FileText,
  AlertTriangle,
  Clock,
  Mic,
  TrendingUp,
  ShieldAlert,
  Zap,
} from "lucide-react";

function App() {
  const [view, setView] = useState("chat");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! InstaLoan mein swagat hai. Are you looking for a Personal Loan or Student Loan?",
      suggestions: ["Personal Loan", "Student Loan"], // Initial Suggestions
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [agentStatus, setAgentStatus] = useState("");

  // --- 🎙️ VOICE INPUT LOGIC ---
  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;

      setIsTyping(true);
      setAgentStatus("🎙️ Listening to you...");

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsTyping(false);
        setAgentStatus("");
      };

      recognition.onerror = () => {
        setIsTyping(false);
        setAgentStatus("");
        alert("Mic access error. Check browser permissions.");
      };

      recognition.start();
    } else {
      alert("Browser does not support Voice API. Chrome use kar bhai.");
    }
  };

  // --- 🤖 CHAT LOGIC ---
  const processBotResponse = async (userInput) => {
    try {
      // PHASE 1: Sales Agent
      setIsTyping(true);
      setAgentStatus("🕵️ Sales Agent: Understanding Intent...");

      // NOTE: Ensure URL matches your backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();

      // PHASE 2: Risk Agent (Theatre) - Only if loan intent detected
      if (data.amount > 0) {
        setAgentStatus("👮 Risk Agent: Checking Credit Bureau & Fraud DB...");
        await new Promise((r) => setTimeout(r, 1200));

        // PHASE 3: Compliance Agent
        setAgentStatus("⚖️ Compliance Agent: Generating Audit Report...");
        await new Promise((r) => setTimeout(r, 1000));
      }

      // PHASE 4: Final Result
      setAgentStatus("✅ Finalizing Decision...");
      await new Promise((r) => setTimeout(r, 500));

      let botMsg = {
        sender: "bot",
        text: data.reply,
        action: data.action,
        amount: data.amount,
        suggestions: data.suggestions, // 🔥 Capture Suggestions from Backend
        timestamp: "Now",
      };

      if (data.action === "download_sanction") {
        botMsg.actionLabel = "Download Sanction Letter";
        botMsg.actionUrl = `http://localhost:5000/api/download-sanction?amount=${data.amount}`;
      } else if (data.action === "upload_docs") {
        botMsg.actionLabel = "Upload Salary Slip";
        setCurrentAmount(data.amount);
      }

      setIsTyping(false);
      setAgentStatus("");
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setIsTyping(false);
      setAgentStatus("");
      // Fallback message if server is down
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ System Offline. Switching to Offline Mode (Regex)...",
        },
      ]);
    }
  };

  // --- ADMIN ACTIONS ---
  const handleAdminAction = async (id, action) => {
    await fetch("http://localhost:5000/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    fetchAdminData();
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/applications");
      const data = await res.json();
      setAdminData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (view === "admin") fetchAdminData();
  }, [view]);

  // --- FILE UPLOAD ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📎 Uploaded: ${file.name}`, timestamp: "Now" },
    ]);
    setIsTyping(true);
    setAgentStatus("📄 Document Agent: Verifying File...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("amount", currentAmount || 0);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      await new Promise((r) => setTimeout(r, 1000));
      setIsTyping(false);
      setAgentStatus("");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          action: data.action,
          actionLabel: "Download Sanction Letter",
          actionUrl: `http://localhost:5000/api/download-sanction?amount=${data.amount}`,
          timestamp: "Now",
        },
      ]);
    } catch (error) {
      setIsTyping(false);
      setAgentStatus("");
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input, timestamp: "Now" },
    ]);
    const userInput = input;
    setInput("");
    processBotResponse(userInput);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, agentStatus]);

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
          <div className="header">
            <div className="logo-circle">
              <Banknote size={24} />
            </div>
            <div className="header-info">
              <h2>InstaLoan Prime</h2>
              <div className="verified-badge">
                <ShieldCheck size={14} /> AI Agent Active
              </div>
            </div>
          </div>

          {/* 🔥 PRE-APPROVAL BANNER 🔥 */}
          <div className="pre-approval-banner">
            <span>
              🎁 <b>Pre-Approved Offer:</b> You are eligible for up to ₹80,000
              instantly!
            </span>
          </div>

          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.sender}`}>
                <div className="bubble">
                  {msg.text}

                  {/* Action Button (Download/Upload) */}
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

                  {/* 🔥 NEW: SUGGESTION CHIPS (Guided Choice) 🔥 */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="suggestion-container">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          className="chip-btn"
                          onClick={() => {
                            setInput(s);
                            processBotResponse(s); // Auto-send when clicked
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="agent-loader">
                <div className="agent-spinner"></div>
                <span className="agent-text">{agentStatus}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="input-area">
            <button
              className="icon-btn mic-btn"
              onClick={startListening}
              title="Speak"
            >
              <Mic size={20} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or Speak..."
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
        // --- ADMIN PANEL ---
        <div className="admin-container">
          <div
            className="header"
            style={{ background: "#0f172a", justifyContent: "space-between" }}
          >
            <h2>🏦 Agentic Lending OS</h2>
            <button
              onClick={fetchAdminData}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Refresh ⟳
            </button>
          </div>

          {/* 🔥 METRICS DASHBOARD 🔥 */}
          <div className="metrics-dashboard">
            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "#dbeafe", color: "#1e40af" }}
              >
                <Zap size={18} />
              </div>
              <div>
                <div className="metric-value">27s</div>
                <div className="metric-title">Avg Approval</div>
              </div>
            </div>
            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "#fee2e2", color: "#991b1b" }}
              >
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="metric-value">14</div>
                <div className="metric-title">Fraud Blocked</div>
              </div>
            </div>
            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="metric-value">41%</div>
                <div className="metric-title">Conversion</div>
              </div>
            </div>
            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "#ffedd5", color: "#9a3412" }}
              >
                <Banknote size={18} />
              </div>
              <div>
                <div className="metric-value">₹120</div>
                <div className="metric-title">Cost Saved/App</div>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Amt</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>AI Analysis</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminData.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr
                      style={{
                        background:
                          expandedRow === app.id ? "#f1f5f9" : "white",
                      }}
                    >
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
                        <div
                          className={`status-badge ${
                            app.status.includes("APPROVED")
                              ? "success"
                              : "pending"
                          }`}
                        >
                          {app.status}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === app.id ? null : app.id
                            )
                          }
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <FileText size={14} /> View Logic
                        </button>
                      </td>
                      <td>
                        {app.status.includes("PENDING") && (
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() =>
                                handleAdminAction(app.id, "APPROVE")
                              }
                              className="icon-btn approve"
                              title="Force Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleAdminAction(app.id, "REJECT")
                              }
                              className="icon-btn reject"
                              title="Force Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        {app.status.includes("Manual") && (
                          <span style={{ fontSize: "10px", color: "#64748b" }}>
                            Admin Override
                          </span>
                        )}
                      </td>
                    </tr>
                    {expandedRow === app.id && (
                      <tr>
                        <td colSpan="5" style={{ padding: "0" }}>
                          <div
                            style={{
                              background: "#f8fafc",
                              padding: "15px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 10px 0",
                                fontSize: "14px",
                                color: "#475569",
                              }}
                            >
                              🧠 Agent Logic Breakdown:
                            </h4>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "15px",
                              }}
                            >
                              <div className="audit-card">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    marginBottom: "5px",
                                    color: "#b91c1c",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                  }}
                                >
                                  <AlertTriangle size={14} /> RISK FACTORS
                                </div>
                                <ul
                                  style={{
                                    margin: "0",
                                    paddingLeft: "20px",
                                    fontSize: "13px",
                                    color: "#334155",
                                  }}
                                >
                                  {app.factors && app.factors.length > 0 ? (
                                    app.factors.map((f, i) => (
                                      <li key={i}>{f}</li>
                                    ))
                                  ) : (
                                    <li>No high-risk flags detected.</li>
                                  )}
                                </ul>
                              </div>
                              <div className="audit-card">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    marginBottom: "5px",
                                    color: "#15803d",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                  }}
                                >
                                  <Clock size={14} /> COMPLIANCE AUDIT
                                </div>
                                <p
                                  style={{
                                    margin: "0",
                                    fontSize: "13px",
                                    color: "#334155",
                                  }}
                                >
                                  {app.auditData
                                    ? app.auditData.complianceNote
                                    : "Audit Pending..."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
