import { useEffect, useState } from "react";

export default function TypingText({ text, speed = 60 }) {
  const safeText = typeof text === "string" ? text : "";
  const words = safeText.split(" ");

  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);

    if (!words.length) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      setCount((prev) => {
        if (prev >= words.length) return prev;

        const next = prev + 1;

        if (next < words.length) {
          setTimeout(tick, speed);
        }

        return next;
      });
    };

    setTimeout(tick, speed);

    return () => {
      cancelled = true;
    };
  }, [safeText, speed]);

  return <span>{words.slice(0, count).join(" ")}</span>;
}
