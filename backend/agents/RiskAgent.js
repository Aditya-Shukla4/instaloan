// agents/RiskAgent.js
class RiskAgent {
  constructor() {
    console.log("👮 Risk Agent Activated: Monitoring Credit Lines...");
  }

  evaluate(amount, userMetadata = {}) {
    let riskScore = 0;
    let factors = [];
    let isRejected = false;
    let reason = "";

    console.log(`🔍 Risk Agent Analyzing: ₹${amount}`);

    // --- 1. CHEAT CODES (For Demo Magic) ---
    // Scenario A: Amount ends in 00 (e.g., 50000) -> Instant Approve
    if (amount % 100 === 0) {
      riskScore = 850;
      factors.push("Prime Customer (Demo Cheat)");
    }
    // Scenario B: Amount ends in 99 (e.g., 49999) -> Fraud
    else if (amount % 100 === 99) {
      riskScore = 300;
      isRejected = true;
      reason = "Detected pattern match with known fraud IDs.";
      factors.push("Blacklisted ID Match");
    }
    // Scenario C: Normal User
    else {
      riskScore = 720;
    }

    // --- 2. ADAPTIVE RISK (The "2 AM" Hack) ---
    // India Time (IST) Logic
    const currentHour = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    });

    // Agar Raat ke 1 AM se Subah 5 AM tak request aayi -> HIGH RISK
    if (currentHour >= 1 && currentHour <= 5) {
      console.log("⚠️ NIGHT TIME ALERT: High Risk Mode Triggered");
      riskScore -= 50; // Penalty
      factors.push(`High-Risk Time Request (${currentHour}:00 hrs)`);

      // Agar score borderline tha, toh ab reject
      if (riskScore < 680) {
        isRejected = true;
        reason = "Security freeze due to unusual login time.";
      }
    }

    // --- 3. DECISION LOGIC ---
    let status = "PENDING_DOCS"; // Default

    if (isRejected) {
      status = "REJECTED";
    } else if (riskScore >= 750 && amount < 100000) {
      status = "APPROVED"; // Instant Sanction
      factors.push("Instant Approval Criteria Met");
    } else {
      status = "PENDING_DOCS";
      reason =
        amount > 100000
          ? "High Value Loan requires verification"
          : "Standard verification protocol";
    }

    return {
      status,
      score: riskScore,
      reason: reason || "System Decision",
      factors: factors,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = RiskAgent;
