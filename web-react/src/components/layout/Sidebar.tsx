import { Link, useLocation } from "react-router-dom";
import { MENU_SECTIONS } from "./MobileNav";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { Map } from "lucide-react";

interface SidebarProps {
  farmCode: string;
}

export default function Sidebar({ farmCode }: SidebarProps) {
  const location = useLocation();
  return (
    <div className="w-64 bg-slate-900 shrink-0 hidden lg:flex flex-col text-slate-300 relative z-20 shadow-2xl border-r border-slate-800">
      <div className="h-16 flex items-center px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <h2 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-slate-200 to-slate-400">
            Smart<span className="text-emerald-400">Bio</span>
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <div className="space-y-1">
          {MENU_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="mb-6 last:mb-0">
              <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, idx) => {
                  const fullPath = `/trai/${farmCode}${item.path}`;
                  const isActive = location.pathname.includes(fullPath);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sIdx * 0.1) + (idx * 0.05) }}
                      key={item.path}
                    >
                      <Link
                        to={fullPath}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive 
                            ? "bg-emerald-500/15 text-emerald-300 font-semibold shadow-inner" 
                            : "hover:bg-slate-800/60 hover:text-slate-100"
                        )}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active-sidebar-bg"
                            className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-transparent"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        {isActive && (
                          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        )}
                        
                        <div className={cn(
                          "transition-all duration-300 relative z-10",
                          isActive 
                            ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                            : "text-slate-500 group-hover:text-emerald-400/80 group-hover:scale-110"
                        )}>
                          {item.icon}
                        </div>
                        <span className="relative z-10 text-sm">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area for global actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <Link 
          to="/ban-do-tong-quan"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium text-sm group shadow-sm border border-slate-700/50 hover:border-emerald-500/30"
        >
          <Map className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-emerald-400" />
          <span>Bản đồ Chuỗi Trại</span>
        </Link>
      </div>
    </div>
  );
}
