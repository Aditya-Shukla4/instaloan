import { Bot, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Typewriter from "@/components/Typewriter";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ================= HERO ================= */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-28">
        <div className="mb-10 rounded-xl bg-primary/10 p-6 ring-1 ring-primary/20">
          <Bot className="h-14 w-14 text-primary" />
        </div>

        <h1 className="max-w-2xl text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          InstaLoan <span className="text-primary">AI</span>
        </h1>

        {/* subtitle block (CLS-safe) */}
        <div className="mt-6 max-w-2xl min-h-[4.5rem] md:min-h-[5.5rem] text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-line">
          <Typewriter
            text={`Instant, transparent loan assistance powered by AI.\nNo calls. No confusion. No paperwork chaos.`}
            typingSpeed={45}
            deletingSpeed={25}
            chunkSize={2}
            holdDelay={4000}
          />
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-5">
          <Button
            size="lg"
            className="gap-2 px-10 text-base"
            onClick={() => navigate("/app")}
          >
            Start Chat
            <ArrowRight className="h-4 w-4" />
          </Button>

          <a href="#how-it-works">
            <Button
              size="lg"
              variant="ghost"
              className="px-10 text-base text-muted-foreground"
            >
              Learn how it works →
            </Button>
          </a>
        </div>

        {/* divider */}
        <div className="mt-20 h-px w-full max-w-3xl bg-border/70" />
      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 py-28 bg-secondary/30 border-t border-border">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Features
          </h2>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Why InstaLoan AI?
          </p>

          <div className="mt-16 grid gap-8 md:gap-10 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-5 w-5 text-yellow-500" />}
              title="Fast Decisions"
              desc="Get instant eligibility insights and clear next steps without delays."
            />

            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5 text-green-500" />}
              title="Secure & Transparent"
              desc="Compliance-first logic with risk visibility and audit trails."
            />

            <FeatureCard
              icon={<Bot className="h-5 w-5 text-blue-500" />}
              title="AI-First Experience"
              desc="Just ask your question. The AI handles the complexity."
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="px-6 py-28 bg-secondary/30 border-t border-border"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How it works
          </h2>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            A simple, transparent flow designed for speed and clarity.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <HowCard index="01" title="Ask">
              Tell InstaLoan AI what you need — amount, purpose, or interest
              rates.
            </HowCard>

            <HowCard index="02" title="Analyze">
              Instantly get eligibility, risks, and recommendations explained
              clearly.
            </HowCard>

            <HowCard index="03" title="Proceed">
              Upload documents and move forward securely with full transparency.
            </HowCard>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 py-28 text-center border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Ready to start?
        </h2>

        <p className="mt-6 text-muted-foreground text-base max-w-xl mx-auto">
          Ask your first question and let the AI handle the rest.
        </p>

        <Button
          size="lg"
          className="mt-12 gap-2 px-12 text-base"
          onClick={() => navigate("/app")}
        >
          Open Chat
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

/* ================= helpers ================= */

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="p-9 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="mb-5 flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-2">{icon}</div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </Card>
  );
}

function HowCard({ index, title, children }) {
  return (
    <div className="relative rounded-2xl border border-border bg-background p-9 shadow-sm hover:shadow-md transition">
      <span className="absolute -top-4 left-6 rounded-md bg-background px-3 py-1.5 text-xs font-bold tracking-widest text-primary border border-border">
        {index}
      </span>

      <h4 className="mt-6 font-semibold text-lg">{title}</h4>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}
