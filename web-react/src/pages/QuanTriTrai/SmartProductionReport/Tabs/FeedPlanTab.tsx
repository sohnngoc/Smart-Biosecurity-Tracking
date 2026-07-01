import { useMemo } from 'react';
import { Truck, AlertTriangle, CheckCircle2, Factory, Package, Calendar } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { format } from 'date-fns';

interface FeedPlanTabProps {
  data: any;
  farmId: string | undefined;
  year: number;
  week: number;
}

// Simple Card replacements
const Card = ({ children, className }: any) => <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("p-6 pb-4", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("font-semibold text-slate-800 dark:text-white leading-none tracking-tight", className)}>{children}</h3>;
const CardDescription = ({ children, className }: any) => <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1.5", className)}>{children}</p>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

export default function FeedPlanTab({ data, week }: FeedPlanTabProps) {
  const { feedOrders } = data || {};

  const totalKg = useMemo(() => {
    if (!feedOrders) return 0;
    return feedOrders.reduce((sum: number, order: any) => sum + (Number(order.total_kg) || 0), 0);
  }, [feedOrders]);

  const totalBags = useMemo(() => {
    if (!feedOrders) return 0;
    return feedOrders.reduce((sum: number, order: any) => sum + (Number(order.bag_count) || 0), 0);
  }, [feedOrders]);

  const biosecurityAlerts = useMemo(() => {
    if (!feedOrders) return [];
    const alerts: string[] = [];
    const pendingVehicles = feedOrders
      .filter((order: any) => order.biosecurity_status === 'Pending')
      .map((order: any) => order.vehicle_plate);
    
    // Unique vehicles
    const uniqueVehicles = [...new Set(pendingVehicles)];
    if (uniqueVehicles.length > 0) {
      alerts.push(`Xe cám ${uniqueVehicles.join(' / ')} có lịch giao cám tuần ${week}, cần kiểm tra trạng thái sát trùng trước khi vào khu sạch.`);
    }
    return alerts;
  }, [feedOrders, week]);

  return (
    <div className="space-y-6">
      {/* Biosecurity Alerts */}
      {biosecurityAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-600 dark:text-red-500" size={20} />
            <h4 className="font-semibold text-red-800 dark:text-red-500">Cảnh báo An toàn sinh học (BioTrace)</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-400">
            {biosecurityAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng chuyến xe</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {feedOrders?.length || 0} <span className="text-sm font-normal text-slate-500">chuyến</span>
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Truck className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng sản lượng (Kg)</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {totalKg.toLocaleString()} <span className="text-sm font-normal text-slate-500">kg</span>
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Factory className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Số lượng bao cám</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {totalBags.toLocaleString()} <span className="text-sm font-normal text-slate-500">bao</span>
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Package className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feed Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Kế hoạch giao cám chi tiết</CardTitle>
            <CardDescription>Danh sách các xe cám dự kiến vào trại trong tuần {week}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Ngày đặt</th>
                  <th className="px-4 py-3 font-medium">Quản lý</th>
                  <th className="px-4 py-3 font-medium">Xe (Biển số)</th>
                  <th className="px-4 py-3 font-medium">ATS/H</th>
                  <th className="px-4 py-3 font-medium">Trại (Code)</th>
                  <th className="px-4 py-3 font-medium">Mã cám</th>
                  <th className="px-4 py-3 font-medium text-right">Quy cách (kg)</th>
                  <th className="px-4 py-3 font-medium text-right">Số bao</th>
                  <th className="px-4 py-3 font-medium text-right">Tổng Kg</th>
                  <th className="px-4 py-3 font-medium">Số PO</th>
                  <th className="px-4 py-3 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {!feedOrders || feedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                      Không có kế hoạch giao cám nào trong tuần {week}
                    </td>
                  </tr>
                ) : (
                  feedOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Calendar size={14} />
                          {order.order_date ? format(new Date(order.order_date), 'dd/MM/yyyy') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{order.manager}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Truck size={14} className="text-slate-400" />
                          {order.vehicle_plate}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.biosecurity_status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                            <CheckCircle2 size={12} /> Đạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-2 py-1 rounded-full">
                            <AlertTriangle size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{order.farm_code} - {order.farm_group}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{order.product_code}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{order.bag_weight_kg}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">{order.bag_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{Number(order.total_kg).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.po_number}</td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{order.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
