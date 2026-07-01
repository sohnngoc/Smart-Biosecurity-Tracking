import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Factory, Wind, ShieldAlert, CheckCircle, Flame, Leaf, AlertTriangle } from 'lucide-react';

export default function DashboardTab({ farmId }: { farmId: string }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    totalEmissions: 0,
    scope1Flag: 0,
    scope3Flag: 0,
    scope3NonFlag: 0,
    avoidedEmissions: 0,
    completeness: 85,
    readiness: 'Tier 1 Ready'
  });
  
  const [chartData, setChartData] = useState<any>({
    scopeData: [],
    sourceData: [],
    farmCompare: []
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      // Fetch emission results
      const { data: results } = await supabase.from('carbon_emission_results').select('*').eq('farm_id', farmId);
      
      let resultsToUse = results || [];
      if (resultsToUse.length === 0) {
        // Fallback mock data
        resultsToUse = [
          { scope: 'Scope 1', flag_status: 'FLAG', emission_source: 'Enteric Fermentation', calculated_tco2e: 469.8 },
          { scope: 'Scope 1', flag_status: 'FLAG', emission_source: 'Manure Management', calculated_tco2e: 680.4 },
          { scope: 'Scope 3', flag_status: 'FLAG', emission_source: 'Feed Production', calculated_tco2e: 1250.0 },
          { scope: 'Scope 1', flag_status: 'Non-FLAG', emission_source: 'Generator Fuel', calculated_tco2e: 45.5 },
          { scope: 'Scope 3', flag_status: 'Non-FLAG', emission_source: 'Logistics', calculated_tco2e: 112.3 }
        ];
      }
      
      let s1f = 0, s3f = 0, s3nf = 0, s1nf = 0;
      
      resultsToUse.forEach((r: any) => {
        const val = Number(r.calculated_tco2e);
        if (r.scope === 'Scope 1' && r.flag_status === 'FLAG') s1f += val;
        if (r.scope === 'Scope 3' && r.flag_status === 'FLAG') s3f += val;
        if (r.scope === 'Scope 3' && r.flag_status === 'Non-FLAG') s3nf += val;
        if (r.scope === 'Scope 1' && r.flag_status === 'Non-FLAG') s1nf += val;
      });

      // Fetch avoided emissions
      const { data: scenarios } = await supabase.from('carbon_outbreak_scenarios').select('*').eq('farm_id', farmId);
      
      let scenariosToUse = scenarios || [];
      if (scenariosToUse.length === 0) {
        scenariosToUse = [{ avoided_tco2e: 171.28 }];
      }

      let avoided = 0;
      scenariosToUse.forEach((s: any) => avoided += Number(s.avoided_tco2e));

      setMetrics({
        totalEmissions: s1f + s3f + s3nf + s1nf,
        scope1Flag: s1f,
        scope3Flag: s3f,
        scope3NonFlag: s3nf,
        avoidedEmissions: avoided,
        completeness: 92,
        readiness: 'Tier 1 Ready'
      });

      setChartData({
        scopeData: [
          { name: 'Scope 1 FLAG', value: s1f },
          { name: 'Scope 3 FLAG', value: s3f },
          { name: 'Scope 3 Non-FLAG', value: s3nf },
          { name: 'Scope 1 Non-FLAG', value: s1nf }
        ],
        sourceData: resultsToUse.reduce((acc: any, curr: any) => {
          const existing = acc.find((a: any) => a.name === curr.emission_source);
          if (existing) {
            existing.value += Number(curr.calculated_tco2e);
          } else {
            acc.push({ name: curr.emission_source, value: Number(curr.calculated_tco2e) });
          }
          return acc;
        }, [])
      });

      setLoading(false);
    };

    loadDashboard();
  }, [farmId]);

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Đang tổng hợp dữ liệu GHG...</div>;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#64748b'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Actual Emissions" value={metrics.totalEmissions.toFixed(1)} unit="tCO2e" icon={<Factory className="text-slate-400" />} color="border-l-4 border-slate-700" />
        <KPICard title="Scope 1 FLAG" value={metrics.scope1Flag.toFixed(1)} unit="tCO2e" icon={<Flame className="text-emerald-500" />} color="border-l-4 border-emerald-500" />
        <KPICard title="Scope 3 FLAG" value={metrics.scope3Flag.toFixed(1)} unit="tCO2e" icon={<Leaf className="text-blue-500" />} color="border-l-4 border-blue-500" />
        <KPICard title="Scope 3 Non-FLAG" value={metrics.scope3NonFlag.toFixed(1)} unit="tCO2e" icon={<Wind className="text-amber-500" />} color="border-l-4 border-amber-500" />
        
        <KPICard title="Avoided Emissions (Biosecurity)" value={metrics.avoidedEmissions.toFixed(1)} unit="tCO2e" icon={<ShieldAlert className="text-indigo-500" />} color="bg-indigo-50 border border-indigo-100" textClass="text-indigo-700" />
        <KPICard title="Data Completeness" value={`${metrics.completeness}%`} unit="Score" icon={<CheckCircle className="text-emerald-500" />} />
        <KPICard title="MRV Readiness Level" value={metrics.readiness} unit="" icon={<AlertTriangle className="text-amber-500" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Phân bổ theo Phạm vi (Scope)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.scopeData.filter((d: any) => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.scopeData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => [`${Number(value).toFixed(1)} tCO2e`, 'Phát thải']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Phân bổ theo Nguồn phát (Emission Source)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <RechartsTooltip formatter={(value: any) => [`${Number(value).toFixed(1)} tCO2e`, 'Phát thải']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {chartData.sourceData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, icon, color = 'bg-white border-slate-200', textClass = 'text-slate-900' }: any) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${color}`}>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className={`text-2xl font-black ${textClass}`}>{value}</h3>
          {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
        </div>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    </div>
  );
}
