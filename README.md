# MailToCall Dashboard

Un dashboard moderno y minimalista para la gestión de llamadas automatizadas basado en eventos de email.

## Características

- 🔐 **Autenticación segura** con JWT
- 👥 **Gestión de grupos de contactos** con niveles de emergencia
- 📱 **Gestión de contactos** con prioridades y roles
- ⚡ **Configuración de triggers** para activación automática
- 🎨 **Diseño moderno y minimalista** con Angular 18
- 📱 **Responsive design** para todos los dispositivos
- 🚀 **Arquitectura moderna** con standalone components y signals
- 📊 **Dashboard con estadísticas** en tiempo real del sistema

## Tecnologías Utilizadas

- **Angular 18** - Framework principal
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos y diseño
- **Signals** - Gestión de estado reactivo
- **Reactive Forms** - Formularios reactivos
- **HTTP Client** - Comunicación con API
- **Router** - Navegación entre vistas

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/           # Componentes de la aplicación
│   │   ├── login/           # Componente de autenticación
│   │   ├── home/            # Dashboard principal con estadísticas
│   │   ├── contact-groups/  # Gestión de grupos
│   │   ├── contacts/        # Gestión de contactos
│   │   └── triggers/        # Gestión de triggers
│   ├── services/            # Servicios para API
│   ├── models/              # Interfaces TypeScript
│   ├── guards/              # Guards de autenticación
│   └── interceptors/        # Interceptors HTTP
├── styles.scss              # Estilos globales
└── index.html              # HTML principal
```

## API Endpoints

La aplicación se conecta a los siguientes endpoints:

### Autenticación
- `POST /api/v1/auth/token` - Login y obtención de token

### Grupos de Contactos
- `GET /api/v1/contact-groups/` - Listar grupos
- `POST /api/v1/contact-groups/` - Crear grupo
- `GET /api/v1/contact-groups/{id}` - Obtener grupo
- `PUT /api/v1/contact-groups/{id}` - Actualizar grupo
- `DELETE /api/v1/contact-groups/{id}` - Eliminar grupo

### Contactos
- `GET /api/v1/contacts/` - Listar contactos
- `POST /api/v1/contacts/` - Crear contacto
- `GET /api/v1/contacts/{id}` - Obtener contacto
- `PUT /api/v1/contacts/{id}` - Actualizar contacto
- `DELETE /api/v1/contacts/{id}` - Eliminar contacto
- `GET /api/v1/contacts/by-group/{groupId}` - Contactos por grupo

### Triggers
- `GET /api/v1/triggers/` - Listar triggers
- `POST /api/v1/triggers/` - Crear trigger
- `GET /api/v1/triggers/{id}` - Obtener trigger
- `PUT /api/v1/triggers/{id}` - Actualizar trigger
- `DELETE /api/v1/triggers/{id}` - Eliminar trigger

### Estadísticas del Sistema
- `GET /api/v1/system-stats/counts/contact-groups` - Contar grupos de contactos
- `GET /api/v1/system-stats/counts/contacts` - Contar contactos totales
- `GET /api/v1/system-stats/counts/active-triggers` - Contar triggers activos
- `GET /api/v1/system-stats/counts/daily-calls` - Contar llamadas diarias

## Instalación y Desarrollo

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm start
   ```

3. **Abrir en navegador:**
   ```
   http://localhost:4200
   ```

## Build para Producción

```bash
npm run build
```

Los archivos compilados se generarán en el directorio `dist/`.

## Funcionalidades Principales

### Dashboard/Home
- Vista general del sistema con métricas clave
- Estadísticas en tiempo real:
  - Total de grupos de contactos
  - Total de contactos registrados
  - Triggers activos en el sistema
  - Llamadas realizadas hoy
- Acciones rápidas para crear nuevos elementos
- Indicadores de estado de carga

### Gestión de Grupos de Contactos
- Crear, editar y eliminar grupos
- Configurar niveles de emergencia (bajo, medio, alto, crítico)
- Activar/desactivar grupos
- Vista en tarjetas con información detallada

### Gestión de Contactos
- Crear, editar y eliminar contactos
- Asignar contactos a múltiples grupos
- Configurar prioridades (1-5)
- Definir roles y departamentos
- Vista en tabla con filtros

### Gestión de Triggers
- Crear, editar y eliminar triggers de email
- Configurar cadenas de activación
- Asignar a grupos de contactos
- Mensajes personalizados para llamadas
- Configurar prioridades

### Características de UX/UI
- Diseño moderno y minimalista
- Interfaz responsive
- Modales para formularios
- Estados de carga
- Confirmaciones de eliminación
- Mensajes de error informativos
- Navegación intuitiva

## Configuración de API

La aplicación está configurada para usar rutas relativas que apuntan a `/api/v1/`. Para cambiar la URL base de la API, modifica los servicios en `src/app/services/`.

## Seguridad

- Autenticación JWT con tokens almacenados localmente
- Interceptor HTTP para agregar tokens automáticamente
- Guards de ruta para proteger páginas privadas
- Logout automático en caso de token inválido

## Personalización

### Colores y Temas
Los colores principales se definen en `src/styles.scss`. Puedes personalizar:
- Color primario: `#3b82f6` (azul)
- Color de éxito: `#10b981` (verde)
- Color de advertencia: `#f59e0b` (amarillo)
- Color de error: `#ef4444` (rojo)

### Componentes
Todos los componentes usan standalone components y pueden ser fácilmente extendidos o personalizados.

## Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
