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
  Zap,
  TrendingUp,
  ShieldAlert,
  Cpu, // New Icon for Source
} from "lucide-react";

function App() {
  const [view, setView] = useState("chat");
  // 🔥 UPDATED INITIAL STATE FOR HONESTY
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! InstaLoan mein swagat hai. How can I help you today?",
      suggestions: ["Personal Loan", "Student Loan (Info)"],
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  // --- 🎙️ VOICE INPUT LOGIC ---
  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;

      setIsTyping(true);
      setAgentStatus("🎙️ Listening...");

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsTyping(false);
        setAgentStatus("");
      };

      recognition.onerror = () => {
        setIsTyping(false);
        setAgentStatus("");
        alert("Mic access error.");
      };

      recognition.start();
    } else {
      alert("Use Chrome for Voice features.");
    }
  };

  // --- 🤖 CHAT LOGIC ---
  const processBotResponse = async (userInput) => {
    try {
      setIsTyping(true);
      setAgentStatus("🕵️ Sales Agent: Understanding Intent...");

      // Ensure URL matches your backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();

      // --- VISUAL FEEDBACK (THEATRE) ---
      if (data.action === "show_plans") {
        setAgentStatus("🧮 Advisor Agent: Structuring Plans...");
        await new Promise((r) => setTimeout(r, 1000));
      } else if (
        data.reply.includes("Approved") ||
        data.reply.includes("Rejected")
      ) {
        setAgentStatus("👮 Risk Agent: Analyzing Credit Score...");
        await new Promise((r) => setTimeout(r, 1200));
        setAgentStatus("⚖️ Compliance Agent: Finalizing...");
        await new Promise((r) => setTimeout(r, 800));
      }

      setAgentStatus("✅ Responding...");
      await new Promise((r) => setTimeout(r, 400));

      let botMsg = {
        sender: "bot",
        text: data.reply,
        action: data.action,
        amount: data.amount,
        suggestions: data.suggestions,
        loanPlans: data.loanPlans,
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
      console.error("Backend Error:", error);
      setIsTyping(false);
      setAgentStatus("");
      // 🔥 CLEAR FALLBACK MESSAGE FOR UX
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ AI Service Unavailable. Switching to Offline Rule-Engine.",
        },
      ]);
    }
  };

  // --- HANDLE PLAN SELECTION ---
  const handlePlanClick = (amount, months) => {
    const userText = `Proceed with ${amount} for ${months} months`;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `Selected: ${months} Months Plan` },
    ]);
    processBotResponse(userText);
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
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, agentStatus]);

  // File Upload Logic
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📎 Uploaded: ${file.name}`, timestamp: "Now" },
    ]);
    setIsTyping(true);
    setAgentStatus("📄 Document Agent: Verifying...");

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
        },
      ]);
    } catch (error) {
      setIsTyping(false);
      setAgentStatus("");
    }
  };

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

          <div className="pre-approval-banner">
            <span>
              🎁 <b>Pre-Approved:</b> Eligible for ₹80,000 instantly! *T&C Apply
            </span>
          </div>

          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.sender}`}>
                <div className="bubble">
                  {/* 🔥 UPDATED: Pre-line style for Disclaimer formatting */}
                  <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                  {/* Plan Cards */}
                  {msg.loanPlans && (
                    <div className="plans-container">
                      {msg.loanPlans.map((plan, i) => (
                        <div
                          key={i}
                          className="plan-card"
                          onClick={() =>
                            handlePlanClick(msg.amount, plan.months)
                          }
                        >
                          <div className="plan-tenure">
                            {plan.months} Months
                          </div>
                          <div className="plan-emi">
                            ₹{plan.emi.toLocaleString()}
                            <span style={{ fontSize: "10px" }}>/mo</span>
                          </div>
                          <div className="plan-total">
                            Total: ₹{(plan.total / 1000).toFixed(1)}k
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
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

                  {/* Suggestion Chips */}
                  {msg.suggestions && (
                    <div className="suggestion-container">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          className="chip-btn"
                          onClick={() => {
                            setInput(s);
                            processBotResponse(s);
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
              placeholder="Type amount (e.g. 50k)..."
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
        // --- UPGRADED ADMIN PANEL ---
        <div className="admin-container">
          <div
            className="header"
            style={{ background: "#0f172a", justifyContent: "space-between" }}
          >
            <h2>🏦 Lending OS Admin</h2>
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

          {/* Metrics Dashboard */}
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
                  <th>Tenure</th>
                  <th>Risk Score</th>
                  <th>Source</th>
                  <th>Status</th>
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
                      <td>{app.tenure ? `${app.tenure}M` : "-"}</td>
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

                      {/* 🔥 NEW SOURCE COLUMN: AI vs RULE */}
                      <td>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "600",
                            background:
                              app.decisionSource === "AI_AGENT"
                                ? "#f3e8ff"
                                : "#e0f2fe",
                            color:
                              app.decisionSource === "AI_AGENT"
                                ? "#6b21a8"
                                : "#0369a1",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            width: "fit-content",
                          }}
                        >
                          {app.decisionSource === "AI_AGENT" ? (
                            <Cpu size={10} />
                          ) : (
                            <Zap size={10} />
                          )}
                          {app.decisionSource === "AI_AGENT" ? "AI" : "Rule"}
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
                          <FileText size={14} /> Info
                        </button>
                      </td>
                    </tr>
                    {expandedRow === app.id && (
                      <tr>
                        <td colSpan="6" style={{ padding: "0" }}>
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
                                {/* Admin Actions inside Detail View */}
                                {app.status.includes("PENDING") && (
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      display: "flex",
                                      gap: "10px",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleAdminAction(app.id, "APPROVE")
                                      }
                                      className="icon-btn approve"
                                      title="Force Approve"
                                    >
                                      <Check size={16} /> Force Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAdminAction(app.id, "REJECT")
                                      }
                                      className="icon-btn reject"
                                      title="Force Reject"
                                    >
                                      <X size={16} /> Force Reject
                                    </button>
                                  </div>
                                )}
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
