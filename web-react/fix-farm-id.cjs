const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/QuanTriTrai/TongQuanTrai.tsx',
  'src/pages/QuanTriTrai/BanDoNoiBo.tsx',
  'src/pages/QuanTriTrai/XeRaVao.tsx',
  'src/pages/QuanTriTrai/NguoiRaVao.tsx',
  'src/pages/QuanTriTrai/ThietBi.tsx',
  'src/pages/QuanTriTrai/CanhBao.tsx',
  'src/pages/QuanTriTrai/MoPhongRuiRo.tsx',
  'src/pages/QuanTriTrai/MoPhongIoT.tsx',
  'src/pages/QuanTriTrai/DanhGiaDinhKy/index.tsx',
  'src/pages/QuanTriTrai/BaoCao/PeriodicAssessmentReport.tsx',
  'src/pages/DangKyVaoTrai/index.tsx',
  'src/pages/DuyetVaoTrai/index.tsx',
  'src/pages/QuanTriTrai/BaoCao/BaoCaoThongMinh.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('const { farmId } = useParams()')) {
    content = content.replace(
      "const { farmId } = useParams();",
      "const { farmId } = useOutletContext<{ farmId: string }>();"
    );
    
    // add useOutletContext to react-router-dom import
    if (!content.includes('useOutletContext')) {
      content = content.replace(
        /import\s+{[^}]*useParams[^}]*}\s+from\s+['"]react-router-dom['"];/,
        "import { useParams, useOutletContext } from 'react-router-dom';"
      );
    }
    
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
