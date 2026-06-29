import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Sky, Html, Sphere } from '@react-three/drei';
import { Map, AlertTriangle, Fingerprint } from 'lucide-react';

type BarnDef = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  name: string;
  devices: { positionOffset: [number, number, number]; name: string }[];
};

const STATIC_BARNS: BarnDef[] = [
  { 
    id: 'cong', position: [0, 2, -30], size: [8, 4, 6], color: '#9ca3af', name: 'Cổng Trại',
    devices: [{ positionOffset: [0, 0, 3], name: 'FS-Cổng' }]
  },
  { 
    id: 'tam1', position: [-14, 2, -20], size: [6, 4, 8], color: '#99f6e4', name: 'Tắm 1',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-T1' }]
  },
  { 
    id: 'tam2', position: [-7, 2, -20], size: [6, 4, 8], color: '#99f6e4', name: 'Tắm 2',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-T2' }]
  },
  { 
    id: 'tam3', position: [0, 2, -20], size: [6, 4, 8], color: '#99f6e4', name: 'Tắm 3',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-T3' }]
  },
  { 
    id: 'tam4', position: [7, 2, -20], size: [6, 4, 8], color: '#99f6e4', name: 'Tắm 4',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-T4' }]
  },
  { 
    id: 'tam5', position: [14, 2, -20], size: [6, 4, 8], color: '#99f6e4', name: 'Tắm 5',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-T5' }]
  },
  { 
    id: 'kho_thuoc', position: [-25, 2, -20], size: [8, 4, 8], color: '#f3f4f6', name: 'Kho Thuốc',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-K.Thuốc' }]
  },
  { 
    id: 'kho_cam', position: [-35, 2, -20], size: [8, 4, 8], color: '#fcd34d', name: 'Kho Cám',
    devices: [{ positionOffset: [0, 0, 4], name: 'FS-K.Cám' }]
  },
  { 
    id: 'sinh_hoat', position: [25, 2, -20], size: [12, 4, 10], color: '#bae6fd', name: 'Khu Sinh Hoạt',
    devices: [{ positionOffset: [0, 0, 5], name: 'FS-SinhHoạt' }]
  },
  
  // 3 chuồng đẻ (2 thiết bị/chuồng)
  { 
    id: 'de1', position: [-15, 2, 0], size: [10, 4, 15], color: '#fca5a5', name: 'Chuồng Đẻ 1',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-Đ1-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-Đ1-Ra' }]
  },
  { 
    id: 'de2', position: [0, 2, 0], size: [10, 4, 15], color: '#fca5a5', name: 'Chuồng Đẻ 2',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-Đ2-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-Đ2-Ra' }]
  },
  { 
    id: 'de3', position: [15, 2, 0], size: [10, 4, 15], color: '#fca5a5', name: 'Chuồng Đẻ 3',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-Đ3-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-Đ3-Ra' }]
  },

  // 2 chuồng bầu (2 thiết bị/chuồng)
  { 
    id: 'bau1', position: [-15, 2, 20], size: [10, 4, 15], color: '#fcd34d', name: 'Chuồng Bầu 1',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-B1-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-B1-Ra' }]
  },
  { 
    id: 'bau2', position: [0, 2, 20], size: [10, 4, 15], color: '#fcd34d', name: 'Chuồng Bầu 2',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-B2-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-B2-Ra' }]
  },

  // 2 chuồng cách ly (2 thiết bị/chuồng)
  { 
    id: 'cach_ly1', position: [30, 2, 0], size: [10, 4, 15], color: '#ef4444', name: 'Cách Ly 1',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-CL1-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-CL1-Ra' }]
  },
  { 
    id: 'cach_ly2', position: [45, 2, 0], size: [10, 4, 15], color: '#ef4444', name: 'Cách Ly 2',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-CL2-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-CL2-Ra' }]
  },

  // 1 chuồng hậu bị cách ly (2 thiết bị/chuồng)
  { 
    id: 'hau_bi_cl', position: [37.5, 2, 20], size: [12, 4, 15], color: '#fb923c', name: 'Hậu Bị Cách Ly',
    devices: [{ positionOffset: [0, 0, -7.5], name: 'FS-HBCL-Vào' }, { positionOffset: [0, 0, 7.5], name: 'FS-HBCL-Ra' }]
  },
];

