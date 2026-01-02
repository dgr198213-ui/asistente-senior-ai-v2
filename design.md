# Diseño de Interfaz - Asistente Senior AI

## Principios de Diseño

Esta aplicación está diseñada específicamente para personas mayores, siguiendo los principios de accesibilidad y facilidad de uso. El diseño se basa en las **Apple Human Interface Guidelines (HIG)** para garantizar una experiencia nativa en iOS, con orientación **portrait (9:16)** y optimizada para **uso con una sola mano**.

### Características Clave de Accesibilidad

El diseño prioriza textos grandes, botones amplios, alto contraste, navegación simple e iconos claros y descriptivos. Todos los elementos interactivos tienen un tamaño mínimo de 60x60 píxeles para facilitar la pulsación. Los colores utilizan contrastes altos para mejorar la legibilidad, y se proporciona feedback visual y háptico inmediato para todas las acciones.

## Paleta de Colores

La aplicación utiliza una paleta de colores calmante y profesional, inspirada en el sector salud y bienestar. El color primario es **azul turquesa (#0a7ea4)**, que transmite confianza y tranquilidad. El fondo en modo claro es **blanco (#ffffff)**, mientras que en modo oscuro es **gris oscuro (#151718)**. Los colores de superficie son **gris muy claro (#f5f5f5)** en modo claro y **gris oscuro medio (#1e2022)** en modo oscuro. Para el texto principal se usa **gris muy oscuro (#11181C)** en modo claro y **gris muy claro (#ECEDEE)** en modo oscuro. El texto secundario es **gris medio (#687076)** en modo claro y **gris claro (#9BA1A6)** en modo oscuro.

Los colores de estado incluyen **verde (#22C55E / #4ADE80)** para éxito, **amarillo (#F59E0B / #FBBF24)** para advertencias, y **rojo (#EF4444 / #F87171)** para errores y emergencias.

## Lista de Pantallas

### 1. Pantalla de Inicio (Home)
Esta es la pantalla principal que muestra un saludo personalizado con el nombre del usuario y la hora del día. Incluye un botón grande y prominente para activar el asistente de voz, accesos rápidos a funciones principales mediante tarjetas grandes (Recordatorios, Salud, Contactos, Emergencia), y un resumen de recordatorios pendientes del día.

**Contenido específico**: Tarjetas con iconos grandes (corazón para salud, campana para recordatorios, teléfono para contactos, cruz médica roja para emergencia). Cada tarjeta muestra un título, un icono y una breve descripción o contador.

**Funcionalidad**: Al tocar el botón de voz se activa el asistente. Al tocar cada tarjeta se navega a la sección correspondiente. El botón de emergencia tiene un color rojo distintivo y está siempre visible.

### 2. Pantalla de Asistente de Voz
Esta pantalla muestra una interfaz limpia y centrada para la interacción por voz. Incluye un botón circular grande para iniciar/detener grabación con animación de pulso durante la grabación, visualización de la transcripción del usuario en tiempo real, respuesta del asistente en texto, y botones para reproducir audio de la respuesta.

**Contenido específico**: Icono de micrófono animado en el centro. Área de transcripción con texto grande y legible. Área de respuesta del asistente con fondo diferenciado. Historial de conversación desplazable hacia arriba.

**Funcionalidad**: Grabar audio del usuario, enviar a API de transcripción (Speech-to-Text), procesar con LLM para generar respuesta inteligente, convertir respuesta a audio (Text-to-Speech), reproducir respuesta automáticamente, y mantener contexto de conversación.

**Flujo de usuario**: Usuario toca botón de micrófono → Habla su consulta → Suelta botón → Ve transcripción → Recibe respuesta en texto y audio → Puede hacer seguimiento o nueva consulta.

### 3. Pantalla de Recordatorios
Esta pantalla lista todos los recordatorios organizados por fecha (Hoy, Mañana, Próximos). Cada recordatorio muestra título, hora, icono según tipo (medicamento, cita, general), y estado (pendiente/completado).

**Contenido específico**: Lista desplazable de recordatorios. Cada ítem tiene checkbox grande para marcar como completado, título del recordatorio, hora y fecha, icono de categoría, y botón para editar/eliminar.

**Funcionalidad**: Crear nuevo recordatorio con formulario simple, editar recordatorios existentes, marcar como completado, eliminar recordatorios, y recibir notificaciones push a la hora programada.

**Flujo de usuario**: Usuario ve lista de recordatorios → Toca "+" para crear nuevo → Completa formulario (título, hora, tipo, repetición) → Guarda → Recibe notificación a la hora indicada → Marca como completado.

### 4. Pantalla de Salud
Esta pantalla permite registrar y visualizar datos de salud. Incluye tarjetas para diferentes métricas (Presión arterial, Glucosa, Peso, Medicamentos), gráficos simples de tendencias, y botón para agregar nueva medición.

**Contenido específico**: Tarjetas con última medición y fecha. Gráficos de línea simples mostrando tendencia de últimos 7 días. Formulario para agregar nueva medición con campos grandes y teclado numérico. Indicadores visuales de rangos normales/anormales.

**Funcionalidad**: Registrar mediciones de salud con fecha y hora, visualizar historial en gráficos simples, alertas si valores están fuera de rango normal, y exportar datos para compartir con médico.

**Flujo de usuario**: Usuario toca tarjeta de métrica → Ve historial y gráfico → Toca "Agregar medición" → Ingresa valor → Guarda → Ve actualización en gráfico.

### 5. Pantalla de Contactos de Emergencia
Esta pantalla muestra una lista de contactos importantes con botones grandes para llamar o enviar mensaje. Incluye foto del contacto (si está disponible), nombre, relación (hijo, médico, etc.), y botones de acción grandes (Llamar, Mensaje).

**Contenido específico**: Lista de contactos con fotos circulares grandes. Cada contacto tiene nombre en texto grande, etiqueta de relación, botón verde grande "Llamar", y botón azul "Mensaje". Botón "+" para agregar nuevo contacto.

**Funcionalidad**: Llamar directamente con un toque, enviar mensaje predefinido ("Necesito ayuda", "Estoy bien", etc.), agregar/editar/eliminar contactos, y marcar contactos como favoritos.

**Flujo de usuario**: Usuario ve lista de contactos → Toca botón "Llamar" → Se inicia llamada telefónica. O toca "Mensaje" → Selecciona mensaje predefinido → Se envía SMS.

### 6. Pantalla de Emergencia
Esta es una pantalla especial de acceso rápido con botón rojo grande "LLAMAR EMERGENCIA" que llama al número de emergencia local. También muestra información médica importante del usuario (alergias, condiciones, medicamentos) y botones para contactar a familiares de emergencia.

**Contenido específico**: Botón rojo enorme que ocupa 1/3 de la pantalla con texto "EMERGENCIA 911". Sección con información médica clave en texto grande. Lista de 2-3 contactos de emergencia con botones de llamada rápida.

**Funcionalidad**: Llamar a emergencias con un toque, mostrar información médica relevante para primeros respondedores, y contactar automáticamente a familiares designados.

**Flujo de usuario**: Usuario toca botón de emergencia en Home → Pantalla de emergencia se abre → Toca botón rojo grande → Confirmación rápida → Llama a emergencias → Opcionalmente notifica a contactos.

### 7. Pantalla de Configuración
Esta pantalla permite personalizar la experiencia de la aplicación. Incluye ajustes de tamaño de fuente (Pequeño, Mediano, Grande, Extra Grande), tema (Claro, Oscuro, Automático), volumen de voz del asistente, activar/desactivar notificaciones, y gestión de perfil de usuario.

**Contenido específico**: Lista de opciones con switches grandes y sliders. Previsualización en tiempo real de cambios de fuente. Selector de tema con iconos visuales. Control de volumen con slider grande. Sección de perfil con foto, nombre, edad, información médica básica.

**Funcionalidad**: Cambiar tamaño de fuente globalmente, alternar entre modo claro/oscuro, ajustar volumen de respuestas de voz, gestionar permisos de notificaciones, y editar información de perfil.

## Navegación

La aplicación utiliza una **barra de pestañas inferior (Tab Bar)** con 4-5 pestañas principales para navegación rápida. Las pestañas incluyen:

1. **Inicio** (icono: casa) - Pantalla principal con accesos rápidos
2. **Asistente** (icono: micrófono) - Interacción por voz
3. **Recordatorios** (icono: campana) - Lista de recordatorios
4. **Salud** (icono: corazón) - Métricas de salud
5. **Más** (icono: tres puntos) - Contactos, emergencia, configuración

Los iconos de la Tab Bar son grandes (28-32px) con etiquetas de texto claras. El color de la pestaña activa es el azul turquesa primario.

## Componentes Clave

### Botón Grande de Acción
Botón con altura mínima de 60px, esquinas redondeadas (12px), texto grande (18-20px), feedback háptico al tocar, y animación de escala al presionar (0.97).

### Tarjeta de Función
Contenedor con fondo de superficie, borde sutil, padding generoso (16-20px), icono grande en la parte superior (48-64px), título en texto grande (20-24px), y descripción en texto mediano (16px).

### Campo de Entrada Accesible
Input con altura mínima de 56px, texto grande (18px), placeholder claro, borde visible con buen contraste, y teclado apropiado según tipo de dato.

### Elemento de Lista
Ítem con altura mínima de 72px, checkbox o botón de acción grande, texto principal grande (18-20px), texto secundario mediano (14-16px), e icono descriptivo.

## Interacciones y Feedback

Todas las interacciones proporcionan feedback inmediato. Los botones principales tienen feedback háptico ligero, animación de escala (0.97), y cambio de opacidad (0.9). Los elementos de lista tienen feedback de opacidad (0.7). Las acciones importantes muestran confirmación visual con checkmark o mensaje de éxito. Las acciones destructivas (eliminar) requieren confirmación con diálogo.

## Accesibilidad Adicional

La aplicación incluye soporte completo para VoiceOver y TalkBack, etiquetas descriptivas en todos los elementos interactivos, navegación por gestos simplificada, y textos con alto contraste (WCAG AAA cuando sea posible). Todos los iconos tienen etiquetas de texto alternativo, y se proporcionan instrucciones de voz para funciones complejas.
