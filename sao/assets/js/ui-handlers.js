// --- SAO OS v2.0 - Manejadores de UI Global ---
// Todas las funciones que son llamadas desde HTML están aquí

/* ============= AUTENTICACIÓN ============= */

// Mostrar/Ocultar formas de autenticación
function switchToSignin() {
    const signinForm = document.getElementById('mobile-signin');
    const signupForm = document.getElementById('mobile-signup');
    if (signinForm) signinForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
}

function switchToSignup() {
    const signinForm = document.getElementById('mobile-signin');
    const signupForm = document.getElementById('mobile-signup');
    if (signupForm) signupForm.classList.remove('hidden');
    if (signinForm) signinForm.classList.add('hidden');
}

// Cambiar tab de autenticación (desktop)
function switchAuthTab(tabName) {
    ['signin', 'signup'].forEach(tab => {
        const btn = document.getElementById(`auth-tab-${tab}`);
        const content = document.getElementById(`auth-content-${tab}`);
        
        if (tab === tabName) {
            if (btn) {
                btn.classList.add('bg-white', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                btn.classList.remove('bg-transparent', 'text-slate-600', 'dark:text-slate-400');
            }
            if (content) content.classList.remove('hidden');
        } else {
            if (btn) {
                btn.classList.remove('bg-white', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                btn.classList.add('bg-transparent', 'text-slate-600', 'dark:text-slate-400');
            }
            if (content) content.classList.add('hidden');
        }
    });
    
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Manejar envío de formulario de autenticación
async function handleAuthSubmit(event, type) {
    event.preventDefault();
    
    try {
        if (type === 'signin') {
            const email = document.getElementById('auth-signin-email')?.value?.trim();
            const password = document.getElementById('auth-signin-password')?.value;
            
            // Validación mejorada
            if (!email) {
                showAuthError('Por favor ingresa tu correo electrónico');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAuthError('Por favor ingresa un correo electrónico válido');
                return;
            }
            
            if (!password || password.length < 6) {
                showAuthError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            // Simular login
            localStorage.setItem('sao-auth', JSON.stringify({ email, type: 'signin' }));
            localStorage.setItem('sao-has-completed-auth', 'true');
            
            showAuthLoading(true);
            setTimeout(() => {
                hideAuthScreen();
                showMainApp();
                initializeMain();
                showAuthLoading(false);
            }, 800);
            
        } else if (type === 'signup') {
            const name = document.getElementById('auth-signup-name')?.value?.trim();
            const email = document.getElementById('auth-signup-email')?.value?.trim();
            const password = document.getElementById('auth-signup-password')?.value;
            
            // Validación mejorada
            if (!name || name.length < 2) {
                showAuthError('Por favor ingresa un nombre válido (mínimo 2 caracteres)');
                return;
            }
            
            if (!email) {
                showAuthError('Por favor ingresa tu correo electrónico');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAuthError('Por favor ingresa un correo electrónico válido');
                return;
            }
            
            if (!password || password.length < 8) {
                showAuthError('La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            localStorage.setItem('sao-auth', JSON.stringify({ name, email, type: 'signup' }));
            localStorage.setItem('sao-has-completed-auth', 'true');
            
            showAuthLoading(true);
            setTimeout(() => {
                hideAuthScreen();
                showMainApp();
                initializeMain();
                showAuthLoading(false);
            }, 800);
        }
    } catch (error) {
        console.error('Auth error:', error);
        showAuthError(error.message || 'Error de autenticación');
    }
}

function showAuthLoading(show) {
    const desktopLoading = document.getElementById('auth-loading');
    const mobileLoading = document.getElementById('mobile-auth-loading');
    const desktopContent = document.getElementById('auth-content-signin');
    const mobileContent = document.getElementById('mobile-auth-content');
    
    if (show) {
        if (desktopLoading) desktopLoading.classList.remove('hidden');
        if (mobileLoading) mobileLoading.classList.remove('hidden');
        if (desktopContent) desktopContent.classList.add('hidden');
        if (mobileContent) mobileContent.classList.add('hidden');
    } else {
        if (desktopLoading) desktopLoading.classList.add('hidden');
        if (mobileLoading) mobileLoading.classList.add('hidden');
        if (desktopContent) desktopContent.classList.remove('hidden');
        if (mobileContent) mobileContent.classList.remove('hidden');
    }
}

function showAuthError(message) {
    const desktopError = document.getElementById('auth-error');
    const mobileError = document.getElementById('mobile-auth-error');
    const desktopErrorText = document.getElementById('auth-error-text');
    const mobileErrorText = document.getElementById('mobile-auth-error-text');
    
    if (message) {
        if (desktopError && desktopErrorText) {
            desktopErrorText.textContent = message;
            desktopError.classList.remove('hidden');
        }
        if (mobileError && mobileErrorText) {
            mobileErrorText.textContent = message;
            mobileError.classList.remove('hidden');
        }
    }
}

function hideAuthError() {
    const desktopError = document.getElementById('auth-error');
    const mobileError = document.getElementById('mobile-auth-error');
    if (desktopError) desktopError.classList.add('hidden');
    if (mobileError) mobileError.classList.add('hidden');
}

function showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    
    if (authScreen) {
        authScreen.classList.remove('hidden');
        authScreen.style.display = 'block';
    }
    if (appContainer) {
        appContainer.classList.add('hidden');
        appContainer.style.display = 'none';
    }
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
}

function hideAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    if (authScreen) {
        authScreen.classList.add('hidden');
        authScreen.style.display = 'none';
    }
}

function showMainApp() {
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.classList.remove('hidden');
        appContainer.style.display = 'flex';
    }
}

/* ============= UI PRINCIPAL ============= */

function startNewChat() {
    const input = document.getElementById('chat-input');
    if (input) input.focus();
    showToast('Nuevo chat iniciado', 'success');
}

function toggleProfilePanel() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
        } else {
            closeProfilePanel();
        }
    }
}

