import { useState, useRef, useEffect } from "react";

// Backend URL
const API_URL = "http://localhost:5000/api";

export function useChatLogic() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "Namaste! I am your AI Loan Assistant. How can I help you finance your goals today?",
      meta: null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);

  // Sidebar States
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // UI Transition State
  const [hasInteracted, setHasInteracted] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Theme Effect (initial load)
 useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  setIsDarkMode(savedTheme === "dark");
}, []);


  const toggleTheme = () => {
    document.documentElement.classList.add("disable-transitions");

    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });

    window.setTimeout(() => {
      document.documentElement.classList.remove("disable-transitions");
    }, 0);
  };

  // Refs
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // =======================
  // SEND MESSAGE
  // =======================
  const sendMessage = async (textOverride) => {
    let textToSend = input;

    if (typeof textOverride === "string") {
      textToSend = textOverride;
    }

    if (!textToSend || !textToSend.trim()) return;

    if (!hasInteracted) setHasInteracted(true);

    const userMsg = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      // ❗ IMPORTANT: fetch does NOT throw on 4xx/5xx
      if (!response.ok) {
        throw new Error("Server unavailable");
      }

      const data = await response.json();

      const safeReply =
        typeof data?.reply === "string"
          ? data.reply
          : "System Error: Could not connect to the server.";

      if (data?.amount) setCurrentAmount(data.amount);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: safeReply,
          meta: data?.meta ?? null,
          action: data?.action ?? null,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "System Error: Could not connect to the server.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // =======================
  // FILE UPLOAD
  // =======================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("amount", currentAmount);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      const safeReply =
        typeof data?.reply === "string"
          ? data.reply
          : "System Error: File upload failed.";

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: safeReply,
          action: data?.action ?? null,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "System Error: File upload failed.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // =======================
  // DOWNLOAD
  // =======================
  const downloadSanction = () => {
    window.open(
      `${API_URL}/download-sanction?amount=${currentAmount}`,
      "_blank"
    );
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isDesktopSidebarOpen,
    setIsDesktopSidebarOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    hasInteracted,
    isDarkMode,
    toggleTheme,
    scrollRef,
    fileInputRef,
    sendMessage,
    handleFileUpload,
    downloadSanction,
  };
}
