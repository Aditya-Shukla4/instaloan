// agents/ComplianceAgent.js
class ComplianceAgent {
  constructor() {
    console.log("⚖️ Compliance Agent Online: Ready to audit.");
  }

  generateAuditLog(riskResult, amount) {
    const isApproved = riskResult.status === "APPROVED";

    // Dynamic Explainability String
    let explanation = `Decision based on Credit Score ${riskResult.score}. `;

    if (riskResult.factors.length > 0) {
      explanation += `Key Factors: [${riskResult.factors.join(", ")}]. `;
    }

    if (!isApproved) {
      explanation += `Action: ${riskResult.reason}`;
    }

    return {
      auditId: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      decision: riskResult.status,
      complianceNote: explanation,
      regulatoryFlag: amount > 200000 ? "RBI_REPORTING_REQ" : "STANDARD",
      confidence: riskResult.score > 700 ? "HIGH" : "MEDIUM",
    };
  }
}

module.exports = ComplianceAgent;
