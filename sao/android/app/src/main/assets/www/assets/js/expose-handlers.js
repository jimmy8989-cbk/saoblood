// ======================================================
// SAO OS - EXPONER HANDLERS AL SCOPE GLOBAL
// Este archivo asegura que todos los handlers de ui-handlers.js
// estén disponibles en window para onclick desde HTML
// ======================================================

// Función para exponer todos los handlers globales
function exposeUIHandlers() {
    // Lista de todas las funciones que deben estar globales
    const handlersToExpose = [
        // Auth
        'switchToSignin',
        'switchToSignup',
        'switchAuthTab',
        'handleAuthSubmit',
        'showAuthLoading',
        'showAuthError',
        'hideAuthError',
        'performSignIn',
        'performSignUp',
        'performSignOut',
        
        // Navegación
        'toggleProfilePanel',
        'closeProfilePanel',
        'openSettings',
        'closeSettings',
        'goBackSettings',
        'switchProfileTab',
        'updateProfileData',
        
        // Chat
        'startNewChat',
        'handleSend',
        'addMessage',
        'cancelReply',
        'generateReplySuggestions',
        'scrollToBottom',
        'showToast',
        
        // Modo
        'toggleZenMode',
        'toggleCompactMode',
        'toggleBattleMode',
        'toggleMobileSidebar',
        'toggleSidebarQuickPanel',
        
        // Imágenes
        'removePendingImage',
        'closeLightbox',
        
        // Ediciones
        'beginRenameSession',
        'cancelRenameSession',
        'confirmRenameSession',
        
        // Generación
        'abortGeneration'
    ];

    let exposedCount = 0;
    let failedCount = 0;

    handlersToExpose.forEach(handlerName => {
        try {
            // Buscar la función en el scope actual
            if (typeof eval(handlerName) === 'function') {
                // Exponerla a window
                window[handlerName] = eval(handlerName);
                exposedCount++;
            } else {
                console.warn(`⚠️  ${handlerName} no es una función`);
                failedCount++;
            }
        } catch (e) {
            console.warn(`⚠️  No se pudo exponer ${handlerName}: ${e.message}`);
            failedCount++;
        }
    });

    console.log(`✓ Expuestos ${exposedCount} handlers globales (${failedCount} errores)`);

    // Verificación rápida
    const checkFunctions = ['switchAuthTab', 'toggleZenMode', 'startNewChat', 'handleSend'];
    checkFunctions.forEach(fn => {
        if (typeof window[fn] === 'function') {
            console.log(`✓ ${fn} está disponible globalmente`);
        } else {
            console.error(`✗ ${fn} NO está disponible`);
        }
    });
}

// Exponer cuando el documento esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', exposeUIHandlers);
} else {
    // Si el documento ya se cargó, exponer inmediatamente
    exposeUIHandlers();
}

// También intentar exponer en una ventana corta para estar seguro
setTimeout(exposeUIHandlers, 500);
setTimeout(exposeUIHandlers, 1000);
