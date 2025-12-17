import * as React from "react";
import {
  Bot,
  LayoutGrid,
  ShoppingBag,
  Clock,
  Settings,
  X,
  PanelLeftClose,
  Plus,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function AppSidebar({
  className,
  onClose,
  onCollapse,
  isMobile,
  onNewChat,
  chatHistory, // 🔥 Receive History Array
  onLoadChat, // 🔥 Receive Load Function
  onClearHistory,
}) {
  const handleNewChat = () => {
    if (onNewChat) onNewChat();
    if (isMobile && onClose) onClose();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border/50 h-16">
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <span></span>
        </div>
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={onCollapse}
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        <Button
          className="w-full justify-start gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-95"
          onClick={handleNewChat}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        {/* 🔥 HISTORY SECTION 🔥 */}
        {chatHistory && chatHistory.length > 0 && (
          <div>
            <div className="px-2 text-xs font-semibold text-muted-foreground/60 mb-2 uppercase tracking-wider flex justify-between items-center">
              <span>Recent History</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-muted-foreground hover:text-destructive"
                onClick={onClearHistory}
                title="Clear All"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start text-sm text-sidebar-foreground/80 truncate h-9 px-2 group"
                  onClick={() => onLoadChat(chat)}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-2 opacity-70 group-hover:text-primary" />
                  <span className="truncate">{chat.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/50">
                    {chat.date}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Static Links */}
        <div>
          <div className="px-2 text-xs font-semibold text-muted-foreground/60 mb-2 uppercase tracking-wider">
            Discover
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-foreground h-9"
            >
              <LayoutGrid className="w-4 h-4" /> Explore Agents
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-foreground h-9"
            >
              <ShoppingBag className="w-4 h-4" /> Agent Store
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors bg-sidebar-accent/10 border border-sidebar-border/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0">
            RS
          </div>
          <div className="flex-1 text-sm overflow-hidden">
            <div className="font-medium truncate">Rahul Sharma</div>
            <div className="text-xs text-muted-foreground">Premium</div>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </div>
    </div>
  );
}
