const fs = require('fs');

function modifyFile(filepath, replacements) {
  let content = fs.readFileSync(filepath, 'utf8');
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  fs.writeFileSync(filepath, content, 'utf8');
}

modifyFile('src/components/dashboard/ActionModal.tsx', [
  { regex: /Zap,?\s*/g, replace: '' }
]);

modifyFile('src/components/dashboard/HabitManager.tsx', [
  { regex: /Check,?\s*/g, replace: '' },
  { regex: /X,?\s*/g, replace: '' }
]);

modifyFile('src/components/profile/ProfileModals.tsx', [
  { regex: /import \{ UserProfile \} from "\.\.\/\.\.\/types";\s*/g, replace: '' }
]);

modifyFile('src/lib/recommendation-engine.ts', [
  { regex: /currentFootprint:\s*number/g, replace: '_currentFootprint: number' }
]);

modifyFile('src/pages/FootprintBreakdown.tsx', [
  { regex: /Bus,?\s*/g, replace: '' },
  { regex: /Zap,?\s*/g, replace: '' },
  { regex: /ShoppingBag,?\s*/g, replace: '' },
  { regex: /Droplet,?\s*/g, replace: '' },
  { regex: /ArrowRight,?\s*/g, replace: '' }
]);

modifyFile('src/pages/Missions.tsx', [
  { regex: /\(_, i\)/g, replace: '(_, _i)' }
]);

modifyFile('src/pages/Profile.tsx', [
  { regex: /MessageCircle,?\s*/g, replace: '' }
]);

modifyFile('src/pages/Settings.tsx', [
  { regex: /CardContent,?\s*/g, replace: '' }
]);

modifyFile('src/pages/Simulator.tsx', [
  { regex: /CardDescription,?\s*/g, replace: '' },
  { regex: /Train,?\s*/g, replace: '' },
  { regex: /ArrowDown,?\s*/g, replace: '' },
  { regex: /Plane,?\s*/g, replace: '' },
  { regex: /import \{ motion \} from "motion\/react";\s*/g, replace: '' }
]);

console.log('Fixed using Node regex!');
