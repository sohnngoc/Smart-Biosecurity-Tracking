import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateProductionInsights, generatePigletTransferInsights } from '../utils/reportUtils';

export function useProductionReport(farmId: string | undefined, year: number, week: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    async function fetchReport() {
      try {
        setLoading(true);
        setError(null);

        // Fetch Overview
        const { data: report } = await supabase
          .from('production_weekly_reports')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week)
          .single();

        // Fetch Breeding
        const { data: breeding } = await supabase
          .from('breeding_weekly_metrics')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week)
          .single();

        // Fetch Farrowing
        const { data: farrowing } = await supabase
          .from('farrowing_weekly_metrics')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week)
          .single();

        // Fetch Mortality
        const { data: mortality } = await supabase
          .from('piglet_mortality_weekly')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week)
          .single();

        // Fetch Export
        const { data: exportData } = await supabase
          .from('piglet_export_weekly')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week)
          .single();

        // Fetch Feed Orders
        const { data: feedOrders } = await supabase
          .from('feed_orders')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week);

        // Fetch Culling Requests
        const { data: cullingRequests } = await supabase
          .from('culling_requests')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week);

        // Fetch Vaccine Schedules
        const { data: vaccineSchedules } = await supabase
          .from('vaccine_schedules')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week);

        // Fetch Gilt Batches
        const { data: giltBatches } = await supabase
          .from('gilt_batches')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week);

        // Fetch Herd Growth Plans
        const { data: herdGrowthPlans } = await supabase
          .from('herd_growth_plans')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year)
          .eq('week_no', week);

        // Fetch Targets
        const { data: targets } = await supabase
          .from('production_targets')
          .select('*')
          .eq('farm_id', farmId)
          .eq('year', year);

        // Fetch Piglet Transfers
        const [pcRes, hoRes, recRes] = await Promise.all([
          supabase.from('pen_checks').select('*').eq('farm_id', farmId),
          supabase.from('piglet_handovers').select('*').eq('dest_farm_id', farmId),
          supabase.from('piglet_receivings').select('*').eq('farm_id', farmId)
        ]);

        const combinedData = {
          report,
          breeding,
          farrowing,
          mortality,
          export: exportData,
          feedOrders,
          cullingRequests,
          vaccineSchedules,
          giltBatches,
          herdGrowthPlans,
          targets,
          pigletTransfers: {
            pen_checks: pcRes.data,
            handovers: hoRes.data,
            receivings: recRes.data
          }
        };

        const insights = generateProductionInsights(combinedData);
        
        const pigletInsights = generatePigletTransferInsights(combinedData.pigletTransfers);

        setData({
          ...combinedData,
          insights: [...insights, ...pigletInsights]
        });
      } catch (err: any) {
        console.error('Error fetching production report:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [farmId, year, week]);

  return { data, loading, error };
}

export function useTrendData(farmId: string | undefined, year: number, currentWeek: number) {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;

    async function fetchTrends() {
      try {
        setLoading(true);
        // We need the last 4 weeks
        const weeks = [currentWeek - 3, currentWeek - 2, currentWeek - 1, currentWeek].filter(w => w > 0);

        // Fetch from multiple tables concurrently
        const [reportsRes, breedingRes, farrowingRes, mortalityRes, exportRes, cullingRes, vaccineRes, giltRes, herdRes] = await Promise.all([
          supabase.from('production_weekly_reports').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('breeding_weekly_metrics').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('farrowing_weekly_metrics').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('piglet_mortality_weekly').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('piglet_export_weekly').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('culling_requests').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('vaccine_schedules').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('gilt_batches').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks),
          supabase.from('herd_growth_plans').select('*').eq('farm_id', farmId).eq('year', year).in('week_no', weeks)
        ]);

        // Combine into one array grouped by week
        const combined = weeks.map(w => {
          return {
            week_no: w,
            report: reportsRes.data?.find(r => r.week_no === w),
            breeding: breedingRes.data?.find(r => r.week_no === w),
            farrowing: farrowingRes.data?.find(r => r.week_no === w),
            mortality: mortalityRes.data?.find(r => r.week_no === w),
            export: exportRes.data?.find(r => r.week_no === w),
            cullingRequests: cullingRes.data?.filter(c => c.week_no === w) || [],
            vaccineSchedules: vaccineRes.data?.filter(v => v.week_no === w) || [],
            giltBatches: giltRes.data?.filter(g => g.week_no === w) || [],
            herdGrowthPlans: herdRes.data?.filter(h => h.week_no === w) || []
          };
        });

        setTrends(combined);
      } catch (err) {
        console.error('Error fetching trends', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, [farmId, year, currentWeek]);

  return { trends, loading };
}
