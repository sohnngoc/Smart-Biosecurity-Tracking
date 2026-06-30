/**
 * Safely divides two numbers, avoiding division by zero errors.
 * Returns null if the denominator is 0.
 */
export function safeDivide(numerator: number | null | undefined, denominator: number | null | undefined): number | null {
  if (numerator == null || denominator == null || denominator === 0) {
    return null;
  }
  return numerator / denominator;
}

/**
 * Calculates the delta between actual and target values.
 */
export function calculateDelta(actual: number | null | undefined, target: number | null | undefined): number | null {
  if (actual == null || target == null) return null;
  return actual - target;
}

export type StatusDirection = 'higher_is_better' | 'lower_is_better' | 'target_range';

/**
 * Calculates status (Good, Warning, Critical) based on value and thresholds.
 */
export function calculateStatus(
  value: number | null | undefined,
  std: number | null | undefined,
  direction: StatusDirection = 'higher_is_better',
  warningThreshold?: number,
  criticalThreshold?: number
): 'good' | 'warning' | 'critical' | 'neutral' {
  if (value == null || std == null) return 'neutral';

  // Default simple logic if no explicit thresholds
  if (!warningThreshold) {
    warningThreshold = direction === 'higher_is_better' ? std * 0.9 : std * 1.1;
  }
  if (!criticalThreshold) {
    criticalThreshold = direction === 'higher_is_better' ? std * 0.8 : std * 1.25;
  }

  if (direction === 'higher_is_better') {
    if (value >= std) return 'good';
    if (value >= warningThreshold) return 'warning';
    return 'critical';
  } else if (direction === 'lower_is_better') {
    if (value <= std) return 'good';
    if (value <= warningThreshold) return 'warning';
    return 'critical';
  }

  return 'neutral';
}

/**
 * Generates automated smart insights based on the weekly report data.
 */
export function generateProductionInsights(data: any): any[] {
  const insights: any[] = [];

  if (!data) return insights;

  // Rule 1: Stillborn > 15%
  if (data.farrowing?.stillborn_rate > 15) {
    insights.push({
      severity: 'critical',
      category: 'mortality',
      title: 'Tỷ lệ chết khi sinh vượt ngưỡng',
      description: `Tỷ lệ chết khi sinh (${data.farrowing.stillborn_rate}%) đang cao hơn ngưỡng chuẩn 10%.`,
      recommended_action: 'Cần kiểm tra khu đẻ, vệ sinh chuồng đẻ, nhiệt độ, quy trình đỡ đẻ và tình trạng nái.',
      related_metric: 'stillborn_rate',
    });
  }

  // Rule 2: Total piglet dead > 5%
  if (data.mortality?.total_dead_rate > 5) {
    insights.push({
      severity: 'warning',
      category: 'mortality',
      title: 'Heo con chết sau sinh cao',
      description: `Tổng tỷ lệ heo con chết sau sinh (${data.mortality.total_dead_rate}%) cao hơn chuẩn 5%.`,
      recommended_action: 'Kiểm tra ô úm, nguồn nước, nhiệt độ, camera theo dõi bất thường và lịch vệ sinh.',
      related_metric: 'total_dead_rate',
    });
  }

  // Rule 3: Export actual >= export plan
  if (data.export && data.export.export_actual >= data.export.export_plan && data.export.export_plan > 0) {
    const pct = ((data.export.export_actual / data.export.export_plan) * 100).toFixed(1);
    insights.push({
      severity: 'good',
      category: 'export',
      title: 'Xuất heo cai sữa đạt kế hoạch',
      description: `Xuất heo cai sữa đạt ${data.export.export_actual}/${data.export.export_plan}, hoàn thành ${pct}% kế hoạch.`,
    });
  }

  // Rule 4: Feed sow avg > 2.7
  if (data.report?.feed_sow_avg_kg_day > 2.7) {
    insights.push({
      severity: 'warning',
      category: 'feed',
      title: 'Cám nái bình quân cao',
      description: `Cám nái bình quân ${data.report.feed_sow_avg_kg_day} kg/con/ngày cao hơn STD 2.55.`,
      recommended_action: 'Cần kiểm tra khẩu phần theo nhóm nái, tồn kho cám và hao hụt.',
      related_metric: 'feed_sow_avg_kg_day',
    });
  }

  // Rule 5: Breeding actual significantly > target
  if (data.breeding && data.breeding.actual_count > data.breeding.target_count * 1.1) {
    insights.push({
      severity: 'info',
      category: 'breeding',
      title: 'Phối vượt chỉ tiêu',
      description: `Thực tế phối ${data.breeding.actual_count} vượt kế hoạch ${data.breeding.plan_count} và vượt chỉ tiêu ${data.breeding.target_count}.`,
      recommended_action: 'Kiểm tra tải chuồng chửa và forecast số nái đẻ sau 17 tuần.',
      related_metric: 'breeding_actual',
    });
  }

  // More rules can be added here (Biosecurity linkage with Feed deliveries, Vaccines)

  return insights;
}
