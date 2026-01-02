# Asistente Senior AI - v1.0.3 (Completamente Funcional y Corregido)

Aplicación móvil React Native con Expo diseñada específicamente para personas mayores. Incluye asistente de voz con IA, gestión de recordatorios, seguimiento de salud, contactos de emergencia y configuración accesible.

## 🎯 Características Principales

### ✅ Completamente Implementadas y Funcionales

- **Asistente de Voz con IA Real**: 
  - Grabación de audio con permisos solicitados correctamente
  - Entrada de texto alternativa
  - Integración con OpenAI (o respuestas inteligentes mock)
  - Historial de conversaciones persistente en AsyncStorage
  - Interfaz intuitiva con auto-scroll
  
- **Recordatorios**: Crear, editar, completar recordatorios con categorías (medicamento, cita, general)
- **Seguimiento de Salud**: Registrar presión arterial, glucosa, peso, frecuencia cardíaca
- **Contactos de Emergencia**: Agregar contactos, marcar favoritos, llamadas directas
- **Pantalla de Emergencia**: Botón rojo grande para llamar al 911
- **Configuración Accesible**: Tamaño de fuente ajustable, modo oscuro/claro, notificaciones
- **Persistencia Local**: Todos los datos se guardan en AsyncStorage
- **Monitoreo de Conectividad**: Indicador de conexión con reconexión automática
- **Accesibilidad Senior**: Textos grandes, botones grandes, alto contraste, feedback háptico

## 🆕 Novedades en v1.0.3

### Correcciones Implementadas

1. **✅ API de Chat Funcional**
   - Nuevo router `chat` en el servidor con integración a OpenAI
   - Respuestas inteligentes contextuales (mock o con API key)
   - Sistema de fallback robusto

2. **✅ Permisos de Audio**
   - Solicitud automática de permisos al iniciar
   - Alertas amigables si no se conceden permisos
   - Validación antes de grabar

3. **✅ Persistencia de Mensajes**
   - Todos los mensajes se guardan en AsyncStorage
   - Límite de 50 mensajes almacenados
   - Carga automática al iniciar la app

4. **✅ Entrada de Texto**
   - Campo de texto para enviar mensajes sin grabar
   - Teclado adaptativo con KeyboardAvoidingView
   - Botón de envío con validación

5. **✅ Mejor UX**
   - Auto-scroll al final de la conversación
   - Botón para limpiar historial
   - Indicadores de estado claros
   - Manejo de errores mejorado

6. **✅ Configuración para Móviles**
   - Script para obtener IP local automáticamente
   - Guía completa de configuración
   - Archivo .env.example con todas las variables

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js 18+ y npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- Git
- Dispositivo móvil con Expo Go instalado

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/dgr198213-ui/asistente-senior-ai-v2.git
cd asistente-senior-ai-v2

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Obtener tu IP local (para dispositivos móviles)
pnpm get-ip

# 5. Editar .env y cambiar API_URL con tu IP local
# Ejemplo: API_URL=http://192.168.1.100:3000

# 6. (Opcional) Configurar OpenAI API Key en .env
# OPENAI_API_KEY=tu_api_key_aqui

# 7. Iniciar el servidor de desarrollo
pnpm dev

# 8. Escanear el código QR con Expo Go
```

## 📱 Configuración para Dispositivos Móviles

### Paso 1: Obtener tu IP Local

```bash
pnpm get-ip
```

Este comando te mostrará tu IP local y las instrucciones exactas para configurar.

### Paso 2: Configurar .env

Edita el archivo `.env` y cambia:

```env
API_URL=http://TU_IP_LOCAL:3000
```

**IMPORTANTE**: 
- NO uses `localhost` o `127.0.0.1`
- Usa tu IP de red local (ejemplo: `192.168.1.100`)
- Tu computadora y dispositivo móvil deben estar en la misma red WiFi

### Paso 3: Verificar Conectividad

Desde el navegador de tu móvil, visita:
```
http://TU_IP_LOCAL:3000/api/trpc/system.health
```

Deberías ver una respuesta JSON con el estado del servidor.

📖 **Guía completa**: Ver [CONFIGURACION_MOVIL.md](./CONFIGURACION_MOVIL.md)

## 🤖 Configuración del Asistente de IA

### Opción 1: Con OpenAI (Recomendado)

1. Obtén una API key de [OpenAI](https://platform.openai.com/api-keys)
2. Agrega la key en el archivo `.env`:
   ```env
   OPENAI_API_KEY=sk-...tu_key_aqui
   ```
3. Reinicia el servidor con `pnpm dev`

### Opción 2: Sin OpenAI (Respuestas Mock)

Si no configuras una API key, el asistente usará respuestas inteligentes predefinidas que:
- Responden contextualmente según palabras clave
- Ayudan con recordatorios, salud y contactos
- Funcionan completamente offline

## 📊 Estructura del Proyecto

```
asistente-senior-ai-v2/
├── app/                      # Pantallas de la aplicación
│   ├── (tabs)/              # Navegación por pestañas
│   │   ├── index.tsx        # Inicio
│   │   ├── assistant.tsx    # Asistente (ACTUALIZADO)
│   │   ├── reminders.tsx    # Recordatorios
│   │   ├── health.tsx       # Salud
│   │   └── more.tsx         # Más opciones
│   ├── add-*.tsx            # Modales para agregar datos
│   ├── settings.tsx         # Configuración
│   └── _layout.tsx          # Layout raíz
├── hooks/
│   ├── use-voice-assistant.ts  # Asistente (ACTUALIZADO)
│   ├── use-reminders.ts     # Recordatorios
│   ├── use-health.ts        # Salud
│   └── use-emergency-contacts.ts
├── server/
│   ├── chat-router.ts       # Router de chat (NUEVO)
│   ├── routers.ts           # Routers principales (ACTUALIZADO)
│   └── _core/               # Core del servidor
├── scripts/
│   ├── get-local-ip.mjs     # Script para IP local (NUEVO)
│   └── generate_qr.mjs      # Generar QR
├── .env.example             # Variables de entorno (NUEVO)
├── CONFIGURACION_MOVIL.md   # Guía de configuración (NUEVO)
└── package.json
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor + Expo
pnpm dev:server       # Solo servidor backend
pnpm dev:metro        # Solo Expo Metro

