require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const multer = require("multer");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

// CONFIG
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: "uploads/" });

// API KEY
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let applications = [];

// --- 🛡️ 1. DETERMINISTIC RISK ENGINE (The "Legal" Brain) ---
// --- 🛡️ 1. DETERMINISTIC RISK ENGINE (Cheat Codes for Demo) ---
class CreditRiskEngine {
  static evaluate(amount) {
    let creditScore;
    let isFraud = false;

    // --- CHEAT CODES FOR DEMO ---
    // Scenario 1: User wants Instant Approval (Type amount ending in 00, e.g. 50000)
    if (amount % 100 === 0) {
      creditScore = 850; // Excellent Score
    }
    // Scenario 2: User wants Rejection (Type amount ending in 99, e.g. 59999)
    else if (amount % 100 === 99) {
      creditScore = 550; // Poor Score
      isFraud = true; // Trigger Fraud Flag
    }
    // Scenario 3: User wants Doc Upload (Any other amount, e.g. 55555)
    else {
      creditScore = 720; // Average Score
    }

    console.log(`🔍 Risk Check: Score ${creditScore}, Amount ${amount}`);

    // RULE 1: Fraud Check
    if (isFraud) {
      return {
        status: "REJECTED",
        reason: "Multiple loan applications detected (Fraud Risk)",
        score: creditScore,
      };
    }

    // RULE 2: Credit Score Logic
    if (creditScore < 650) {
      return {
        status: "REJECTED",
        reason: `Low Credit Score (${creditScore}). Minimum 650 required.`,
        score: creditScore,
      };
    }

    // RULE 3: Amount Limits based on Score
    // Even if score is good, big amount (>1L) needs docs
    if (amount > 100000 && creditScore < 800) {
      return {
        status: "PENDING_DOCS",
        reason: "High Amount. Salary Slip required.",
        score: creditScore,
      };
    }

    // RULE 4: Instant Approval Criteria
    if (amount <= 100000 && creditScore >= 700) {
      return {
        status: "APPROVED",
        reason: "Instant Approval (Prime Customer)",
        score: creditScore,
      };
    }

    // Default Fallback
    return {
      status: "PENDING_DOCS",
      reason: "Standard Verification Required",
      score: creditScore,
    };
  }
}

// --- 🧠 2. AI EXTRACTION ENGINE (Only for Understanding) ---
async function analyzeLoanRequest(userText) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
                    Role: Loan Data Extractor.
                    Task: Extract INTENT and AMOUNT. Do NOT make loan decisions.
                    
                    Output JSON: { 
                        "intent": "LOAN" | "QUERY" | "CHAT", 
                        "amount": number (0 if not found), 
                        "confidence": number (0-1),
                        "reply": "string (Polite Hinglish)" 
                    }`,
        },
        { role: "user", content: userText },
      ],
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    return { intent: "CHAT", amount: 0, reply: "System busy." };
  }
}

// --- ROUTES ---

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // STEP 1: AI Extracts Data (No Decision yet)
  const aiResult = await analyzeLoanRequest(message);

  // Handle Queries/Chat
  if (aiResult.intent !== "LOAN" || aiResult.amount === 0) {
    return res.json({ reply: aiResult.reply, action: null });
  }

  // STEP 2: Risk Engine Takes Over (The "Real" Logic)
  const riskDecision = CreditRiskEngine.evaluate(aiResult.amount, aiResult);

  const appId = Date.now();
  const newApp = {
    id: appId,
    amount: aiResult.amount,
    status: riskDecision.status,
    riskScore: riskDecision.score, // Saving Score for Admin
    reason: riskDecision.reason, // Audit Trail
    aiConfidence: aiResult.confidence || 0.95, // AI Metrics
    date: new Date().toLocaleString(),
    doc: riskDecision.status.includes("PENDING") ? "Pending" : "Not Required",
  };

  applications.push(newApp);

  // STEP 3: Generate Response based on Risk Engine
  let clientAction = null;
  let clientReply = aiResult.reply;

  if (riskDecision.status === "APPROVED") {
    clientAction = "download_sanction";
    clientReply = `Congratulations! Credit Score (${riskDecision.score}) looks good. Loan Approved.`;
  } else if (riskDecision.status === "REJECTED") {
    clientAction = null;
    clientReply = `Sorry, loan rejected. Reason: ${riskDecision.reason}`;
  } else {
    clientAction = "upload_docs";
    clientReply = `Credit Score ${riskDecision.score} is okay, but we need Salary Slip for ₹${aiResult.amount}.`;
  }

  res.json({
    reply: clientReply,
    action: clientAction,
    amount: aiResult.amount,
  });
});

// --- ADMIN ACTION ROUTE (Override Logic) ---
app.post("/api/admin/action", (req, res) => {
  const { id, action } = req.body; // action = "APPROVE" or "REJECT"
  const appIndex = applications.findIndex((a) => a.id == id);

  if (appIndex > -1) {
    applications[appIndex].status =
      action === "APPROVE" ? "APPROVED (Manual)" : "REJECTED (Manual)";
    applications[appIndex].reason = `Admin Override: ${action}`;
    res.json({ success: true, app: applications[appIndex] });
  } else {
    res.status(404).json({ success: false });
  }
});

// ... (Upload and PDF Routes remain same as previous MVP) ...
// (Add Upload/PDF/GetAdmin routes here from previous code)

// Paste Upload/PDF routes from previous code here...
app.post("/api/upload", upload.single("file"), (req, res) => {
  const amount = req.body.amount || 0;
  const appIndex = applications.findIndex((a) => a.amount == amount);
  if (appIndex > -1) {
    applications[appIndex].status = "APPROVED (Verified)";
    applications[appIndex].doc = req.file ? req.file.filename : "Uploaded";
  }
  res.json({
    reply: "Docs Verified! Loan APPROVED.",
    action: "download_sanction",
    amount: amount,
  });
});

app.get("/api/admin/applications", (req, res) => res.json(applications));

app.get("/api/download-sanction", (req, res) => {
  const amount = req.query.amount || "Loan";
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.fontSize(25).text("INSTALOAN - Sanction Letter", { align: "center" });
  doc.text(`Loan of INR ${amount} is APPROVED!`);
  doc.end();
});

app.listen(5000, () => console.log("🚀 Server running on Port 5000"));
