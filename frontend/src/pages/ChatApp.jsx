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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import custom hooks & components
import { useChatLogic } from "@/hooks/useChatLogic";
import { AppSidebar } from "@/components/app-sidebar";
import TypingText from "@/components/TypingText";
import { Textarea } from "@/components/ui/textarea";

//Importing Landing Page
import Landing from "@/pages/Landing";

function App() {
  const {
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
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
        <div className="flex-1 overflow-y-auto px-4 scroll-smooth custom-scrollbar relative">
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
                    <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span className="text-sm truncate font-normal">
                      I need a loan of ₹50,000
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-4 justify-start gap-3 hover:bg-secondary border-dashed border-border transition-colors"
                    onClick={() => sendMessage("What are the interest rates?")}
                  >
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
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
                        {msg.role === "agent" ? (
                          <TypingText text={msg.content || ""} />
                        ) : (
                          msg.content || ""
                        )}
                      </div>

                      {/* Glass Box Transparency Log */}
                      {msg.meta &&
                        (msg.meta.risk_factors?.length > 0 ||
                          msg.meta.audit) && (
                          <div className="mt-3 inline-block rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 w-full sm:w-auto min-w-72">
                            <div className="flex items-center gap-2 text-orange-400 mb-2 font-medium text-xs uppercase tracking-wider">
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
                                        ? "text-green-500 font-bold"
                                        : "text-red-400 font-bold"
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
                      {msg.action === "upload_docs" && (
                        <div className="pt-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                          />
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
                            className="gap-2 bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-900/20 w-full sm:w-auto"
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
        <div className="p-4 pb-4 md:pb-6 z-20">
          <div className="max-w-3xl mx-auto relative">
            <div
              className={cn(
                "relative flex items-end gap-2 bg-secondary/40 border border-input rounded-3xl p-2 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/50",
                !hasInteracted && "shadow-md border-primary/20 bg-secondary/60"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full shrink-0 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask about loans..."
                className="
    flex-1
    resize-none
    bg-transparent
    border-none
    shadow-none
    focus-visible:ring-0
    px-3
    py-2
    text-sm
    leading-relaxed
    max-h-40
    custom-scrollbar
  "
              />

              <div className="flex items-center gap-1 shrink-0 pb-1">
                {!input.trim() && (
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
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-colors duration-200",
                    input.trim()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="w-4 h-4" />
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

export default App;
