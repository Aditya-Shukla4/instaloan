require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const multer = require("multer");
const Groq = require("groq-sdk");

// IMPORT AGENTS
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

// AGENTS
const riskAgent = new RiskAgent();
const complianceAgent = new ComplianceAgent();

// DB
let applications = [];

// --- 🧠 HYBRID BRAIN (FIXED: NO MORE HALLUCINATIONS) ---
async function analyzeLoanRequest(userText) {
  try {
    const lowerText = userText.toLowerCase();

    // ------------------------------------------------------
    // 1️⃣ RULE ENGINE: HANDLE CHIP CLICKS (Personal/Student)
    // ------------------------------------------------------
    if (
      lowerText.includes("personal loan") ||
      lowerText.includes("student loan")
    ) {
      return {
        intent: "CHAT",
        amount: 0,
        reply:
          "Great choice! To start, please tell me the Amount you need? (e.g. 50k, 2 Lakh)",
        suggestions: ["50k", "1 Lakh", "5 Lakh"], // Next logical chips
      };
    }

    // ------------------------------------------------------
    // 2️⃣ RULE ENGINE: DETECT PLAN SELECTION (Final Step)
    // ------------------------------------------------------
    const proceedMatch = userText.match(/Proceed with (\d+) for (\d+) months/i);
    if (proceedMatch) {
      return {
        intent: "LOAN_CONFIRM",
        amount: parseInt(proceedMatch[1]),
        tenure: parseInt(proceedMatch[2]),
        reply: "Locking plan & initiating Risk Analysis...",
        source: "RULE_ENGINE",
      };
    }

    // ------------------------------------------------------
    // 3️⃣ RULE ENGINE: DETECT LOAN AMOUNT & SHOW PLANS
    // ------------------------------------------------------
    const amountMatch = userText.match(/(\d+)\s*(k|lakh)?/i);

    // Sirf tab trigger karo jab amount ho, aur user 'rate' ya 'interest' na pooch raha ho
    if (
      amountMatch &&
      !lowerText.includes("rate") &&
      !lowerText.includes("interest")
    ) {
      let amount = 50000;
      if (amountMatch) {
        const unit = amountMatch[2] ? amountMatch[2].toLowerCase() : "";
        const num = parseInt(amountMatch[1]);
        if (unit === "k") amount = num * 1000;
        else if (unit.includes("lakh")) amount = num * 100000;
        else amount = num;
      }

      // Generate 3 Plans
      const rate = 14 / 12 / 100;
      const plans = [12, 24, 36].map((months) => {
        const emi = Math.round(
          (amount * rate * Math.pow(1 + rate, months)) /
            (Math.pow(1 + rate, months) - 1)
        );
        return { months, emi, total: emi * months };
      });

      return {
        intent: "SHOW_PLANS",
        amount: amount,
        reply: `For ₹${amount.toLocaleString()}, here are indicative plans:\n\n*Disclaimer: Rates are subject to credit checks & bank policy.*`,
        loanPlans: plans,
        source: "RULE_ENGINE",
      };
    }

    // ------------------------------------------------------
    // 4️⃣ AI AGENT (Strict Instructions)
    // ------------------------------------------------------
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
            Role: Honest Senior Loan Officer.
            Goal: Guide user to give an AMOUNT. Do NOT give general info.
            
            Rules:
            1. If user says "Hi" or "Hello", suggest "Personal Loan".
            2. If user asks "Student Loan", reply: "Student Loans info is coming soon. Can we try Personal Loan?"
            3. If user selects a loan type, ASK FOR AMOUNT.
            
            Output JSON: { "intent": "CHAT", "reply": "string", "suggestions": ["string"] }
          `,
        },
        { role: "user", content: userText },
      ],
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    aiData.source = "AI_AGENT";
    return aiData;
  } catch (error) {
    return {
      intent: "CHAT",
      reply: "Please type the amount (e.g. 50k) to proceed.",
      source: "FALLBACK_MODE",
    };
  }
}

// --- ROUTE ---
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const aiResult = await analyzeLoanRequest(message);

  // SCENARIO 1: Show Plans (Consultation Phase)
  // 🔥 FIX: Sending 'action' explicitly to trigger UI Animation
  if (aiResult.intent === "SHOW_PLANS") {
    return res.json({
      reply: aiResult.reply,
      action: "show_plans",
      loanPlans: aiResult.loanPlans,
      amount: aiResult.amount,
      suggestions: aiResult.suggestions, // if any
    });
  }

  // SCENARIO 2: User Confirmed Plan
  if (aiResult.intent === "LOAN_CONFIRM") {
    const riskDecision = riskAgent.evaluate(aiResult.amount);
    const auditLog = complianceAgent.generateAuditLog(
      riskDecision,
      aiResult.amount
    );

    const newApp = {
      id: Date.now(),
      amount: aiResult.amount,
      tenure: aiResult.tenure,
      status: riskDecision.status,
      riskScore: riskDecision.score,
      factors: riskDecision.factors,
      auditData: auditLog,
      // 🔥 SAVING DECISION SOURCE FOR ADMIN
      decisionSource: aiResult.source,
      date: new Date().toLocaleString(),
    };
    applications.push(newApp);

    let reply =
      riskDecision.status === "APPROVED"
        ? `Approved! Sanction Letter generated.`
        : `Rejected. Reason: ${riskDecision.reason}`;

    let action =
      riskDecision.status === "APPROVED" ? "download_sanction" : null;

    return res.json({
      reply,
      action,
      amount: aiResult.amount,
      meta: { risk: riskDecision },
    });
  }

  // Normal Response
  res.json(aiResult);
});

// ... (Admin/Upload/PDF routes remain same as previous code) ...
app.post("/api/admin/action", (req, res) => {
  const { id, action } = req.body;
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
app.get("/api/admin/applications", (req, res) => res.json(applications));
app.post("/api/upload", upload.single("file"), (req, res) => {
  const amount = req.body.amount || 0;
  const appIndex = applications.findIndex((a) => a.amount == amount);
  if (appIndex > -1) {
    applications[appIndex].status = "APPROVED (Verified)";
    applications[appIndex].doc = req.file ? req.file.filename : "Uploaded";
  }
  res.json({
    reply: "Docs Verified!",
    action: "download_sanction",
    amount: amount,
  });
});
app.get("/api/download-sanction", (req, res) => {
  const amount = req.query.amount || "Loan";
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.fontSize(25).text("INSTALOAN PRIME", { align: "center" });
  doc.text(`Loan: ${amount} | APPROVED`, { align: "center" });
  doc.end();
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));
