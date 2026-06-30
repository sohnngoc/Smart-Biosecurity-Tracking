import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Settings, 
  AlertTriangle, 
  Cpu, 
  ShieldAlert, 
  FileText, 
  CheckCircle,
  ClipboardList,
  Menu,
  X,
  ClipboardCheck,
  ShieldCheck,
  UserCog
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface MobileNavProps {
  farmCode: string;
}

export const MENU_SECTIONS = [
  {
    title: "Theo dõi & Báo cáo",
    items: [
      { name: 'Tổng quan', path: '/tong-quan', icon: <LayoutDashboard size={20} />, isMain: true },
      { name: 'Bản đồ chuồng', path: '/ban-do-noi-bo', icon: <Map size={20} />, isMain: true },
      { name: 'Báo cáo sản xuất', path: '/bao-cao-san-xuat', icon: <FileText size={20} /> },
    ]
  },
  {
    title: "Quản lý công việc",
    items: [
      { name: 'Phân công', path: '/phan-cong-cong-viec', icon: <ClipboardList size={20} />, isMain: true },
      { name: 'Việc được giao', path: '/cong-viec-duoc-giao', icon: <CheckCircle size={20} /> },
      { name: 'Đánh giá định kỳ', path: '/danh-gia-dinh-ky', icon: <ClipboardCheck size={20} /> },
    ]
  },
  {
    title: "An ninh sinh học",
    items: [
      { name: 'Cảnh báo', path: '/canh-bao', icon: <AlertTriangle size={20} />, isMain: true },
      { name: 'Đăng ký vào trại', path: '/dang-ky-vao-trai', icon: <FileText size={20} /> },
      { name: 'Duyệt vào trại', path: '/duyet-vao-trai', icon: <ShieldCheck size={20} /> },
      { name: 'Giám sát ra/vào', path: '/nguoi-ra-vao', icon: <Users size={20} /> },
    ]
  },
  {
    title: "Quản trị hệ thống",
    items: [
      { name: 'Nhân sự', path: '/nhan-su', icon: <UserCog size={20} /> },
      { name: 'Thiết bị', path: '/thiet-bi', icon: <Settings size={20} /> },
    ]
  },
  {
    title: "Môi trường giả lập",
    items: [
      { name: 'Mô phỏng rủi ro', path: '/mo-phong-rui-ro', icon: <ShieldAlert size={20} /> },
      { name: 'Bộ mô phỏng IoT', path: '/mo-phong-iot', icon: <Cpu size={20} /> },
    ]
  }
];

export const MAIN_MENU = MENU_SECTIONS.flatMap(s => s.items).filter(i => i.isMain);
export const EXTRA_MENU = MENU_SECTIONS.flatMap(s => s.items).filter(i => !i.isMain);

export default function MobileNav({ farmCode }: MobileNavProps) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {MAIN_MENU.map((item) => {
          const fullPath = `/trai/${farmCode}${item.path}`;
          const isActive = location.pathname.includes(fullPath);
          return (
            <Link
              key={item.path}
              to={fullPath}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all",
                isActive ? "text-emerald-600" : "text-slate-500 hover:text-emerald-500"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn("p-1 rounded-full", isActive && "bg-emerald-50")}
              >
                {item.icon}
              </motion.div>
              <span className="text-[10px] font-medium mt-1 truncate w-full text-center">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* More Menu Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-full transition-all text-slate-500 hover:text-emerald-500",
            drawerOpen && "text-emerald-600"
          )}
        >
          <motion.div whileTap={{ scale: 0.9 }} className="p-1">
            <Menu size={20} />
          </motion.div>
          <span className="text-[10px] font-medium mt-1">Thêm</span>
        </button>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-emerald-50/50">
                <h2 className="text-lg font-bold text-slate-800">Menu Mở Rộng</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 -mr-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {MENU_SECTIONS.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                    {section.items.filter(i => !i.isMain).map((item) => {
                      const fullPath = `/trai/${farmCode}${item.path}`;
                      const isActive = location.pathname.includes(fullPath);
                      return (
                        <Link
                          key={item.path}
                          to={fullPath}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm",
                            isActive 
                              ? "bg-emerald-50 text-emerald-700" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <div className={cn(isActive ? "text-emerald-600" : "text-slate-400")}>
                            {item.icon}
                          </div>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
