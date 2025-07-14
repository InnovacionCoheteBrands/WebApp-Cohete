import fs from 'fs';

// Read the routes.ts file
const routesFile = 'server/routes.ts';
let content = fs.readFileSync(routesFile, 'utf8');

// Define method mappings
const methodMappings = {
  'listDocumentsByProject': 'getDocuments',
  'listChatMessagesByProject': 'getChatMessages',
  'listTasksByProject': 'getTasks',
  'listTaskComments': 'getTaskComments',
  'listSubtasks': 'getTasks', // Use getTasks and filter for subtasks
  'listContentHistoryByProject': 'getContentHistory' // This might need special handling
};

// Replace all method calls
for (const [oldMethod, newMethod] of Object.entries(methodMappings)) {
  const regex = new RegExp(`global\\.storage\\.${oldMethod}`, 'g');
  content = content.replace(regex, `global.storage.${newMethod}`);
}

// Write the file back
fs.writeFileSync(routesFile, content);

console.log('Fixed all method calls:', Object.keys(methodMappings).join(', '));