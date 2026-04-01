# 🔧 REFERENCIA TÉCNICA - SAO OS

## Arquitectura Técnica

### Stack Usado
- **HTML5** - Estructura semántica
- **CSS3** - Estilos + animations
- **JavaScript** - Vanilla JS (sin frameworks)
- **Tailwind CSS** - Utility-first CSS
- **LocalStorage** - Persistencia temporal
- **Firebase** (preparado) - Backend ready

---

## Estructura de Archivos

```
/home/sao/sao/
├── SAO.html                      # Punto de entrada
├── assets/
│   ├── js/
│   │   ├── ui-handlers.js        # ⭐ Todas las funciones globales
│   │   ├── app.js                # Lógica principal
│   │   ├── tailwind-config.js    # Config Tailwind
│   │   └── core/
│   │       ├── architecture.js   # Arquitectura
│   │       ├── config.js         # Configuración
│   │       ├── logging.js        # Logger
│   │       └── platform.js       # Plataforma
│   └── css/
│       └── styles.css            # ⭐ Estilos + animations
└── build/                         # Carpeta de producción
```

---

## Funciones Globales (50+)

### Autenticación
```javascript
handleAuthSubmit(event, type)    // type: 'signin' | 'signup'
switchAuthTab(tabName)           // Desktop tabs
switchToSignin()                 // Mobile
switchToSignup()                 // Mobile
showAuthLoading(show)            // Loading state
showAuthError(message)           // Error display
hideAuthError()                  // Hide error
showAuthScreen()                 // Show auth UI
hideAuthScreen()                 // Hide auth UI
```

### UI Principal
```javascript
startNewChat()                   // Nueva sesión
toggleProfilePanel()             // Profile modal
closeProfilePanel()              // Close profile
openSettings(tab)                // Settings modal
closeSettings()                  // Close settings
toggleZenMode()                  // Hide sidebar
toggleCompactMode()              // Compact view
toggleBattleMode()               // Arena mode
toggleMobileSidebar()            // Mobile menu
closeMobileSidebar()             // Close menu
scrollToBottom()                 // Auto scroll
```

### Chat
```javascript
handleSend()                     // Enviar mensaje
addMessage(role, content)        // Agregar a chat
generateReplySuggestions()       // Sugerencias IA
abortGeneration()                // Stop streaming
handleImageUpload(event)         // Upload imagen
removePendingImage(event)        // Remove preview
openLightbox(src)                // Image lightbox
closeLightbox()                  // Close lightbox
```

### Sesiones
```javascript
toggleSessionMenu()              // Session menu
closeSessionMenu()               // Close menu
beginRenameSession()             // Rename form
cancelRenameSession()            // Cancel rename
confirmRenameSession()           // Save rename
```

### Modales y Tabs
```javascript
switchProfileTab(tabName)        // Profile tabs
performSignIn()                  // Manual signin
performSignUp()                  // Manual signup
performSignOut()                 // Sign out
updateProfileData()              // Update profile
uploadProfileAvatar(event)       // Avatar upload
goBackSettings()                 // Back button
```

### Utilidades
```javascript
showToast(message, type)         // type: success|error|info
renderMessages()                 // Render chat
renderSessionsList()             // Render history
initializeMain()                 // Init app
toggleSidebarQuickPanel(type)    // Quick panel
```

---

## Estados CSS Clave

### Animaciones (@keyframes)
```css
@keyframes fadeIn       /* Fade in efecto */
@keyframes slideIn      /* Slide in efecto */
@keyframes pulse        /* Pulse animation */
@keyframes spin         /* Spinner */
@keyframes bounce       /* Bounce effect */
@keyframes wave         /* Wave animation */
```

### Clases Reutilizables
```css
.hidden                 /* display: none */
.opacity-0              /* Invisible */
.opacity-100            /* Visible */
.transition-all         /* Smooth transitions */
.animate-in             /* Fade in */
.animate-pulse          /* Pulse effect */
.animate-spin           /* Spinner */
.animate-bounce         /* Bounce effect */
```

---

## Event Listeners

### Keyboard
- `Ctrl+N` - Nuevo chat
- `Enter` - Enviar mensaje
- `Escape` - Cerrar modales

### Mouse
- `click` - Todos los botones
- `submit` - Formularios
- `change` - Inputs de archivo

### System
- `DOMContentLoaded` - Inicialización
- `localStorage` - Persistencia
- `mediaquery (--prefers-color-scheme)` - Dark mode

