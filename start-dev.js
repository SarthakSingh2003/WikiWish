const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;

console.log('Starting WikiWish Backend on port 8080...');
const backend = spawn('node', ['dist/index.js'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '8080' },
});

console.log('Starting WikiWish Frontend on port 3000...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\nStopping WikiWish servers...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
