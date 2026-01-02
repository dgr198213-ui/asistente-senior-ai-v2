#!/usr/bin/env node

import { networkInterfaces } from "os";

/**
 * Script para obtener la IP local de la máquina
 * Útil para configurar la URL del API en dispositivos móviles
 */

function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
      if (net.family === familyV4Value && !net.internal) {
        results.push({
          interface: name,
          address: net.address,
        });
      }
    }
  }

  return results;
}

function main() {
  console.log("\n🌐 Direcciones IP locales detectadas:\n");

  const addresses = getLocalIpAddress();

  if (addresses.length === 0) {
    console.log("❌ No se encontraron direcciones IP locales.");
    console.log("   Asegúrate de estar conectado a una red.\n");
    process.exit(1);
  }

  addresses.forEach(({ interface: iface, address }, index) => {
    console.log(`${index + 1}. ${iface}: ${address}`);
  });

  console.log("\n📱 Configuración para dispositivos móviles:\n");
  console.log("1. Crea un archivo .env en la raíz del proyecto");
  console.log("2. Agrega la siguiente línea (reemplaza con tu IP):\n");

  const primaryAddress = addresses[0].address;
  console.log(`   API_URL=http://${primaryAddress}:3000\n`);

  console.log("3. Asegúrate de que tu dispositivo móvil esté en la misma red WiFi");
  console.log("4. Ejecuta 'pnpm dev' para iniciar el servidor");
  console.log("5. Escanea el código QR con Expo Go\n");

  console.log("💡 Tip: Puedes probar la conexión desde tu móvil visitando:");
  console.log(`   http://${primaryAddress}:3000/api/trpc/system.health\n`);
}

main();
