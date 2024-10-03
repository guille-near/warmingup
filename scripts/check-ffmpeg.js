const { execSync } = require('child_process');

try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  console.log('FFmpeg está instalado correctamente.');

  const rubberbandOutput = execSync('ffmpeg -filters | grep rubberband', { encoding: 'utf8' });
  if (rubberbandOutput.includes('rubberband')) {
    console.log('El plugin rubberband está disponible.');
  } else {
    console.warn('Advertencia: El plugin rubberband no está disponible. Algunas funciones de procesamiento de audio podrían no funcionar correctamente.');
  }
} catch (error) {
  console.error('Error: FFmpeg no está instalado o no está en el PATH del sistema.');
  console.error('Por favor, instale FFmpeg y el plugin rubberband antes de continuar.');
  process.exit(1);
}