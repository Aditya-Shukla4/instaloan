import {
  Bot,
  User,
  Upload,
  FileText,
  ShieldAlert,
  Loader2,
  Menu,
  Sun,
  Plus,
  Mic,
  ArrowUp,
  Sparkles,
  Zap,
  ChevronRight,
  Moon,
  PanelLeftClose,
  X,
  Image as ImageIcon,
  File,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import custom hooks & components
import { useChatLogic } from "@/hooks/useChatLogic";
import { AppSidebar } from "@/components/app-sidebar";
import TypingText from "@/components/TypingText";
import { Textarea } from "@/components/ui/textarea";

function App() {
  const {
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
    sendMessage,
    handleFileUpload,
    handleDrop,
    downloadSanction,
  } = useChatLogic();

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border",
          "transform transition-transform duration-300 ease-in-out",
          isDesktopSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AppSidebar
          isMobile={false}
          onCollapse={() => setIsDesktopSidebarOpen(false)}
        />
      </aside>

      {/* 2. MOBILE SIDEBAR (Drawer) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AppSidebar
          isMobile={true}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main
        className={cn(
          "flex-1 flex flex-col relative h-full w-full bg-background transition-[padding] duration-300",
          isDesktopSidebarOpen && "md:pl-64"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-transparent z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!isDesktopSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDesktopSidebarOpen(true)}
                className="hidden md:inline-flex text-muted-foreground hover:bg-secondary/50"
              >
                <PanelLeftClose className="w-5 h-5 rotate-180" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-muted-foreground hover:bg-secondary/50"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/50 cursor-pointer text-muted-foreground hover:text-foreground">
              <span className="font-medium text-sm">InstaLoan 7.0</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:bg-secondary/50"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 scroll-smooth app-scroll relative">
          {/* HERO SECTION */}
          {!hasInteracted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <Card className="w-full max-w-xl bg-card border-border shadow-sm p-8 flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
                  <Bot className="w-12 h-12 text-primary" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Namaste Grahak!
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
                    How can I assist with your finances today?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-4 justify-start gap-3 hover:bg-secondary border-dashed border-border transition-colors"
                    onClick={() =>
                      sendMessage("I need a personal loan of 50,000")
                    }
                  >
                    <Zap className="w-4 h-4 text-chart-4 shrink-0" />
                    <span className="text-sm truncate font-normal">
                      I need a loan of ₹50,000
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-4 justify-start gap-3 hover:bg-secondary border-dashed border-border transition-colors"
                    onClick={() => sendMessage("What are the interest rates?")}
                  >
                    <Sparkles className="w-4 h-4 text-chart-2 shrink-0" />
                    <span className="text-sm truncate font-normal">
                      Check Interest Rates
                    </span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* CHAT THREAD */}
          {hasInteracted && (
            <div className="max-w-3xl mx-auto space-y-8 py-10">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex group",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-3 md:gap-6 max-w-[85%] md:max-w-full",
                      msg.role === "user"
                        ? "flex-row-reverse text-right"
                        : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 flex flex-col items-center pt-1">
                      {msg.role === "agent" ? (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-secondary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Message block */}
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div
                        className={cn(
                          "flex items-baseline gap-2",
                          msg.role === "user" && "justify-end"
                        )}
                      >
                        <span className="font-semibold text-sm text-foreground">
                          {msg.role === "agent" ? "InstaLoan AI" : "You"}
                        </span>
                        <span className="text-xs text-muted-foreground opacity-50 group-hover:opacity-100">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "prose prose-sm max-w-none leading-relaxed whitespace-pre-wrap px-4 py-2 rounded-2xl",
                          msg.role === "user"
                            ? "bg-secondary text-secondary-foreground ml-auto"
                            : "bg-transparent text-foreground"
                        )}
                      >
                        {/* RENDER FILES IF USER SENT THEM */}
                        {msg.role === "user" && msg.attachments && (
                          <div className="flex flex-wrap justify-end gap-2 mb-3">
                            {groupAttachments(msg.attachments).map(
                              (group, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 bg-background/50 border border-border px-3 py-1.5 rounded-lg"
                                >
                                  {getGroupIcon(group.type)}
                                  <span className="text-xs font-medium">
                                    {group.count}{" "}
                                    {group.count > 1 ? "files" : "file"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {msg.role === "agent" ? (
                          <TypingText text={msg.content || ""} />
                        ) : (
                          msg.content || ""
                        )}
                      </div>

                      {/* Glass Box Transparency Log (Meta & Audit) */}
                      {msg.meta &&
                        (msg.meta.risk_factors?.length > 0 ||
                          msg.meta.audit) && (
                          <div className="mt-3 inline-block rounded-xl border border-chart-5/20 bg-chart-5/5 p-4 w-full sm:w-auto min-w-72">
                            <div className="flex items-center gap-2 text-chart-5 mb-2 font-medium text-xs uppercase tracking-wider">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Risk Analysis</span>
                            </div>

                            {msg.meta.risk_factors?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {msg.meta.risk_factors.map((factor, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-md bg-background border border-border text-xs text-muted-foreground shadow-sm"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            )}

                            {msg.meta.audit && (
                              <div className="text-xs font-mono text-muted-foreground flex flex-col gap-1 border-t border-border/50 pt-2">
                                <span className="flex justify-between">
                                  <span>ID:</span>
                                  <span className="opacity-70 truncate max-w-36">
                                    {msg.meta.audit.auditId}
                                  </span>
                                </span>
                                <span className="flex justify-between">
                                  <span>Decision:</span>
                                  <span
                                    className={
                                      msg.meta.audit.decision === "APPROVED"
                                        ? "text-chart-4 font-bold" // Success (Greenish)
                                        : "text-destructive font-bold" // Error (Red)
                                    }
                                  >
                                    {msg.meta.audit.decision}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Actions */}
                      {msg.action === "upload_docs" && msg.role === "agent" && (
                        <div className="pt-2">
                          <Button
                            onClick={() => fileInputRef.current.click()}
                            disabled={isLoading}
                            variant="secondary"
                            className="gap-2 w-full sm:w-auto"
                          >
                            <Upload className="w-4 h-4" /> Upload Salary Slip
                          </Button>
                        </div>
                      )}

                      {msg.action === "download_sanction" && (
                        <div className="pt-2">
                          <Button
                            onClick={downloadSanction}
                            // Using chart-4 (Greenish) for success action to stay within variables
                            className="gap-2 bg-chart-4 hover:bg-chart-4/90 text-primary-foreground border-none shadow-lg shadow-chart-4/20 w-full sm:w-auto"
                          >
                            <FileText className="w-4 h-4" /> Download Sanction
                            Letter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 md:gap-6 pl-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* 3. INPUT AREA */}
        {/* ================= INPUT AREA ================= */}
        <div className="p-4 pb-4 md:pb-6 z-20">
          <div className="max-w-3xl mx-auto relative">
            {/* STAGING QUEUE AREA */}
            {fileQueue.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 pt-2 pr-2 scrollbar-hide">
                {fileQueue.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "relative group flex flex-col items-center justify-center w-16 h-16 shrink-0 rounded-lg border transition-all",
                      // STYLING FOR STATUSES (Using Vars):
                      file.status === "uploading" &&
                        "border-primary/30 bg-primary/5",
                      file.status === "error" &&
                        "border-destructive bg-destructive/10", // ERROR VAR
                      file.status === "done" && "border-border bg-secondary/50"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "mb-1 transition-opacity",
                        file.status === "uploading" && "opacity-40",
                        file.status === "error" && "opacity-100"
                      )}
                    >
                      {getFileIcon(file.type)}
                    </div>

                    {/* Name */}
                    <span
                      className={cn(
                        "text-[9px] w-full px-1 text-center truncate",
                        file.status === "error"
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {file.name}
                    </span>

                    {/* Circular Progress */}
                    {file.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            className="text-muted-foreground/20"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            className="text-primary transition-all duration-200 ease-linear"
                            strokeDasharray="75.4"
                            strokeDashoffset={
                              75.4 - (75.4 * file.progress) / 100
                            }
                          />
                        </svg>
                      </div>
                    )}

                    {/* ERROR OVERLAY */}
                    {file.status === "error" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] rounded-lg">
                        <AlertCircle className="w-6 h-6 text-destructive drop-shadow-sm" />
                      </div>
                    )}

                    {/* Remove Button (Position Fixed to Top Right) */}
                    {(file.status === "done" || file.status === "error") && (
                      <button
                        onClick={() => removeFileFromQueue(file.id)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm scale-75 hover:scale-100 z-10"
                        title="Remove file"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "relative flex items-end gap-2 bg-secondary/40 border border-input rounded-3xl p-2 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/50",
                !hasInteracted && "shadow-md border-primary/20 bg-secondary/60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-10 w-10 rounded-full shrink-0 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <Plus className="w-5 h-5" />
                <span className="sr-only">Upload files</span>
              </Button>

              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    160
                  )}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (isLoading) return;
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  isLoading ? "AI is replying..." : "Ask about loans..."
                }
                className="flex-1 resize-none bg-transparent border-none shadow-none focus-visible:ring-0 px-3 py-2 text-sm leading-relaxed max-h-40 overflow-y-auto"
              />

              <div className="flex items-center gap-1 shrink-0 pb-1">
                {!input.trim() && fileQueue.length === 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-8 w-8 rounded-full text-muted-foreground"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  onClick={() => sendMessage()}
                  disabled={
                    isLoading ||
                    (!input.trim() && fileQueue.length === 0) ||
                    fileQueue.some(
                      (f) => f.status === "uploading" || f.status === "error"
                    )
                  }
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    isLoading || fileQueue.some((f) => f.status === "error")
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground/60 mt-3 font-medium">
              InstaLoan AI can make mistakes.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============ HELPER FUNCTIONS ============ */

function getFileIcon(mimeType) {
  // Use Chart-2 (Teal/Blue) for Images
  if (mimeType?.includes("image"))
    return <ImageIcon className="w-4 h-4 text-chart-2" />;
  // Use Destructive (Red) for PDFs
  if (mimeType?.includes("pdf"))
    return <FileText className="w-6 h-6 text-destructive" />;
  // Use Muted Foreground (Gray) for others
  return <File className="w-8 h-8 text-muted-foreground" />;
}

function getGroupIcon(typeLabel) {
  if (typeLabel === "image")
    return <ImageIcon className="w-4 h-4 text-chart-2" />;
  if (typeLabel === "pdf")
    return <FileText className="w-6 h-6 text-destructive" />;
  return <File className="w-8 h-8 text-muted-foreground" />;
}

function groupAttachments(attachments) {
  if (!attachments) return [];
  const groups = {};
  attachments.forEach((file) => {
    let key = "other";
    if (file.type.includes("image")) key = "image";
    else if (file.type.includes("pdf")) key = "pdf";

    if (!groups[key]) groups[key] = 0;
    groups[key]++;
  });

  return Object.keys(groups).map((key) => ({
    type: key,
    count: groups[key],
  }));
}

export default App;
