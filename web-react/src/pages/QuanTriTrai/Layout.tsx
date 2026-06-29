import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import MobileNav from '../../components/layout/MobileNav';
import { LogOut, ArrowLeft, BellDot } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function QuanTriTraiLayout() {
  const navigate = useNavigate();
  const { farmCode } = useParams<{ farmCode: string }>();
  const location = useLocation();
  const [farmName, setFarmName] = useState<string>('');
  const [farmId, setFarmId] = useState<string | null>(null);
  
  // Hardcode session demo
  const [demoUser] = useState({
    id: 'DEMO-ADMIN-001',
    full_name: 'Quản Lý',
    role: 'admin'
  });

  useEffect(() => {
    const fetchFarm = async () => {
      if (!farmCode) return;
      const { data } = await supabase.from('farms').select('id, farm_name').eq('farm_code', farmCode).single();
      if (data) {
        setFarmId(data.id);
        setFarmName(data.farm_name);
      }
    };
    fetchFarm();
  }, [farmCode]);

  const isMapRoute = location.pathname.includes('/ban-do-noi-bo');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <Sidebar farmCode={farmCode || ''} />
      
      {/* Mobile Bottom & Drawer Nav */}
      <MobileNav farmCode={farmCode || ''} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 z-30 shrink-0 shadow-sm sticky top-0 transition-all">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => navigate('/ban-do-tong-quan')}
              className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-100/50 hover:bg-emerald-50 rounded-full transition-all group"
              title="Quay lại Bản Đồ Chuỗi Trại"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600 hidden sm:block">
                Kiểm Soát An Toàn Sinh Học
              </h1>
              <h1 className="text-base font-bold text-slate-800 sm:hidden">
                Smart Bio
              </h1>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  {farmName || 'Đang tải...'}
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Connected
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Quick alert badge for mobile */}
            <div className="relative p-2 text-slate-400 hover:text-orange-500 cursor-pointer sm:hidden">
              <BellDot size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
            </div>
            
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200/60">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-700">{demoUser.full_name}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{demoUser.role}</div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-black shadow-sm ring-1 ring-emerald-500/20">
                {demoUser.full_name.charAt(0)}
              </div>
            </div>
            
            <button 
              className="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl sm:ml-2 transition-all duration-200"
              onClick={() => navigate('/')}
              title="Đăng xuất"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Content Area - Add pb-20 on mobile to avoid overlapping with bottom nav */}
        <main className={`flex-1 relative ${isMapRoute ? 'overflow-hidden' : 'overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8'}`}>
          {farmId ? <Outlet context={{ farmId }} /> : <div className="flex h-full items-center justify-center text-slate-400 font-medium animate-pulse">Đang nạp hệ thống...</div>}
        </main>
      </div>
    </div>
  );
}
