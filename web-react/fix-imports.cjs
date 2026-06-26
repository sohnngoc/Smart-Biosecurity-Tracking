const fs = require('fs');
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
  if (content.includes('useOutletContext') && !content.match(/import\s+{([^}]*useOutletContext[^}]*)}\s+from\s+['"]react-router-dom['"]/)) {
    // We need to add useOutletContext to the react-router-dom import.
    content = content.replace(
      /(import\s+{[^}]*)\s*(\}\s+from\s+['"]react-router-dom['"])/,
      "$1, useOutletContext$2"
    );
    fs.writeFileSync(file, content);
    console.log('Fixed imports in', file);
  }
});
