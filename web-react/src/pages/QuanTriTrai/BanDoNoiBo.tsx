import { useEffect, useState, useRef, useMemo, memo } from 'react';
import {  useNavigate , useOutletContext} from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Box, Sphere, Cone, Plane, Sky, Grid, Html } from '@react-three/drei';
import { AlertTriangle, Bell } from 'lucide-react';

// Layout trại Farm-001 mô phỏng theo bản đồ thực tế
const mockBarns = [
  // Cổng & Khu sinh hoạt
  { id: 'cong', position: [20, 2, -25], size: [6, 4, 6], color: '#9ca3af', name: 'Nhà bảo vệ (Cổng)' },
  { id: 'sinh_hoat', position: [0, 2, -20], size: [15, 4, 8], color: '#d1d5db', name: 'Khu sinh hoạt', 
    hoverInfo: 'Nhân sự bên trong: 3 Kỹ sư, 20 Công nhân\nTrạng thái: Đang nghỉ ngơi' },
  { id: 'cach_ly', position: [25, 2, 0], size: [8, 4, 10], color: '#fca5a5', name: 'Cách ly', 
    hoverInfo: 'Nhân sự bên trong: 1 Kỹ sư, 5 Công nhân\nTG cách ly còn lại: 15 giờ' },
  
  // Các khu vực mới
  { id: 'nha_an', position: [-12, 2, -15], size: [8, 4, 8], color: '#e5e7eb', name: 'Nhà ăn' },
  { id: 'kho', position: [-5, 2, -10], size: [6, 4, 6], color: '#f3f4f6', name: 'Kho thuốc/dụng cụ' },
  { id: 'kiem_ke', position: [28, 2, -10], size: [6, 4, 8], color: '#dbeafe', name: 'Phòng kiểm kê' },
  { id: 'xu_ly_heo_chet', position: [35, 2, 35], size: [8, 4, 8], color: '#f87171', name: 'Xử lý heo chết' },
  { id: 'xuat_nhap', position: [35, 2, 20], size: [8, 4, 10], color: '#bfdbfe', name: 'Xuất nhập heo' },
  { id: 'tam', position: [5, 2, -5], size: [6, 4, 8], color: '#99f6e4', name: 'Khu tắm/Thay đồ' },
  { id: 'sat_trung', position: [15, 2, -25], size: [6, 4, 6], color: '#6ee7b7', name: 'Khu sát trùng xe' },

  // Khu đẻ
  { id: 'de3', position: [-25, 2, 20], size: [6, 4, 18], color: '#fde047', name: 'Chuồng Đẻ 3' },
  { id: 'de2', position: [-15, 2, 20], size: [6, 4, 18], color: '#fde047', name: 'Chuồng Đẻ 2' },
  { id: 'de1', position: [-5, 2, 20], size: [6, 4, 18], color: '#fde047', name: 'Chuồng Đẻ 1' },

  // Khu bầu
  { id: 'bau2', position: [7, 2, 20], size: [8, 4, 18], color: '#fdba74', name: 'Chuồng Bầu 2' },
  { id: 'bau1', position: [17, 2, 20], size: [8, 4, 18], color: '#fdba74', name: 'Chuồng Bầu 1' },

  // Chuồng đực
  { id: 'duc', position: [28, 2, 20], size: [6, 4, 18], color: '#93c5fd', name: 'Chuồng Đực' },
  
  // Hồ nước
  { id: 'ho_nuoc', position: [-22, 0.1, -5], size: [16, 0.2, 10], color: '#38bdf8', name: 'Hồ nước' }
];

const mockRoads = [
  { id: 'road_main', position: [5, 0.1, 10], size: [70, 0.2, 4], color: '#9ca3af' },
  { id: 'road_gate', position: [20, 0.1, -7.5], size: [4, 0.2, 35], color: '#9ca3af' },
  { id: 'road_sh', position: [10, 0.1, -20], size: [24, 0.2, 4], color: '#9ca3af' },
  { id: 'road_cl', position: [22.5, 0.1, 0], size: [5, 0.2, 4], color: '#9ca3af' },
  { id: 'road_right', position: [35, 0.1, 10], size: [4, 0.2, 50], color: '#9ca3af' }, // Đường dọc bên phải xuống khu heo chết
];

