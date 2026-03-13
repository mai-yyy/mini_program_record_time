const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\maiyan\\.gemini\\antigravity\\brain\\74dc21c1-b3c6-4e9c-90b2-1dfe2d0351d6';
const dstDir = 'd:\\antigravity\\mini program demo\\study-tracker\\miniprogram\\images';

const files = {
  'record_icon_1773208850255.png': 'record.png',
  'record_active_icon_1773208863201.png': 'record-active.png',
  'history_icon_1773208874253.png': 'history.png',
  'history_active_icon_1773208891386.png': 'history-active.png',
  'profile_icon_1773208905730.png': 'profile.png',
  'profile_active_icon_1773208919988.png': 'profile-active.png'
};

for (const [src, dst] of Object.entries(files)) {
  fs.copyFileSync(path.join(srcDir, src), path.join(dstDir, dst));
}
console.log("Icons copied");
