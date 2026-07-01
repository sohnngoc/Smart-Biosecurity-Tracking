export interface MockEmployee {
  id: string;
  employee_code: string;
  full_name: string;
  department: string;
  job_title: string;
}

export interface MockCheckpoint {
  id: string;
  checkpoint_name: string;
  checkpoint_type: string;
}

export interface MockLog {
  id: string;
  scan_time: string;
  decision: 'allow' | 'warning' | 'deny';
  reason: string;
  risk_level: 'low' | 'medium' | 'critical';
  employees: MockEmployee;
  checkpoints: MockCheckpoint;
  finger_scan_devices: { device_name: string };
}

const employees: Record<string, MockEmployee> = {
  'NV-034': { id: 'E1', employee_code: 'NV-034', full_name: 'Đinh Văn Nam', department: 'Chăn nuôi', job_title: 'Công nhân chuồng đẻ' },
  'NV-021': { id: 'E2', employee_code: 'NV-021', full_name: 'Nguyễn Văn Bình', department: 'Chăn nuôi', job_title: 'Công nhân cám' },
  'NV-017': { id: 'E3', employee_code: 'NV-017', full_name: 'Trần Thị Hoa', department: 'Thú y', job_title: 'Bác sĩ thú y' },
  'NV-045': { id: 'E4', employee_code: 'NV-045', full_name: 'Lê Minh Tuấn', department: 'Kỹ thuật', job_title: 'Bảo trì' },
  'NV-052': { id: 'E5', employee_code: 'NV-052', full_name: 'Phạm Quốc Hưng', department: 'Chăn nuôi', job_title: 'Công nhân nái chửa' },
};

const checkpoints: Record<string, MockCheckpoint> = {
  'Chuồng đẻ 1': { id: 'C1', checkpoint_name: 'Chuồng đẻ 1', checkpoint_type: 'barn_door' },
  'Chuồng nái chửa': { id: 'C2', checkpoint_name: 'Chuồng nái chửa', checkpoint_type: 'barn_door' },
  'Khu cách ly': { id: 'C3', checkpoint_name: 'Khu cách ly', checkpoint_type: 'isolation' },
  'Khu sát trùng': { id: 'C4', checkpoint_name: 'Khu sát trùng', checkpoint_type: 'shower' },
  'Kho thuốc': { id: 'C5', checkpoint_name: 'Kho thuốc', checkpoint_type: 'warehouse' },
};

const devices = [{ device_name: 'Finger Scan 01' }, { device_name: 'Camera AI 02' }, { device_name: 'QR Check-in' }];

export const generateMockLogs = (): MockLog[] => {
  const logs: MockLog[] = [];
  const now = new Date();
  
  const empKeys = Object.keys(employees);
  const chkKeys = Object.keys(checkpoints);
  
  // Create 150 mock logs
  for (let i = 0; i < 150; i++) {
    const isNam = i < 70; // Guarantee lots of Nam
    const isChuongDe = i % 2 === 0; // Guarantee lots of Chuong de 1
    
    const empKey = isNam ? 'NV-034' : empKeys[Math.floor(Math.random() * empKeys.length)];
    const chkKey = isChuongDe ? 'Chuồng đẻ 1' : chkKeys[Math.floor(Math.random() * chkKeys.length)];
    
    let decision: 'allow' | 'warning' | 'deny' = 'allow';
    let reason = 'Hợp lệ';
    let risk_level: 'low' | 'medium' | 'critical' = 'low';
    
    const rand = Math.random();
    if (rand < 0.1) {
      decision = 'warning';
      reason = 'Thời gian sát trùng trước khi vào chuồng chưa đạt chuẩn';
      risk_level = 'medium';
    } else if (rand < 0.15) {
      decision = 'deny';
      reason = 'Có nguy cơ lây nhiễm chéo giữa các khu vực (Sai luồng)';
      risk_level = 'critical';
    } else if (rand < 0.2 && empKey === 'NV-034' && chkKey !== 'Chuồng đẻ 1') {
      decision = 'warning';
      reason = 'Vào nhiều chuồng trong cùng một ca làm việc';
      risk_level = 'medium';
    } else if (rand < 0.25) {
      decision = 'warning';
      reason = 'Camera ghi nhận nhưng thiếu xác nhận finger scan';
      risk_level = 'medium';
    } else if (rand < 0.3 && chkKey === 'Chuồng đẻ 1') {
      decision = 'deny';
      reason = 'Di chuyển từ khu cách ly sang chuồng đẻ vi phạm ATSH';
      risk_level = 'critical';
    }

    const scanTime = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));

    logs.push({
      id: `mock-log-${i}`,
      scan_time: scanTime.toISOString(),
      decision,
      reason,
      risk_level,
      employees: employees[empKey],
      checkpoints: checkpoints[chkKey],
      finger_scan_devices: devices[Math.floor(Math.random() * devices.length)]
    });
  }
  
  // Sort by scan_time descending
  return logs.sort((a, b) => new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime());
};

export const globalMockLogs = generateMockLogs();
