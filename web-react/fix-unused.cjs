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
  
  // check if useParams is used in the body
  const body = content.split('import').pop();
  if (!body.includes('useParams(') && !body.includes('useParams<')) {
    content = content.replace('useParams,', '').replace(', useParams', '').replace('{ useParams }', '{}');
    fs.writeFileSync(file, content);
    console.log('Removed unused useParams in', file);
  }
});
