import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function ExportTab({ farmId }: { farmId: string }) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      // In a real scenario, we would join carbon_emission_results with carbon_reporting_periods, carbon_activity_records, carbon_emission_factors.
      // For this demo, we'll fetch results and just show a mock summary.
      const { data } = await supabase.from('carbon_emission_results').select('*, period:period_id(period_name)').eq('farm_id', farmId);
      let exportData = data || [];
      if (exportData.length === 0) {
        exportData = [
          { period: { period_name: 'Q1-2026' }, scope: 'Scope 1', flag_status: 'FLAG', emission_source: 'Enteric Fermentation', calculated_tco2e: 469.8, formula_used: '1200 * 14.5 * 27 / 1000', created_at: new Date().toISOString() },
          { period: { period_name: 'Q1-2026' }, scope: 'Scope 1', flag_status: 'FLAG', emission_source: 'Manure Management', calculated_tco2e: 680.4, formula_used: '1200 * 21.0 * 27 / 1000', created_at: new Date().toISOString() },
          { period: { period_name: 'Q1-2026' }, scope: 'Scope 3', flag_status: 'FLAG', emission_source: 'Feed Production', calculated_tco2e: 1250.0, formula_used: '1470000 * 0.85 / 1000', created_at: new Date().toISOString() },
          { period: { period_name: 'Q1-2026' }, scope: 'Scope 1', flag_status: 'Non-FLAG', emission_source: 'Generator Fuel', calculated_tco2e: 45.5, formula_used: '17000 * 2.68 / 1000', created_at: new Date().toISOString() },
          { period: { period_name: 'Q1-2026' }, scope: 'Scope 3', flag_status: 'Non-FLAG', emission_source: 'Logistics', calculated_tco2e: 112.3, formula_used: '935000 * 0.12 / 1000', created_at: new Date().toISOString() }
        ];
      }
      setRecords(exportData);
    };
    fetchData();
  }, [farmId]);

  const handleExportCSV = async () => {
    if (records.length === 0) return;
    setLoading(true);
    
    // Create CSV content
    const headers = ["Period", "Scope", "FLAG Status", "Emission Source", "Calculated tCO2e", "Formula Used", "Created At"];
    const rows = records.map(r => [
      r.period?.period_name || 'N/A',
      r.scope,
      r.flag_status,
      r.emission_source,
      r.calculated_tco2e,
      `"${r.formula_used}"`, // wrap in quotes in case of commas
      new Date(r.created_at).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Carbon_MRV_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log export
    await supabase.from('carbon_report_exports').insert({
      farm_id: farmId,
      export_format: 'CSV',
      exported_by: 'Current User' // mock
    });
    
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileSpreadsheet size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Xuất báo cáo phát thải (MRV Report)</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Báo cáo chi tiết bao gồm activity data, emission factors đã sử dụng, và kết quả tính toán tCO2e theo tiêu chuẩn phân loại Scope 1, 3 và FLAG/Non-FLAG.
      </p>
      
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8 text-left">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-600">Dữ liệu sẵn sàng xuất:</span>
          <span className="text-sm font-bold text-emerald-600">{records.length} bản ghi</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600">Kỳ báo cáo gần nhất:</span>
          <span className="text-sm font-bold text-slate-900">{records[0]?.period?.period_name || 'N/A'}</span>
        </div>
      </div>
      
      <button
        onClick={handleExportCSV}
        disabled={loading || records.length === 0}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
        {loading ? 'Đang xuất file...' : 'Tải xuống Báo cáo (CSV)'}
      </button>
    </div>
  );
}
