import { useEffect, useState } from "react";

export default function Typewriter({
  text = "",
  typingSpeed = 40, // delay per step (ms)
  deletingSpeed = 25, // delay per step (ms)
  chunkSize = 1, // 👈 number of characters per step (typing + deleting)
  startDelay = 300, // delay before typing starts
  holdDelay = 1500, // delay after full text typed
  loop = true,
  cursor = true,
}) {
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  // Cursor blink
  useEffect(() => {
    if (!cursor) return;
    const blink = setInterval(() => {
      setCursorOn((v) => !v);
    }, 500);
    return () => clearInterval(blink);
  }, [cursor]);

  // Typing / deleting logic
  useEffect(() => {
    if (!text) return;

    let timeout;

    // 👉 Typing
    if (!isDeleting && index < text.length) {
      timeout = setTimeout(
        () => setIndex((i) => Math.min(i + chunkSize, text.length)),
        index === 0 ? startDelay : typingSpeed
      );
    }

    // 👉 Pause after typing
    else if (!isDeleting && index === text.length) {
      if (!loop) return;
      timeout = setTimeout(() => setIsDeleting(true), holdDelay);
    }

    // 👉 Deleting (same chunkSize)
    else if (isDeleting && index > 0) {
      timeout = setTimeout(
        () => setIndex((i) => Math.max(i - chunkSize, 0)),
        deletingSpeed
      );
    }

    // 👉 Restart typing
    else if (isDeleting && index === 0) {
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [
    index,
    isDeleting,
    text,
    typingSpeed,
    deletingSpeed,
    chunkSize,
    startDelay,
    holdDelay,
    loop,
  ]);

  return (
    <span className="relative">
      {text.slice(0, index)}
      {cursor && (
        <span
          className={`inline-block ml-0.5 h-[1em] w-[0.6ch] align-middle bg-primary ${
            cursorOn ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </span>
  );
}
