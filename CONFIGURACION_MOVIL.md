# Guía de Configuración para Dispositivos Móviles

## Configuración para Expo Go en Dispositivos Físicos

Para que la aplicación funcione correctamente en tu dispositivo móvil con Expo Go, necesitas configurar la URL del servidor para que sea accesible desde tu red local.

### Paso 1: Obtener tu IP Local

#### En Windows:
```bash
ipconfig
```
Busca la línea que dice "Dirección IPv4" en tu adaptador de red activo (WiFi o Ethernet).

#### En macOS/Linux:
```bash
ifconfig | grep "inet "
```
O usa:
```bash
hostname -I
```

#### Ejemplo de IP local:
```
192.168.1.100
```

### Paso 2: Crear archivo .env

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### Paso 3: Configurar la URL del API

Edita el archivo `.env` y cambia la línea `API_URL`:

```env
# Reemplaza 192.168.1.100 con tu IP local
API_URL=http://192.168.1.100:3000
```

**IMPORTANTE**: 
- NO uses `localhost` o `127.0.0.1` porque el dispositivo móvil no podrá conectarse
- Usa tu IP de red local (ejemplo: `192.168.1.100`)
- Asegúrate de que tu computadora y tu dispositivo móvil estén en la misma red WiFi

### Paso 4: Iniciar el Servidor

```bash
pnpm dev
```

Esto iniciará:
- El servidor backend en el puerto 3000
- El servidor de Expo en el puerto 8081

### Paso 5: Conectar desde Expo Go

1. Abre la app Expo Go en tu dispositivo móvil
2. Escanea el código QR que aparece en la terminal
3. La aplicación se cargará y se conectará al servidor

## Verificar Conectividad

### Probar el servidor desde el navegador del móvil

1. Abre el navegador en tu dispositivo móvil
2. Navega a: `http://TU_IP_LOCAL:3000/api/trpc/system.health`
3. Deberías ver una respuesta JSON con el estado del servidor

Ejemplo: `http://192.168.1.100:3000/api/trpc/system.health`

### Probar desde la terminal

```bash
# Reemplaza con tu IP
curl http://192.168.1.100:3000/api/trpc/system.health
```

## Solución de Problemas Comunes

### Error: "Network request failed"

**Causa**: El dispositivo no puede conectarse al servidor

**Soluciones**:
1. Verifica que ambos dispositivos estén en la misma red WiFi
2. Verifica que la IP en el archivo `.env` sea correcta
3. Verifica que el firewall no esté bloqueando el puerto 3000
4. Reinicia el servidor con `pnpm dev`

### Error: "Unable to resolve host"

**Causa**: La URL del API no está configurada correctamente

**Solución**:
1. Verifica el archivo `.env`
2. Asegúrate de usar `http://` (no `https://`)
3. No uses `localhost`, usa tu IP local

### El servidor no inicia

**Solución**:
```bash
# Limpiar caché y reinstalar
rm -rf node_modules
pnpm install
pnpm dev
```

### No aparece el código QR

**Solución**:
```bash
# Generar código QR manualmente
pnpm qr
```

## Configuración del Firewall

### Windows Firewall

1. Abre "Firewall de Windows Defender"
2. Click en "Configuración avanzada"
3. Click en "Reglas de entrada"
4. Click en "Nueva regla..."
5. Selecciona "Puerto" → Siguiente
6. TCP, puerto específico: 3000 → Siguiente
7. Permitir la conexión → Siguiente
8. Marca todas las opciones → Siguiente
9. Nombre: "Asistente Senior API" → Finalizar

### macOS Firewall

```bash
# Permitir conexiones entrantes para Node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

## Configuración para Producción

Para desplegar la aplicación en producción, necesitarás:

1. **Servidor con IP pública o dominio**
   - Ejemplo: `https://api.miapp.com`

2. **Certificado SSL (HTTPS)**
   - Requerido para producción
   - Usa Let's Encrypt (gratis)

3. **Actualizar configuración**
   ```env
   API_URL=https://api.miapp.com
   NODE_ENV=production
   ```

4. **Build de producción**
   ```bash
   # Para Android
   eas build --platform android
   
   # Para iOS
   eas build --platform ios
   ```

## Modo Offline

La aplicación funciona parcialmente sin conexión:

✅ **Funciona sin conexión:**
- Recordatorios (lectura y creación)
- Salud (lectura y creación de registros)
- Contactos de emergencia
- Configuración

❌ **Requiere conexión:**
- Asistente de voz con IA
- Sincronización de datos
- Actualizaciones de configuración remota

## Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev/)
- [Guía de Networking en React Native](https://reactnative.dev/docs/network)
- [Troubleshooting de Expo Go](https://docs.expo.dev/troubleshooting/overview/)
