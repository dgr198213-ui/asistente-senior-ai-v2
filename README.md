# Asistente Senior AI - v1.0.2 (Completamente Funcional)

Aplicación móvil React Native con Expo diseñada específicamente para personas mayores. Incluye asistente de voz con IA, gestión de recordatorios, seguimiento de salud, contactos de emergencia y configuración accesible.

## 🎯 Características Principales

### ✅ Completamente Implementadas y Funcionales

- **Asistente de Voz**: Grabación de audio, historial de conversaciones, interfaz intuitiva
- **Recordatorios**: Crear, editar, completar recordatorios con categorías (medicamento, cita, general)
- **Seguimiento de Salud**: Registrar presión arterial, glucosa, peso, frecuencia cardíaca
- **Contactos de Emergencia**: Agregar contactos, marcar favoritos, llamadas directas
- **Pantalla de Emergencia**: Botón rojo grande para llamar al 911
- **Configuración Accesible**: Tamaño de fuente ajustable, modo oscuro/claro, notificaciones
- **Persistencia Local**: Todos los datos se guardan en AsyncStorage
- **Monitoreo de Conectividad**: Indicador de conexión con reconexión automática
- **Accesibilidad Senior**: Textos grandes, botones grandes, alto contraste, feedback háptico

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js 18+ y npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- Git

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/dgr198213-ui/asistente-senior-ai-v2.git
cd asistente-senior-ai-v2

# 2. Instalar dependencias
pnpm install
# o
npm install

# 3. Iniciar el servidor de desarrollo
pnpm dev
# o
npm run dev

# 4. Abrir en navegador o dispositivo
# - Navegador: http://localhost:8081
# - Dispositivo: Escanear código QR con Expo Go
```

## 📱 Uso de la Aplicación

### Pantalla de Inicio
- Saludo personalizado según la hora del día
- Accesos rápidos a Recordatorios, Salud y Contactos
- Contador de recordatorios pendientes
- Botón de emergencia prominente

### Asistente de Voz
- Toca el micrófono para grabar tu voz
- El asistente procesa y responde
- Historial de conversaciones visible
- Indicador de "Procesando..." durante operaciones

### Recordatorios
- Crear nuevo recordatorio con título, hora, fecha y tipo
- Marcar como completado tocando la tarjeta
- Categorías: Medicamento (rojo), Cita (naranja), General (azul)
- Opciones de repetición: Diariamente, Semanalmente, No repetir

### Salud
- Registrar mediciones: Presión Arterial, Glucosa, Peso, Frecuencia Cardíaca
- Ver última medición de cada tipo
- Interfaz clara con valores y fechas

### Contactos de Emergencia
- Agregar contactos con nombre, teléfono y relación
- Marcar como favoritos (estrella)
- Botón de llamada directa para cada contacto
- Eliminar contactos si es necesario

### Configuración
- **Tamaño de Fuente**: Pequeño, Mediano, Grande, Muy Grande
- **Notificaciones**: Activar/Desactivar
- **Retroalimentación Háptica**: Activar/Desactivar
- **Modo Oscuro**: Activar/Desactivar

## 🔧 Estructura del Proyecto

```
asistente-senior-app/
├── app/
│   ├── (tabs)/              # Pantallas con navegación por pestañas
│   │   ├── index.tsx        # Pantalla de inicio
│   │   ├── assistant.tsx    # Asistente de voz
│   │   ├── reminders.tsx    # Recordatorios
│   │   ├── health.tsx       # Salud
│   │   └── more.tsx         # Más opciones
│   ├── add-reminder.tsx     # Modal para agregar recordatorio
│   ├── add-health-metric.tsx # Modal para agregar medición
│   ├── add-emergency-contact.tsx # Modal para agregar contacto
│   ├── settings.tsx         # Configuración
│   ├── emergency-contacts.tsx # Gestión de contactos
│   ├── emergency.tsx        # Pantalla de emergencia
│   └── _layout.tsx          # Layout raíz
├── components/
│   ├── screen-container.tsx # Contenedor con SafeArea
│   ├── app-initializer.tsx  # Splash screen
│   ├── network-status-bar.tsx # Indicador de conexión
│   ├── accessible-button.tsx # Botón accesible
│   ├── accessible-text-input.tsx # Input accesible
│   └── ui/
│       └── icon-symbol.tsx  # Mapeo de iconos
├── hooks/
│   ├── use-reminders.ts     # Gestión de recordatorios
│   ├── use-health.ts        # Gestión de salud
│   ├── use-emergency-contacts.ts # Gestión de contactos
│   ├── use-voice-assistant.ts # Asistente de voz
│   ├── use-app-init.ts      # Inicialización de app
│   ├── use-network-error.ts # Manejo de errores de red
│   └── use-colors.ts        # Colores del tema
├── lib/
│   ├── config-service.ts    # Configuración remota con fallback
│   ├── network-service.ts   # Monitoreo de conectividad
│   └── theme-provider.tsx   # Proveedor de tema
├── assets/
│   ├── images/              # Iconos y splash
│   └── default_config.json  # Configuración por defecto
└── package.json
```

## 🔌 Configuración de API

### Configuración Remota
La app intenta descargar configuración remota al iniciar. Si no hay conexión, usa `default_config.json` como fallback.

**Archivo**: `assets/default_config.json`
```json
{
  "systemPrompt": "Eres un asistente útil y paciente, optimizado para usuarios mayores. Tus respuestas deben ser breves, claras y sin tecnicismos.",
  "apiUrl": "http://localhost:3000",
  "timeout": 10000,
  "retryAttempts": 3
}
```

### Endpoints Esperados
- `GET /api/config` - Obtener configuración remota
- `POST /api/chat` - Enviar mensaje al asistente

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo

# Testing
pnpm test             # Ejecutar pruebas unitarias

# Compilación
pnpm build            # Compilar para producción

# Linting
pnpm lint             # Verificar código

# Formato
pnpm format           # Formatear código con Prettier
```

