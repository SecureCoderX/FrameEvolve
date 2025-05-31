const { spawn } = require('child_process');

function checkFFmpeg() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('error', () => {
      console.log('❌ FFmpeg not found');
      console.log('');
      console.log('Please install FFmpeg:');
      console.log('  Ubuntu/Debian: sudo apt install ffmpeg');
      console.log('  macOS: brew install ffmpeg');
      console.log('  Windows: Download from https://ffmpeg.org/download.html');
      resolve(false);
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ FFmpeg is installed and ready');
        resolve(true);
      } else {
        console.log('❌ FFmpeg installation issue');
        resolve(false);
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      ffmpeg.kill();
      console.log('❌ FFmpeg check timed out');
      resolve(false);
    }, 5000);
  });
}

checkFFmpeg().then((isInstalled) => {
  if (isInstalled) {
    console.log('🎥 Ready for real video processing!');
  } else {
    console.log('⚠️  Install FFmpeg to enable video processing');
  }
});
