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

export function generatePigletTransferInsights(pigletData: any): any[] {
  const insights: any[] = [];
  if (!pigletData) return insights;

  const { pen_checks, handovers, receivings } = pigletData;

  if (pen_checks && pen_checks.length > 0) {
    pen_checks.forEach((pc: any) => {
      if (pc.result !== 'ready' && pc.status !== 'approved') {
        insights.push({
          severity: 'critical',
          category: 'pen_preparation',
          title: 'Chuồng chưa sẵn sàng nhận heo',
          description: `Mã chuồng: ${pc.barn_id || 'N/A'}. Trạng thái kiểm tra: ${pc.result || 'Chưa đạt'}.`,
          recommended_action: 'Hoàn tất vệ sinh, sát trùng và kiểm tra lại trước khi nhận.',
          assignee: 'Quản lý trại nhận',
          deadline: 'Trước khi heo tới',
          reference_id: pc.id
        });
      }
    });
  }

  if (receivings && receivings.length > 0) {
    receivings.forEach((rec: any) => {
      const handover = handovers?.find((h: any) => h.id === rec.handover_id);
      
      if (handover) {
        if (rec.actual_total_qty !== handover.total_handover_qty) {
          insights.push({
            severity: 'critical',
            category: 'quantity',
            title: 'Sai lệch số lượng heo con khi tiếp nhận',
            description: `Thực nhận: ${rec.actual_total_qty} con, Bàn giao: ${handover.total_handover_qty} con. Lệch: ${rec.discrepancy_qty}.`,
            recommended_action: 'Xác minh lại với lái xe và trại xuất. Tạo claim trên hệ thống.',
            assignee: 'Bác sĩ thú y trại nhận',
            deadline: '24 giờ',
            reference_id: rec.id
          });
        }

        if (rec.quality_result === 'fail' || rec.weak_pigs > 0 || rec.dead_on_arrival > 0) {
          insights.push({
            severity: rec.quality_result === 'fail' ? 'critical' : 'warning',
            category: 'quality',
            title: 'Heo con tiếp nhận có vấn đề chất lượng',
            description: `Đánh giá: ${rec.quality_result === 'fail' ? 'Không đạt' : 'Cảnh báo'}. Heo chết: ${rec.dead_on_arrival}, Yếu/Còi: ${rec.weak_pigs}.`,
            recommended_action: 'Thực hiện quy trình cách ly và điều trị đặc biệt. Lập biên bản đền bù.',
            assignee: 'Bác sĩ thú y',
            deadline: '72 giờ',
            reference_id: rec.id
          });
        }

        if ((rec.weak_pigs > 0 || rec.dead_on_arrival > 0 || rec.discrepancy_qty !== 0) && (!rec.evidence_photo_urls || rec.evidence_photo_urls.length === 0)) {
           insights.push({
            severity: 'warning',
            category: 'compliance',
            title: 'Thiếu ảnh minh chứng sự cố',
            description: 'Phát hiện sai lệch số lượng hoặc heo chết nhưng không có ảnh chụp đính kèm.',
            recommended_action: 'Cập nhật ảnh minh chứng để submit claim.',
            assignee: 'Nhân viên nhận heo',
            deadline: '24 giờ',
            reference_id: rec.id
          });
        }

        if (handover.vaccine_info && Array.isArray(handover.vaccine_info)) {
          let hasShortage = false;
          handover.vaccine_info.forEach((v: any) => {
             if (v.qty < handover.total_handover_qty) hasShortage = true;
          });
          if (hasShortage || handover.vaccine_info.length === 0) {
            insights.push({
              severity: 'warning',
              category: 'vaccine',
              title: 'Thông tin vaccine chưa đầy đủ',
              description: 'Dữ liệu vaccine bị thiếu hoặc số liều tiêm ít hơn số lượng heo bàn giao.',
              recommended_action: 'Kiểm tra lại sổ tay vaccine của trại xuất.',
              assignee: 'Bác sĩ thú y trại nái',
              deadline: '72 giờ',
              reference_id: handover.id
            });
          }
        }

        if (rec.actual_avg_weight_kg && rec.actual_avg_weight_kg < 6.0) {
           insights.push({
              severity: 'warning',
              category: 'weight',
              title: 'Trọng lượng bình quân thấp hơn chuẩn',
              description: `BQ thực tế: ${rec.actual_avg_weight_kg}kg, dưới chuẩn cai sữa (6.0kg).`,
              recommended_action: 'Báo cáo bộ phận dinh dưỡng để điều chỉnh cám úm.',
              assignee: 'Quản lý trại',
              deadline: '7 ngày',
              reference_id: rec.id
            });
        }
      }

      if (rec.vehicle_plate && rec.discrepancy_qty !== undefined) {
        // Just mock trigger for biosecurity demo
        if (rec.vehicle_plate.includes('99')) {
          insights.push({
            severity: 'critical',
            category: 'biosecurity',
            title: 'Xe vận chuyển chưa đủ điều kiện ATSH',
            description: `Xe ${rec.vehicle_plate} không có log sát trùng tại trạm trung chuyển.`,
            recommended_action: 'Kiểm tra lại hệ thống camera cổng và log phun thuốc.',
            assignee: 'Bảo vệ cổng',
            deadline: 'Ngay lập tức',
            reference_id: rec.id
          });
        }
      }
    });
  }

  return insights;
}
