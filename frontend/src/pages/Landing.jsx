import { Bot, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[105] w-[105] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-[-30] right-[-20] h-[90] w-[90] rounded-full bg-purple-500/20 blur-[160px]" />
      </div>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-28">
        <div className="mb-8 rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/20 shadow-sm">
          <Bot className="h-14 w-14 text-primary" />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          InstaLoan <span className="text-primary">AI</span>
        </h1>

        <p className="mt-6 max-w-xl text-muted-foreground text-base md:text-lg leading-relaxed">
          Instant, transparent loan assistance powered by AI.  
          No calls. No confusion. No paperwork chaos.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="gap-2 px-8 text-base shadow-lg shadow-primary/20"
            onClick={() => navigate("/app")}
          >
            Start Chat
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="px-8 text-base"
          >
            How it works
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            title="Fast Decisions"
            desc="Get instant eligibility insights and next steps without delays."
          />

          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6 text-green-500" />}
            title="Secure & Transparent"
            desc="Clear risk analysis, audit trails, and no hidden rules."
          />

          <FeatureCard
            icon={<Bot className="h-6 w-6 text-blue-500" />}
            title="AI-First Experience"
            desc="Just ask. The AI handles the complexity for you."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 bg-secondary/30">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How it works
          </h2>

          <div className="mt-14 grid gap-12 md:grid-cols-3">
            <Step index="01" title="Ask">
              Tell InstaLoan AI what you need.
            </Step>

            <Step index="02" title="Analyze">
              Eligibility, risks, and options explained clearly.
            </Step>

            <Step index="03" title="Proceed">
              Upload documents and move forward securely.
            </Step>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Ready to start?
        </h2>
        <p className="mt-5 text-muted-foreground text-base">
          Ask your first question and let the AI handle the rest.
        </p>
        <Button
          size="lg"
          className="mt-10 gap-2 px-10 text-base shadow-lg shadow-primary/20"
          onClick={() => navigate("/app")}
        >
          Open Chat
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="p-7 bg-card/60 backdrop-blur border-border/60 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </Card>
  );
}

function Step({ index, title, children }) {
  return (
    <div>
      <span className="text-primary font-bold tracking-widest">
        {index}
      </span>
      <h4 className="mt-3 font-semibold text-lg">{title}</h4>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}
