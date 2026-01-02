# 🚀 Guía de Inicio Rápido - Asistente Senior AI

## Para Compilar con Expo Go

### 📋 Requisitos Previos

1. **En tu computadora:**
   - Node.js 18+ instalado
   - Git instalado

2. **En tu dispositivo móvil:**
   - Expo Go instalado desde:
     - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
     - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

3. **Conexión:**
   - Ambos dispositivos en la misma red WiFi

---

## 🎯 Pasos para Iniciar

### 1. Clonar e Instalar

```bash
# Clonar el repositorio
git clone https://github.com/dgr198213-ui/asistente-senior-ai-v2.git
cd asistente-senior-ai-v2

# Instalar dependencias
npm install -g pnpm
pnpm install
```

### 2. Configurar para Dispositivos Móviles

```bash
# Obtener tu IP local
pnpm get-ip
```

Esto mostrará algo como:
```
🌐 Direcciones IP locales detectadas:

1. WiFi: 192.168.1.100

📱 Configuración para dispositivos móviles:
   API_URL=http://192.168.1.100:3000
```

### 3. Crear Archivo .env

```bash
# Copiar el ejemplo
cp .env.example .env

# Editar .env y cambiar API_URL con tu IP
# Ejemplo: API_URL=http://192.168.1.100:3000
```

**Contenido mínimo del .env:**
```env
API_URL=http://TU_IP_LOCAL:3000
PORT=3000
EXPO_PORT=8081
```

### 4. (Opcional) Configurar OpenAI

Si quieres usar IA real en lugar de respuestas mock:

```env
OPENAI_API_KEY=sk-tu_api_key_aqui
```

> **Nota**: Sin API key, el asistente funcionará con respuestas inteligentes predefinidas.

### 5. Iniciar el Servidor

```bash
pnpm dev
```

Esto iniciará:
- ✅ Servidor backend en puerto 3000
- ✅ Servidor Expo en puerto 8081
- ✅ Código QR para escanear

### 6. Abrir en Expo Go

1. Abre la app **Expo Go** en tu dispositivo móvil
2. Escanea el código QR que aparece en la terminal
3. ¡La aplicación se cargará automáticamente!

---

## ✅ Verificar que Funciona

### Probar la Conexión

Desde el navegador de tu móvil, visita:
```
http://TU_IP_LOCAL:3000/api/trpc/system.health
```

Deberías ver una respuesta JSON.

### Probar el Asistente

1. Abre la app en Expo Go
2. Ve a la pestaña "Asistente"
3. Escribe un mensaje o graba tu voz
4. Deberías recibir una respuesta

---

## 🐛 Solución de Problemas

### "Network request failed"

**Solución:**
1. Verifica que ambos dispositivos estén en la misma WiFi
2. Ejecuta `pnpm get-ip` nuevamente
3. Actualiza el archivo `.env` con la IP correcta
4. Reinicia con `pnpm dev`

### No aparece el código QR

**Solución:**
```bash
pnpm qr
```

### El asistente no responde

**Solución:**
1. Verifica que el servidor esté corriendo
2. Revisa la consola para errores
3. Si usas OpenAI, verifica la API key

### Permisos de audio no se solicitan

**Solución:**
1. Cierra completamente Expo Go
2. Vuelve a escanear el QR
3. Acepta los permisos cuando se soliciten

---

## 📱 Funcionalidades Disponibles

### ✅ Completamente Funcionales

- **Asistente de Voz**: Graba o escribe mensajes
- **Recordatorios**: Crea y gestiona recordatorios
- **Salud**: Registra mediciones de salud
- **Contactos de Emergencia**: Guarda contactos importantes
- **Configuración**: Personaliza la app

### 🎨 Características

- Persistencia local (AsyncStorage)
- Modo oscuro/claro
- Tamaño de fuente ajustable
- Feedback háptico
- Accesibilidad optimizada para personas mayores

---

## 📚 Documentación Adicional

- **README completo**: [README_ACTUALIZADO.md](./README_ACTUALIZADO.md)
- **Configuración móvil**: [CONFIGURACION_MOVIL.md](./CONFIGURACION_MOVIL.md)
- **Problemas identificados**: [PROBLEMAS_IDENTIFICADOS.md](./PROBLEMAS_IDENTIFICADOS.md)

---

## 🆘 Soporte

¿Problemas? Abre un issue en:
https://github.com/dgr198213-ui/asistente-senior-ai-v2/issues

---

## 🎉 ¡Listo!

Tu aplicación está completamente funcional y lista para usar con Expo Go.

**Próximos pasos:**
- Personaliza los colores en `theme.config.js`
- Agrega más respuestas en `server/chat-router.ts`
- Configura OpenAI para IA real
- Compila para producción con EAS Build

---

**Versión**: 1.0.3  
**Última actualización**: Enero 2026
