import fs from 'fs';
import path from 'path';

const replacements = {
  'bg-[#0a0a0a]': 'bg-[#2b323b]',
  'bg-[#111]': 'bg-[#2b323b]',
  'bg-[#121212]': 'bg-[#50686c]',
  'bg-[#f2f2f1]': 'bg-[#eceae6]',
  'bg-[#f4f3f0]': 'bg-[#eceae6]',
  'bg-[#eeeae6]': 'bg-[#eceae6]',
  'bg-[#e4e3e0]': 'bg-[#dddcdc]',
  'bg-[#fdfdfc]': 'bg-[#eceae6]',
  'bg-[#fbfbfc]': 'bg-[#eceae6]',
  'bg-[#f0ece9]': 'bg-[#eceae6]',
  'bg-[#f7f7f6]': 'bg-[#eceae6]',
  'bg-[#f9f9f8]': 'bg-[#eceae6]',
  'border-[#e4e3e0]': 'border-[#dddcdc]',
  'border-[#d6d3d1]': 'border-[#dddcdc]',
  'bg-[#d0cfcb]': 'bg-[#c7d4ce]',
  'bg-[#d6d3d1]': 'bg-[#c7d4ce]',
  'bg-[#e7e5e4]': 'bg-[#dddcdc]',
  'text-[#8baba4]': 'text-[#50686c]',
  'bg-black': 'bg-[#2b323b]',
  'text-black': 'text-[#2b323b]',
  'border-black': 'border-[#2b323b]',
  'hover:bg-black': 'hover:bg-[#50686c]',
  'bg-gray-900': 'bg-[#2b323b]',
  'text-gray-900': 'text-[#2b323b]',
  'hover:text-gray-900': 'hover:text-[#2b323b]',
  'hover:bg-gray-800': 'hover:bg-[#50686c]'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.split(key).join(value);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  }
}

processDirectory('./src/app');
processDirectory('./src/components');
console.log('Done!');