# Utilidades
pnpm get-ip           # Obtener IP local para móviles (NUEVO)
pnpm qr               # Generar código QR
pnpm check            # Verificar TypeScript
pnpm lint             # Linter
pnpm format           # Formatear código

# Testing
pnpm test             # Ejecutar tests

# Compilación
pnpm build            # Compilar servidor
pnpm start            # Iniciar servidor en producción

# Dispositivos específicos
pnpm android          # Abrir en Android
pnpm ios              # Abrir en iOS
```

## 🔧 Desarrollo

### Agregar Nuevas Funciones al Asistente

Edita `server/chat-router.ts` y agrega nuevos casos en `getMockResponse()`:

```typescript
if (lowerMessage.includes("tu_palabra_clave")) {
  return "Tu respuesta personalizada";
}
```

### Modificar el Prompt del Sistema

Edita la constante `SYSTEM_PROMPT` en `server/chat-router.ts`:

```typescript
const SYSTEM_PROMPT = `Tu prompt personalizado aquí...`;
```

## 🐛 Solución de Problemas

### "Network request failed" en el móvil

**Solución**:
1. Verifica que ambos dispositivos estén en la misma WiFi
2. Ejecuta `pnpm get-ip` y actualiza `.env`
3. Verifica el firewall (ver guía de configuración)
4. Reinicia el servidor

### El asistente no responde

**Solución**:
1. Verifica que el servidor esté corriendo (`pnpm dev`)
2. Revisa la consola del servidor para errores
3. Si usas OpenAI, verifica que la API key sea válida
4. Prueba sin API key (usará respuestas mock)

### No se solicitan permisos de audio

**Solución**:
1. Desinstala la app de Expo Go
2. Reinstala y vuelve a escanear el QR
3. Acepta los permisos cuando se soliciten

### Los mensajes no se guardan

**Solución**:
1. Verifica que AsyncStorage esté funcionando
2. Revisa los logs de la consola
3. Limpia la caché: Settings → Clear Data en Expo Go

## 📝 Changelog

### v1.0.3 (Actual - Completamente Funcional)
- ✅ Implementado router de chat con integración a OpenAI
- ✅ Agregada solicitud de permisos de audio
- ✅ Implementada persistencia de mensajes en AsyncStorage
- ✅ Agregada entrada de texto al asistente
- ✅ Mejorado manejo de errores y UX
- ✅ Creado script para obtener IP local
- ✅ Agregada guía completa de configuración móvil
- ✅ Creado archivo .env.example
- ✅ Sistema de respuestas mock inteligentes
- ✅ Auto-scroll en conversaciones
- ✅ Botón para limpiar historial

### v1.0.2 (Anterior)
- ✅ Todas las pantallas implementadas
- ✅ Navegación funcionando
- ⚠️ Asistente con respuestas hardcodeadas
- ⚠️ Sin permisos de audio
- ⚠️ Sin persistencia de mensajes

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para reportar problemas o sugerencias, abre un issue en GitHub:
https://github.com/dgr198213-ui/asistente-senior-ai-v2/issues

## 👨‍💻 Autor

Desarrollado por el equipo de Manus - Especialistas en aplicaciones accesibles para personas mayores.

---

**Nota**: Esta es una aplicación de demostración completamente funcional. Para uso en producción, se recomienda:
- Implementar autenticación de usuarios
- Configurar backend seguro con HTTPS
- Obtener certificados SSL
- Implementar encriptación de datos sensibles
- Realizar testing exhaustivo en dispositivos reales
- Configurar rate limiting en la API
- Implementar logging y monitoreo
