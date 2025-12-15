import { useEffect, useState } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const SCRIPT = [
  {
    role: "user",
    content: "I need a personal loan of ₹50,000",
  },
  {
    role: "agent",
    content: "Sure. Let me check your eligibility.",
  },
  {
    role: "agent",
    content: "You may be eligible. Please upload your salary slip.",
  },
];

export default function HeroChatPreview() {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= SCRIPT.length) {
      // loop reset after pause
      const reset = setTimeout(() => {
        setVisibleMessages([]);
        setStep(0);
      }, 3000);
      return () => clearTimeout(reset);
    }

    const timer = setTimeout(
      () => {
        setVisibleMessages((prev) => [...prev, SCRIPT[step]]);
        setStep((s) => s + 1);
      },
      step === 0 ? 800 : 1400
    );

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">InstaLoan AI</span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4 px-4 py-5 text-sm">
        {visibleMessages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "agent" && (
              <div className="h-7 w-7 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[75%] rounded-xl px-3 py-2 leading-relaxed",
                msg.role === "user"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="h-7 w-7 shrink-0 rounded-md bg-secondary flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* typing indicator */}
        {step < SCRIPT.length && step > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span className="flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
