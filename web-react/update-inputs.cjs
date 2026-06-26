const fs = require('fs');

function updateInputs(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace default inputs
  content = content.replace(/className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2\.5 text-gray-900 shadow-sm(.*?)"/g, 
    'className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200$1"');

  // Labels
  content = content.replace(/className="block text-sm font-medium text-gray-700 mb-1"/g, 
    'className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"');
    
  // Sub headers
  content = content.replace(/className="grid grid-cols-2 gap-6"/g, 'className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"');

  fs.writeFileSync(filePath, content);
  console.log('Updated', filePath);
}

const files = [
  'src/pages/DangKyVaoTrai/index.tsx',
  'src/pages/DuyetVaoTrai/index.tsx',
  'src/pages/QuanTriTrai/DanhGiaDinhKy/Tabs/ChecklistTab.tsx',
  'src/pages/QuanTriTrai/DanhGiaDinhKy/Tabs/FormTab.tsx'
];

files.forEach(updateInputs);