const layoutDevices: any[] = [
  // GPS Base Station
  { id: 'gps_base', device_type: 'GPS', device_name: 'GPS Base Station', pos: [24, 5, -25] },
  
  // RFID Các vị trí
  { id: 'rfid_cong_xe', device_type: 'RFID', device_name: 'RFID Cổng Xe', pos: [20, 3, -28] },
  { id: 'rfid_nha_bao_ve', device_type: 'RFID', device_name: 'RFID Nhà Bảo Vệ', pos: [20, 3, -23] },
  { id: 'rfid_truoc_tam', device_type: 'RFID', device_name: 'RFID Trước Tắm', pos: [5, 3, -10] },
  { id: 'rfid_sau_tam', device_type: 'RFID', device_name: 'RFID Sau Tắm', pos: [5, 3, -1] },
  { id: 'rfid_kho', device_type: 'RFID', device_name: 'RFID Kho', pos: [-5, 3, -7] },
  { id: 'rfid_heo_chet', device_type: 'RFID', device_name: 'RFID Xử Lý Heo Chết', pos: [35, 3, 31] },
  { id: 'rfid_kiem_ke', device_type: 'RFID', device_name: 'RFID Kiểm Kê', pos: [28, 3, -14] },
  { id: 'rfid_cach_ly', device_type: 'RFID', device_name: 'RFID Cách Ly', pos: [25, 3, -6] },
  
  // UWB Các vị trí
  { id: 'uwb_sat_trung', device_type: 'UWB', device_name: 'UWB Sát Trùng Xe', pos: [15, 3, -25] },
  { id: 'uwb_tam', device_type: 'UWB', device_name: 'UWB Khu Tắm', pos: [5, 3, -5] },
  { id: 'uwb_hanh_lang', device_type: 'UWB', device_name: 'UWB Hành Lang', pos: [1.5, 3, 10] },
  { id: 'uwb_xuat_nhap', device_type: 'UWB', device_name: 'UWB Xuất Nhập Heo', pos: [35, 3, 20] },
  { id: 'uwb_heo_chet', device_type: 'UWB', device_name: 'UWB Xử Lý Heo Chết', pos: [35, 3, 35] },
  { id: 'uwb_cach_ly', device_type: 'UWB', device_name: 'UWB Cách Ly', pos: [25, 3, 0] },
];

// Tự động sinh RFID cổng và 4 UWB góc cho các chuồng
const barnConfigs = [
  { prefix: 'de3', x: -25, z: 20, width: 6, length: 18, name: 'Đẻ 3' },
  { prefix: 'de2', x: -15, z: 20, width: 6, length: 18, name: 'Đẻ 2' },
  { prefix: 'de1', x: -5, z: 20, width: 6, length: 18, name: 'Đẻ 1' },
  { prefix: 'bau2', x: 7, z: 20, width: 8, length: 18, name: 'Bầu 2' },
  { prefix: 'bau1', x: 17, z: 20, width: 8, length: 18, name: 'Bầu 1' },
  { prefix: 'duc', x: 28, z: 20, width: 6, length: 18, name: 'Đực' },
];

barnConfigs.forEach(b => {
  // 1 RFID ở cửa (Z nhỏ hơn Z trung tâm, gần đường chính)
  layoutDevices.push({ id: `rfid_${b.prefix}`, device_type: 'RFID', device_name: `RFID Cửa ${b.name}`, pos: [b.x, 3, b.z - b.length/2 - 1] });
  
  // 4 UWB bố trí dọc từ đầu chuồng đến cuối chuồng
  const numUWB = 4;
  const startZ = b.z - b.length / 2 + 2;
  const endZ = b.z + b.length / 2 - 2;
  const stepZ = (endZ - startZ) / (numUWB - 1);

  for (let i = 0; i < numUWB; i++) {
    layoutDevices.push({ 
      id: `uwb_${b.prefix}_${i+1}`, 
      device_type: 'UWB', 
      device_name: `UWB`, 
      pos: [b.x, 4.5, startZ + i * stepZ] 
    });
  }
});

