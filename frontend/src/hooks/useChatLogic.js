import { useState, useRef, useEffect, useCallback } from "react";

// Backend URL
const API_URL = "http://localhost:5000/api";

// File constraints
const MAX_TOTAL_SIZE_MB = 30;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

export function useChatLogic() {
  /* =======================
     CHAT STATE
  ======================= */
  const [messages, setMessages] = useState(() => {
    try {
      const stored = sessionStorage.getItem("chat_messages");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);

  /* =======================
     FILE QUEUE STATE
  ======================= */
  // Structure: { id, file, name, size, type, progress, status, serverData }
  const [fileQueue, setFileQueue] = useState([]);

  /* =======================
     SIDEBAR / UI STATE
  ======================= */
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  /* =======================
     THEME STATE
  ======================= */
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  /* =======================
     PERSIST CHAT
  ======================= */
  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) setHasInteracted(true);
  }, [messages]);

  const toggleTheme = () => {
    document.documentElement.classList.add("disable-transitions");
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
    setTimeout(() => {
      document.documentElement.classList.remove("disable-transitions");
    }, 0);
  };

  /* =======================
     REFS
  ======================= */
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, fileQueue.length]);

  /* =======================
     REAL FILE UPLOAD LOGIC
  ======================= */
  
  const removeFileFromQueue = (id) => {
    // Optional: If you want to delete the file from server when user clicks X, 
    // you would trigger a DELETE request here using the id.
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  };

  // ✅ REAL UPLOAD FUNCTION
  const uploadFileToBackend = (fileItem) => {
    const formData = new FormData();
    formData.append("file", fileItem.file);

    const xhr = new XMLHttpRequest();
    // Assuming your backend has this endpoint
    xhr.open("POST", `${API_URL}/upload`);

    // 1. Track Progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, progress } : f
          )
        );
      }
    };

    // 2. Handle Success
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Success!
        console.log(`File "${fileItem.name}" has been successfully uploaded.`);
        
        let responseData = {};
        try {
            responseData = JSON.parse(xhr.responseText);
        } catch (e) {
            console.warn("Could not parse server response", e);
        }

        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { 
                  ...f, 
                  progress: 100, 
                  status: "done",
                  // Save any ID/Path returned by server so we can send it to the bot later
                  serverData: responseData 
                }
              : f
          )
        );
      } else {
        // HTTP Error
        console.error("Upload failed", xhr.statusText);
        setFileQueue((prev) =>
          prev.map((f) => f.id === fileItem.id ? { ...f, status: "error", progress: 0 } : f)
        );
      }
    };

    // 3. Handle Network Error
    xhr.onerror = () => {
      console.error("Network error during upload");
      setFileQueue((prev) =>
        prev.map((f) => f.id === fileItem.id ? { ...f, status: "error", progress: 0 } : f)
      );
    };

    xhr.send(formData);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    // Calculate current total size
    const currentTotalSize = fileQueue.reduce((acc, f) => acc + f.size, 0);
    const newFilesTotalSize = newFiles.reduce((acc, f) => acc + f.size, 0);

    if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE_BYTES) {
      alert(`Total file size cannot exceed ${MAX_TOTAL_SIZE_MB}MB per message.`);
      return;
    }

    const newQueueItems = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading",
      serverData: null, // Will hold the backend response
    }));

    setFileQueue((prev) => [...prev, ...newQueueItems]);

    // Trigger REAL upload for each file
    newQueueItems.forEach((item) => uploadFileToBackend(item));
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

    const files = e.dataTransfer.files;
    processFiles(files);
  }, [fileQueue, isLoading]);


  /* =======================
     SEND MESSAGE
  ======================= */
  const sendMessage = async (textOverride) => {
    if (isLoading) return;
    
    // Prevent send if files are still uploading or errored
    if (fileQueue.some(f => f.status === 'uploading' || f.status === 'error')) {
        alert("Please wait for uploads to finish or remove failed files.");
        return;
    }

    let textToSend = input;
    if (typeof textOverride === "string") textToSend = textOverride;
    
    // Allow send if there is text OR files
    if ((!textToSend || !textToSend.trim()) && fileQueue.length === 0) return;

    // Prepare attachments with server data (path/id)
    const attachments = fileQueue.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        // Crucial: Pass the data returned by /upload (e.g., { fileId: 123, path: '/uploads/doc.pdf' })
        // This ensures the Chat Bot knows exactly which file on the server to look at.
        serverData: f.serverData 
    }));

    const userMsg = {
      role: "user",
      content: textToSend,
      attachments: attachments.length > 0 ? attachments : null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFileQueue([]); // Clear queue after send
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: textToSend, 
            attachments: attachments // Now includes the real server paths/IDs
        }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            typeof data?.reply === "string"
              ? data.reply
              : "System Error: Could not connect to the server.",
          meta: data?.meta ?? null,
          action: data?.action ?? null,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
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

  /* =======================
     DOWNLOAD
  ======================= */
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
    downloadSanction,
  };
}