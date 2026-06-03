const { execSync } = require('child_process');
try {
  console.log(execSync('npx tsc --noEmit', { encoding: 'utf-8', shell: 'cmd.exe' }));
} catch (e) {
  console.log(e.stdout);
  console.log(e.stderr);
}
