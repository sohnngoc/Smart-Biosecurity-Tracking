const fs = require('fs');
const glob = require('glob'); // Note: glob might not be installed globally, I'll use a recursive function instead just in case.

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/pages');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // check if useParams is actually used in the body
  const body = content.split('import').pop();
  if (!body.includes('useParams(') && !body.includes('useParams<')) {
    // Replace useParams correctly using regex
    const original = content;
    // Remove "useParams ," or "useParams," or ", useParams" or "useParams"
    content = content.replace(/\buseParams\s*,\s*/g, '');
    content = content.replace(/,\s*useParams\b/g, '');
    content = content.replace(/\{\s*useParams\s*\}/g, '{}');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Cleaned unused useParams in', file);
    }
  }
});
