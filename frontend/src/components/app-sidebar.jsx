import * as React from "react";
import { 
  Bot, LayoutGrid, ShoppingBag, Clock, 
  Settings, X, PanelLeftClose 
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function AppSidebar({ 
  className, 
  onClose,      // Function to close sidebar (Mobile)
  onCollapse,   // Function to collapse sidebar (Desktop)
  isMobile      // Boolean to check if we are in mobile mode
}) {
  return (
    <div className={cn("flex flex-col h-full bg-sidebar text-sidebar-foreground", className)}>
      
      {/* 1. Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border/50 h-16">
        <div className="flex items-center gap-2 font-semibold">
           <div className="bg-sidebar-primary text-sidebar-primary-foreground p-1.5 rounded-lg">
              <Bot className="w-5 h-5" />
           </div>
           <span>InstaLoan</span>
        </div>
        
        {/* Toggle/Close Actions */}
        {isMobile ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onCollapse}>
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 2. Navigation Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        
        {/* Main Links */}
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-foreground h-10">
              <LayoutGrid className="w-4 h-4" /> Explore Agents
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-foreground h-10">
              <ShoppingBag className="w-4 h-4" /> Agent Store
           </Button>
        </div>

        {/* History / Activity */}
        <div>
          <div className="px-2 text-xs font-semibold text-muted-foreground/60 mb-2 uppercase tracking-wider">
            Recent Activity
          </div>
          <div className="space-y-1">
             <Button variant="ghost" className="w-full justify-start text-sm text-sidebar-foreground/80 truncate h-9 px-2">
                <Clock className="w-3.5 h-3.5 mr-2 opacity-70" /> Loan Application #102
             </Button>
             <Button variant="ghost" className="w-full justify-start text-sm text-sidebar-foreground/80 truncate h-9 px-2">
                <Clock className="w-3.5 h-3.5 mr-2 opacity-70" /> Document Upload
             </Button>
          </div>
        </div>
      </div>

      {/* 3. Footer (User Profile) */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
         <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors bg-sidebar-accent/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0">
               JS
            </div>
            <div className="flex-1 text-sm overflow-hidden">
               <div className="font-medium truncate">John Smith</div>
               <div className="text-xs text-muted-foreground">Premium Plan</div>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
         </div>
      </div>
    </div>
  );
}