function closeProfilePanel() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('opacity-100');
        }, 300);
    }
}

function openSettings(tab = 'appearance') {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('opacity-100');
        }, 300);
    }
}

function goBackSettings() {
    closeSettings();
}

function switchProfileTab(tabName) {
    ['signin', 'signup', 'account'].forEach(tab => {
        const tabBtn = document.getElementById(`profile-tab-${tab}`);
        const content = document.getElementById(`profile-content-${tab}`);
        
        if (tab === tabName) {
            if (tabBtn) {
                tabBtn.classList.add('border-blue-500', 'text-slate-900', 'dark:text-white');
                tabBtn.classList.remove('border-transparent', 'text-slate-600', 'dark:text-slate-300');
            }
            if (content) content.classList.remove('hidden');
        } else {
            if (tabBtn) {
                tabBtn.classList.remove('border-blue-500', 'text-slate-900', 'dark:text-white');
                tabBtn.classList.add('border-transparent', 'text-slate-600', 'dark:text-slate-300');
            }
            if (content) content.classList.add('hidden');
        }
    });
}

function toggleZenMode() {
    const sidebar = document.getElementById('sidebar');
    const zenIcon = document.getElementById('zen-icon');
    
    if (sidebar) {
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            if (zenIcon) zenIcon.innerHTML = '<i data-lucide="maximize-2" class="w-4 h-4"></i>';
        } else {
            sidebar.classList.add('hidden');
            if (zenIcon) zenIcon.innerHTML = '<i data-lucide="minimize-2" class="w-4 h-4"></i>';
        }
    }
    
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

function toggleCompactMode() {
    const container = document.getElementById('chat-container');
    if (container) {
        container.classList.toggle('compact-mode');
    }
}

function toggleBattleMode() {
    showToast('Arena 2v2 activada', 'info');
}

function toggleMobileSidebar(e) {
    if (e) e.preventDefault();
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('mobile-sidebar-scrim');
    
    if (sidebar && scrim) {
        sidebar.classList.toggle('hidden');
        scrim.classList.toggle('hidden');
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('mobile-sidebar-scrim');
    
    if (sidebar) sidebar.classList.add('hidden');
    if (scrim) scrim.classList.add('hidden');
}

function scrollToBottom() {
    const container = document.getElementById('chat-container');
    if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
}

/* ============= CHAT Y MENSAJES ============= */

function handleSend() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    addMessage('user', message);
    input.value = '';
    
    // Simular respuesta
    setTimeout(() => {
        addMessage('assistant', '¡Hola! Soy SAO OS. ¿Cómo puedo ayudarte hoy? 🤖');
    }, 500);
}

