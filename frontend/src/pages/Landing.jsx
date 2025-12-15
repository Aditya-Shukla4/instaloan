import { Bot, ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Typewriter from "@/components/Typewriter";
import HeroChatPreview from "@/components/HeroChatPreview";
// Assuming these are your existing icon components

import FeaturesBento from "@/components/FeaturesBento";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden ">
      {/* ================= HERO ================= */}
      <section className="relative px-6 pt-32 pb-28">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* LEFT: CONTENT */}
          <div className="flex flex-col text-center md:text-left items-center md:items-start z-10">
            <div className="mb-8 rounded-xl bg-primary/10 p-5 ring-1 ring-primary/20">
              <Bot className="h-14 w-14 text-primary" />
            </div>

            <h1 className="max-w-xl text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              InstaLoan <span className="text-primary">AI</span>
            </h1>

            <div className="mt-6 max-w-xl min-h-[4.5rem] md:min-h-[5.5rem] text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-line">
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
                className="gap-2 px-10 text-base shadow-xl shadow-primary/20"
                onClick={() => navigate("/app")}
              >
                Start Chat
                <ArrowRight className="h-4 w-4" />
              </Button>

              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="ghost"
                  className="px-10 text-base text-muted-foreground hover:bg-secondary"
                >
                  Learn how it works →
                </Button>
              </a>
            </div>
          </div>

          {/* RIGHT: HERO CHAT PREVIEW */}
          {/* RIGHT: HERO CHAT PREVIEW */}
          <div className="hidden md:flex justify-center relative">
            {/* Background Blob for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10" />
            <HeroChatPreview />
          </div>
        </div>

        <div className="mt-24 h-px w-full max-w-5xl mx-auto bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ================= FEATURES (BENTO GRID) ================= */}
      <FeaturesBento />

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="px-6 py-28 border-t border-border">
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
      <section className="px-6 py-28 text-center bg-secondary/30 border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Ready to start?
        </h2>

        <p className="mt-6 text-muted-foreground text-base max-w-xl mx-auto">
          Ask your first question and let the AI handle the rest.
        </p>

        <Button
          size="lg"
          className="mt-12 gap-2 px-12 text-base"
          onClick={() => navigate("/auth")}
        >
          Open Chat
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

/* ================= helpers ================= */

function HowCard({ index, title, children }) {
  return (
    <div className="relative rounded-2xl border border-border bg-background p-9 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
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
