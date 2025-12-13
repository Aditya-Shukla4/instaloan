require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const multer = require("multer");
const Groq = require("groq-sdk");

// IMPORT AGENTS (The New Brains)
const RiskAgent = require("./agents/RiskAgent");
const ComplianceAgent = require("./agents/ComplianceAgent");

const app = express();
app.use(cors());
app.use(express.json());

// CONFIG
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: "uploads/" });

// API KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// INITIALIZE AGENTS
const riskAgent = new RiskAgent();
const complianceAgent = new ComplianceAgent();

// DATA STORE (In-Memory Database)
let applications = [];


async function analyzeLoanRequest(userText) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
            Role: Proactive Senior Loan Officer for 'InstaLoan Prime'.
            Goal: Guide the user to apply for a loan. Be helpful, short, and conversational (Hinglish allowed).
            
            Rules:
            1. If user is VAGUE (e.g., "Hi", "Loan chahiye"):
               - Do NOT assume amount.
               - Proactively suggest: "Namaste! Are you looking for a Personal Loan or Student Loan?"
               - Or suggest amounts: "Most users start with ₹50,000. Would that work?"
               - Output: { "intent": "CHAT", "amount": 0, "reply": "...", "suggestions": ["₹50,000 Personal Loan", "₹2 Lakh Student Loan"] }

            2. If user asks for INFO (e.g., "Interest kitna hai?", "EMI kya hogi?"):
               - Provide estimates (NOT promises).
               - "Typically 12-14% p.a. rehta hai depending on profile."
               - "For ₹50k, approx EMI is ₹4,500/month."
               - Output: { "intent": "CHAT", "amount": 0, "reply": "..." }

            3. If user gives SPECIFIC intent (e.g., "50k chahiye", "I want 1 lakh"):
               - Extract amount.
               - Output: { "intent": "LOAN", "amount": NUMBER, "reply": "Great! Processing your application for ₹..." }

            Output JSON Format: 
            { 
              "intent": "LOAN" | "CHAT", 
              "amount": number (0 if chat), 
              "reply": "string",
              "suggestions": ["string", "string"] (Optional: Quick reply options for user)
            }
          `,
        },
        { role: "user", content: userText },
      ],
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    // Fallback Logic (Regex)
    const amountMatch = userText.match(/(\d{4,})/);
    if (amountMatch) {
      return {
        intent: "LOAN",
        amount: parseInt(amountMatch[0]),
        reply:
          "AI is offline, but Rule Engine detected a loan request. Processing...",
        source: "REGEX_FALLBACK",
      };
    }
    return {
      intent: "CHAT",
      amount: 0,
      reply: "System busy. Seedha amount bataiye (e.g. 50000).",
      source: "NONE",
    };
  }
}

// --- 🚀 MAIN ROUTE (The Agentic Workflow) ---
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // STEP 1: AI Agent (Sales) extracts intent
  const aiResult = await analyzeLoanRequest(message);

  // Handle Queries/Chat (Non-Loan)
  if (aiResult.intent !== "LOAN" || aiResult.amount === 0) {
    return res.json({ reply: aiResult.reply, action: null });
  }

  // STEP 2: Risk Agent (The Strict Cop) Logic
  const riskDecision = riskAgent.evaluate(aiResult.amount);

  // STEP 3: Compliance Agent (The Lawyer) Audit
  const auditLog = complianceAgent.generateAuditLog(
    riskDecision,
    aiResult.amount
  );

  // STEP 4: Save Application with Explainability Data
  const newApp = {
    id: Date.now(),
    amount: aiResult.amount,
    status: riskDecision.status,
    riskScore: riskDecision.score,
    reason: riskDecision.reason,

    // 🔥 NEW: Storing "Glass Box" Data for Admin Panel
    factors: riskDecision.factors,
    auditData: auditLog,

    date: new Date().toLocaleString(),
    doc: riskDecision.status.includes("PENDING") ? "Pending" : "Not Required",
  };

  applications.push(newApp);

  // STEP 5: Generate Response based on Agent Decisions
  let clientAction = null;
  let clientReply = aiResult.reply;

  if (riskDecision.status === "APPROVED") {
    clientAction = "download_sanction";
    clientReply = `Badhai ho! Risk Agent ne approve kar diya hai (Score: ${riskDecision.score}). Sanction Letter ready hai.`;
  } else if (riskDecision.status === "REJECTED") {
    clientAction = null;
    clientReply = `Sorry Bhai, Risk Agent ne decline kiya hai. Reason: ${riskDecision.reason}`;
  } else {
    clientAction = "upload_docs";
    clientReply = `Score (${riskDecision.score}) theek hai, par amount bada hai. Salary Slip upload karni padegi.`;
  }

  // Send full debug info for you to see in console/network tab
  res.json({
    reply: clientReply,
    action: clientAction,
    amount: aiResult.amount,
    meta: {
      risk_factors: riskDecision.factors,
      audit: auditLog,
    },
  });
});

// --- ADMIN & UTILS ---

// Admin Action Override
app.post("/api/admin/action", (req, res) => {
  const { id, action } = req.body;
  const appIndex = applications.findIndex((a) => a.id == id);
  if (appIndex > -1) {
    applications[appIndex].status =
      action === "APPROVE" ? "APPROVED (Manual)" : "REJECTED (Manual)";
    applications[appIndex].reason = `Admin Override: ${action}`;
    applications[
      appIndex
    ].auditData.complianceNote += ` [MANUAL OVERRIDE by Admin]`;
    res.json({ success: true, app: applications[appIndex] });
  } else {
    res.status(404).json({ success: false });
  }
});

// Upload Docs
app.post("/api/upload", upload.single("file"), (req, res) => {
  const amount = req.body.amount || 0;
  const appIndex = applications.findIndex((a) => a.amount == amount); // Simple matching logic
  if (appIndex > -1) {
    applications[appIndex].status = "APPROVED (Verified)";
    applications[appIndex].doc = req.file ? req.file.filename : "Uploaded";
    applications[appIndex].auditData.complianceNote += " [Document Verified]";
  }
  res.json({
    reply: "Docs Verified! Loan APPROVED.",
    action: "download_sanction",
    amount: amount,
  });
});

// Get All Apps (Updated to send Audit Data)
app.get("/api/admin/applications", (req, res) => res.json(applications));

// Generate PDF
app.get("/api/download-sanction", (req, res) => {
  const amount = req.query.amount || "Loan";
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.fontSize(25).text("INSTALOAN - Sanction Letter", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Loan Amount: INR ${amount}`);
  doc.text(`Status: APPROVED (AI Verified)`);
  doc.moveDown();
  doc
    .fontSize(12)
    .text(
      "This is a computer generated document based on Risk Agent Analysis.",
      { align: "center" }
    );
  doc.end();
});

app.listen(5000, () => console.log("🚀 Agentic Server running on Port 5000"));