function addMessage(role, content) {
    const messagesWrapper = document.getElementById('messages-wrapper');
    if (!messagesWrapper) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} gap-3`;
    
    const contentEl = document.createElement('div');
    contentEl.className = `max-w-[70%] rounded-2xl px-4 py-3 ${
        role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
    }`;
    contentEl.textContent = content;
    
    messageEl.appendChild(contentEl);
    messagesWrapper.appendChild(messageEl);
    
    // Auto scroll
    const container = document.getElementById('chat-container');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

function generateReplySuggestions() {
    showToast('Generando sugerencias...', 'info');
}

function abortGeneration() {
    showToast('Transmisión detenida', 'info');
}

function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    showToast('Imagen cargada', 'success');
}

function removePendingImage(event) {
    if (event) event.preventDefault();
    const preview = document.getElementById('image-preview-container');
    if (preview) preview.classList.add('hidden');
}

function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (lightbox && img) {
        img.src = imageSrc || '';
        lightbox.classList.remove('hidden');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.add('hidden');
}

function cancelReply() {
    const banner = document.getElementById('reply-banner');
    if (banner) banner.classList.add('hidden');
}

/* ============= SESSIONES ============= */

function toggleSessionMenu(sessionId) {
    const menu = document.getElementById('session-menu-overlay');
    if (menu) {
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
        } else {
            menu.classList.add('hidden');
        }
    }
}

function closeSessionMenu() {
    const menu = document.getElementById('session-menu-overlay');
    if (menu) menu.classList.add('hidden');
}

function beginRenameSession() {
    const renameBox = document.getElementById('session-rename-box');
    const input = document.getElementById('session-rename-input');
    
    if (renameBox) {
        renameBox.classList.remove('hidden');
        if (input) input.focus();
    }
}

function cancelRenameSession() {
    const renameBox = document.getElementById('session-rename-box');
    if (renameBox) renameBox.classList.add('hidden');
}

function confirmRenameSession() {
    const input = document.getElementById('session-rename-input');
    if (input && input.value) {
        showToast(`Chat renombrado a "${input.value}"`, 'success');
        cancelRenameSession();
    }
}

/* ============= PERFIL Y ACCOUNT ============= */

function performSignIn() {
    const email = document.getElementById('signin-email')?.value;
    const password = document.getElementById('signin-password')?.value;
    
    if (!email || !password) {
        showToast('Por favor ingresa correo y contraseña', 'error');
        return;
    }
    
    localStorage.setItem('sao-auth', JSON.stringify({ email, password }));
    showToast('Sesión iniciada', 'success');
    closeProfilePanel();
}

function performSignUp() {
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    
    if (!name || !email || !password) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    localStorage.setItem('sao-auth', JSON.stringify({ name, email, password }));
    showToast('Cuenta creada', 'success');
    closeProfilePanel();
}

function performSignOut() {
    localStorage.removeItem('sao-auth');
    showToast('Sesión cerrada', 'info');
    closeProfilePanel();
}

function updateProfileData() {
    const name = document.getElementById('account-name')?.value;
    if (name) {
        localStorage.setItem('sao-user-name', name);
        showToast('Perfil actualizado', 'success');
    }
}

function uploadProfileAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('account-avatar-preview');
        if (preview) {
            preview.src = e.target?.result;
        }
    };
    reader.readAsDataURL(file);
}

/* ============= UTILIDADES ============= */

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-lg text-white text-sm pointer-events-auto ${
        type === 'success'
            ? 'bg-green-500'
            : type === 'error'
            ? 'bg-red-500'
            : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function renderMessages() {
    // Placeholder para renderizar mensajes
}

function renderSessionsList() {
    // Placeholder para renderizar listado de sesiones
}

function initializeMain() {
    // Inicializar componentes principales
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    showToast('¡Bienvenido a SAO OS! 🚀', 'success');
}

// Inicializar al cargar
function toggleSidebarQuickPanel(type) {
    const panel = document.getElementById('sidebar-quick-panel');
    if (!panel) return;
    
    if (panel.dataset.type === type) {
        // Toggle off
        panel.classList.add('hidden');
        delete panel.dataset.type;
    } else {
        // Toggle on
        panel.classList.remove('hidden');
        panel.dataset.type = type;
        panel.innerHTML = `<div class="p-3 text-sm text-slate-600 dark:text-slate-400">
            ${type === 'fusion' ? '🔄 Modo Fusión' : type === 'mind' ? '🧠 Estado Mental' : '✨ Flow'}
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const authScreen = document.getElementById('auth-screen');
    const hasCompleted = localStorage.getItem('sao-has-completed-auth') === 'true';
    
    if (authScreen && !hasCompleted) {
        showAuthScreen();
        switchAuthTab('signin');
    } else if (hasCompleted) {
        hideAuthScreen();
        showMainApp();
        setTimeout(() => {
            initializeMain();
        }, 100);
    }
    
    // Inicializar Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
