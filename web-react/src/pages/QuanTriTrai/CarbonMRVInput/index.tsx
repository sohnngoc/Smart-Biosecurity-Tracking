import { useState } from 'react';
import { Leaf, Flame, Factory, ShieldAlert, CheckCircle, Save } from 'lucide-react';
import { calculateAvoidedEmissions, calculateEmission } from '../../../utils/carbonCalcUtils';
import { useParams } from 'react-router-dom';

export default function CarbonMRVInput() {
  const { farmCode } = useParams();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center">
            <Leaf size={14} className="mr-1" />
            Sustainability Module
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Nhập liệu Carbon MRV
        </h1>
        <p className="text-slate-500 mt-1">
          Khai báo dữ liệu hoạt động (Activity Data) cho <strong>{farmCode || 'Trại Demo'}</strong>. 
          Hệ thống sẽ tự động tính toán phát thải KNK dựa trên thư viện EF chuẩn.
        </p>
      </div>

      <div className="space-y-8">
        <HerdActivityCard />
        <FeedActivityCard />
        <NonFlagActivityCard />
        <BiosecurityScenarioCard />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Form Cards
// ----------------------------------------------------------------------

function HerdActivityCard() {
  const [headcount, setHeadcount] = useState(1200);
  const [ef, setEf] = useState(14.5); // Enteric Fermentation
  const gwp = 27; // CH4
  
  const emission = calculateEmission({ activityData: headcount, emissionFactor: ef, gwp });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex items-center gap-3">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <Flame size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight">Herd Activity (Scope 1 FLAG)</h2>
          <p className="text-xs text-slate-500">Phát thải từ quá trình tiêu hóa và quản lý phân</p>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Số lượng heo (con)</label>
            <input 
              type="number" 
              value={headcount} 
              onChange={(e) => setHeadcount(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Hoạt động (Hệ số EF)</label>
            <select 
              value={ef} 
              onChange={(e) => setEf(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <option value={14.5}>Enteric Fermentation (14.5 kg CH4)</option>
              <option value={21.0}>Manure Management (21.0 kg CH4)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div>
            <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Phát thải tính toán</span>
            <div className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
              {emission} <span className="text-sm font-semibold text-emerald-500">tCO2e</span>
            </div>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Save size={16} /> Lưu Dữ Liệu
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedActivityCard() {
  const [feedQty, setFeedQty] = useState(1470000);
  const [ef, setEf] = useState(0.85); // Feed
  const gwp = 1; // CO2
  
  const emission = calculateEmission({ activityData: feedQty, emissionFactor: ef, gwp });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <Leaf size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight">Feed (Scope 3 FLAG)</h2>
          <p className="text-xs text-slate-500">Phát thải từ chuỗi cung ứng thức ăn chăn nuôi</p>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Lượng cám tiêu thụ (kg)</label>
            <input 
              type="number" 
              value={feedQty} 
              onChange={(e) => setFeedQty(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Hệ số phát thải (kg CO2e/kg)</label>
            <input 
              type="number" 
              step="0.01"
              value={ef} 
              onChange={(e) => setEf(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" 
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div>
            <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Phát thải tính toán</span>
            <div className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
              {emission} <span className="text-sm font-semibold text-emerald-500">tCO2e</span>
            </div>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Save size={16} /> Lưu Dữ Liệu
          </button>
        </div>
      </div>
    </div>
  );
}

function NonFlagActivityCard() {
  const [fuelQty, setFuelQty] = useState(17000);
  const [ef, setEf] = useState(2.68); // Diesel
  const gwp = 1; // CO2
  
  const emission = calculateEmission({ activityData: fuelQty, emissionFactor: ef, gwp });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex items-center gap-3">
        <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
          <Factory size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight">Energy & Logistics (Non-FLAG)</h2>
          <p className="text-xs text-slate-500">Sử dụng điện, nhiên liệu và logistics vận tải</p>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Khối lượng (Lít / kWh / tkm)</label>
            <input 
              type="number" 
              value={fuelQty} 
              onChange={(e) => setFuelQty(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Loại Năng lượng / Hoạt động</label>
            <select 
              value={ef} 
              onChange={(e) => setEf(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <option value={2.68}>Dầu Diesel (2.68 kg CO2e/lít)</option>
              <option value={0.72}>Điện lưới (0.72 kg CO2e/kWh)</option>
              <option value={0.12}>Vận tải Trucking (0.12 kg CO2e/tkm)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div>
            <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Phát thải tính toán</span>
            <div className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
              {emission} <span className="text-sm font-semibold text-emerald-500">tCO2e</span>
            </div>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Save size={16} /> Lưu Dữ Liệu
          </button>
        </div>
      </div>
    </div>
  );
}

function BiosecurityScenarioCard() {
  const [sowsWithout, setSowsWithout] = useState(800);
  const [sowsWith, setSowsWith] = useState(50);
  const [rearingMonths, setRearingMonths] = useState(7);
  const efEntericManure = 14.5; 
  const gwpCh4 = 27;

  const result = calculateAvoidedEmissions({
    sowsLostWithoutBioTrace: sowsWithout,
    sowsLostWithBioTrace: sowsWith,
    rearingMonths,
    efEntericManure,
    gwpCh4
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-200 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <ShieldAlert size={120} className="text-indigo-900" />
      </div>
      
      <div className="bg-indigo-50 border-b border-indigo-100 p-4 sm:px-6 flex items-center gap-3 relative z-10">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm shadow-indigo-200/50">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-indigo-900 leading-tight">Biosecurity Avoided Emissions</h2>
          <p className="text-xs text-indigo-600/80">Mô phỏng giảm thiểu thiệt hại do Dịch tả Heo Châu Phi (ASF)</p>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nái chết (Không BioTrace)</label>
            <input 
              type="number" 
              value={sowsWithout} 
              onChange={(e) => setSowsWithout(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nái chết (Có BioTrace)</label>
            <input 
              type="number" 
              value={sowsWith} 
              onChange={(e) => setSowsWith(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">TG nuôi Hậu bị (Tháng)</label>
            <input 
              type="number" 
              value={rearingMonths} 
              onChange={(e) => setRearingMonths(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
            />
          </div>
        </div>

        <div className="bg-indigo-900 rounded-xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Hậu bị tránh phải nuôi</span>
              <div className="text-2xl font-black text-white">
                {result.avoidedSowReplacement} <span className="text-sm font-medium text-indigo-200">con</span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Phát thải tránh được</span>
              <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                {result.avoidedTco2e} <span className="text-sm font-medium text-emerald-400/80">tCO2e</span>
                {result.avoidedTco2e === 171.28 && (
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                )}
              </div>
            </div>
          </div>
          <button className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Save size={18} /> Lưu Kịch Bản
          </button>
        </div>
      </div>
    </div>
  );
}
