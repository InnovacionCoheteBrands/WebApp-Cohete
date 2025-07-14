import fs from 'fs';

// Read the routes.ts file
const routesFile = 'server/routes.ts';
let content = fs.readFileSync(routesFile, 'utf8');

// Fix all occurrences of checkUserProjectAccess with 3 parameters
const oldPattern = /await global\.storage\.checkUserProjectAccess\(\s*req\.user\.id,\s*projectId,\s*req\.user\.isPrimary\s*\)/g;
const newPattern = 'await global.storage.checkUserProjectAccess(req.user.id, projectId)';

// Replace all occurrences
content = content.replace(oldPattern, newPattern);

// Also fix any other similar patterns
const oldPattern2 = /await global\.storage\.checkUserProjectAccess\(\s*req\.user\.id,\s*(\w+),\s*req\.user\.isPrimary\s*\)/g;
const newPattern2 = 'await global.storage.checkUserProjectAccess(req.user.id, $1)';

content = content.replace(oldPattern2, newPattern2);

// Write the file back
fs.writeFileSync(routesFile, content);

console.log('Fixed all checkUserProjectAccess calls');