---

## LocalStorage Keys

```javascript
sao-auth                // Datos de auth actual
sao-has-completed-auth  // Flag de primer login
sao-user-name           // Nombre del usuario
sao-sessions            // Historial de chats
sao-settings-*          // Preferencias
```

---

## Integración con Firebase (Preparada)

### Ya en HTML:
```javascript
window.firebaseModular = {
    app, auth, database, firestore, storage,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    // ... y más
}
```

### Para activar Firebase Real:
1. Actualizar `handleAuthSubmit()` en ui-handlers.js
2. Usar `window.firebaseModular.auth` en lugar de localStorage
3. Agregar sync con Firestore

---

## Performance Tips

### Optimizaciones Ya Realizadas
- ✅ Lazy load de scripts con `defer`
- ✅ CSS compilado (no inline)
- ✅ Animaciones con CSS (no JS)
- ✅ Event delegation
- ✅ HTML5 Semantic

### Optimizaciones Recomendadas
- 📌 Minificar JS/CSS para producción
- 📌 Service Workers para offline
- 📌 Code splitting si crece mucho
- 📌 Image optimization

---

## Browser Compatibility

### Soporta
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### Requiere
- ✅ ES6 JavaScript
- ✅ CSS Grid/Flexbox
- ✅ LocalStorage API
- ✅ CSS Custom Properties

---

## API Endpoints (Preparados)

### Gemini Chat
```
POST /v1/generateContent
Headers: x-goog-api-key
Body: { contents: [...] }
```

### Groq Suggestions
```
POST /openai/v1/chat/completions
Headers: Authorization: Bearer KEY
Body: { messages: [...] }
```

---

## Debugging

### Console Logs
```javascript
// Verificar estado
console.log(localStorage.getItem('sao-auth'))

// Limpiar todo
localStorage.clear()

// Force dark mode
document.documentElement.classList.add('dark')

// Ver eventos
document.addEventListener('click', e => console.log(e.target))
```

### Network Tab
- Verifica requests a CDN (Tailwind)
- Verifica si hay CORS issues
- Verifica timing de recursos

### Performance Tab
- Lighthouse audit
- Profiling de JS
- Memory leaks check

---

## Build & Deployment

### Pre-deployment Checklist
- [ ] Minify HTML/CSS/JS
- [ ] Verificar todos los endpoints
- [ ] Tests en navegadores reales
- [ ] Performance audit
- [ ] Security audit
- [ ] SEO meta tags

### Deploy Opciones
- Netlify (recomendado)
- Vercel
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

---

## Troubleshooting Dev

### "ReferenceError: function not defined"
✅ Verifica que esté en `window` scope:
```javascript
window.myFunction = function() { ... }
```

### "CSS not applying"
✅ Verifica Tailwind CDN está cargado
✅ Verifica no hay conflictos de estilos inline

### "LocalStorage quota exceeded"
✅ Limpia datos viejos:
```javascript
localStorage.removeItem('sao-old-key')
```

### "Animations stuttering"
✅ Usa `transform` y `opacity` (no `width/height`)
✅ Agrega `will-change` en CSS

---

## Git Workflow (Recomendado)

```bash
# Main branch
git checkout -b feature/nueva-feature
git add .
git commit -m "feat: descripción"
git push origin feature/nueva-feature
# Pull Request

# Mergear a main
git checkout main
git merge feature/nueva-feature
git push origin main
```

---

## Testing Sugerido

### Unit Tests
```javascript
// Con Jest o Vitest
test('handleAuthSubmit valida email', () => {
  // ...
})
```

### E2E Tests
```javascript
// Con Cypress o Playwright
cy.visit('/')
cy.get('[data-testid=email]').type('test@test.com')
cy.get('[data-testid=submit]').click()
```

### Manual Testing
- [ ] Login desktop
- [ ] Login móvil
- [ ] Chat enviar mensaje
- [ ] Settings abierto
- [ ] Dark mode toggle
- [ ] Responsive en varios tamaños

---

## Mantenimiento Futuro

### Actualizar dependencias
```bash
npm outdated        # Ver qué está viejo
npm update          # Actualizar
```

### Monitoreo
- Sentry (error tracking)
- LogRocket (session replay)
- Vercel Analytics (performance)

### Backups
- Firebase backup automático
- GitHub backup regular

---

**Última actualización**: 31 de Marzo de 2026
**Versión**: 2.0.0  
**Status**: 🟢 PRODUCCIÓN

