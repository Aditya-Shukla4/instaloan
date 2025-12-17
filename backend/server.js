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

// --- 🧠 HYBRID BRAIN (COMMA FIX + SMART LOGIC) ---
async function analyzeLoanRequest(userText) {
  try {
    // 1. CLEAN INPUT (Remove commas: "50,000" -> "50000")
    const cleanText = userText.replace(/,/g, "").toLowerCase();
    const rawText = userText; // Keep original for context if needed

    // ------------------------------------------------------
    // PRIORITY 1: DETECT PLAN SELECTION (Button Click)
    // ------------------------------------------------------
    const proceedMatch = userText.match(/Proceed with (\d+) for (\d+) months/i); // Keep original text for exact match
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
    // PRIORITY 2: DETECT SPECIFIC EMI CALCULATION (User asks "EMI for 5L")
    // ------------------------------------------------------
    const isEmiIntent =
      cleanText.includes("emi") ||
      cleanText.includes("calculate") ||
      cleanText.includes("interest");
    const amountMatch = cleanText.match(/(\d+)\s*(k|lakh|cr)?/i);

    if (isEmiIntent && amountMatch) {
      let amount = 50000;
      const unit = amountMatch[2] || "";
      const num = parseInt(amountMatch[1]);
      if (unit === "k") amount = num * 1000;
      else if (unit.includes("lakh")) amount = num * 100000;
      else if (unit.includes("cr")) amount = num * 10000000;
      else amount = num;

      // Tenure detection
      const tenureMatch = cleanText.match(/(\d+)\s*(month|year|saal|mahine)/i);
      let months = 12;
      if (tenureMatch) {
        months =
          tenureMatch[2].startsWith("year") || tenureMatch[2].startsWith("saal")
            ? parseInt(tenureMatch[1]) * 12
            : parseInt(tenureMatch[1]);
      }

      // Calculate
      const r = 14 / 12 / 100;
      const emi = Math.round(
        (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
      );
      const totalPayable = emi * months;
      const totalInterest = totalPayable - amount;

      return {
        intent: "EMI_CALC",
        amount: amount,
        reply: `Here is the mathematical breakdown for ₹${amount.toLocaleString()}:`,
        emiData: {
          emi: emi,
          principal: amount,
          interest: totalInterest,
          total: totalPayable,
          tenure: months,
        },
        source: "MATHS_ENGINE",
      };
    }

    // ------------------------------------------------------
    // PRIORITY 3: DETECT LOAN APPLICATION (User says "50000" or "50k")
    // ------------------------------------------------------
    // If user provided a number but didn't explicitly ask for "calculator", assume they want Plans.
    if (amountMatch) {
      let amount = 50000;
      const unit = amountMatch[2] || "";
      const num = parseInt(amountMatch[1]);
      if (unit === "k") amount = num * 1000;
      else if (unit.includes("lakh")) amount = num * 100000;
      else if (unit.includes("cr")) amount = num * 10000000;
      else amount = num;

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
    // PRIORITY 4: HANDLE CHIP CLICKS (Context Setting)
    // ------------------------------------------------------
    if (
      cleanText.includes("personal loan") ||
      cleanText.includes("student loan")
    ) {
      return {
        intent: "CHAT",
        amount: 0,
        reply:
          "Great choice! To start, please tell me the Amount you need? (e.g. 50k, 2 Lakh)",
        suggestions: ["50k", "1 Lakh", "5 Lakh"],
      };
    }

    // ------------------------------------------------------
    // PRIORITY 5: AI AGENT (Strict Fallback)
    // ------------------------------------------------------
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
            Role: Honest Senior Loan Officer.
            Goal: Get the loan amount from the user.
            
            Rules:
            1. If user says "Hi", suggest "Personal Loan".
            2. If user asks vague questions like "Show me plans", ask "For which amount?".
            3. Do NOT make up plans. Only ask for amount.
            
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
      reply: "I missed that. Could you type the amount again? (e.g. 50000)",
      source: "FALLBACK_MODE",
    };
  }
}

// --- ROUTE ---
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const aiResult = await analyzeLoanRequest(message);

  // SCENARIO 1: Show Plans
  if (aiResult.intent === "SHOW_PLANS") {
    return res.json({
      reply: aiResult.reply,
      action: "show_plans",
      loanPlans: aiResult.loanPlans,
      amount: aiResult.amount,
      suggestions: aiResult.suggestions,
    });
  }

  // SCENARIO 2: Show EMI Calculator Result
  if (aiResult.intent === "EMI_CALC") {
    return res.json({
      reply: aiResult.reply,
      action: "emi_calc",
      emiData: aiResult.emiData,
      amount: aiResult.amount,
    });
  }

  // SCENARIO 3: User Confirmed Plan
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

// ... (Rest of the routes remain same) ...
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
