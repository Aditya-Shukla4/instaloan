import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesBento() {
  return (
    <section className="px-6 py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            What makes InstaLoan AI different
          </h2>
          <p className="mt-4 text-muted-foreground">
            A true agentic AI that sells, verifies, and approves loans — end to
            end.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-20 grid gap-6 md:grid-cols-4 auto-rows-[220px]"
        >
          {/* Agentic AI (BIG) */}
          <motion.div variants={item} className="md:col-span-2 md:row-span-2">
            <BentoCard
              icon={<Bot className="h-6 w-6 text-primary" />}
              title="Agentic AI Sales Assistant"
              desc="Not a form-filling bot. A human-like AI that understands intent, persuades users, and dynamically drives the loan conversation forward."
              large
            />
          </motion.div>

          {/* End-to-End Flow */}
          <motion.div variants={item}>
            <BentoCard
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
              title="From ‘Hi’ to Approved"
              desc="Greet, negotiate, verify, underwrite, and approve — all inside one seamless conversation."
            />
          </motion.div>

          {/* Underwriting */}
          <motion.div variants={item}>
            <BentoCard
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
              title="Instant Underwriting"
              desc="Real-time eligibility checks and approvals without manual delays or back-and-forth."
            />
          </motion.div>

          {/* Edge Case Handling */}
          <motion.div variants={item} className="md:col-span-2">
            <BentoCard
              icon={<ShieldAlert className="h-5 w-5 text-orange-500" />}
              title="Smart Edge-Case Handling"
              desc="Gracefully handles rejections, credit score issues, and additional verification — just like a trained loan officer."
            />
          </motion.div>

          {/* Sanction Letter */}
          <motion.div variants={item}>
            <BentoCard
              icon={<FileText className="h-5 w-5 text-blue-500" />}
              title="Instant Sanction Letter"
              desc="Generate and deliver official loan sanction documents instantly within the chat."
            />
          </motion.div>

          {/* Business Impact */}
          <motion.div variants={item}>
            <BentoCard
              icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
              title="Real Business Impact"
              desc="24/7 sales, 80% zero-touch approvals, faster conversions, and happier customers."
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Bento Card ---------------- */

function BentoCard({ icon, title, desc, large }) {
  return (
    <Card
      className={`group relative h-full overflow-hidden rounded-2xl border border-border bg-background p-7 transition
      hover:shadow-lg ${large ? "p-9" : ""}`}
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">{icon}</div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

        {large && (
          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            Simulates a real loan officer's reasoning and conversation flow.
          </div>
        )}
      </div>
    </Card>
  );
}
