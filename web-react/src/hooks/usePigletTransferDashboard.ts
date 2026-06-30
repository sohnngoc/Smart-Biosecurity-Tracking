import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface PigletDashboardStats {
  handoverCount: number;
  totalHandoverQty: number;
  totalReceivedQty: number;
  discrepancyBatches: number;
  discrepancyRate: number; // percentage
  rejectionRate: number; // percentage
  openIncidents: number;
  overdueTasks: number;
  
  weeklyTrend: any[];
  sourceFarmIssues: any[];
  recentBatches: any[];
}

export function usePigletTransferDashboard(farmId: string | undefined) {
  const [stats, setStats] = useState<PigletDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch Handovers
        const { data: handovers } = await supabase
          .from('piglet_handovers')
          .select('*')
          .eq('dest_farm_id', farmId);

        // Fetch Receivings
        const { data: receivings } = await supabase
          .from('piglet_receivings')
          .select('*, handover:handover_id(*)')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false });

        // Fetch Tasks for this week
        const { data: tasks } = await supabase
          .from('assigned_tasks')
          .select('*')
          .eq('farm_id', farmId)
          .in('status', ['draft', 'assigned', 'in_progress', 'submitted']) // open tasks
          .filter('due_time', 'lt', new Date().toISOString());

        const hList = handovers || [];
        const rList = receivings || [];
        
        // Calculate KPIs
        const handoverCount = hList.length;
        const totalHandoverQty = hList.reduce((sum, h) => sum + (h.total_handover_qty || 0), 0);
        const totalReceivedQty = rList.reduce((sum, r) => sum + (r.actual_total_qty || 0), 0);
        
        const discrepancyBatches = rList.filter(r => (r.discrepancy_qty || 0) !== 0).length;
        const discrepancyTotal = rList.reduce((sum, r) => sum + Math.abs(r.discrepancy_qty || 0), 0);
        const discrepancyRate = totalHandoverQty > 0 ? (discrepancyTotal / totalHandoverQty) * 100 : 0;
        
        const rejectionTotal = rList.reduce((sum, r) => sum + (r.dead_on_arrival || 0) + (r.weak_pigs || 0) + (r.culling_qty || 0), 0);
        const rejectionRate = totalReceivedQty > 0 ? (rejectionTotal / totalReceivedQty) * 100 : 0;
        
        // Mock incidents: count receivings with fail or weak > 0
        const openIncidents = rList.filter(r => r.quality_result === 'fail' || (r.weak_pigs || 0) > 0).length;
        
        // Mock overdue tasks from actual tasks plus some mock if empty
        const overdueTasks = tasks ? tasks.length : 0;

        // Chart Data: Weekly Trend (Mock based on current date week)
        const weeklyTrend = [
          { week: 'Tuần 23', handover: 850, received: 845 },
          { week: 'Tuần 24', handover: 1200, received: 1190 },
          { week: 'Tuần 25', handover: 950, received: 950 },
          { week: 'Tuần 26', handover: totalHandoverQty, received: totalReceivedQty },
        ];

        // Chart Data: Source Farm Issues
        // Group by source farm from rList where issues occur
        const issuesBySource: Record<string, number> = {};
        rList.forEach(r => {
          if (r.quality_result === 'fail' || (r.discrepancy_qty || 0) !== 0) {
            const sourceName = r.handover?.source_farm_name || 'Không rõ';
            issuesBySource[sourceName] = (issuesBySource[sourceName] || 0) + 1;
          }
        });
        const sourceFarmIssues = Object.keys(issuesBySource).map(k => ({
          name: k,
          value: issuesBySource[k]
        }));
        // If empty, mock one
        if (sourceFarmIssues.length === 0) {
          sourceFarmIssues.push({ name: 'Trại Nái A', value: 2 });
          sourceFarmIssues.push({ name: 'Trại Nái B', value: 1 });
        }

        // Table: Recent Batches
        const recentBatches = rList.slice(0, 10).map(r => ({
          id: r.id,
          date: new Date(r.created_at).toLocaleDateString('vi-VN'),
          source: r.handover?.source_farm_name || 'N/A',
          expected: r.handover?.total_handover_qty || 0,
          actual: r.actual_total_qty || 0,
          diff: r.discrepancy_qty || 0,
          status: r.quality_result === 'pass' ? 'Đạt' : r.quality_result === 'warning' ? 'Cảnh báo' : 'Không đạt'
        }));

        setStats({
          handoverCount,
          totalHandoverQty,
          totalReceivedQty,
          discrepancyBatches,
          discrepancyRate,
          rejectionRate,
          openIncidents,
          overdueTasks,
          weeklyTrend,
          sourceFarmIssues,
          recentBatches
        });

      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [farmId]);

  return { stats, loading, error };
}