function FingerScanDevice({ position, name }: { position: [number, number, number], name: string }) {
  return (
    <group position={position}>
      <Sphere args={[0.6, 16, 16]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </Sphere>
      <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="bg-blue-600 text-white p-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse">
            <Fingerprint size={14} />
          </div>
          <span className="text-[10px] font-bold text-blue-800 bg-white/90 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap shadow-sm border border-blue-200">
            {name}
          </span>
        </div>
      </Html>
    </group>
  );
}

function Barn({ barn, hasViolation }: { barn: BarnDef, hasViolation: boolean }) {
  return (
    <group position={barn.position}>
      <Box args={barn.size}>
        <meshStandardMaterial color={hasViolation ? '#ef4444' : barn.color} transparent opacity={0.9} />
      </Box>
      
      {/* Label chuồng */}
      <Html position={[0, barn.size[1]/2 + 1, 0]} center zIndexRange={[50, 0]}>
        <div className={`px-2 py-1 rounded shadow-md text-sm font-bold border whitespace-nowrap ${hasViolation ? 'bg-red-600 text-white border-red-800 animate-bounce' : 'bg-white text-gray-800 border-gray-300'}`}>
          {barn.name}
        </div>
      </Html>

      {/* Các thiết bị Finger Scan */}
      {barn.devices.map((dev, idx) => (
        <FingerScanDevice 
          key={idx} 
          position={dev.positionOffset} 
          name={dev.name} 
        />
      ))}
    </group>
  );
}

export default function BanDoNoiBo() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [violations, setViolations] = useState<string[]>([]);
  
  useEffect(() => {
    fetchViolations();
    const channel = supabase.channel('biosecurity_alerts_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'biosecurity_alerts', filter: `farm_id=eq.${farmId}` }, () => {
        fetchViolations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [farmId]);

  const fetchViolations = async () => {
    const { data } = await supabase
      .from('biosecurity_alerts')
      .select('description')
      .eq('farm_id', farmId)
      .eq('status', 'open');
    
    if (data) {
      // Very naive mapping of alert description to barn IDs for demo map
      const activeIds: string[] = [];
      data.forEach(d => {
        const desc = d.description.toLowerCase();
        if (desc.includes('cách ly')) {
          activeIds.push('cach_ly1', 'cach_ly2', 'hau_bi_cl');
        }
        if (desc.includes('đẻ')) activeIds.push('de1', 'de2', 'de3');
        if (desc.includes('bầu')) activeIds.push('bau1', 'bau2');
        if (desc.includes('cổng')) activeIds.push('cong');
        if (desc.includes('tắm')) activeIds.push('tam1', 'tam2', 'tam3', 'tam4', 'tam5');
        if (desc.includes('sinh hoạt')) activeIds.push('sinh_hoat');
      });
      setViolations(activeIds);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Map className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Bản đồ khu vực & Vị trí Finger Scan
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Giám sát tổng cộng 24 thiết bị nhận diện sinh trắc học được bố trí tại các chốt an toàn</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        {violations.length > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-100 border-2 border-red-500 p-3 rounded-lg flex items-center shadow-lg">
            <AlertTriangle className="text-red-600 mr-2 animate-pulse" size={24} />
            <span className="font-bold text-red-800">Cảnh báo: Phát hiện vi phạm tại {violations.length} khu vực!</span>
          </div>
        )}
        
        {/* Chú thích bản đồ */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/90 p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
          <div className="font-bold text-gray-800 mb-2">Chú thích:</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
            <span>Thiết bị Finger Scan (24)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-[#fca5a5] rounded-sm"></div>
            <span>Chuồng đẻ (3)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-[#fcd34d] rounded-sm"></div>
            <span>Chuồng bầu (2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ef4444] rounded-sm"></div>
            <span>Khu cách ly (3)</span>
          </div>
        </div>

        <Canvas camera={{ position: [0, 55, 45], fov: 45 }}>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
          
          <Plane args={[120, 120]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#86efac" />
          </Plane>

          {STATIC_BARNS.map(barn => (
            <Barn 
              key={barn.id} 
              barn={barn}
              hasViolation={violations.includes(barn.id)} 
            />
          ))}

          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1} 
          />
        </Canvas>
      </div>
    </div>
  );
}
