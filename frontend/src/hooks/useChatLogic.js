import { useState, useRef, useEffect, useCallback } from "react";

// Backend URL
const API_URL = "http://localhost:5000/api";

export function useChatLogic() {
  // --- 💾 1. CHAT HISTORY STATE (Long Term - LocalStorage) ---
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("instaloan_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- 💬 2. CURRENT CHAT STATE (Short Term - SessionStorage) ---
  // 🔥 FIX: Initial State ab SessionStorage se uthayega
  const [messages, setMessages] = useState(() => {
    try {
      const savedSession = sessionStorage.getItem("current_chat_session");
      return savedSession
        ? JSON.parse(savedSession)
        : [
            {
              role: "agent",
              content:
                "Namaste! InstaLoan mein swagat hai. How can I help you today?",
              suggestions: ["Personal Loan", "Student Loan (Info)"],
              timestamp: "Now",
            },
          ];
    } catch {
      return [
        {
          role: "agent",
          content:
            "Namaste! InstaLoan mein swagat hai. How can I help you today?",
          suggestions: ["Personal Loan", "Student Loan (Info)"],
          timestamp: "Now",
        },
      ];
    }
  });

  // Standard States
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  const [currentAmount, setCurrentAmount] = useState(0);
  const [fileQueue, setFileQueue] = useState([]);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Interaction check based on messages length
  const [hasInteracted, setHasInteracted] = useState(messages.length > 1);

  const [isDarkMode, setIsDarkMode] = useState(true);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- 🔄 SYNC HISTORY TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("instaloan_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // --- 🔥 FIX: SYNC CURRENT CHAT TO SESSION STORAGE ---
  useEffect(() => {
    sessionStorage.setItem("current_chat_session", JSON.stringify(messages));
    if (messages.length > 1) setHasInteracted(true);
  }, [messages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, agentStatus]);

  const toggleTheme = () => {
    document.documentElement.classList.add("disable-transitions");
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
    setTimeout(
      () => document.documentElement.classList.remove("disable-transitions"),
      0
    );
  };

  // --- 🔥 NEW CHAT LOGIC (SAVE OLD + RESET SESSION) ---
  const startNewChat = () => {
    // 1. Agar current chat mein kuch baat hui hai, toh history mein daalo
    if (messages.length > 1) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 30) + "..."
        : "New Conversation";

      const newHistoryItem = {
        id: Date.now(),
        title: title,
        date: new Date().toLocaleDateString(),
        messages: messages, // Save full thread
      };

      setChatHistory((prev) => [newHistoryItem, ...prev]);
    }

    // 2. Session Clear karo
    sessionStorage.removeItem("current_chat_session");

    // 3. State Reset karo
    setMessages([
      {
        role: "agent",
        content:
          "Namaste! InstaLoan mein swagat hai. How can I help you today?",
        suggestions: ["Personal Loan", "Student Loan (Info)"],
        timestamp: "Now",
      },
    ]);
    setInput("");
    setFileQueue([]);
    setCurrentAmount(0);
    setHasInteracted(false);
  };

  // --- 📂 LOAD OLD CHAT ---
  const loadChatFromHistory = (historyItem) => {
    setMessages(historyItem.messages);
    // Note: useEffect automatically saves this loaded chat to sessionStorage now
    setHasInteracted(true);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // --- CLEAR HISTORY ---
  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("instaloan_history");
  };

  // --- FILE & SEND LOGIC (Same as before) ---
  const removeFileFromQueue = (id) =>
    setFileQueue((prev) => prev.filter((f) => f.id !== id));

  const uploadFileToBackend = (fileItem) => {
    const formData = new FormData();
    formData.append("file", fileItem.file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setFileQueue((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, progress } : f))
        );
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let responseData = {};
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {}
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  progress: 100,
                  status: "done",
                  serverData: responseData,
                }
              : f
          )
        );
      } else {
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "error" } : f
          )
        );
      }
    };
    xhr.send(formData);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const newQueueItems = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading",
      serverData: null,
    }));
    setFileQueue((prev) => [...prev, ...newQueueItems]);
    newQueueItems.forEach((item) => uploadFileToBackend(item));
  };

  const handleFileUpload = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isLoading) processFiles(e.dataTransfer.files);
    },
    [isLoading]
  );

  const sendMessage = async (textOverride) => {
    if (isLoading) return;
    let textToSend = input;
    if (typeof textOverride === "string") textToSend = textOverride;
    if ((!textToSend || !textToSend.trim()) && fileQueue.length === 0) return;

    const attachments = fileQueue.map((f) => ({
      name: f.name,
      type: f.type,
      serverData: f.serverData,
    }));

    const userMsg = {
      role: "user",
      content: textToSend,
      attachments: attachments.length > 0 ? attachments : null,
      timestamp: "Now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFileQueue([]);
    setIsLoading(true);
    setAgentStatus("🕵️ Sales Agent: Understanding Intent...");

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, attachments }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      if (data.action === "show_plans") {
        setAgentStatus("🧮 Advisor Agent: Structuring Plans...");
        await new Promise((r) => setTimeout(r, 800));
      } else if (
        data.reply.includes("Approved") ||
        data.reply.includes("Rejected")
      ) {
        setAgentStatus("👮 Risk Agent: Analyzing Credit Score...");
        await new Promise((r) => setTimeout(r, 1200));
        setAgentStatus("⚖️ Compliance Agent: Finalizing...");
        await new Promise((r) => setTimeout(r, 800));
      }

      setAgentStatus("✅ Responding...");
      await new Promise((r) => setTimeout(r, 400));

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.reply || "System Error",
          loanPlans: data.loanPlans || null,
          suggestions: data.suggestions || null,
          emiData: data.emiData || null,
          meta: data.meta || null,
          action: data.action || null,
          amount: data.amount || 0,
          timestamp: "Now",
        },
      ]);
      if (data.amount) setCurrentAmount(data.amount);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "⚠️ System Offline." },
      ]);
    } finally {
      setIsLoading(false);
      setAgentStatus("");
    }
  };

  const handlePlanClick = (amount, months) => {
    const msg = `Proceed with ${amount} for ${months} months`;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `Selected: ${months} Months Plan`,
        timestamp: "Now",
      },
    ]);
    sendMessage(msg);
  };

  const downloadSanction = () => {
    if (!currentAmount) return;
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
    agentStatus,
    fileQueue,
    removeFileFromQueue,
    isDesktopSidebarOpen,
    setIsDesktopSidebarOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    hasInteracted,
    isDarkMode,
    toggleTheme,
    scrollRef,
    fileInputRef,
    handleDrop,
    sendMessage,
    handleFileUpload,
    handlePlanClick,
    downloadSanction,
    startNewChat,
    chatHistory,
    loadChatFromHistory,
    clearHistory,
  };
}
