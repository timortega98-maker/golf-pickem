const { execSync } = require('child_process');

console.log('Auto-sync started. Scores will update every 5 minutes.');
console.log('Press Ctrl+C to stop.\n');

async function sync() {
  const now = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' });
  console.log(`[${now}] Syncing scores...`);
  try {
    execSync(`node ${__dirname}/syncScores.js`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Sync failed:', e.message);
  }
}

sync();
setInterval(sync, 5 * 60 * 1000);
