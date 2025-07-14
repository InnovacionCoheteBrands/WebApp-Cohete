import fs from 'fs';

// Read the routes.ts file
const routesFile = 'server/routes.ts';
let content = fs.readFileSync(routesFile, 'utf8');

// Fix all occurrences of listUsers to getAllUsers
content = content.replace(/global\.storage\.listUsers\(\)/g, 'global.storage.getAllUsers()');

// Write the file back
fs.writeFileSync(routesFile, content);

console.log('Fixed all listUsers calls to getAllUsers');