### Agregar Nuevas Pantallas

1. Crear archivo en `app/` o `app/(tabs)/`
2. Agregar ruta en `app/_layout.tsx` si es modal
3. Usar `ScreenContainer` para layout correcto
4. Importar `useColors()` para colores del tema

### Agregar Nuevos Hooks

1. Crear archivo en `hooks/`
2. Usar `AsyncStorage` para persistencia
3. Exportar tipos TypeScript
4. Documentar con comentarios

## 🎨 Personalización

### Cambiar Colores del Tema

Editar `theme.config.js`:
```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  background: { light: '#ffffff', dark: '#151718' },
  // ... más colores
};
```

### Cambiar Nombre de la App

Editar `app.config.ts`:
```typescript
const env = {
  appName: "Tu Nombre de App",
  appSlug: "tu-app-slug",
  // ...
};
```

## 📊 Datos Locales

Todos los datos se guardan en AsyncStorage:
- `@asistente_senior_reminders` - Recordatorios
- `@asistente_senior_health` - Mediciones de salud
- `@asistente_senior_contacts` - Contactos de emergencia
- `@asistente_senior_settings` - Configuración de usuario
- `@asistente_senior_config` - Configuración de app

## 🐛 Troubleshooting

### La app no inicia
```bash
# Limpiar caché
pnpm cache clean
rm -rf node_modules
pnpm install
pnpm dev
```

### Errores de TypeScript
```bash
# Verificar tipos
pnpm check
```

### Problemas de conectividad
- Verificar que el servidor está corriendo en puerto 3000
- Revisar `default_config.json` para endpoint correcto
- Ver indicador de conexión en la parte superior de la app

## 📝 Versiones

### v1.0.2 (Actual - Completamente Funcional)
- ✅ Todas las pantallas implementadas y funcionales
- ✅ Rutas modales configuradas correctamente
- ✅ Imports corregidos
- ✅ Navegación entre pantallas funcionando
- ✅ Persistencia de datos en AsyncStorage
- ✅ Monitoreo de conectividad
- ✅ Accesibilidad mejorada
- ✅ Manejo robusto de errores

### v1.0.1 (Anterior)
- Problemas de conectividad
- Rutas modales no configuradas
- Imports incompletos

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

Desarrollado por Manus Team - Especialistas en aplicaciones accesibles para personas mayores.

---

**Nota**: Esta es una aplicación de demostración. Para uso en producción, se recomienda:
- Implementar autenticación de usuarios
- Configurar backend seguro
- Obtener certificados SSL
- Implementar encriptación de datos sensibles
- Realizar testing exhaustivo en dispositivos reales