const BlinkingMaterial = memo(({ 
  baseColor, 
  baseEmissive = '#000000', 
  baseEmissiveIntensity = 0, 
  isAlert, 
  alertColor = '#ff0000' 
}: { 
  baseColor: string, 
  baseEmissive?: string, 
  baseEmissiveIntensity?: number, 
  isAlert: boolean, 
  alertColor?: string 
}) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      if (isAlert) {
        const t = clock.getElapsedTime();
        const pulse = (Math.sin(t * 8) + 1) / 2; // Nhấp nháy liên tục
        
        const cBase = new THREE.Color(baseColor);
        const cAlert = new THREE.Color(alertColor);
        
        materialRef.current.color.lerpColors(cBase, cAlert, pulse);
        materialRef.current.emissive.copy(cAlert);
        materialRef.current.emissiveIntensity = pulse * 2; // Sáng rực lên
      } else {
        materialRef.current.color.set(baseColor);
        materialRef.current.emissive.set(baseEmissive);
        materialRef.current.emissiveIntensity = baseEmissiveIntensity;
      }
    }
  });

  return (
    <meshStandardMaterial ref={materialRef} color={baseColor} emissive={baseEmissive} emissiveIntensity={baseEmissiveIntensity} />
  );
});

const BarnGroup = memo(({ barn, isAlert }: { barn: any, isAlert: boolean }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={barn.position as [number, number, number]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <Box args={barn.size as [number, number, number]} castShadow receiveShadow>
        <BlinkingMaterial baseColor={barn.color} isAlert={isAlert} />
      </Box>
      <Html center position={[0, barn.size[1]/2 + 2.5, 0]} zIndexRange={[100, 0]}>
        <div className={`transition-all duration-200 ${hovered ? 'scale-110 z-10' : 'scale-100 z-0'}`}>
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow text-center select-none pointer-events-none border border-gray-100 min-w-[80px]">
            <span className="font-bold text-gray-800 text-xs drop-shadow-sm whitespace-nowrap">{barn.name}</span>
          </div>
          
          {hovered && barn.hoverInfo && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900/90 backdrop-blur-md text-white p-2 rounded shadow-xl text-xs whitespace-pre-line text-center min-w-[220px] pointer-events-none border border-gray-700">
              {barn.hoverInfo}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
});

// --- 3D Objects ---
const Truck3D = memo(({ position, isAlert }: { position: [number, number, number], isAlert: boolean }) => (
  <group position={position}>
    {/* Body */}
    <Box args={[2, 2, 4]} position={[0, 1.5, 0]} castShadow>
      <BlinkingMaterial baseColor="#cbd5e1" isAlert={isAlert} />
    </Box>
    {/* Cabin */}
    <Box args={[2, 1.5, 1.5]} position={[0, 1.25, 2.75]} castShadow>
      <BlinkingMaterial baseColor="#94a3b8" isAlert={isAlert} />
    </Box>
    {/* Wheels */}
    {[-1, 1].map(x => 
      [-1.5, 1.5].map(z => (
        <group key={`wheel-${x}-${z}`}>
          <Box args={[0.4, 1, 1]} position={[x * 1.2, 0.5, z]} castShadow>
            <meshStandardMaterial color="#1e293b" />
          </Box>
        </group>
      ))
    )}
  </group>
));

const Person3D = memo(({ position, isAlert }: { position: [number, number, number], isAlert: boolean }) => (
  <group position={position}>
    {/* Body */}
    <Box args={[0.8, 1.4, 0.8]} position={[0, 0.7, 0]} castShadow>
      <BlinkingMaterial baseColor="#3b82f6" isAlert={isAlert} />
    </Box>
    {/* Head */}
    <Sphere args={[0.35, 16, 16]} position={[0, 1.75, 0]} castShadow>
      <BlinkingMaterial baseColor="#fca5a5" isAlert={isAlert} />
    </Sphere>
  </group>
));

const WarningSign3D = memo(({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Cone args={[0.8, 1.5, 3]} position={[0, 0, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
      <BlinkingMaterial baseColor="#eab308" baseEmissive="#ca8a04" baseEmissiveIntensity={0.5} isAlert={true} />
    </Cone>
    <Html center position={[0, -0.2, 0]} zIndexRange={[100, 0]}>
      <span className="font-bold text-red-700 text-lg">!</span>
    </Html>
  </group>
));

const Crate3D = memo(({ position, isAlert }: { position: [number, number, number], isAlert: boolean }) => (
  <group position={position}>
    <Box args={[1.5, 1.5, 1.5]} position={[0, 0.75, 0]} castShadow>
      <BlinkingMaterial baseColor="#d97706" isAlert={isAlert} />
    </Box>
  </group>
));
// -------------------

const SpinningBell3D = memo(({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 3; // Xoay vòng
    }
  });
  return (
    <group position={position} ref={groupRef}>
      <Html center position={[0, 0, 0]} zIndexRange={[100, 0]}>
        <div className="text-red-600 animate-bounce">
          <Bell size={48} className="drop-shadow-xl" fill="currentColor" />
        </div>
      </Html>
    </group>
  );
});

function FarmLayout({ activeAlerts, iotZone }: { activeAlerts: any[], iotZone: string }) {
  // Check which scenarios are active based on alert_code
  const activeScenarios = activeAlerts.map(a => a.alert_code.split('-')[1]);
  const hasAlertS1 = activeScenarios.includes('S1');
  const hasAlertS2 = activeScenarios.includes('S2');
  const hasAlertS3 = activeScenarios.includes('S3');
  const hasAlertS4 = activeScenarios.includes('S4');
  const hasAlertS5 = activeScenarios.includes('S5');
  // Tối ưu hoá cache road shapes
  const roadMeshes = useMemo(() => mockRoads.map((road) => (
    <Box key={road.id} args={road.size as [number, number, number]} position={road.position as [number, number, number]} receiveShadow>
      <meshStandardMaterial color={road.color} />
    </Box>
  )), []);

  return (
    <group>
      {/* Nền đất */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#86efac" />
      </Plane>
      <Grid args={[100, 100]} cellSize={2} cellThickness={1} cellColor="#6b7280" sectionSize={10} sectionThickness={1.5} fadeDistance={50} />

      {/* Các tuyến đường */}
      {roadMeshes}

      {/* Các khu vực (Barns) - Không nhấp nháy cả toà nhà nữa */}
      {mockBarns.map((barn) => {
        return (
          <group key={barn.id}>
            <BarnGroup barn={barn} isAlert={false} />
            {/* Hiển thị chuông xoay nếu khu vực này đang được test bằng IoT */}
            {iotZone === barn.id && (
              <SpinningBell3D position={[barn.position[0] as number, (barn.position[1] as number) + (barn.size[1] as number) + 1, barn.position[2] as number]} />
            )}
          </group>
        );
      })}

      {/* 3D Objects cho Kịch bản */}
      {hasAlertS1 && <Truck3D position={[15, 0, -25]} isAlert={true} />} {/* Xe ở khu sát trùng */}
      {hasAlertS2 && <Person3D position={[-5, 0, 9]} isAlert={true} />} {/* Người trước chuồng Đẻ 1 (bên ngoài) */}
      {hasAlertS4 && <WarningSign3D position={[-15, 5, 20]} />} {/* Biển báo trên mái chuồng Đẻ 2 */}
      {hasAlertS5 && <Crate3D position={[-5, 0, -6]} isAlert={true} />} {/* Kiện hàng trước Kho Thuốc (bên ngoài) */}

      {/* Thiết bị IoT */}
      {layoutDevices.map((device, index) => {
        let x, y, z;

        if (device.pos) {
          [x, y, z] = device.pos;
        } else {
          // Phân bổ ngẫu nhiên nếu thiết bị lấy từ DB chưa có vị trí
          const angle = (index / layoutDevices.length) * Math.PI * 2;
          const radius = 15;
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;
          y = 3; 
        }
        
        // Giả lập lỗi thiết bị theo kịch bản S3
        const isAlert = hasAlertS3 && (device.id === 'uwb_cach_ly' || device.id === 'uwb_de3_1');

        let shape;
        if (device.device_type === 'RFID') {
          shape = (
            <Box args={[1.5, 1.5, 1.5]} position={[x, y, z]} castShadow>
              <BlinkingMaterial baseColor="#3b82f6" baseEmissive="#1d4ed8" baseEmissiveIntensity={0.5} isAlert={isAlert} />
            </Box>
          );
        } else if (device.device_type === 'UWB') {
          shape = (
            <Sphere args={[0.4, 32, 32]} position={[x, y, z]} castShadow>
              <BlinkingMaterial baseColor="#22c55e" baseEmissive="#15803d" baseEmissiveIntensity={0.5} isAlert={isAlert} />
            </Sphere>
          );
        } else {
          // GPS or others
          shape = (
            <Cone args={[1, 2, 32]} position={[x, y, z]} castShadow>
              <BlinkingMaterial baseColor="#ef4444" baseEmissive="#b91c1c" baseEmissiveIntensity={0.5} isAlert={isAlert} />
            </Cone>
          );
        }

        return (
          <group key={device.id}>
            {shape}
            {isAlert && <WarningSign3D position={[x, y + 2, z]} />}
            <Html center position={[x, y + 1.5, z]} zIndexRange={[100, 0]}>
              <div className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white whitespace-nowrap pointer-events-none shadow-sm backdrop-blur-sm border border-gray-600/50">
                {device.device_name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function BanDoNoiBo() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [iotZone, setIotZone] = useState(localStorage.getItem('iot_selected_zone') || '');

  useEffect(() => {
    const handleZoneChange = () => {
      setIotZone(localStorage.getItem('iot_selected_zone') || '');
    };
    window.addEventListener('iot_zone_changed', handleZoneChange);
    window.addEventListener('storage', handleZoneChange);
    return () => {
      window.removeEventListener('iot_zone_changed', handleZoneChange);
      window.removeEventListener('storage', handleZoneChange);
    };
  }, []);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    const fetchData = async () => {
      if (!farmId) return;
      
      // Lấy danh sách cảnh báo thực tế (Chưa xử lý) từ bảng alerts
      const { data, error } = await supabase
        .from('alerts')
        .select('id, alert_code')
        .eq('farm_id', farmId)
        .eq('status', 'Chưa xử lý');
      
      if (!error && data) {
        setActiveAlerts(data);
      } else {
        console.error('Lỗi khi tải dữ liệu cảnh báo:', error);
      }
        
      setLoading(false);
    };

    fetchData();

    // Lắng nghe realtime các thay đổi của bảng alerts
    if (farmId) {
      subscription = supabase
        .channel(`public:alerts:farm_id=eq.${farmId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'alerts',
            filter: `farm_id=eq.${farmId}`
          },
          () => {
            // Khi có bất kỳ cập nhật nào (INSERT, UPDATE, DELETE) thì fetch lại số lượng
            fetchData();
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [farmId]);

  if (loading) {
    return <div className="p-4 bg-white rounded shadow text-gray-500">Đang tải mô phỏng 3D...</div>;
  }

  return (
    <div className="h-full w-full bg-blue-50 flex flex-col relative overflow-hidden shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto">
        <h3 className="font-bold text-gray-800 mb-2">Chú giải (Legend)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center"><div className="w-4 h-4 bg-blue-500 mr-2 rounded-sm border border-blue-700"></div>Khối vuông: Ăng-ten RFID</li>
          <li className="flex items-center"><div className="w-4 h-4 bg-green-500 mr-2 rounded-full border border-green-700"></div>Khối cầu: UWB Anchor</li>
          <li className="flex items-center"><div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-500 mr-2"></div>Khối chóp: GPS Base Station</li>
        </ul>
        <p className="mt-4 text-xs italic text-gray-500">Sử dụng chuột trái để xoay, lăn chuột để thu phóng.</p>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <button 
          onClick={() => navigate(`/trai/${farmId}/canh-bao`)}
          className="relative bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm hover:bg-red-50 hover:scale-105 transition-all flex items-center justify-center group"
          title="Xem cảnh báo"
        >
          <AlertTriangle className="text-red-500 group-hover:text-red-600" size={24} />
          {activeAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-md border-2 border-white">
              {activeAlerts.length}
            </span>
          )}
        </button>
      </div>

      <Canvas shadows camera={{ position: [30, 20, 30], fov: 45 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[20, 30, 10]} 
          intensity={1} 
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
        </directionalLight>
        
        <FarmLayout activeAlerts={activeAlerts} iotZone={iotZone} />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}
