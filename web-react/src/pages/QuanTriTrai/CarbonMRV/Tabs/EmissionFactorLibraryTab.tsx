import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Database, Search, ShieldCheck } from 'lucide-react';

export default function EFLibraryTab() {
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEFs = async () => {
      setLoading(true);
      const { data } = await supabase.from('carbon_emission_factors').select('*').order('scope', { ascending: true });
      let efData = data || [];
      if (efData.length === 0) {
        efData = [
          { id: '1', activity_type: 'Enteric Fermentation - Sows', scope: 'Scope 1', flag_status: 'FLAG', factor_value: 14.5, unit: 'kg CH4/head/yr', source: 'IPCC 2019', methodology: 'Tier 1', data_quality_level: 'High' },
          { id: '2', activity_type: 'Manure Management - Sows', scope: 'Scope 1', flag_status: 'FLAG', factor_value: 21.0, unit: 'kg CH4/head/yr', source: 'IPCC 2019', methodology: 'Tier 1', data_quality_level: 'High' },
          { id: '3', activity_type: 'Feed - Corn (Soybean mix)', scope: 'Scope 3', flag_status: 'FLAG', factor_value: 0.85, unit: 'kg CO2e/kg', source: 'AgriFootprint', methodology: 'LCA', data_quality_level: 'Medium' },
          { id: '4', activity_type: 'Diesel (Generator)', scope: 'Scope 1', flag_status: 'Non-FLAG', factor_value: 2.68, unit: 'kg CO2e/liter', source: 'DEFRA 2023', methodology: 'Standard', data_quality_level: 'High' },
          { id: '5', activity_type: 'Logistics (Trucking)', scope: 'Scope 3', flag_status: 'Non-FLAG', factor_value: 0.12, unit: 'kg CO2e/tkm', source: 'GLEC', methodology: 'Standard', data_quality_level: 'Medium' }
        ];
      }
      setFactors(efData);
      setLoading(false);
    };
    fetchEFs();
  }, []);

  const filtered = factors.filter(f => f.activity_type.toLowerCase().includes(search.toLowerCase()) || f.source?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-emerald-500" size={20} />
            Thư viện Hệ số Phát thải (Emission Factors)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Danh sách các hệ số quy đổi áp dụng cho tính toán GHG, được xác thực từ các nguồn chuẩn hóa (IPCC, AgriFootprint, GLEC).</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm hệ số..." 
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Hoạt động (Activity)</th>
              <th className="px-4 py-3">Phạm vi (Scope)</th>
              <th className="px-4 py-3">Phân loại FLAG</th>
              <th className="px-4 py-3">Hệ số (Value)</th>
              <th className="px-4 py-3">Đơn vị (Unit)</th>
              <th className="px-4 py-3">Nguồn / Phương pháp</th>
              <th className="px-4 py-3 rounded-tr-lg">Độ tin cậy (DQL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Đang tải thư viện EF...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Không tìm thấy hệ số phù hợp.</td></tr>
            ) : (
              filtered.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{f.activity_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      f.scope === 'Scope 1' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {f.scope}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      f.flag_status === 'FLAG' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {f.flag_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{Number(f.factor_value).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">{f.unit}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{f.source}</div>
                    <div className="text-xs text-slate-400">{f.methodology}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                      <ShieldCheck size={14} />
                      {f.data_quality_level}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
