import fetch from 'node:fetch';

console.log('🧪 Probando el servidor...\n');

// Probar el endpoint de salud
try {
  console.log('1. Probando endpoint de salud del sistema...');
  const healthResponse = await fetch('http://localhost:3000/api/trpc/system.health');
  const healthData = await healthResponse.json();
  console.log('✅ Sistema saludable:', healthData);
} catch (error) {
  console.log('⚠️  Servidor no está corriendo. Esto es normal si no lo has iniciado.');
  console.log('   Ejecuta "pnpm dev" para iniciar el servidor.\n');
}

console.log('\n✅ Verificación completada');
