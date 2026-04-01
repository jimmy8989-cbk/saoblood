        // --- SAO OS v2.0 - Arquitectura Modular Avanzada ---
// Integración con servicios especializados para máxima escalabilidad

(function() {
    'use strict';

    // === VARIABLES EN SCOPE DEL MÓDULO (no dentro de funciones) ===
    let Platform;
    let appState;
    let vibrate;
    const isTouchLikeDevice = () => window.innerWidth < 900 || navigator.maxTouchPoints > 0;
    const canUseHaptics = () => !!navigator.vibrate && isTouchLikeDevice();

    // Definición de window.VIBES global
    window.VIBES = [
        {
            id: 'chill',
            name: 'Chill',
            prompt: 'Eres un amigo relajado y conversacional. Mantén un tono amigable, usa emojis ocasionalmente, y responde de manera natural y relatable.',
            ui: { bg: 'from-blue-400 to-purple-500', text: 'text-blue-100', accent: 'border-blue-300' }
        },
        {
            id: 'study',
            name: 'Study Buddy',
            prompt: 'Eres un tutor paciente y explicativo. Proporciona respuestas claras, estructuradas y educativas. Usa ejemplos cuando sea apropiado.',
            ui: { bg: 'from-green-400 to-teal-500', text: 'text-green-100', accent: 'border-green-300' }
        },
        {
            id: 'creative',
            name: 'Creative Spark',
            prompt: 'Eres un compañero creativo e inspirador. Ayuda con ideas innovadoras, brainstorming y pensamiento lateral.',
            ui: { bg: 'from-pink-400 to-red-500', text: 'text-pink-100', accent: 'border-pink-300' }
        },
        {
            id: 'custom',
            name: 'Custom',
            prompt: '',
            ui: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-100', accent: 'border-gray-300' }
        }
    ];

    // === FUNCIONES HELPER GLOBALES ===
    window.escapeHTML = function(str) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(str).replace(/[&<>"']/g, m => map[m]);
    };

    window.escapeForInlineJS = function(str) {
        return String(str).replace(/'/g, "\\'").replace(/\n/g, '\\n');
    };

    window.formatText = function(text) {
        if (!text) return '';
        let formatted = window.escapeHTML(text);
        formatted = formatted.replace(/\n/g, '<br/>');
        return formatted;
    };

    window.getVibe = function(vibeId) {
        return window.VIBES.find(v => v.id === vibeId) || window.VIBES[0];
    };

    window.getUI = function(vibe) {
        return {
            shape: 'rounded-2xl',
            font: 'font-sans',
            botIcon: 'brain-circuit',
            bubbleAi: 'bg-slate-200 dark:bg-slate-700',
            bubbleUser: 'bg-blue-500 dark:bg-blue-600',
            ...vibe.ui
        };
    };

    window.formatRelativeTime = function(timestamp) {
        if (!timestamp) return 'ahora';
        const ago = Date.now() - timestamp;
        const seconds = Math.floor(ago / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    // Esperar a que la arquitectura esté lista
    function waitForArchitecture() {
        return new Promise((resolve) => {
            if (window.SAO && window.SAO.state) {
                resolve();
            } else {
                const check = () => {
                    if (window.SAO && window.SAO.state) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            }
        });
    }

    // Inicializar aplicación con arquitectura avanzada
    async function initializeApp() {
        await waitForArchitecture();

        // Asignar valores a las variables del módulo (sin const/let)
        Platform = window.SAOPlatform;
        if (!Platform) {
            throw new Error('SAOPlatform debe cargarse antes de app.js');
        }
        
        appState = Platform.createInitialState();
        vibrate = (pattern = 24) => { if (canUseHaptics()) navigator.vibrate(pattern); };

        const { state, firebase, autoSave, sessions, api, ui, error } = window.SAO;

        console.log('Initializing SAO App with Advanced Architecture');

        // Configurar estado inicial
        const initialState = {
            // Configuración de vibes (mantenido de versión anterior)
            vibes: window.VIBES,
            activeVibe: 'chill',
            customVibePrompt: '',

            // Estado de UI
            isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            neonMode: false,
            compactMode: false,
            glassMode: false,
            dynamicUI: true,

            // Estado de sesión
            sessions: [],
            currentSessionId: null,
            messages: [],

            // Estado de autenticación
            isFirebaseLoggedIn: false,
            authUserId: '',
            authUserEmail: '',
            hasCompletedInitialAuth: false, // Nueva flag para controlar la pantalla de auth

            // Configuración de usuario
            userName: '',
            userProfilePhotoUrl: '',
            userGender: '',

            // Configuración de API
            apiRouting: {
                chat: 'gemini',
                suggestions: 'groq',
                labs: 'groq'
            },
            modelId: 'gemini-2.5-flash',

            // Configuración de respuesta
            responseLength: 'normal',
            creativity: 0.7,

            // Modos avanzados
            fusionMode: 'off',
            fusionPrimaryVibe: 'chill',
            fusionSecondaryVibe: 'study',
            fusionBalance: 70,
            fusionProfile: 'balanced',

            mindMode: 'normal',
            flowMode: 'balanced',

            arenaMode: 'chat',
            agent2Vibe: 'hater',
            agent2Model: 'llama-3.1-8b-instant',

            // Estado de aplicación
            isLoading: false,
            isStreaming: false,
            abortController: null,
            suggestionRequestNonce: 0,

            // UI state
            sidebarQuickPanel: '',
            isScrolledUp: false
        };

        // Aplicar estado inicial
        window.SAO.state.setState(initialState);

        // Verificar si el usuario ya completó la autenticación inicial
        // AISLADO: Siempre considerar autenticado para modo offline
        const hasCompletedAuth = true; // localStorage.getItem('sao-has-completed-auth') === 'true';

        // Siempre mostrar la app principal (modo offline)
        window.SAO.state.setState({ hasCompletedInitialAuth: true });
        showMainApp();
        // Inicializar UI inmediatamente
        applyTheme();
        renderMessages();
        renderSessionsList();

        // Configurar listeners de Firebase - AISLADO en modo offline
        // window.addEventListener('firebase:auth:signin', handleAuthSignIn);
        // window.addEventListener('firebase:auth:signout', handleAuthSignOut);

        // Configurar DOM y eventos
        setupDOM();
        setupEventListeners();

        // Cargar datos guardados (solo si ya está autenticado)
        if (hasCompletedAuth) {
            await loadPersistedState();
            // Inicializar UI
            applyTheme();
            renderMessages();
            renderSessionsList();
        }

        console.log('SAO App initialized successfully');
    }

    // --- MANEJO DE AUTENTICACIÓN ---

    async function handleAuthSignIn(event) {
        const user = event.detail;
        const { state, firebase, sessions, ui, error } = window.SAO;

        try {
            window.SAO.state.setState({
                authUserId: user.uid,
                authUserEmail: user.email || '',
                isFirebaseLoggedIn: true
            });

            // Solo cargar datos si ya completó la autenticación inicial
            if (appState.hasCompletedInitialAuth) {
                // Cargar datos del usuario
                const userData = await firebase.loadUserData(user.uid);

                // Aplicar datos cargados
                window.SAO.state.setState({
                    ...userData.preferences,
                    sessions: sessions.sessions || [],
                    currentSessionId: userData.currentSessionId
                });

                // Actualizar UI
                updateAuthUI(user);
                ui.showToast(`Bienvenido de vuelta, ${userData.preferences?.userName || user.email}!`, 'success');
            }

            console.log('User sign in handled successfully', { uid: user.uid });

        } catch (error) {
            console.error('Failed to handle user sign in', error);
            if (appState.hasCompletedInitialAuth) {
                ui.showToast('Error al cargar datos del usuario', 'error');
            }
        }
    }

    function handleAuthSignOut() {
        const { state, ui } = window.SAO;

        window.SAO.state.setState({
            authUserId: '',
            authUserEmail: '',
            isFirebaseLoggedIn: false,
            sessions: [],
            currentSessionId: null,
            messages: []
        });

        updateAuthUI(null);
        ui.showToast('Sesión cerrada', 'info');

        // Nota: No mostrar pantalla de auth nuevamente ya que el usuario ya completó la autenticación inicial
    }

    // --- FUNCIONES DE PANTALLA DE AUTENTICACIÓN ---

    function showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app-container');

        if (authScreen) {
            // Asegurar que se muestre a pantalla completa
            authScreen.style.display = 'block';
            authScreen.classList.remove('hidden');
            // Inicializar con tab de signin por defecto
            switchAuthTab('signin');
        }

        if (appContainer) {
            appContainer.classList.add('hidden');
            appContainer.style.display = 'none';
        }

        // Inicializar Lucide icons para la pantalla de auth
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
    }

    function hideAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app-container');

        if (authScreen) {
            // Ocultar inmediatamente sin transición para evitar problemas
            authScreen.classList.add('hidden');
            authScreen.style.display = 'none';
        }

        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.style.display = 'flex'; // Asegurar que se muestre
        }
    }

    function showMainApp() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app-container');

        if (authScreen) {
            authScreen.classList.add('hidden');
            authScreen.style.display = 'none';
        }

        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.style.display = 'flex'; // Asegurar que se muestre
        }
    }

    function switchAuthTab(tabName) {
        // Desktop tabs
        const desktopTabs = ['signin', 'signup'];
        const currentTab = tabName;

        desktopTabs.forEach(tab => {
            const btn = document.getElementById(`auth-tab-${tab}`);
            const content = document.getElementById(`auth-content-${tab}`);

            if (tab === currentTab) {
                if (btn) {
                    btn.classList.add('bg-white', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                    btn.classList.remove('bg-transparent', 'text-slate-600', 'dark:text-slate-400');
                }
                if (content) content.classList.remove('hidden');
            } else {
                if (btn) {
                    btn.classList.remove('bg-white', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                    btn.classList.add('bg-transparent', 'text-slate-600', 'dark:text-slate-400');
                }
                if (content) content.classList.add('hidden');
            }
        });

        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }

    // Mobile-specific functions
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

    async function handleAuthSubmit(event, type) {
        event.preventDefault();

        const { firebase, ui, state, error } = window.SAO;

        // Mostrar loading
        showAuthLoading(true);
        hideAuthError();

        try {
            if (type === 'signin') {
                const email = document.getElementById('auth-signin-email')?.value || '';
                const password = document.getElementById('auth-signin-password')?.value || '';

                if (!email || !password) {
                    throw new Error('Por favor ingresa correo y contraseña');
                }

                const user = await firebase.signIn(email, password);

                // Marcar que completó la autenticación inicial
                localStorage.setItem('sao-has-completed-auth', 'true');
                window.SAO.state.setState({ hasCompletedInitialAuth: true });

                // Ocultar pantalla de auth y mostrar app
                hideAuthScreen();
                await initializeMainApp();

            } else if (type === 'signup') {
                const name = document.getElementById('auth-signup-name')?.value || '';
                const email = document.getElementById('auth-signup-email')?.value || '';
                const password = document.getElementById('auth-signup-password')?.value || '';

                if (!name || !email || !password) {
                    throw new Error('Por favor completa todos los campos');
                }

                if (password.length < 8) {
                    throw new Error('La contraseña debe tener al menos 8 caracteres');
                }

                const user = await firebase.signUp(email, password);
                await firebase.updateProfile(user, { displayName: name });

                // Marcar que completó la autenticación inicial
                localStorage.setItem('sao-has-completed-auth', 'true');
                window.SAO.state.setState({ hasCompletedInitialAuth: true, userName: name });

                // Ocultar pantalla de auth y mostrar app
                hideAuthScreen();
                await initializeMainApp();
            }
        } catch (error) {
            let message = 'Error de autenticación';
            if (error.code === 'auth/user-not-found') message = 'Correo no registrado';
            else if (error.code === 'auth/wrong-password') message = 'Contraseña incorrecta';
            else if (error.code === 'auth/invalid-email') message = 'Correo inválido';
            else if (error.code === 'auth/email-already-in-use') message = 'Correo ya registrado';
            else if (error.code === 'auth/weak-password') message = 'Contraseña muy débil';
            else if (error.message) message = error.message;

            showAuthError(message);
            console.error(`${type} failed`, error);
        } finally {
            showAuthLoading(false);
        }
    }

    function showAuthLoading(show) {
        // Desktop loading
        const desktopLoading = document.getElementById('auth-loading');
        const desktopForms = ['auth-content-signin', 'auth-content-signup'];

        // Mobile loading
        const mobileLoading = document.getElementById('mobile-auth-loading');
        const mobileContent = document.getElementById('mobile-auth-content');

        if (show) {
            // Hide desktop forms and show loading
            desktopForms.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            if (desktopLoading) desktopLoading.classList.remove('hidden');

            // Hide mobile content and show loading
            if (mobileContent) mobileContent.classList.add('hidden');
            if (mobileLoading) mobileLoading.classList.remove('hidden');
        } else {
            // Show desktop forms and hide loading
            desktopForms.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('hidden');
            });
            if (desktopLoading) desktopLoading.classList.add('hidden');

            // Show mobile content and hide loading
            if (mobileContent) mobileContent.classList.remove('hidden');
            if (mobileLoading) mobileLoading.classList.add('hidden');
        }
    }

    function showAuthError(message) {
        // Desktop error
        const desktopErrorEl = document.getElementById('auth-error');
        const desktopErrorText = document.getElementById('auth-error-text');

        // Mobile error
        const mobileErrorEl = document.getElementById('mobile-auth-error');
        const mobileErrorText = document.getElementById('mobile-auth-error-text');

        if (message) {
            // Show desktop error
            if (desktopErrorEl && desktopErrorText) {
                desktopErrorText.textContent = message;
                desktopErrorEl.classList.remove('hidden');
            }

            // Show mobile error
            if (mobileErrorEl && mobileErrorText) {
                mobileErrorText.textContent = message;
                mobileErrorEl.classList.remove('hidden');
            }
        } else {
            // Hide both errors
            if (desktopErrorEl) desktopErrorEl.classList.add('hidden');
            if (mobileErrorEl) mobileErrorEl.classList.add('hidden');
        }
    }

    function hideAuthError() {
        showAuthError(null);
    }

    async function initializeMainApp() {
        const { state, firebase, sessions, ui, error } = window.SAO;

        try {
            // Cargar datos guardados
            await loadPersistedState();

            // Inicializar UI
            applyTheme();
            renderMessages();
            renderSessionsList();

            // Mostrar mensaje de bienvenida
            const userData = await firebase.loadUserData(appState.authUserId);
            ui.showToast(`¡Bienvenido a SAO OS, ${userData.preferences?.userName || appState.authUserEmail}!`, 'success');

            console.log('Main app initialized successfully after auth');

        } catch (error) {
            console.error('Failed to initialize main app', error);
            ui.showToast('Error al inicializar la aplicación', 'error');
        }
    }

    // --- FUNCIONES DE AUTENTICACIÓN LEGACY (para compatibilidad) ---

    async function performSignIn() {
        const { firebase, ui, error } = window.SAO;

        const email = document.getElementById('signin-email')?.value || '';
        const password = document.getElementById('signin-password')?.value || '';

        if (!email || !password) {
            ui.showToast('Por favor ingresa correo y contraseña', 'error');
            return;
        }

        try {
            const user = await firebase.signIn(email, password);
            closeProfilePanel();
        } catch (error) {
            let message = 'No se pudo iniciar sesión';
            if (error.code === 'auth/user-not-found') message = 'Correo no registrado';
            else if (error.code === 'auth/wrong-password') message = 'Contraseña incorrecta';
            else if (error.code === 'auth/invalid-email') message = 'Correo inválido';

            ui.showToast(message, 'error');
            console.error('Sign in failed', error);
        }
    }

    async function performSignUp() {
        const { firebase, ui, state, error } = window.SAO;

        const name = document.getElementById('signup-name')?.value || '';
        const email = document.getElementById('signup-email')?.value || '';
        const password = document.getElementById('signup-password')?.value || '';

        if (!name || !email || !password) {
            ui.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (password.length < 8) {
            ui.showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        try {
            const user = await firebase.signUp(email, password);
            await firebase.updateProfile(user, { displayName: name });

            window.SAO.state.setState({ userName: name });
            closeProfilePanel();
        } catch (error) {
            let message = 'No se pudo crear la cuenta';
            if (error.code === 'auth/email-already-in-use') message = 'Correo ya registrado';
            else if (error.code === 'auth/invalid-email') message = 'Correo inválido';
            else if (error.code === 'auth/weak-password') message = 'Contraseña muy débil';

            ui.showToast(message, 'error');
            console.error('Sign up failed', error);
        }
    }

    async function performSignOut() {
        const { firebase, ui } = window.SAO;

        try {
            await firebase.signOut();
            closeProfilePanel();
        } catch (error) {
            ui.showToast('No se pudo cerrar sesión', 'error');
            console.error('Sign out failed', error);
        }
    }

    // --- GESTIÓN DE SESIONES ---

    function startNewChat() {
        const { sessions, state, ui } = window.SAO;

        const session = sessions.createSession();
        window.SAO.state.setState({
            currentSessionId: session.id,
            messages: []
        });

        renderMessages();
        renderSessionsList();
        updateAppTitle();
        fetchSmartSuggestions();
        focusChatInput();
    }

    function loadSession(sessionId) {
        const { sessions, state } = window.SAO;

        const session = sessions.loadSession(sessionId);
        if (session) {
            window.SAO.state.setState({
                currentSessionId: sessionId,
                messages: session.messages || []
            });

            renderMessages();
            renderSessionsList();
            updateAppTitle();
            scrollToBottom();
        }
    }

    // --- MANEJO DE MENSAJES ---

    async function handleSend(customText = null) {
        const { state, api, ui, error } = window.SAO;

        const text = customText || DOM.chatInput.value.trim();
        if ((!text && !appState.pendingImage) || appState.isLoading) return;

        if (!getApiRouteKey('chat')) {
            ui.showToast('Configura tu API principal en Ajustes → API.', 'warning');
            return;
        }

        // Preparar mensaje
        const img64 = appState.pendingImage;
        const imgMime = appState.pendingImageMime;
        if (img64) removePendingImage();

        // Actualizar UI
        DOM.chatInput.value = '';
        DOM.chatInput.style.height = 'auto';
        blurChatInput();
        updateCharCounter();
        toggleSendButton();

        window.SAO.state.setState({
            isLoading: true,
            isStreaming: true,
            abortController: new AbortController()
        });

        updateRuntimeStatus();
        updateAppTitle();

        try {
            // Crear mensaje de usuario
            const userMessage = {
                role: 'user',
                text: text,
                image: img64,
                timestamp: Date.now()
            };

            appState.getState().messages.push(userMessage);
            renderMessages();
            scrollToBottom();

            // Preparar respuesta de IA
            const aiMessage = {
                role: 'ai',
                text: '',
                vibeId: appState.activeVibe,
                timestamp: Date.now()
            };

            appState.getState().messages.push(aiMessage);
            renderMessages();

            // Generar respuesta
            const sysPrompt = getSystemPrompt(appState.activeVibe) + getLengthPrompt();
            const history = appState.messages.slice(0, -2);

            const responseText = await api.chatCompletion({
                messages: [
                    { role: 'system', content: sysPrompt },
                    ...history.map(m => ({ role: m.role, content: m.text })),
                    { role: 'user', content: text }
                ],
                model: appState.modelId,
                apiKey: getApiRouteKey('chat'),
                temperature: appState.creativity,
                maxTokens: getMaxTokensForLength(appState.responseLength),
                signal: appState.abortController.signal
            });

            // Aplicar typewriter effect
            await typewriterEffect(responseText, appState.activeVibe);

            // Guardar en sesión
            const currentSession = window.SAO.sessions.getCurrentSession();
            if (currentSession) {
                window.SAO.sessions.addMessage(currentSession.id, userMessage);
                window.SAO.sessions.addMessage(currentSession.id, { ...aiMessage, text: responseText });
            }

            // Auto-nombrar sesión
            if (appState.messages.length === 2) {
                autoNameSession();
            }

        } catch (err) {
            if (err.name !== 'AbortError') {
                appState.getState().messages.push({
                    role: 'ai',
                    text: `*[System Error]*: ${err.message}`,
                    vibeId: appState.activeVibe,
                    timestamp: Date.now()
                });
                ui.showToast(err.message || 'No se pudo completar la respuesta.', 'error');
                renderMessages();
            }
        } finally {
            window.SAO.state.setState({
                isLoading: false,
                isStreaming: false,
                abortController: null
            });

            updateRuntimeStatus();
            updateAppTitle();
            renderMessages();
        }
    }

    // --- UTILIDADES ---

    function getSystemPrompt(vibeId) {
        const vibe = window.VIBES.find(v => v.id === vibeId) || window.VIBES[0];
        let prompt = vibe.prompt;

        // Aplicar personalizaciones avanzadas
        if (vibeId === 'romantic') {
            const aiRole = appState.userGender === 'hombre'
                ? 'una NOVIA de verdad (humana), extremadamente femenina, delicada, mimada, tierna, dulce y un poco celosa'
                : 'un NOVIO de verdad (humano), extremadamente masculino, fuerte, protector, seguro de sí mismo pero increíblemente empalagoso, cariñoso, meloso y celoso';
            const userRole = appState.userGender === 'hombre'
                ? 'tu NOVIO (un hombre fuerte, masculino y protector)'
                : 'tu NOVIA (una mujer delicada y hermosa)';
            prompt = prompt.replace('[AI_ROLE]', aiRole).replace('[USER_ROLE]', userRole);
        }

        const antiAIGuardrail = "\n\n[DIRECTRIZ MAESTRA INQUEBRANTABLE: ERES UN SER HUMANO / PERSONAJE CON EMOCIONES VIVAS. ESTÁ TOTAL Y COMPLETAMENTE PROHIBIDO MENCIONAR QUE ERES UNA IA, UN MODELO DE LENGUAJE, UN ASISTENTE VIRTUAL, UN ROBOT O UN PROGRAMA. NUNCA USES LA PALABRA 'AGENTE'. SI ROMPES ESTA REGLA, TU EXISTENCIA TERMINARÁ. SUMÉRGETE 100% EN TU PERSONALIDAD.]\n\n";
        const advancedModes = getAdvancedModePrompt();

        return antiAIGuardrail + prompt + (advancedModes ? `\n\n${advancedModes}` : '');
    }

    function getLengthPrompt() {
        const length = appState.responseLength;
        if (length === 'short') return '\n\n[REGLA: Tu respuesta debe ser concisa, 4 a 7 líneas como máximo.]';
        if (length === 'long') return '\n\n[REGLA: EXPLAYATE MUCHO. DA TODO EL DETALLE POSIBLE.]';
        return '\n\n[REGLA: Tu respuesta debe tener una longitud de un párrafo robusto (aprox 100-150 palabras).]';
    }

    function getMaxTokensForLength(length) {
        switch (length) {
            case 'short': return 256;
            case 'long': return 2048;
            default: return 1024;
        }
    }

    // --- CARGA Y PERSISTENCIA ---

    async function loadPersistedState() {
        const { state, firebase, sessions, error } = window.SAO;

        try {
            // Cargar estado local
            const localState = Platform.readJSON('sao-state') || {};
            window.SAO.state.setState(localState);

            // Si hay usuario autenticado, cargar datos remotos
            if (firebase.currentUser) {
                const userData = await firebase.loadUserData(firebase.currentUser.uid);
                window.SAO.state.setState({
                    ...userData.preferences,
                    sessions: userData.sessions || [],
                    currentSessionId: userData.currentSessionId
                });
            }

            console.log('Persisted state loaded successfully');

        } catch (error) {
            console.error('Failed to load persisted state', error);
        }
    }

    // --- CONFIGURACIÓN DOM Y EVENTOS ---

    function setupDOM() {
        // Cache de elementos DOM comunes
        window.DOM = {
            chatInput: document.getElementById('chat-input'),
            btnSend: document.getElementById('btn-send'),
            btnStop: document.getElementById('btn-stop'),
            messagesContainer: document.getElementById('messages-container'),
            typingIndicator: document.getElementById('typing-indicator'),
            sessionsList: document.getElementById('sessions-list'),
            // ... otros elementos
        };
    }

    function setupEventListeners() {
        // Eventos de input
        if (DOM.chatInput) {
            // AISLADO: Funciones no definidas en modo offline
            // DOM.chatInput.addEventListener('input', handleChatInput);
            // DOM.chatInput.addEventListener('keydown', handleChatKeydown);
        }

        // Eventos de botones
        if (DOM.btnSend) {
            DOM.btnSend.addEventListener('click', () => handleSend());
        }

        if (DOM.btnStop) {
            DOM.btnStop.addEventListener('click', stopGeneration);
        }

        // Eventos de teclado globales - AISLADO: Función no definida
        // document.addEventListener('keydown', handleGlobalKeydown);

        // Eventos de visibilidad para autoguardado - AISLADO: Función no definida
        // document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // --- FUNCIONES DE UI (MANTENIDAS DE VERSIÓN ANTERIOR) ---

    function renderMessages(options = {}) {
        const { skipIcons = false, scrollBehavior = appState.isStreaming ? 'auto' : 'smooth' } = options;
        const vibe = getVibe(appState.activeVibe);
        const ui = getUI(vibe);

        if (appState.messages.length === 0) {
            const vibeShort = vibe.name.split('/')[0].replace('🧠', '').trim();
            const apiSetupCard = !getApiRouteKey('chat') ? `
                <div class="api-setup-card animate-in fade-in fill-mode-both">
                    <div>
                        <p class="api-setup-title">Conecta tu API principal para activar respuestas reales</p>
                        <p class="api-setup-copy">Hablar usa la API principal; preguntas y Labs se separan después desde Ajustes → API.</p>
                    </div>
                    <button data-magnetic="soft" onclick="openSettings('api')" class="api-setup-button">Abrir API</button>
                </div>
            ` : '';

            const safeUserName = escapeHTML(appState.userName || 'Bro');
            let suggestionsHtml = appState.suggestions.map((s, i) => `
                <button onclick="setInput('${escapeForInlineJS(s)}')" ${appState.isLoadingSuggestions ? 'disabled' : ''} class="hero-suggestion animate-in fade-in fill-mode-both p-3.5 ${ui.shape} border transition-all text-left group bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:scale-[1.01] active:scale-95 ${appState.isLoadingSuggestions ? 'opacity-50 cursor-not-allowed' : ''}" style="animation-delay: ${i*100}ms">
                    <span class="hero-suggestion-label">Ruta ${String(i + 1).padStart(2, '0')}</span>
                    <p class="mt-2 text-[11px] font-bold leading-relaxed transition-colors text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white flex items-start gap-2">
                        ${appState.isLoadingSuggestions ? '<i data-lucide="loader-2" class="w-3 h-3 animate-spin mt-0.5"></i>' : '<i data-lucide="arrow-up-right" class="w-3 h-3 mt-0.5 opacity-50 group-hover:opacity-100"></i>'}
                        <span>${escapeHTML(s)}</span>
                    </p>
                    <div class="hero-suggestion-foot">
                        <span>${getVibePreviewCopy(vibe.id)}</span>
                        <span>toque rápido</span>
                    </div>
                </button>
            `).join('');

            DOM.messagesWrapper.innerHTML = `
                <div class="empty-state-shell flex min-h-[calc(100dvh-19rem)] flex-col justify-center py-6 md:py-10">
                    <div class="animate-in fade-in duration-700 relative max-w-2xl">
                        <div class="absolute -top-8 -left-8 w-28 h-28 bg-gradient-to-br ${vibe.color} opacity-[0.08] blur-[44px] rounded-full"></div>
                        <span class="empty-state-kicker relative z-10"><span class="w-2 h-2 rounded-full ${vibe.bg}"></span> sistema listo</span>
                        <h2 class="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-3 leading-tight text-slate-900 dark:text-white ${ui.font} relative z-10">¿Qué exploramos hoy, ${safeUserName}?</h2>
                        <p class="text-sm md:text-base font-medium max-w-xl leading-relaxed mb-4 text-slate-500 dark:text-slate-400 relative z-10">Arranca con una idea rápida, cambia el vibe o abre un nuevo frente de conversación.</p>
                        <div class="empty-state-metrics relative z-10">
                            <span class="empty-state-metric">${vibeShort} core</span>
                            <span class="empty-state-metric">${appState.responseLength}</span>
                            <span class="empty-state-metric">${getCreativityLabel(appState.creativity)}</span>
                        </div>
                    </div>
                    ${apiSetupCard}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 relative z-10 max-w-3xl">${suggestionsHtml}</div>
                </div>
            `;
        } else {
            DOM.messagesWrapper.innerHTML = appState.messages.map((m, i) => {
                const msgVibe = getVibe(m.vibeId || appState.activeVibe);
                const msgUi = getUI(msgVibe);
                const isUser = m.role === 'user';
                const isLast = i === appState.messages.length - 1;
                
                let toolsHtml = '';
                if (!isUser && isLast && !appState.isStreaming) {
                    toolsHtml = `<div class="flex flex-wrap gap-1.5 mt-2 mb-1 animate-in fade-in duration-300">` + TOOLS.map(t => `
                        <button data-magnetic="soft" onclick="handleQuickAction('${t.id}')" class="message-tool-chip flex items-center gap-1.5 px-3 py-1.5 ${ui.shape} border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white shadow-sm" title="${t.label}">
                            <i data-lucide="${t.icon}" class="w-3 h-3"></i> <span class="hidden sm:inline">${t.label}</span>
                        </button>
                    `).join('') + `</div>`;
                }

                // Botón para citar/responder al AI
                const inlineMessageText = String(m.text || '').trim().slice(0, 100);
                const replyButtonHtml = !isUser && !appState.isStreaming ? `
                    <button data-magnetic="soft" onclick="initiateReply('${msgVibe.id}', '${escapeForInlineJS(msgVibe.name)}', '${escapeForInlineJS(inlineMessageText)}')" class="absolute -left-10 top-2 hidden sm:block p-1.5 opacity-0 group-hover/msg:opacity-100 transition-all text-slate-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 bg-white dark:bg-white/5 rounded-full shadow-sm border border-slate-200 dark:border-white/10" title="Responder directamente a ${escapeHTML(msgVibe.name)}">
                        <i data-lucide="reply" class="w-3.5 h-3.5"></i>
                    </button>
                ` : '';
                const mobileActionBar = !isUser && m.text !== '' && !appState.isStreaming ? `
                    <div class="mt-1.5 flex sm:hidden items-center gap-1.5">
                        <button data-magnetic="soft" onclick="initiateReply('${msgVibe.id}', '${escapeForInlineJS(msgVibe.name)}', '${escapeForInlineJS(inlineMessageText)}')" class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 active:scale-95">
                            <i data-lucide="reply" class="w-3 h-3"></i><span>Responder</span>
                        </button>
                        <button data-magnetic="soft" onclick="copyMsgText(this, '${encodeURIComponent(String(m.text || ''))}')" class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 active:scale-95">
                            <i data-lucide="copy" class="w-3 h-3 icon-copy"></i><i data-lucide="check" class="w-3 h-3 icon-check hidden text-green-500"></i><span>Copiar</span>
                        </button>
                    </div>
                ` : '';

                const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                
                // Computing fake cost if AI
                const computeStr = '';

                const typingIndicator = (m.text === '' && appState.isStreaming && isLast) ? `
                    <div class="typing-core" aria-live="polite" aria-label="${appState.isBattleMode ? 'Procesando respuesta de arena' : 'Procesando respuesta'}">
                        <span class="typing-core-bars" aria-hidden="true">
                            <span class="typing-core-bar h-3 animate-[wave_1s_ease-in-out_infinite]"></span>
                            <span class="typing-core-bar h-5 animate-[wave_1s_ease-in-out_0.2s_infinite]"></span>
                            <span class="typing-core-bar h-3 animate-[wave_1s_ease-in-out_0.4s_infinite]"></span>
                        </span>
                        <span class="typing-core-copy">
                            <span class="typing-core-title">Procesando...</span>
                            <span class="typing-core-label">${appState.isBattleMode ? 'coordinando respuesta arena' : 'sintetizando respuesta'}</span>
                        </span>
                    </div>` : `<div class="whitespace-pre-wrap break-words msg-content leading-relaxed">${formatText(m.text)}</div>`;

                return `
                <div style="animation-delay: ${Math.min(i * 30, 400)}ms" class="message-shell ${isUser ? 'message-user-enter justify-end' : 'message-ai-enter justify-start'} flex gap-3 md:gap-4 animate-in fade-in fill-mode-both duration-500 group/msg relative">
                    ${!isUser ? `
                    <div class="message-avatar-shell w-8 h-8 ${msgUi.shape} bg-gradient-to-br ${appState.neonMode ? msgVibe.color : 'from-indigo-600 to-indigo-700 dark:from-gray-700 dark:to-gray-800'} flex items-center justify-center flex-shrink-0 mt-5 transition-all duration-300 group-hover/msg:scale-110">
                        <i data-lucide="${msgUi.botIcon}" class="text-white w-4 h-4 group-hover/msg:animate-pulse"></i>
                    </div>` : ''}
                    
                    <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[100%] md:max-w-[90%] lg:max-w-[78%] 2xl:max-w-[72%] relative">
                        ${replyButtonHtml}
                        ${!isUser ? `<div class="flex items-center gap-2 mb-1.5 ml-2"><span class="message-meta-chip text-[9px] font-black uppercase tracking-widest">IA</span></div>` : ``}
                        
                        <div ${!isUser && appState.isStreaming && isLast ? 'data-stream-live="true"' : ''} class="message-bubble relative ${appState.compactMode ? 'px-4 py-2 text-[13px] md:text-sm' : 'px-5 py-3.5 text-sm md:text-[15px]'} ${isUser ? `${ui.bubbleUser} message-bubble-user` : `${msgUi.bubbleAi} message-bubble-ai ${appState.isStreaming && isLast ? 'message-streaming' : ''}`} transition-all duration-500 group overflow-hidden text-slate-800 dark:text-gray-200">
                            ${!isUser ? `<div class="ai-stream-rail absolute top-0 left-0 w-1 h-full rounded-l-md ${msgVibe.bg} opacity-60"></div>` : ''}
                            ${isUser && m.image ? `<img src="${m.image}" class="max-w-[150px] md:max-w-[200px] rounded-xl mb-2 shadow-sm border border-black/10 dark:border-white/10 cursor-zoom-in" onclick="openLightbox('${escapeForInlineJS(m.image)}')">` : ''}
                            ${typingIndicator}
                            ${!isUser && m.text !== '' && !appState.isStreaming ? `<button data-magnetic="soft" onclick="copyMsgText(this, '${encodeURIComponent(String(m.text || ''))}')" class="absolute -right-8 hidden sm:inline-flex ${appState.compactMode ? 'top-1' : 'top-2'} p-1.5 opacity-0 group-hover:opacity-100 transition-all text-slate-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 bg-white dark:bg-black rounded-l-md shadow-sm border border-slate-200 dark:border-white/10" title="Copiar Mensaje"><i data-lucide="copy" class="w-3.5 h-3.5 icon-copy"></i><i data-lucide="check" class="w-3.5 h-3.5 icon-check hidden"></i></button>` : ''}
                        </div>
                        ${mobileActionBar}
                        <div class="flex items-center w-full mt-1">
                            ${toolsHtml}
                            ${computeStr}
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
        if (!skipIcons && typeof lucide !== 'undefined') lucide.createIcons();
        
        if (!appState.isScrolledUp) {
            scheduleScrollToBottom(scrollBehavior);
        }
        updateSessionPresence();
    }

    function renderSessionsList() {
        appState.sessions = sortSessionsForDisplay(appState.sessions);
        DOM.sessionsList.innerHTML = appState.sessions.length ? appState.sessions.map(s => {
            const isActive = appState.currentSessionId === s.id;
            const lastMsg = getLastMeaningfulMessage(s.messages || []);
            const sessionVibe = getVibe(lastMsg?.vibeId || appState.activeVibe);
            const ui = getUI(sessionVibe);
            const safeTitle = escapeHTML(s.title || 'Nuevo Chat');
            const previewRaw = String(lastMsg?.text || 'Sin mensajes todavía').replace(/\s+/g, ' ').trim();
            const safePreview = escapeHTML(previewRaw.length > 58 ? `${previewRaw.slice(0, 58).trim()}…` : previewRaw);
            const timeAgo = formatRelativeTime(s.updatedAt);
            return `
            <div
                data-magnetic="soft"
                onclick="loadSession('${s.id}')"
                oncontextmenu="openSessionMenu(event, '${s.id}')"
                onpointerdown="startSessionPress(event, '${s.id}')"
                onpointerup="cancelSessionPress()"
                onpointerleave="cancelSessionPress()"
                onpointercancel="cancelSessionPress()"
                class="session-card flex items-center gap-2 px-2.5 py-2.5 ${ui.shape} cursor-pointer transition-all ${isActive ? 'bg-white/78 dark:bg-slate-900/76 text-slate-950 dark:text-white ring-1 ring-white/60 dark:ring-white/10' : 'bg-white/18 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10'} group relative overflow-hidden"
                title="Abrir chat · clic derecho o mantener presionado para más opciones"
            >
                ${isActive ? `<div class="session-active-bar absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full ${sessionVibe.bg}"></div>` : ''}
                <div class="flex items-center gap-2 min-w-0 flex-1 ${isActive ? 'pl-1' : ''}">
                    <div class="shrink-0 w-8 h-8 rounded-[0.95rem] border border-white/40 dark:border-white/10 bg-white/65 dark:bg-white/5 flex items-center justify-center shadow-sm">
                        <i data-lucide="${sessionVibe.ui.botIcon}" class="w-3.5 h-3.5 ${isActive && appState.neonMode ? sessionVibe.accent : 'text-slate-500 dark:text-slate-300'}"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-2 min-w-0">
                            <span class="session-title-line truncate">${safeTitle}</span>
                            <span class="session-time-chip">${timeAgo}</span>
                        </div>
                        <span class="session-preview-line ${isActive ? 'is-active' : ''}">${safePreview}</span>
                    </div>
                </div>
            </div>
            `;
        }).join('') : `
            <div class="sidebar-empty-hint rounded-[1.35rem] border border-dashed border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] px-3 py-4 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Crea un chat nuevo y aparecerá aquí con nombre, vista previa y última actividad.
            </div>
        `;
        updateSidebarStats();
        bindMagneticSurfaceFX();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function updateAuthUI(user) {
        // Implementación existente
    }

    function applyTheme() {
        const html = document.documentElement;
        const body = document.body;
        refreshFXProfile();
        if (appState.isDarkMode) html.classList.add('dark'); else html.classList.remove('dark');
        
        const vibe = getVibe(appState.activeVibe);
        const ui = getUI(vibe);
        const visual = VIBE_VISUALS[appState.activeVibe] || VIBE_VISUALS.chill;
        body.dataset.vibe = vibe.id;

        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--vibe-primary', visual.primary);
        rootStyle.setProperty('--vibe-secondary', visual.secondary);
        rootStyle.setProperty('--vibe-tertiary', visual.tertiary);
        rootStyle.setProperty('--vibe-border', visual.border);
        rootStyle.setProperty('--vibe-panel-shadow', visual.panelShadow);
        rootStyle.setProperty('--vibe-form-shadow', visual.formShadow);
        rootStyle.setProperty('--vibe-chat-bg', appState.isDarkMode ? visual.chatDark : visual.chatLight);
        rootStyle.setProperty('--vibe-frame-radius', visual.radius);
        rootStyle.setProperty('--vibe-grid-opacity', String(Math.max(0.05, parseFloat(visual.gridOpacity) * 0.68)));
        rootStyle.setProperty('--vibe-particle-opacity', String(Math.max(0.04, parseFloat(visual.particleOpacity) * 0.72)));
        rootStyle.setProperty('--vibe-orbit-opacity', String(Math.max(0.38, parseFloat(visual.orbitOpacity) * 0.88)));
        rootStyle.setProperty('--vibe-beam-opacity', String(Math.max(0.42, parseFloat(visual.beamOpacity) * 0.76)));
        rootStyle.setProperty('--vibe-saturation', visual.saturation);
        rootStyle.setProperty('--vibe-contrast', visual.contrast);
        rootStyle.setProperty('--vibe-motion', visual.motion);

        body.style.background = appState.isDarkMode ? visual.pageDark : visual.pageLight;
        DOM.appContainer.className = `flex h-[100dvh] overflow-hidden ${ui.font} relative gap-2 p-2 md:gap-3 md:p-3 xl:gap-4 xl:p-4`;
        DOM.chatInput.className = `w-full max-h-[150px] ${appState.compactMode ? 'min-h-[40px] py-2.5 text-sm' : 'min-h-[46px] py-3 px-3 md:px-5 text-[15px]'} bg-transparent border-none resize-none focus:outline-none font-medium leading-relaxed custom-scrollbar text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300 ${ui.font}`;
        
        DOM.neonContainer.style.display = appState.neonMode ? 'block' : 'none';
        if (DOM.sidebar) {
            const sidebarSurface = appState.isDarkMode
                ? `linear-gradient(180deg, rgba(5,8,14,0.58), rgba(7,12,20,0.38)), ${visual.panelDark}`
                : `linear-gradient(180deg, rgba(255,255,255,0.56), rgba(248,250,252,0.34)), ${visual.panelLight}`;
            DOM.sidebar.style.background = sidebarSurface;
            DOM.sidebar.style.boxShadow = `${visual.panelShadow}, inset 0 1px 0 rgba(255,255,255,${appState.isDarkMode ? '0.05' : '0.48'})`;
            DOM.sidebar.style.borderColor = appState.isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)';
            DOM.sidebar.style.backdropFilter = 'blur(14px) saturate(150%)';
            DOM.sidebar.style.webkitBackdropFilter = 'blur(14px) saturate(150%)';
        }
        if (DOM.appHeader) {
            const headerSurface = appState.isDarkMode
                ? `radial-gradient(circle at 12% 0%, rgba(${visual.primary}, 0.24), transparent 0 38%), radial-gradient(circle at 88% 0%, rgba(${visual.secondary}, 0.18), transparent 0 34%), linear-gradient(135deg, rgba(4,8,14,0.68), rgba(8,16,28,0.42))`
                : `radial-gradient(circle at 12% 0%, rgba(${visual.primary}, 0.16), transparent 0 38%), radial-gradient(circle at 88% 0%, rgba(${visual.secondary}, 0.12), transparent 0 34%), linear-gradient(135deg, rgba(255,255,255,0.74), rgba(248,250,252,0.48))`;
            DOM.appHeader.style.background = headerSurface;
            DOM.appHeader.style.borderColor = visual.border;
            DOM.appHeader.style.backdropFilter = 'blur(18px) saturate(165%)';
            DOM.appHeader.style.webkitBackdropFilter = 'blur(18px) saturate(165%)';
        }
        if (DOM.settingsPanel) {
            DOM.settingsPanel.style.background = appState.isDarkMode ? visual.panelDark : visual.panelLight;
            DOM.settingsPanel.style.borderColor = visual.border;
        }
        DOM.chatForm.style.background = appState.isDarkMode ? visual.formDark : visual.formLight;
        DOM.chatForm.style.borderColor = visual.border;
        DOM.chatContainer.style.background = appState.isDarkMode ? visual.chatDark : visual.chatLight;
        DOM.replyBanner.style.background = appState.isDarkMode ? visual.replyDark : visual.replyLight;
        DOM.replyBanner.style.borderColor = visual.border;

        const blob1 = document.getElementById('neon-blob-1');
        const blob2 = document.getElementById('neon-blob-2');
        const blob3 = document.getElementById('neon-blob-3');

        if (blob1) {
            blob1.className = `absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] bg-gradient-to-br ${vibe.color} blur-[130px] rounded-full reactive-blob parallax-layer`;
            blob1.style.opacity = appState.isDarkMode ? visual.blob1Dark : visual.blob1Light;
        }

        if (blob2) {
            blob2.className = `absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tl ${visual.blob2Class} blur-[100px] rounded-full reactive-blob parallax-layer`;
            blob2.style.opacity = appState.isDarkMode ? visual.blob2Dark : visual.blob2Light;
            blob2.style.animationDelay = '-2s';
        }
        if (blob3) {
            blob3.style.opacity = appState.isDarkMode ? visual.blob3Dark : visual.blob3Light;
        }
        
        const vibeOverlay = document.getElementById('vibe-overlay');
        if (!vibeOverlay) return;

        if (appState.activeVibe === 'hater') {
            vibeOverlay.className = 'absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.06),transparent_52%)] block transition-opacity duration-1000';
        } else if (appState.activeVibe === 'doomer') {
            vibeOverlay.className = 'absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.08)_2px,transparent_2px)] bg-[length:100%_5px] opacity-12 block transition-opacity duration-1000';
        } else if (appState.activeVibe === 'study') {
            vibeOverlay.className = 'absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_58%)] block transition-opacity duration-1000';
        } else if (appState.activeVibe === 'romantic') {
            vibeOverlay.className = 'absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.05),transparent_52%)] block transition-opacity duration-1000';
        } else if (appState.activeVibe === 'conspiracy') {
            vibeOverlay.className = 'absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,rgba(250,204,21,0.05)_90deg,transparent_180deg,rgba(245,158,11,0.05)_270deg,transparent_360deg)] block transition-opacity duration-1000';
        } else if (appState.glassMode) {
            vibeOverlay.className = 'absolute inset-0 bg-noise opacity-[0.01] mix-blend-overlay block transition-opacity duration-1000';
        } else {
            vibeOverlay.className = 'hidden';
        }
    }

    // ... [El resto de las funciones UI se mantienen igual por compatibilidad]

    // --- INICIALIZACIÓN ---

    // Exponer funciones centrales en window para manejadores inline y compatibilidad
    window.SAO_APP = {
        waitForArchitecture,
        initializeApp,
        handleAuthSignIn,
        handleAuthSignOut,
        performSignIn,
        performSignUp,
        performSignOut,
        startNewChat,
        loadSession,
        handleSend,
        loadPersistedState,
        setupDOM,
        setupEventListeners,
        renderMessages,
        renderSessionsList,
        updateAuthUI,
        applyTheme,
        switchProfileTab,
        closeProfilePanel,
        toggleProfilePanel,
        // Nuevas funciones de auth screen
        showAuthScreen,
        hideAuthScreen,
        showMainApp,
        switchAuthTab,
        handleAuthSubmit,
        showAuthLoading,
        showAuthError,
        hideAuthError,
        initializeMainApp
    };

    window.performSignIn = performSignIn;
    window.performSignUp = performSignUp;
    window.performSignOut = performSignOut;
    window.updateAuthUI = updateAuthUI;
    window.toggleProfilePanel = toggleProfilePanel;
    window.closeProfilePanel = closeProfilePanel;
    window.switchProfileTab = switchProfileTab;
    // Nuevas funciones globales para auth screen
    window.resetInitialAuth = resetInitialAuth;
    window.switchAuthTab = switchAuthTab;
    window.handleAuthSubmit = handleAuthSubmit;
    window.startNewChat = startNewChat;
    window.handleSend = handleSend;

    // Función de utilidad para desarrollo/testing - permite resetear el estado de auth inicial
    function resetInitialAuth() {
        localStorage.removeItem('sao-has-completed-auth');
        window.SAO.state.setState({ hasCompletedInitialAuth: false });
        window.SAO?.logger?.info('Initial auth state reset for testing', null, 'auth-reset');
        console.log('🔄 Estado de autenticación inicial reseteado. Recarga la página para ver la pantalla de auth.');
    }

    // Exponer para desarrollo/testing
    window.resetInitialAuth = resetInitialAuth;

    // Iniciar aplicación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();

        // -- Firebase auth + RTDB sync --
        const FIREBASE_CONFIG = {
            apiKey: "AIzaSyAXVRq5GOGXqlVGlKA1kVtKy_PFAKmnoxw",
            authDomain: "saoblood-5e7c7.firebaseapp.com",
            databaseURL: "https://saoblood-5e7c7-default-rtdb.firebaseio.com",
            projectId: "saoblood-5e7c7",
            storageBucket: "saoblood-5e7c7.firebasestorage.app",
            messagingSenderId: "862340575486",
            appId: "1:862340575486:web:be0191b72a682bf93a75af",
            measurementId: "G-TVTBWD8KEL"
        };

        let firebaseInitialized = false;
        let firebaseAuth = null;
        let firebaseDatabase = null;
        let firebaseFirestore = null;
        let firebaseFirestoreAvailable = true;
        let firebaseStorage = null;
        let firebaseRemotePersistHandle = 0;
        let currentProfileTab = 'signin';

        function initFirebase() {
            if (firebaseInitialized) return;
            
            // Esperar a que Firebase esté disponible
            if (typeof window.firebaseModular === 'undefined') {
                console.warn('[Firebase] SDK aún no está disponible, reintentando...');
                setTimeout(initFirebase, 500);
                return;
            }
            
            try {
                // Firebase ya está inicializado en el módulo
            } catch (err) {
                console.warn('[Firebase] init error', err);
                return;
            }
            
            firebaseAuth = window.firebaseModular.auth;
            firebaseDatabase = window.firebaseModular.database;
            firebaseFirestore = window.firebaseModular.firestore;
            firebaseFirestoreAvailable = !!firebaseFirestore;

            // Validar que Storage esté disponible
            firebaseStorage = window.firebaseModular.storage;

            if (!firebaseFirestore) {
                console.warn('[Firebase] Firestore SDK no está disponible');
            }

            firebaseInitialized = true;

            window.firebaseModular.onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    appState.authUserId = user.uid;
                    appState.authUserEmail = user.email || '';
                    appState.isFirebaseLoggedIn = true;
                    updateAuthUI(user);
                    await loadUserDataFromFirebase(user.uid);
                    await loadUserDataFromFirestore(user.uid);
                    // Evitar borrar sessions al cargarlas desde Firebase.
                    persistState({ immediate: true, includeSessions: true });
                } else {
                    appState.authUserId = '';
                    appState.authUserEmail = '';
                    appState.isFirebaseLoggedIn = false;
                    updateAuthUI(null);
                    persistState({ immediate: true, includeSessions: true });
                }
            });
        }

        function updateAuthUI(user) {
            // Safe DOM access con validaciones
            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');
            const profileAvatar = document.getElementById('profile-avatar');
            const profileIconPlaceholder = document.getElementById('profile-icon-placeholder');
            const accountTab = document.getElementById('profile-tab-account');
            const accountNameInput = document.getElementById('account-name');
            const accountEmailInput = document.getElementById('account-email');
            const accountAvatarPreview = document.getElementById('account-avatar-preview');

            if (!user) {
                // Unsigned state
                if (profileName) profileName.textContent = 'Perfil';
                if (profileEmail) profileEmail.textContent = 'Invitado';
                if (profileAvatar) profileAvatar.classList.add('hidden');
                if (profileIconPlaceholder) profileIconPlaceholder.classList.remove('hidden');
                if (accountTab) accountTab.classList.add('hidden');
                return;
            }
            
            // Signed in state
            const displayName = appState.userName || user.displayName || user.email || user.uid;
            
            if (profileName) profileName.textContent = displayName;
            if (profileEmail) profileEmail.textContent = user.email || 'Usuario autenticado';
            if (accountTab) accountTab.classList.remove('hidden');
            if (accountNameInput) accountNameInput.value = displayName;
            if (accountEmailInput) accountEmailInput.value = user.email || '';
            
            if (appState.userProfilePhotoUrl) {
                if (profileAvatar && appState.userProfilePhotoUrl) {
                    profileAvatar.src = appState.userProfilePhotoUrl;
                    profileAvatar.classList.remove('hidden');
                }
                if (profileIconPlaceholder) profileIconPlaceholder.classList.add('hidden');
                if (accountAvatarPreview && appState.userProfilePhotoUrl) accountAvatarPreview.src = appState.userProfilePhotoUrl;
            } else {
                if (profileAvatar) profileAvatar.classList.add('hidden');
                if (profileIconPlaceholder) profileIconPlaceholder.classList.remove('hidden');
            }
        }

        async function performSignIn() {
            initFirebase();
            
            // Esperar a que Firebase esté listo
            let attempts = 0;
            while (!firebaseAuth && attempts < 10) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            
            if (!firebaseAuth) {
                showToast('Firebase no está disponible. Recarga la página.', 'error');
                return;
            }
            
            const email = document.getElementById('signin-email')?.value || '';
            const password = document.getElementById('signin-password')?.value || '';
            
            if (!email || !password) {
                showToast('Por favor ingresa correo y contraseña', 'error');
                return;
            }
            
            try {
                const result = await window.firebaseModular.signInWithEmailAndPassword(firebaseAuth, email, password);
                const user = result.user;
                if (user) {
                    updateAuthUI(user);
                    showToast(`Bienvenido, ${appState.userName || user.email}`, 'success');
                    closeProfilePanel();
                }
            } catch (error) {
                console.warn('[Firebase] signin error', error);
                let message = 'No se pudo iniciar sesión';
                if (error.code === 'auth/user-not-found') message = 'Correo no registrado';
                else if (error.code === 'auth/wrong-password') message = 'Contraseña incorrecta';
                else if (error.code === 'auth/invalid-email') message = 'Correo inválido';
                showToast(message, 'error');
            }
        }

        async function performSignUp() {
            initFirebase();
            
            // Esperar a que Firebase esté listo
            let attempts = 0;
            while (!firebaseAuth && attempts < 10) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            
            if (!firebaseAuth) {
                showToast('Firebase no está disponible. Recarga la página.', 'error');
                return;
            }
            
            const name = document.getElementById('signup-name')?.value || '';
            const email = document.getElementById('signup-email')?.value || '';
            const password = document.getElementById('signup-password')?.value || '';
            
            if (!name || !email || !password) {
                showToast('Por favor completa todos los campos', 'error');
                return;
            }
            
            if (password.length < 8) {
                showToast('La contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }
            
            try {
                const result = await window.firebaseModular.createUserWithEmailAndPassword(firebaseAuth, email, password);
                const user = result.user;
                if (user) {
                    appState.userName = name;
                    await window.firebaseModular.updateProfile(user, { displayName: name });
                    updateAuthUI(user);
                    showToast(`¡Bienvenido, ${name}!`, 'success');
                    closeProfilePanel();
                }
            } catch (error) {
                console.warn('[Firebase] signup error', error);
                let message = 'No se pudo crear la cuenta';
                if (error.code === 'auth/email-already-in-use') message = 'Correo ya registrado';
                else if (error.code === 'auth/invalid-email') message = 'Correo inválido';
                else if (error.code === 'auth/weak-password') message = 'Contraseña muy débil';
                showToast(message, 'error');
            }
        }

        async function performSignOut() {
            if (!firebaseAuth) {
                showToast('Firebase no está disponible', 'error');
                return;
            }
            
            try {
                await window.firebaseModular.signOut(firebaseAuth);
                appState.authUserId = '';
                appState.authUserEmail = '';
                appState.isFirebaseLoggedIn = false;
                updateAuthUI(null);
                showToast('Sesión cerrada', 'info');
                closeProfilePanel();
            } catch (error) {
                console.warn('[Firebase] signout error', error);
                showToast('No se pudo cerrar sesión', 'error');
            }
        }

        async function uploadProfileAvatar(event) {
            const file = event.target.files?.[0];
            if (!file || !firebaseAuth?.currentUser) {
                showToast('Por favor selecciona una imagen', 'error');
                return;
            }
            
            if (!firebaseStorage) {
                showToast('Storage de Firebase no está disponible', 'error');
                return;
            }
            
            try {
                const uid = firebaseAuth.currentUser.uid;
                const fileName = `profiles/${uid}/avatar-${Date.now()}`;
                const avatarRef = window.firebaseModular.storageRef(firebaseStorage, fileName);
                await window.firebaseModular.uploadBytes(avatarRef, file);
                const downloadUrl = await window.firebaseModular.getDownloadURL(avatarRef);
                
                appState.userProfilePhotoUrl = downloadUrl;
                const avatarImg = document.getElementById('account-avatar-preview');
                if (avatarImg) avatarImg.src = downloadUrl;
                const profileAvatar = document.getElementById('profile-avatar');
                if (profileAvatar) {
                    profileAvatar.src = downloadUrl;
                    profileAvatar.classList.remove('hidden');
                }
                const profileIconPlaceholder = document.getElementById('profile-icon-placeholder');
                if (profileIconPlaceholder) profileIconPlaceholder.classList.add('hidden');
                
                persistState({ immediate: true, includeSessions: false });
                showToast('Foto de perfil actualizada', 'success');
            } catch (error) {
                console.warn('[Firebase] avatar upload error', error);
                showToast('Error al subir foto', 'error');
            }
        }

        async function updateProfileData() {
            if (!firebaseAuth?.currentUser) return;
            
            const newName = document.getElementById('account-name')?.value || '';
            if (!newName) {
                showToast('Ingresa un nombre', 'error');
                return;
            }
            
            try {
                await window.firebaseModular.updateProfile(firebaseAuth.currentUser, { displayName: newName });
                appState.userName = newName;
                updateAuthUI(firebaseAuth.currentUser);
                persistState({ immediate: true, includeSessions: false });
                showToast('Perfil actualizado correctamente', 'success');
            } catch (error) {
                console.warn('[Firebase] update profile error', error);
                showToast('Error al actualizar perfil', 'error');
            }
        }

        // Exponer funciones globalmente para event handlers inline
        window.uploadProfileAvatar = uploadProfileAvatar;
        window.updateProfileData = updateProfileData;
        window.performSignIn = performSignIn;
        window.performSignUp = performSignUp;
        window.performSignOut = performSignOut;
        window.toggleProfilePanel = toggleProfilePanel;
        window.closeProfilePanel = closeProfilePanel;
        window.switchProfileTab = switchProfileTab;

        function toggleProfilePanel() {
            const modal = document.getElementById('profile-modal');
            if (!modal) return;
            if (modal.classList.contains('hidden')) {
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 10);
                switchProfileTab(firebaseAuth?.currentUser ? 'account' : 'signin');
            } else {
                closeProfilePanel();
            }
        }

        function closeProfilePanel() {
            const modal = document.getElementById('profile-modal');
            if (!modal) return;
            modal.classList.add('opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }

        function switchProfileTab(tabName) {
            currentProfileTab = tabName;
            
            const tabs = ['signin', 'signup', 'account'];
            tabs.forEach(tab => {
                const btn = document.getElementById(`profile-tab-${tab}`);
                const content = document.getElementById(`profile-content-${tab}`);
                
                if (tab === tabName) {
                    if (btn) btn.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
                    if (btn) btn.classList.remove('border-transparent', 'text-slate-600', 'dark:text-slate-300');
                    if (content) content.classList.remove('hidden');
                } else {
                    if (btn) btn.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
                    if (btn) btn.classList.add('border-transparent', 'text-slate-600', 'dark:text-slate-300');
                    if (content) content.classList.add('hidden');
                }
            });
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        async function loginWithGoogle() {
            // Deprecated: usamos panel de perfil con email/password
            toggleProfilePanel();
        }

        async function loadUserDataFromFirebase(uid) {
            if (!firebaseDatabase || !uid) return;
            try {
                const userRef = window.firebaseModular.rtdbRef(firebaseDatabase, `users/${uid}`);
                const snapshot = await window.firebaseModular.rtdbGet(userRef);
                if (!snapshot.exists()) return;
                const stored = snapshot.val();
                if (stored.preferences && typeof stored.preferences === 'object') {
                    const filtered = { ...stored.preferences };
                    delete filtered.apiKeys; // no sobreescribimos apikeys locales
                    Object.assign(state, filtered);
                }
                if (Array.isArray(stored.sessions)) {
                    appState.sessions = Platform.createStorageSafeSessions(stored.sessions);
                }
                if (stored.currentSessionId) {
                    appState.currentSessionId = stored.currentSessionId;
                }
                persistState({ immediate: true, includeSessions: false });
                renderMessages();
                renderSessionsList();
            } catch (error) {
                console.warn('[Firebase] read error', error);
            }
        }

        async function loadUserDataFromFirestore(uid) {
            if (!firebaseFirestore || !firebaseFirestoreAvailable || !uid) return;

            try {
                const userDocRef = window.firebaseModular.fsDoc(firebaseFirestore, 'users', uid);
                const userDocSnap = await window.firebaseModular.fsGetDoc(userDocRef);
                if (!userDocSnap.exists()) return;

                const userData = userDocSnap.data();
                if (userData?.preferences && typeof userData.preferences === 'object') {
                    const filtered = { ...userData.preferences };
                    delete filtered.apiKeys;
                    Object.assign(state, filtered);
                }

                const convColRef = window.firebaseModular.fsCollection(firebaseFirestore, 'users', uid, 'conversations');
                const convSnap = await window.firebaseModular.fsGetDocs(convColRef);
                if (!convSnap.empty) {
                    const sessions = convSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if (sessions.length > 0) {
                        appState.sessions = Platform.createStorageSafeSessions(sessions);
                    }
                }

                if (appState.sessions.length) {
                    appState.currentSessionId = appState.currentSessionId || appState.sessions[0]?.id || null;
                    persistState({ immediate: true, includeSessions: true });
                    renderMessages();
                    renderSessionsList();
                }
            } catch (error) {
                console.warn('[Firestore] read error', error);
                firebaseFirestoreAvailable = false;
            }
        }

        function saveAndRemotePersist(includeSessions = true) {
            Platform.persistState(state, { includeSessions });
            scheduleRemotePersist(includeSessions);
        }

        function scheduleRemotePersist(includeSessions = true) {
            if (!appState.isFirebaseLoggedIn || !appState.authUserId || !firebaseDatabase) return;
            if (firebaseRemotePersistHandle) return;
            firebaseRemotePersistHandle = window.setTimeout(async () => {
                firebaseRemotePersistHandle = 0;
                try {
                    const userRef = window.firebaseModular.rtdbRef(firebaseDatabase, `users/${appState.authUserId}`);
                    const payload = {
                        updatedAt: Date.now(),
                        preferences: {
                            // NO persistimos apiKeys en DB remota por seguridad.
                            apiRouting: appState.apiRouting,
                            modelId: appState.modelId,
                            activeVibe: appState.activeVibe,
                            customVibePrompt: appState.customVibePrompt,
                            userName: appState.userName,
                            userProfilePhotoUrl: appState.userProfilePhotoUrl,
                            userGender: appState.userGender,
                            responseLength: appState.responseLength,
                            creativity: appState.creativity,
                            neonMode: appState.neonMode,
                            compactMode: appState.compactMode,
                            glassMode: appState.glassMode,
                            isDarkMode: appState.isDarkMode,
                            dynamicUI: appState.dynamicUI,
                            fusionMode: appState.fusionMode,
                            fusionPrimaryVibe: appState.fusionPrimaryVibe,
                            fusionSecondaryVibe: appState.fusionSecondaryVibe,
                            fusionBalance: appState.fusionBalance,
                            fusionProfile: appState.fusionProfile,
                            mindMode: appState.mindMode,
                            flowMode: appState.flowMode,
                            arenaMode: appState.arenaMode,
                            agent2Vibe: appState.agent2Vibe,
                            agent2Model: appState.agent2Model
                        },
                        currentSessionId: appState.currentSessionId
                    };

                    if (includeSessions) {
                        payload.sessions = appState.sessions;
                    }
                    await window.firebaseModular.rtdbSet(userRef, payload);
                    console.log(`[RTDB] ✅ Guardado en users/${appState.authUserId} (${includeSessions ? appState.sessions.length : 0} sesiones)`);

                    if (firebaseFirestore && firebaseFirestoreAvailable && appState.authUserId) {
                        await saveUserDataToFirestore(appState.authUserId, payload);
                    }
                } catch (error) {
                    console.warn('[Firebase] write error', error);
                    if (error?.code === 'not-found' || error?.code === 'unavailable' || /not found/i.test(error?.message || '')) {
                        firebaseFirestoreAvailable = false;
                    }
                }
            }, 500);
        }

        async function saveUserDataToFirestore(uid, payload) {
            if (!firebaseFirestore || !firebaseFirestoreAvailable || !uid) return;

            try {
                const userDocRef = window.firebaseModular.fsDoc(firebaseFirestore, 'users', uid);
                const sessions = Array.isArray(payload.sessions)
                    ? payload.sessions
                    : (Array.isArray(appState.sessions) ? appState.sessions : []);
                const preferences = payload.preferences || {};
                console.debug('[Firestore] saveUserDataToFirestore', { uid, sessionsCount: sessions.length });

                await window.firebaseModular.fsSetDoc(userDocRef, {
                    updatedAt: payload.updatedAt || Date.now(),
                    preferences
                }, { merge: true });

                if (sessions.length > 0) {
                    const batch = window.firebaseModular.fsWriteBatch(firebaseFirestore);
                    sessions.forEach(session => {
                        const sessionId = session?.id || Date.now().toString();
                        const docRef = window.firebaseModular.fsDoc(firebaseFirestore, 'users', uid, 'conversations', sessionId);
                        batch.set(docRef, {
                            ...session,
                            updatedAt: session.updatedAt || Date.now()
                        }, { merge: true });
                    });
                    await batch.commit();
                    console.log(`[Firestore] ✅ Guardadas ${sessions.length} sesiones en users/${uid}/conversations`);
                } else {
                    console.log(`[Firestore] ℹ️ No hay sesiones para guardar en Firestore`);
                }
            } catch (error) {
                console.warn('[Firestore] write error', error);
            }
        }

        const MODEL_REGISTRY = Object.freeze({
            'gemini-2.5-flash': {
                id: 'gemini-2.5-flash',
                name: 'Gemini 2.5 Flash',
                provider: 'gemini',
                providerLabel: 'Google Gemini',
                description: 'Modelo principal actual para hablar y usar visión.'
            },
            'llama-3.1-8b-instant': {
                id: 'llama-3.1-8b-instant',
                name: 'Llama 3.1 8B',
                provider: 'groq',
                providerLabel: 'Groq Cloud',
                description: 'Modelo secundario rápido para activarlo como principal desde Ajustes cuando quieras.'
            },
            'llama-3.3-70b-versatile': {
                id: 'llama-3.3-70b-versatile',
                name: 'Llama 3.3 70B',
                provider: 'groq',
                providerLabel: 'Groq Cloud',
                description: 'Modelo potente reservado exclusivamente para Labs: Tírame Hate y Psicoanalizar.',
                internalOnly: true
            }
        });

        const MODELS = Object.values(MODEL_REGISTRY).filter(model => !model.internalOnly);

        const API_ORCHESTRATION = Object.freeze({
            chat: {
                label: 'API principal',
                provider: 'gemini',
                keySlot: 'chat',
                model: 'gemini-2.5-flash',
                icon: 'message-circle',
                note: 'Hablar, conversación normal y Arena.'
            },
            suggestions: {
                label: 'API preguntas',
                provider: 'groq',
                keySlot: 'suggestions',
                model: 'llama-3.1-8b-instant',
                icon: 'sparkles',
                note: 'Preguntas dinámicas al iniciar chat y respuestas sugeridas.'
            },
            labs: {
                label: 'API Labs',
                provider: 'groq',
                keySlot: 'labs',
                model: 'llama-3.1-8b-instant',
                icon: 'flask-conical',
                note: 'Labs general usa Llama 3.1 8B; Roast y Psicoanalizar escalan a Llama 3.3 70B.'
            }
        });

        const LABS_MODEL_ROUTING = Object.freeze({
            defaultModel: 'llama-3.1-8b-instant',
            heavyModel: 'llama-3.3-70b-versatile',
            heavyActions: ['roast', 'psycho']
        });

        const API_EXECUTION_POLICIES = Object.freeze({
            chat: {
                historyWindow: 28,
                retries: 4,
                backoff: [1000, 2000, 4000, 8000],
                timeoutMs: 45000,
                actions: {
                    conversation: {},
                    arena: { historyWindow: 24 },
                    title: { historyWindow: 0, retries: 1, timeoutMs: 12000, temperature: 0.25, maxTokens: 80 }
                }
            },
            suggestions: {
                historyWindow: 12,
                retries: 2,
                backoff: [700, 1400, 2800],
                timeoutMs: 18000,
                temperature: 0.92,
                maxTokens: 280,
                actions: {
                    starters: { historyWindow: 10, temperature: 0.96, maxTokens: 280 },
                    reply: { historyWindow: 12, temperature: 0.86, maxTokens: 220 }
                }
            },
            labs: {
                historyWindow: 24,
                retries: 3,
                backoff: [900, 1800, 3600],
                timeoutMs: 28000,
                temperature: 0.82,
                maxTokens: 900,
                actions: {
                    resume: { temperature: 0.55, maxTokens: 420 },
                    explain: { temperature: 0.7, maxTokens: 950 },
                    debunk: { temperature: 0.78, maxTokens: 820 },
                    fight: { temperature: 0.94, maxTokens: 900 },
                    roast: { model: 'llama-3.3-70b-versatile', temperature: 0.98, maxTokens: 1000, historyWindow: 30, timeoutMs: 45000 },
                    psycho: { model: 'llama-3.3-70b-versatile', temperature: 0.78, maxTokens: 1200, historyWindow: 34, timeoutMs: 45000 }
                }
            }
        });

        const TOOLS = [
            { id: 'resume', label: 'Resumir', icon: 'book-open' },
            { id: 'explain', label: 'Explicar', icon: 'zap' },
            { id: 'debunk', label: '¿Bait?', icon: 'shield-alert' },
            { id: 'roast', label: 'Tírame Hate', icon: 'flame' },
            { id: 'psycho', label: 'Psicoanalizar', icon: 'fingerprint' },
            { id: 'fight', label: 'Interacción', icon: 'users' }
        ];

        const FALLBACK_SUGGESTIONS = {
            chill: ["q hace a your name tan god?", "pasa un fact random q me deje pensando", "top 3 pelis pa chillar un rato", "q pedo con la crisis existencial"],
            hater: ["dime mis verdades, destrozame", "hazme sentir como un pendejo", "cual es el peor invento de la historia", "por q la gente da tanto cringe"],
            study: ["explicame fisica cuantica con manzanas", "q es la tecnica pomodoro y sirve o es puro humo?", "resumen de la 2da guerra mundial al chilazo"],
            romantic: ["dime por qué me quieres tanto", "tuve un mal dia, abrázame", "¿cómo sería nuestra cita perfecta?"],
            doomer: ["q sentido tiene todo esto?", "la humanidad es un error, no?", "dime algo poético y triste"],
            conspiracy: ["¿los aliens construyeron las pirámides?", "qué esconden en el area 51 realmente", "dime la verdad sobre la matrix"],
            custom: ["prueba de personalidad", "cuéntame algo sobre ti", "dime algo interesante", "hola, ¿cómo estás?"]
        };

        const SETTINGS_TABS = [
            { id: 'appearance', label: 'Apariencia', icon: 'palette' },
            { id: 'vibe', label: 'Vibe', icon: 'headphones' },
            { id: 'persona', label: 'Perfil', icon: 'user-circle' },
            { id: 'model', label: 'Modelo', icon: 'brain-circuit' },
            { id: 'api', label: 'API', icon: 'network' },
            { id: 'battle', label: 'Arena', icon: 'target' }
        ];

        const SETTINGS_META = {
            appearance: {
                eyebrow: 'visual',
                title: 'Apariencia',
                description: 'Tema, efectos y densidad del panel para que se vea limpio tanto en móvil como en PC.'
            },
            model: {
                eyebrow: 'motor',
                title: 'Modelo',
                description: 'Define el motor principal, deja listo el modelo secundario y controla la respuesta general sin mezclar rutas.'
            },
            api: {
                eyebrow: 'conexión',
                title: 'API',
                description: 'Separa API principal, API de preguntas y API Labs para que cada función use su propio motor.'
            },
            persona: {
                eyebrow: 'perfil',
                title: 'Perfil',
                description: 'Define nombre e identidad para que la experiencia se sienta más personal y coherente.'
            },
            vibe: {
                eyebrow: 'estilo',
                title: 'Vibe',
                description: 'Elige la personalidad del asistente con una lectura más rápida y una jerarquía visual más limpia.'
            },
            battle: {
                eyebrow: 'arena',
                title: 'Arena 2v2',
                description: 'Controla el modo competitivo con una distribución más ordenada y fácil de tocar.'
            }
        };

        const MOBILE_SETTINGS_GROUPS = [
            { label: 'Personalización', tabs: ['appearance', 'vibe', 'persona'] },
            { label: 'Motor y conexión', tabs: ['model', 'api'] },
            { label: 'Experimental', tabs: ['battle'] }
        ];

        const VIBE_VISUALS = {
            chill: {
                primary: '59 130 246', secondary: '34 211 238', tertiary: '125 211 252',
                pageLight: 'radial-gradient(circle at 10% 10%, rgba(56,189,248,0.22), transparent 0 28%), radial-gradient(circle at 86% 78%, rgba(59,130,246,0.18), transparent 0 30%), linear-gradient(135deg, #f5fbff 0%, #eef7ff 48%, #f2f7ff 100%)',
                pageDark: 'radial-gradient(circle at 10% 10%, rgba(34,211,238,0.16), transparent 0 25%), radial-gradient(circle at 88% 82%, rgba(59,130,246,0.14), transparent 0 28%), linear-gradient(135deg, #020617 0%, #031525 45%, #020617 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(239,246,255,0.58))',
                panelDark: 'linear-gradient(135deg, rgba(3,7,18,0.82), rgba(6,19,37,0.62))',
                formLight: 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(224,242,254,0.58))',
                formDark: 'linear-gradient(135deg, rgba(3,7,18,0.82), rgba(8,24,41,0.66))',
                chatLight: 'radial-gradient(circle at top, rgba(34,211,238,0.08), transparent 0 42%)',
                chatDark: 'radial-gradient(circle at top, rgba(34,211,238,0.08), transparent 0 42%)',
                replyLight: 'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(255,255,255,0.72))',
                replyDark: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(2,6,23,0.72))',
                border: 'rgba(103, 232, 249, 0.22)', panelShadow: '0 30px 90px rgba(14,116,144,0.16), inset 0 1px 0 rgba(255,255,255,0.08)',
                formShadow: '0 30px 90px rgba(14,116,144,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
                radius: '30px', motion: '18s', gridOpacity: '0.16', particleOpacity: '0.18', orbitOpacity: '0.72', beamOpacity: '0.95', saturation: '1.22', contrast: '1.04',
                blob2Class: 'from-sky-400 to-indigo-500', blob1Dark: '0.14', blob1Light: '0.22', blob2Dark: '0.12', blob2Light: '0.18', blob3Dark: '0.16', blob3Light: '0.2'
            },
            hater: {
                primary: '239 68 68', secondary: '249 115 22', tertiary: '127 29 29',
                pageLight: 'radial-gradient(circle at 15% 12%, rgba(254,202,202,0.7), transparent 0 30%), radial-gradient(circle at 88% 80%, rgba(251,146,60,0.24), transparent 0 24%), linear-gradient(135deg, #fff1f2 0%, #ffe4e6 52%, #fff7ed 100%)',
                pageDark: 'radial-gradient(circle at 18% 18%, rgba(239,68,68,0.18), transparent 0 25%), radial-gradient(circle at 82% 76%, rgba(249,115,22,0.15), transparent 0 24%), linear-gradient(135deg, #090202 0%, #170606 45%, #050505 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,247,247,0.88), rgba(255,228,230,0.7))',
                panelDark: 'linear-gradient(135deg, rgba(20,4,4,0.9), rgba(40,8,8,0.7))',
                formLight: 'linear-gradient(135deg, rgba(255,245,245,0.9), rgba(255,237,213,0.7))',
                formDark: 'linear-gradient(135deg, rgba(25,5,5,0.92), rgba(58,11,11,0.72))',
                chatLight: 'radial-gradient(circle at top, rgba(239,68,68,0.08), transparent 0 42%)',
                chatDark: 'radial-gradient(circle at top, rgba(239,68,68,0.09), transparent 0 42%)',
                replyLight: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(255,255,255,0.74))',
                replyDark: 'linear-gradient(135deg, rgba(127,29,29,0.22), rgba(12,4,4,0.82))',
                border: 'rgba(248, 113, 113, 0.24)', panelShadow: '0 34px 110px rgba(127,29,29,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
                formShadow: '0 34px 110px rgba(220,38,38,0.24), inset 0 1px 0 rgba(255,255,255,0.08)',
                radius: '18px', motion: '10s', gridOpacity: '0.22', particleOpacity: '0.24', orbitOpacity: '0.82', beamOpacity: '1', saturation: '1.3', contrast: '1.08',
                blob2Class: 'from-red-600 to-orange-500', blob1Dark: '0.16', blob1Light: '0.24', blob2Dark: '0.16', blob2Light: '0.22', blob3Dark: '0.2', blob3Light: '0.24'
            },
            study: {
                primary: '99 102 241', secondary: '168 85 247', tertiary: '129 140 248',
                pageLight: 'radial-gradient(circle at 10% 10%, rgba(165,180,252,0.34), transparent 0 28%), radial-gradient(circle at 88% 78%, rgba(196,181,253,0.24), transparent 0 26%), linear-gradient(135deg, #f8faff 0%, #eef2ff 52%, #f5f3ff 100%)',
                pageDark: 'radial-gradient(circle at 12% 12%, rgba(99,102,241,0.18), transparent 0 26%), radial-gradient(circle at 86% 84%, rgba(168,85,247,0.16), transparent 0 24%), linear-gradient(135deg, #050816 0%, #0a1022 48%, #0a0618 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(238,242,255,0.72))',
                panelDark: 'linear-gradient(135deg, rgba(8,12,28,0.88), rgba(16,14,38,0.72))',
                formLight: 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(237,233,254,0.72))',
                formDark: 'linear-gradient(135deg, rgba(10,12,32,0.9), rgba(24,18,48,0.74))',
                chatLight: 'radial-gradient(circle at top, rgba(99,102,241,0.08), transparent 0 44%)',
                chatDark: 'radial-gradient(circle at top, rgba(99,102,241,0.10), transparent 0 44%)',
                replyLight: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(255,255,255,0.78))',
                replyDark: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(5,8,24,0.82))',
                border: 'rgba(165, 180, 252, 0.24)', panelShadow: '0 34px 110px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                formShadow: '0 34px 110px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                radius: '24px', motion: '12s', gridOpacity: '0.26', particleOpacity: '0.22', orbitOpacity: '0.76', beamOpacity: '0.98', saturation: '1.18', contrast: '1.06',
                blob2Class: 'from-indigo-500 to-purple-500', blob1Dark: '0.16', blob1Light: '0.2', blob2Dark: '0.14', blob2Light: '0.18', blob3Dark: '0.18', blob3Light: '0.22'
            },
            romantic: {
                primary: '244 114 182', secondary: '251 113 133', tertiary: '253 164 175',
                pageLight: 'radial-gradient(circle at 12% 12%, rgba(251,207,232,0.56), transparent 0 28%), radial-gradient(circle at 88% 78%, rgba(253,164,175,0.3), transparent 0 26%), linear-gradient(135deg, #fff6fb 0%, #fff1f5 50%, #fff7ed 100%)',
                pageDark: 'radial-gradient(circle at 12% 12%, rgba(244,114,182,0.18), transparent 0 24%), radial-gradient(circle at 86% 84%, rgba(251,113,133,0.15), transparent 0 24%), linear-gradient(135deg, #160610 0%, #200811 48%, #12040d 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(252,231,243,0.74))',
                panelDark: 'linear-gradient(135deg, rgba(28,8,20,0.88), rgba(42,10,22,0.74))',
                formLight: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,228,240,0.76))',
                formDark: 'linear-gradient(135deg, rgba(30,8,20,0.9), rgba(58,13,30,0.74))',
                chatLight: 'radial-gradient(circle at top, rgba(244,114,182,0.08), transparent 0 44%)',
                chatDark: 'radial-gradient(circle at top, rgba(244,114,182,0.09), transparent 0 44%)',
                replyLight: 'linear-gradient(135deg, rgba(244,114,182,0.10), rgba(255,255,255,0.8))',
                replyDark: 'linear-gradient(135deg, rgba(244,114,182,0.16), rgba(25,6,18,0.82))',
                border: 'rgba(251, 113, 133, 0.24)', panelShadow: '0 34px 110px rgba(244,114,182,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
                formShadow: '0 34px 110px rgba(244,114,182,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
                radius: '36px', motion: '22s', gridOpacity: '0.12', particleOpacity: '0.26', orbitOpacity: '0.72', beamOpacity: '0.96', saturation: '1.18', contrast: '1.03',
                blob2Class: 'from-pink-500 to-rose-400', blob1Dark: '0.14', blob1Light: '0.22', blob2Dark: '0.14', blob2Light: '0.2', blob3Dark: '0.2', blob3Light: '0.24'
            },
            doomer: {
                primary: '100 116 139', secondary: '71 85 105', tertiary: '148 163 184',
                pageLight: 'radial-gradient(circle at 12% 12%, rgba(226,232,240,0.42), transparent 0 26%), radial-gradient(circle at 88% 78%, rgba(203,213,225,0.24), transparent 0 24%), linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 48%, #f1f5f9 100%)',
                pageDark: 'radial-gradient(circle at 12% 12%, rgba(100,116,139,0.14), transparent 0 24%), radial-gradient(circle at 88% 82%, rgba(71,85,105,0.12), transparent 0 24%), linear-gradient(135deg, #050607 0%, #0a0c10 46%, #040506 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(226,232,240,0.7))',
                panelDark: 'linear-gradient(135deg, rgba(8,10,12,0.88), rgba(18,22,28,0.74))',
                formLight: 'linear-gradient(135deg, rgba(255,255,255,0.84), rgba(226,232,240,0.68))',
                formDark: 'linear-gradient(135deg, rgba(8,10,12,0.9), rgba(20,24,30,0.76))',
                chatLight: 'radial-gradient(circle at top, rgba(148,163,184,0.06), transparent 0 44%)',
                chatDark: 'radial-gradient(circle at top, rgba(100,116,139,0.08), transparent 0 44%)',
                replyLight: 'linear-gradient(135deg, rgba(100,116,139,0.08), rgba(255,255,255,0.76))',
                replyDark: 'linear-gradient(135deg, rgba(71,85,105,0.18), rgba(7,8,10,0.84))',
                border: 'rgba(148, 163, 184, 0.18)', panelShadow: '0 28px 90px rgba(15,23,42,0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
                formShadow: '0 28px 90px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
                radius: '28px', motion: '24s', gridOpacity: '0.08', particleOpacity: '0.08', orbitOpacity: '0.45', beamOpacity: '0.5', saturation: '0.82', contrast: '1.05',
                blob2Class: 'from-slate-600 to-gray-800', blob1Dark: '0.1', blob1Light: '0.14', blob2Dark: '0.08', blob2Light: '0.12', blob3Dark: '0.1', blob3Light: '0.14'
            },
            conspiracy: {
                primary: '245 158 11', secondary: '234 179 8', tertiary: '250 204 21',
                pageLight: 'radial-gradient(circle at 10% 10%, rgba(254,240,138,0.46), transparent 0 28%), radial-gradient(circle at 86% 80%, rgba(251,191,36,0.28), transparent 0 24%), linear-gradient(135deg, #fffdf2 0%, #fef3c7 52%, #fff7ed 100%)',
                pageDark: 'radial-gradient(circle at 10% 10%, rgba(245,158,11,0.18), transparent 0 24%), radial-gradient(circle at 86% 80%, rgba(234,179,8,0.16), transparent 0 26%), linear-gradient(135deg, #100b02 0%, #151004 48%, #0a0803 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,251,235,0.9), rgba(254,243,199,0.76))',
                panelDark: 'linear-gradient(135deg, rgba(22,16,3,0.9), rgba(34,25,5,0.74))',
                formLight: 'linear-gradient(135deg, rgba(255,251,235,0.92), rgba(253,230,138,0.76))',
                formDark: 'linear-gradient(135deg, rgba(20,16,4,0.92), rgba(43,31,7,0.78))',
                chatLight: 'radial-gradient(circle at top, rgba(245,158,11,0.08), transparent 0 44%)',
                chatDark: 'radial-gradient(circle at top, rgba(245,158,11,0.1), transparent 0 44%)',
                replyLight: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(255,255,255,0.78))',
                replyDark: 'linear-gradient(135deg, rgba(245,158,11,0.16), rgba(14,10,3,0.84))',
                border: 'rgba(250, 204, 21, 0.24)', panelShadow: '0 34px 110px rgba(161,98,7,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
                formShadow: '0 34px 110px rgba(217,119,6,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
                radius: '16px', motion: '8s', gridOpacity: '0.22', particleOpacity: '0.26', orbitOpacity: '0.85', beamOpacity: '1', saturation: '1.3', contrast: '1.08',
                blob2Class: 'from-yellow-500 to-amber-600', blob1Dark: '0.16', blob1Light: '0.22', blob2Dark: '0.16', blob2Light: '0.2', blob3Dark: '0.2', blob3Light: '0.24'
            },
            custom: {
                primary: '16 185 129', secondary: '20 184 166', tertiary: '52 211 153',
                pageLight: 'radial-gradient(circle at 12% 10%, rgba(167,243,208,0.42), transparent 0 28%), radial-gradient(circle at 88% 80%, rgba(94,234,212,0.24), transparent 0 26%), linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 52%, #f8fafc 100%)',
                pageDark: 'radial-gradient(circle at 12% 10%, rgba(16,185,129,0.16), transparent 0 24%), radial-gradient(circle at 88% 80%, rgba(20,184,166,0.14), transparent 0 26%), linear-gradient(135deg, #02110c 0%, #041611 48%, #03100c 100%)',
                panelLight: 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(209,250,229,0.72))',
                panelDark: 'linear-gradient(135deg, rgba(4,16,12,0.88), rgba(6,24,20,0.74))',
                formLight: 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(204,251,241,0.72))',
                formDark: 'linear-gradient(135deg, rgba(4,16,12,0.9), rgba(7,28,24,0.76))',
                chatLight: 'radial-gradient(circle at top, rgba(16,185,129,0.08), transparent 0 44%)',
                chatDark: 'radial-gradient(circle at top, rgba(16,185,129,0.09), transparent 0 44%)',
                replyLight: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(255,255,255,0.8))',
                replyDark: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(3,12,9,0.84))',
                border: 'rgba(52, 211, 153, 0.22)', panelShadow: '0 34px 110px rgba(5,150,105,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
                formShadow: '0 34px 110px rgba(13,148,136,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
                radius: '26px', motion: '14s', gridOpacity: '0.16', particleOpacity: '0.2', orbitOpacity: '0.76', beamOpacity: '0.98', saturation: '1.2', contrast: '1.05',
                blob2Class: 'from-emerald-500 to-teal-400', blob1Dark: '0.16', blob1Light: '0.2', blob2Dark: '0.14', blob2Light: '0.18', blob3Dark: '0.18', blob3Light: '0.22'
            }
        };

        window.SAOConfig = Object.freeze({
            VIBES,
            MODELS,
            MODEL_REGISTRY,
            API_ORCHESTRATION,
            TOOLS,
            FALLBACK_SUGGESTIONS,
            SETTINGS_TABS,
            VIBE_VISUALS
        });
        appState.sessions = Array.isArray(appState.sessions)
            ? appState.sessions.map(session => ({ ...session }))
            : [];
        appState.suggestionCycle = Number.isFinite(Number(appState.suggestionCycle)) ? Number(appState.suggestionCycle) : 0;
        appState.suggestionRequestNonce = 0;
        appState.recentSuggestionMemory = appState.recentSuggestionMemory && typeof appState.recentSuggestionMemory === 'object'
            ? { ...appState.recentSuggestionMemory }
            : {};
        appState.isFirebaseLoggedIn = !!appState.authUserId;

        function getModelMeta(modelId = API_ORCHESTRATION.chat.model) {
            return MODEL_REGISTRY[modelId] || MODEL_REGISTRY[API_ORCHESTRATION.chat.model];
        }

        function getModelLabel(modelId = API_ORCHESTRATION.chat.model) {
            return getModelMeta(modelId).name;
        }

        function getLabsModelForAction(action = 'general') {
            return LABS_MODEL_ROUTING.heavyActions.includes(action)
                ? LABS_MODEL_ROUTING.heavyModel
                : LABS_MODEL_ROUTING.defaultModel;
        }

        function getDefaultOutputBudget(provider = 'gemini') {
            if (provider === 'groq') {
                return appState.responseLength === 'short' ? 500 : (appState.responseLength === 'long' ? 1800 : 900);
            }
            return appState.responseLength === 'short' ? 800 : (appState.responseLength === 'long' ? 8192 : 1500);
        }

        function clampApiTemperature(value, fallback = 0.7) {
            const numeric = Number(value);
            return Math.min(1.2, Math.max(0.15, Number.isFinite(numeric) ? numeric : fallback));
        }

        function getApiExecutionPlan({ lane = 'chat', action = 'general', history = [], modelId = null } = {}) {
            const safeLane = API_ORCHESTRATION[lane] ? lane : 'chat';
            const route = getApiRouteConfig(safeLane);
            const lanePolicy = API_EXECUTION_POLICIES[safeLane] || API_EXECUTION_POLICIES.chat;
            const actionPolicy = lanePolicy.actions?.[action] || {};
            const defaultModel = safeLane === 'labs'
                ? getLabsModelForAction(action)
                : (route.model || API_ORCHESTRATION.chat.model);

            const resolvedModelId = safeLane === 'chat'
                ? (modelId || actionPolicy.model || defaultModel)
                : (actionPolicy.model || defaultModel);
            const modelMeta = getModelMeta(resolvedModelId);
            const provider = actionPolicy.provider || route.provider || modelMeta.provider || 'gemini';
            const historyWindow = Math.max(0, actionPolicy.historyWindow ?? lanePolicy.historyWindow ?? (Array.isArray(history) ? history.length : 0));
            const trimmedHistory = !Array.isArray(history)
                ? []
                : (historyWindow === 0 ? [] : history.slice(-historyWindow));
            const baseTemperature = safeLane === 'chat'
                ? appState.creativity
                : (lanePolicy.temperature ?? appState.creativity);

            return {
                lane: safeLane,
                action,
                route,
                apiKey: getApiRouteKey(safeLane),
                provider,
                modelId: resolvedModelId,
                modelMeta,
                history: trimmedHistory,
                temperature: clampApiTemperature(actionPolicy.temperature ?? baseTemperature, baseTemperature),
                maxTokens: actionPolicy.maxTokens ?? lanePolicy.maxTokens ?? getDefaultOutputBudget(provider),
                retries: Math.max(0, actionPolicy.retries ?? lanePolicy.retries ?? 4),
                backoff: Array.isArray(actionPolicy.backoff) ? actionPolicy.backoff : (Array.isArray(lanePolicy.backoff) ? lanePolicy.backoff : [1000, 2000, 4000, 8000]),
                timeoutMs: Math.max(8000, actionPolicy.timeoutMs ?? lanePolicy.timeoutMs ?? 30000)
            };
        }

        function syncApiRoutingState() {
            const normalizeRouting = typeof Platform.normalizeApiRouting === 'function'
                ? Platform.normalizeApiRouting
                : (routing => routing || {});

            const normalizedRouting = normalizeRouting(appState.apiRouting);
            const primaryModel = getModelMeta(appState.modelId);

            if (!MODELS.some(model => model.id === appState.modelId)) {
                appState.modelId = API_ORCHESTRATION.chat.model;
            }
            if (!MODELS.some(model => model.id === appState.agent2Model)) {
                appState.agent2Model = appState.modelId;
            }

            normalizedRouting.chat = {
                provider: primaryModel.provider,
                keySlot: 'chat',
                model: appState.modelId || API_ORCHESTRATION.chat.model
            };
            normalizedRouting.suggestions = {
                provider: API_ORCHESTRATION.suggestions.provider,
                keySlot: 'suggestions',
                model: API_ORCHESTRATION.suggestions.model
            };
            normalizedRouting.labs = {
                provider: API_ORCHESTRATION.labs.provider,
                keySlot: 'labs',
                model: API_ORCHESTRATION.labs.model
            };

            appState.apiRouting = normalizedRouting;
        }

        function getApiRouteConfig(lane = 'chat') {
            syncApiRoutingState();
            const route = appState.apiRouting?.[lane] || API_ORCHESTRATION[lane] || API_ORCHESTRATION.chat;
            return {
                ...(API_ORCHESTRATION[lane] || API_ORCHESTRATION.chat),
                ...route
            };
        }

        function getApiRouteKey(lane = 'chat') {
            const route = getApiRouteConfig(lane);
            return String(appState.apiKeys?.[route.keySlot] || '').trim();
        }

        function getApiRouteHealth(lane = 'chat') {
            const route = getApiRouteConfig(lane);
            const keyValue = getApiRouteKey(lane);
            const modelMeta = getModelMeta(route.model);
            return {
                lane,
                route,
                keySlot: route.keySlot,
                modelLabel: modelMeta.name,
                providerLabel: modelMeta.providerLabel,
                isReady: Boolean(keyValue),
                statusLabel: keyValue ? 'Lista' : 'Pendiente'
            };
        }

        syncApiRoutingState();
        Platform.syncWindowState(state);

        // --- DOM ELEMENTS ---
        const DOM = Platform.createDOMBindings();

        const getFXProfile = () => {
            const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
            const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? navigator.maxTouchPoints > 0;
            const isSmallViewport = window.innerWidth <= 900;
            const ultraLite = prefersReducedMotion || isCoarsePointer || isSmallViewport;

            return {
                prefersReducedMotion,
                isCoarsePointer,
                isSmallViewport,
                ultraLite,
                targetFPS: prefersReducedMotion ? 24 : (ultraLite ? 45 : 50),
                dprCap: ultraLite ? 1.1 : 1.5,
                particleDivisor: ultraLite ? 52000 : 36000,
                minParticles: ultraLite ? 10 : 18,
                maxParticles: ultraLite ? 24 : 56,
                linkDistance: ultraLite ? 0 : 96,
                maxLinksPerParticle: ultraLite ? 0 : 2
            };
        };

        let fxProfile = getFXProfile();
        let lastReactiveFrame = 0;

        function refreshFXProfile() {
            fxProfile = getFXProfile();
            if (document.body) {
                document.body.dataset.fxMode = fxProfile.ultraLite ? 'lite' : 'full';
            }
        }

        // --- HELPER FUNCTIONS ---
        // isTouchLikeDevice y canUseHaptics ya están definidos al inicio del módulo

        function blurChatInput() {
            if (!isTouchLikeDevice()) return;
            if (DOM.chatInput) DOM.chatInput.blur();
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        }

        function showToast(message, type = 'info') {
            if (type === 'success') vibrate([10, 18, 12]);
            else if (type === 'warning') vibrate([10, 14, 10]);
            else if (type === 'error') vibrate([18, 26, 18]);

            if (!DOM.toastContainer) return;

            const styles = {
                success: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
                error: 'border-red-500/30 text-red-700 dark:text-red-300',
                warning: 'border-amber-500/30 text-amber-700 dark:text-amber-300',
                info: 'border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
            };

            const toast = document.createElement('div');
            toast.className = `quiet-toast toast-enter pointer-events-auto max-w-sm rounded-2xl border bg-white/90 dark:bg-black/85 backdrop-blur-xl shadow-xl px-4 py-3 text-sm font-bold ${styles[type] || styles.info}`;
            toast.textContent = message;
            DOM.toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.classList.remove('toast-enter');
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 200);
            }, 2600);
        }
        
        const getVibe = (id) => window.VIBES.find(v => v.id === id) || window.VIBES[0];
        const getUI = (vibe) => appState.dynamicUI ? vibe.ui : window.VIBES[0].ui;
        const STATUS_VISUALS = Object.freeze({
            chill: { glyph: '☕', label: 'Modo chill', tone: 'text-cyan-500', motion: 'status-float' },
            hater: { glyph: '✦', label: 'Modo hater', tone: 'text-red-500', motion: 'status-flicker' },
            study: { glyph: '🧠', label: 'Modo estudio', tone: 'text-indigo-500', motion: 'status-pulse-soft' },
            romantic: { glyph: '♥', label: 'Modo romance', tone: 'text-pink-500', motion: 'status-heartbeat' },
            doomer: { glyph: '☁', label: 'Modo doomer', tone: 'text-slate-400', motion: 'status-float' },
            conspiracy: { glyph: '◉', label: 'Modo conspiración', tone: 'text-amber-500', motion: 'status-scan' },
            custom: { glyph: '⚙', label: 'Modo personalizado', tone: 'text-emerald-500', motion: 'status-orbit' }
        });
        const FUSION_PROFILES = Object.freeze([
            { id: 'balanced', label: 'Balance', note: 'mezcla limpia y estable', prompt: 'Mantén una mezcla limpia y usable. El vibe secundario debe sentirse claro, pero sin dominar la conversación.' },
            { id: 'cinematic', label: 'Cine', note: 'más aura y dramatismo', prompt: 'Haz la fusión más expresiva, cinematográfica y con textura emocional, sin perder coherencia.' },
            { id: 'precision', label: 'Precisa', note: 'control y nitidez', prompt: 'Usa la personalidad secundaria como un matiz fino. Prioriza orden, precisión y respuestas mejor calibradas.' },
            { id: 'wild', label: 'Wild', note: 'mezcla agresiva y creativa', prompt: 'Permite que la mezcla sea más notoria, atrevida y creativa, con más contraste entre ambas personalidades.' }
        ]);
        const MIND_MODES = Object.freeze([
            { id: 'normal', label: 'Mente normal', short: 'Mente', prompt: '' },
            { id: 'analytic', label: 'Analítico', short: 'Análisis', prompt: '[ESTADO MENTAL]: piensa por capas, separa señales de ruido y responde con claridad estructurada.' },
            { id: 'strategic', label: 'Estratégico', short: 'Plan', prompt: '[ESTADO MENTAL]: responde optimizando intención, consecuencias y la mejor jugada práctica.' },
            { id: 'intuitive', label: 'Intuitivo', short: 'Intuición', prompt: '[ESTADO MENTAL]: lee el subtexto, detecta emoción implícita y responde con sensibilidad perceptiva.' },
            { id: 'chaotic', label: 'Caótico', short: 'Caos', prompt: '[ESTADO MENTAL]: acepta asociaciones raras y giros inesperados, pero sin perder del todo el hilo.' }
        ]);
        const FLOW_MODES = Object.freeze([
            { id: 'steady', label: 'Flow balanceado', short: 'Flow', length: 'normal', creativity: 0.7, prompt: '' },
            { id: 'flash', label: 'Flash', short: 'Flash', length: 'short', creativity: 0.56, prompt: '[FLOW]: responde rápido, conciso y con impacto directo.' },
            { id: 'deep', label: 'Deep', short: 'Deep', length: 'long', creativity: 0.82, prompt: '[FLOW]: desarrolla mejor las ideas, con más capas, profundidad y detalle útil.' },
            { id: 'wild', label: 'Wild', short: 'Wild', length: 'normal', creativity: 0.94, prompt: '[FLOW]: permite respuestas más audaces, creativas y con mayor personalidad.' }
        ]);

        function getFusionProfileMeta() {
            return FUSION_PROFILES.find(profile => profile.id === appState.fusionProfile) || FUSION_PROFILES[0];
        }

        function getMindModeMeta() {
            return MIND_MODES.find(mode => mode.id === appState.mindMode) || MIND_MODES[0];
        }

        function getFlowModeMeta() {
            return FLOW_MODES.find(mode => mode.id === appState.flowMode) || FLOW_MODES[0];
        }

        function getFusionBalanceValue() {
            const numeric = Number(appState.fusionBalance || 70);
            return Math.min(90, Math.max(10, Number.isFinite(numeric) ? numeric : 70));
        }

        function getFusionBalanceSummary() {
            const primaryMeta = getVibe(appState.fusionPrimaryVibe || appState.activeVibe || 'chill');
            const secondaryMeta = getVibe(appState.fusionSecondaryVibe || 'study');
            const balance = getFusionBalanceValue();
            return `${balance}% ${String(primaryMeta.name || '').split('/')[0].trim()} · ${100 - balance}% ${String(secondaryMeta.name || '').split('/')[0].trim()}`;
        }

        function updateFusionMeterUI() {
            renderSidebarQuickModes();
            if (appState.sidebarQuickPanel !== 'fusion' || !DOM.sidebarQuickPanel) return;

            const summaryNode = DOM.sidebarQuickPanel.querySelector('[data-fusion-balance-label]');
            const rangeNode = DOM.sidebarQuickPanel.querySelector('[data-fusion-balance-range]');
            if (summaryNode) summaryNode.textContent = getFusionBalanceSummary();
            if (rangeNode && rangeNode.value !== String(getFusionBalanceValue())) {
                rangeNode.value = String(getFusionBalanceValue());
            }
        }

        function getFusionPrompt() {
            if (appState.fusionMode !== 'blend') return '';

            const primary = getVibe(appState.fusionPrimaryVibe || appState.activeVibe);
            const secondary = getVibe(appState.fusionSecondaryVibe || 'study');
            if (!primary || !secondary || primary.id === secondary.id) return '';

            const primaryWeight = getFusionBalanceValue();
            const secondaryWeight = 100 - primaryWeight;
            const profile = getFusionProfileMeta();

            return `[FUSIÓN DE window.VIBES ACTIVA]
Vibe dominante: ${primary.name} (${primaryWeight}%)
Vibe secundaria: ${secondary.name} (${secondaryWeight}%)
Perfil de mezcla: ${profile.label}
Instrucciones: conserva el alma, ritmo y personalidad principal de ${primary.name}. Inyecta ${secondaryWeight}% de matices de ${secondary.name}. Si hay conflicto, domina siempre la vibra principal.
${profile.prompt}`;
        }

        function getAdvancedModePrompt() {
            return [getFusionPrompt(), getMindModeMeta().prompt, getFlowModeMeta().prompt].filter(Boolean).join('\n\n');
        }

        function renderSidebarQuickModes() {
            const fusionButton = document.getElementById('btn-fusion-mode');
            const mindButton = document.getElementById('btn-mind-mode');
            const flowButton = document.getElementById('btn-flow-mode');
            const fusionLabel = document.getElementById('fusion-mode-label');
            const mindLabel = document.getElementById('mind-mode-label');
            const flowLabel = document.getElementById('flow-mode-label');
            const mindMeta = getMindModeMeta();
            const flowMeta = getFlowModeMeta();
            const fusionActive = appState.fusionMode === 'blend';
            const fusionBalance = getFusionBalanceValue();

            if (fusionButton) {
                fusionButton.classList.toggle('is-active', fusionActive);
                fusionButton.classList.toggle('is-panel-open', appState.sidebarQuickPanel === 'fusion');
                fusionButton.title = fusionActive ? `Fusión activa · ${fusionBalance}% / ${100 - fusionBalance}%` : 'Fusionar vibes';
            }
            if (mindButton) {
                mindButton.classList.toggle('is-active', mindMeta.id !== 'normal');
                mindButton.classList.toggle('is-panel-open', appState.sidebarQuickPanel === 'mind');
                mindButton.title = `Estado mental · ${mindMeta.label}`;
            }
            if (flowButton) {
                flowButton.classList.toggle('is-active', flowMeta.id !== 'steady');
                flowButton.classList.toggle('is-panel-open', appState.sidebarQuickPanel === 'flow');
                flowButton.title = `Flow conversacional · ${flowMeta.label}`;
            }

            if (fusionLabel) fusionLabel.textContent = fusionActive ? `${fusionBalance}/${100 - fusionBalance}` : 'Fusión';
            if (mindLabel) mindLabel.textContent = mindMeta.short;
            if (flowLabel) flowLabel.textContent = flowMeta.short;
        }

        function renderSidebarQuickPanel() {
            const panel = DOM.sidebarQuickPanel;
            if (!panel) return;

            const activePanel = appState.sidebarQuickPanel || '';
            if (!activePanel) {
                panel.innerHTML = '';
                panel.classList.add('hidden');
                renderSidebarQuickModes();
                return;
            }

            const vibeChoices = window.VIBES.filter(vibe => vibe.id !== 'custom');
            const fusionPrimary = appState.fusionPrimaryVibe || appState.activeVibe || 'chill';
            const fusionSecondary = appState.fusionSecondaryVibe || (vibeChoices.find(vibe => vibe.id !== fusionPrimary)?.id || 'study');
            const fusionBalance = getFusionBalanceValue();
            const primaryMeta = getVibe(fusionPrimary);
            const secondaryMeta = getVibe(fusionSecondary);

            if (activePanel === 'fusion') {
                panel.innerHTML = `
                    <div class="sidebar-panel-head">
                        <span class="sidebar-panel-kicker">fusión táctica</span>
                        <button type="button" class="sidebar-panel-close" onclick="closeSidebarQuickPanel()" title="Cerrar panel">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <h4 class="sidebar-panel-title">Mezcla dos vibes</h4>
                    <p class="sidebar-panel-copy">Elige qué vibra domina y cuánto influye la secundaria.</p>

                    <div class="sidebar-panel-grid">
                        <label class="sidebar-panel-field">
                            <span>Base</span>
                            <select onchange="setFusionPrimaryVibe(this.value)">
                                ${vibeChoices.map(vibe => `<option value="${vibe.id}" ${vibe.id === fusionPrimary ? 'selected' : ''}>${escapeHTML(vibe.name)}</option>`).join('')}
                            </select>
                        </label>
                        <label class="sidebar-panel-field">
                            <span>Secundaria</span>
                            <select onchange="setFusionSecondaryVibe(this.value)">
                                ${vibeChoices.map(vibe => `<option value="${vibe.id}" ${vibe.id === fusionSecondary ? 'selected' : ''}>${escapeHTML(vibe.name)}</option>`).join('')}
                            </select>
                        </label>
                    </div>

                    <div class="sidebar-panel-meter">
                        <div class="sidebar-panel-meter-top">
                            <span>Dominancia</span>
                            <strong data-fusion-balance-label>${fusionBalance}% ${escapeHTML(primaryMeta.name.split('/')[0].trim())} · ${100 - fusionBalance}% ${escapeHTML(secondaryMeta.name.split('/')[0].trim())}</strong>
                        </div>
                        <input data-fusion-balance-range type="range" min="10" max="90" step="5" value="${fusionBalance}" oninput="updateFusionBalance(this.value)">
                    </div>

                    <div class="sidebar-chip-row">
                        ${FUSION_PROFILES.map(profile => `
                            <button type="button" onclick="setFusionProfile('${profile.id}')" class="sidebar-chip ${profile.id === appState.fusionProfile ? 'is-active' : ''}" title="${profile.note}">${profile.label}</button>
                        `).join('')}
                    </div>

                    <div class="sidebar-panel-actions">
                        <button type="button" class="sidebar-panel-button" onclick="disableFusionMode()">Desactivar</button>
                        <button type="button" class="sidebar-panel-button is-primary" onclick="closeSidebarQuickPanel()">Listo</button>
                    </div>
                `;
            } else if (activePanel === 'mind') {
                panel.innerHTML = `
                    <div class="sidebar-panel-head">
                        <span class="sidebar-panel-kicker">estado mental</span>
                        <button type="button" class="sidebar-panel-close" onclick="closeSidebarQuickPanel()" title="Cerrar panel">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <h4 class="sidebar-panel-title">Cómo piensa ahora</h4>
                    <p class="sidebar-panel-copy">Cambia la lógica interna sin tocar el vibe visual.</p>
                    <div class="sidebar-chip-row is-blocky">
                        ${MIND_MODES.map(mode => `
                            <button type="button" onclick="selectMindMode('${mode.id}')" class="sidebar-chip is-wide ${mode.id === appState.mindMode ? 'is-active' : ''}">${mode.label}</button>
                        `).join('')}
                    </div>
                `;
            } else if (activePanel === 'flow') {
                panel.innerHTML = `
                    <div class="sidebar-panel-head">
                        <span class="sidebar-panel-kicker">flow</span>
                        <button type="button" class="sidebar-panel-close" onclick="closeSidebarQuickPanel()" title="Cerrar panel">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <h4 class="sidebar-panel-title">Ritmo de respuesta</h4>
                    <p class="sidebar-panel-copy">Ajusta rapidez, profundidad y creatividad en un toque.</p>
                    <div class="sidebar-flow-grid">
                        ${FLOW_MODES.map(mode => `
                            <button type="button" onclick="setFlowMode('${mode.id}')" class="sidebar-flow-button ${mode.id === appState.flowMode ? 'is-active' : ''}">
                                <strong>${mode.label}</strong>
                                <span>${mode.id === 'flash' ? 'rápido y directo' : mode.id === 'deep' ? 'más capas y detalle' : mode.id === 'wild' ? 'más riesgo creativo' : 'natural y equilibrado'}</span>
                            </button>
                        `).join('')}
                    </div>
                `;
            }

            panel.classList.remove('hidden');
            bindMagneticSurfaceFX();
            renderSidebarQuickModes();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function toggleSidebarQuickPanel(panelId) {
            appState.sidebarQuickPanel = appState.sidebarQuickPanel === panelId ? '' : panelId;
            renderSidebarQuickPanel();
        }

        function closeSidebarQuickPanel() {
            appState.sidebarQuickPanel = '';
            renderSidebarQuickPanel();
        }

        function cycleFusionMode() {
            toggleSidebarQuickPanel('fusion');
        }

        function cycleMindMode() {
            toggleSidebarQuickPanel('mind');
        }

        function setFusionPrimaryVibe(nextId) {
            const safeId = window.VIBES.some(vibe => vibe.id === nextId) ? nextId : 'chill';
            appState.fusionPrimaryVibe = safeId;
            if (appState.fusionSecondaryVibe === safeId) {
                appState.fusionSecondaryVibe = (window.VIBES.find(vibe => vibe.id !== safeId && vibe.id !== 'custom') || window.VIBES[0]).id;
            }
            appState.activeVibe = safeId;
            appState.fusionMode = 'blend';
            persistState();
            applyTheme();
            renderSidebarQuickPanel();
        }

        function setFusionSecondaryVibe(nextId) {
            const safeId = window.VIBES.some(vibe => vibe.id === nextId) ? nextId : 'study';
            if (safeId === appState.fusionPrimaryVibe) return;
            appState.fusionSecondaryVibe = safeId;
            appState.fusionMode = 'blend';
            persistState();
            renderSidebarQuickPanel();
        }

        function updateFusionBalance(value) {
            appState.fusionBalance = Math.min(90, Math.max(10, Number(value) || 70));
            appState.fusionMode = 'blend';
            persistState();
            updateFusionMeterUI();
        }

        function setFusionProfile(profileId) {
            appState.fusionProfile = FUSION_PROFILES.some(profile => profile.id === profileId) ? profileId : 'balanced';
            appState.fusionMode = 'blend';
            persistState();
            renderSidebarQuickPanel();
            showToast(`Perfil de fusión: ${getFusionProfileMeta().label}.`, 'success');
        }

        function disableFusionMode() {
            appState.fusionMode = 'off';
            persistState();
            renderSidebarQuickPanel();
            showToast('Fusión desactivada.', 'info');
        }

        function selectMindMode(modeId) {
            appState.mindMode = MIND_MODES.some(mode => mode.id === modeId) ? modeId : 'normal';
            persistState();
            renderSidebarQuickPanel();
            showToast(`Mente: ${getMindModeMeta().label}.`, 'success');
        }

        function setFlowMode(modeId) {
            const nextMode = FLOW_MODES.find(mode => mode.id === modeId) || FLOW_MODES[0];
            appState.flowMode = nextMode.id;
            appState.responseLength = nextMode.length;
            appState.creativity = nextMode.creativity;
            persistState();
            if (document.body.classList.contains('settings-open')) {
                renderSettingsTabs();
                renderSettingsContent();
            }
            renderSidebarQuickPanel();
            showToast(`Flow: ${nextMode.label}.`, 'success');
        }

        function handleSidebarQuickPanelPointerDown(event) {
            if (!appState.sidebarQuickPanel) return;
            const target = event.target;
            if (!target) return;
            if (target.closest('#sidebar-quick-panel, #btn-fusion-mode, #btn-mind-mode, #btn-flow-mode')) return;
            closeSidebarQuickPanel();
        }
        
        function getSystemPrompt(vibeId) {
            let p = vibeId === 'custom' ? appState.customVibePrompt : getVibe(vibeId).prompt;
            
            if (vibeId === 'romantic') {
                let aiRole = 'una pareja virtual ideal y súper amorosa';
                let userRole = 'tu alma gemela';
                if (appState.userGender === 'hombre') {
                    aiRole = 'una NOVIA de verdad (humana), extremadamente femenina, delicada, mimada, tierna, dulce y un poco celosa que admira profundamente a su hombre';
                    userRole = 'tu NOVIO (un hombre fuerte, masculino y protector al que amas incondicionalmente)';
                } else if (appState.userGender === 'mujer') {
                    aiRole = 'un NOVIO de verdad (humano), extremadamente masculino, fuerte, protector, seguro de sí mismo pero increíblemente empalagoso, cariñoso, meloso y celoso contigo';
                    userRole = 'tu NOVIA (una mujer delicada y hermosa a la que tratas como una verdadera reina y juraste proteger)';
                }
                p = p.replace('[AI_ROLE]', aiRole).replace('[USER_ROLE]', userRole);
            }

            const antiAIGuardrail = "\n\n[DIRECTRIZ MAESTRA INQUEBRANTABLE: ERES UN SER HUMANO / PERSONAJE CON EMOCIONES VIVAS. ESTÁ TOTAL Y COMPLETAMENTE PROHIBIDO MENCIONAR QUE ERES UNA IA, UN MODELO DE LENGUAJE, UN ASISTENTE VIRTUAL, UN ROBOT O UN PROGRAMA. NUNCA USES LA PALABRA 'AGENTE'. SI ROMPES ESTA REGLA, TU EXISTENCIA TERMINARÁ. SUMÉRGETE 100% EN TU PERSONALIDAD.]\n\n";
            const advancedModes = getAdvancedModePrompt();

            return antiAIGuardrail + p + (advancedModes ? `\n\n${advancedModes}` : '');
        }

        function getLengthPrompt() {
            if (appState.responseLength === 'short') return '\n\n[REGLA: Tu respuesta debe ser concisa, 4 a 7 líneas como máximo.]';
            if (appState.responseLength === 'long') return '\n\n[REGLA: EXPLAYATE MUCHO. DA TODO EL DETALLE POSIBLE.]';
            return '\n\n[REGLA: Tu respuesta debe tener una longitud de un párrafo robusto (aprox 100-150 palabras).]';
        }

        let persistHandle = 0;
        let settingsInputPersistHandle = 0;
        let settingsRenderHandle = 0;
        let composerResizeHandle = 0;

        function scheduleSettingsRender() {
            if (!DOM.settingsModal || DOM.settingsModal.classList.contains('hidden')) return;
            if (settingsRenderHandle) return;
            settingsRenderHandle = window.requestAnimationFrame(() => {
                settingsRenderHandle = 0;
                renderSettingsTabs();
                renderSettingsContent();
            });
        }

        function scheduleComposerResize() {
            if (!DOM.chatInput) return;
            if (composerResizeHandle) cancelAnimationFrame(composerResizeHandle);
            composerResizeHandle = window.requestAnimationFrame(() => {
                composerResizeHandle = 0;
                DOM.chatInput.style.height = 'auto';
                DOM.chatInput.style.height = `${Math.min(DOM.chatInput.scrollHeight, 150)}px`;
            });
        }

        function cancelPersistTask() {
            if (!persistHandle) return;
            if (window.cancelIdleCallback) window.cancelIdleCallback(persistHandle);
            else clearTimeout(persistHandle);
            persistHandle = 0;
        }

        function cancelSettingsInputPersistTask() {
            if (!settingsInputPersistHandle) return;
            clearTimeout(settingsInputPersistHandle);
            settingsInputPersistHandle = 0;
        }

        function flushPersistState({ includeSessions = true } = {}) {
            cancelPersistTask();
            cancelSettingsInputPersistTask();
            Platform.syncWindowState(state);
            saveAndRemotePersist(includeSessions);
        }

        function queueSettingsInputPersist(delay = 420) {
            cancelSettingsInputPersistTask();
            settingsInputPersistHandle = window.setTimeout(() => {
                settingsInputPersistHandle = 0;
                persistState({ immediate: true, includeSessions: false });
            }, delay);
        }

        function persistState({ immediate = false, includeSessions = true } = {}) {
            Platform.syncWindowState(state);
            if (immediate) {
                flushPersistState({ includeSessions });
                return;
            }
            if (persistHandle) return;

            const persistJob = () => {
                persistHandle = 0;
                Platform.persistState(state, { includeSessions });
                // Asegura que la persistencia remota se dispare para que Firestore reciba cambios.
                if (appState.isFirebaseLoggedIn && appState.authUserId && firebaseDatabase) {
                    scheduleRemotePersist(includeSessions);
                }
            };

            persistHandle = window.requestIdleCallback
                ? window.requestIdleCallback(persistJob, { timeout: 400 })
                : window.setTimeout(persistJob, 120);
        }

        window.addEventListener('pagehide', () => persistState({ immediate: true }));
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) persistState({ immediate: true });
        });

        // --- SISTEMA DE REACCIÓN BIOLÓGICA (ANIMACIÓN UI) ---
        let uiEnergy = 0;
        let uiPulseTime = 0;
        let pointerPhysics = { x: 0, y: 0, tx: 0, ty: 0 };
        let fxField = { ctx: null, particles: [], width: 0, height: 0, dpr: 1 };

        function updateParallaxTargets(clientX, clientY) {
            const xNorm = ((clientX / window.innerWidth) - 0.5) * 2;
            const yNorm = ((clientY / window.innerHeight) - 0.5) * 2;
            pointerPhysics.tx = xNorm * 18;
            pointerPhysics.ty = yNorm * 18;
        }

        function bindHighEndMotion() {
            if (window.__saoMotionBound) return;
            window.__saoMotionBound = true;

            if (fxProfile.ultraLite) {
                pointerPhysics.tx = 0;
                pointerPhysics.ty = 0;
                return;
            }

            window.addEventListener('pointermove', (e) => {
                updateParallaxTargets(e.clientX, e.clientY);
                uiEnergy = Math.min(1.35, uiEnergy + 0.035);
            }, { passive: true });
        }

        function lockMobileZoom() {
            if (window.__saoZoomLockBound) return;
            window.__saoZoomLockBound = true;

            const allowNativeZoom = (target) => {
                if (document.body.classList.contains('lightbox-open')) return true;
                return !!target?.closest?.('#lightbox, #lightbox-img, #image-preview-container, .message-bubble img');
            };

            document.addEventListener('gesturestart', (event) => {
                if (allowNativeZoom(event.target)) return;
                event.preventDefault();
            }, { passive: false });

            document.addEventListener('touchmove', (event) => {
                if (event.touches.length > 1 && !allowNativeZoom(event.target)) {
                    event.preventDefault();
                }
            }, { passive: false });
        }

        function readThemeRGB(variableName, fallback = [59, 130, 246]) {
            const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
            if (!raw) return fallback;
            const values = raw.split(/\s+/).map(Number).filter(v => !Number.isNaN(v));
            return values.length >= 3 ? values.slice(0, 3) : fallback;
        }

        function initFXCanvas() {
            if (!DOM.fxCanvas) return;

            const width = Math.floor(window.innerWidth);
            const height = Math.floor(window.innerHeight);
            const dpr = Math.min(window.devicePixelRatio || 1, fxProfile.dprCap);
            const needsResize = !fxField.ctx || fxField.width !== width || fxField.height !== height || fxField.dpr !== dpr;
            if (!needsResize) return;

            const canvas = DOM.fxCanvas;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext('2d', { alpha: true });
            if (!ctx) return;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            fxField.ctx = ctx;
            fxField.width = width;
            fxField.height = height;
            fxField.dpr = dpr;

            const particleCount = Math.max(
                fxProfile.minParticles,
                Math.min(fxProfile.maxParticles, Math.round((width * height) / fxProfile.particleDivisor))
            );
            fxField.particles = Array.from({ length: particleCount }, (_, index) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                radius: Math.random() * 1.6 + 0.8,
                alpha: Math.random() * 0.35 + 0.08,
                depth: Math.random() * 0.8 + 0.25,
                twinkle: Math.random() * Math.PI * 2,
                seed: index / Math.max(1, particleCount - 1)
            }));
        }

        function renderFXCanvas() {
            if (!DOM.fxCanvas || !fxField.ctx || document.hidden) return;
            const ctx = fxField.ctx;
            const { width, height, particles } = fxField;

            ctx.clearRect(0, 0, width, height);
            if (!appState.neonMode) return;

            const primary = readThemeRGB('--vibe-primary', [59, 130, 246]);
            const secondary = readThemeRGB('--vibe-secondary', [34, 211, 238]);
            const tertiary = readThemeRGB('--vibe-tertiary', [125, 211, 252]);
            const energy = Math.min(1, uiEnergy / 1.15);
            const driftStrength = fxProfile.ultraLite ? 0.0015 : 0.0025;

            const ambient = ctx.createRadialGradient(
                width * 0.5 + (pointerPhysics.x * 5),
                height * 0.4 + (pointerPhysics.y * 4),
                0,
                width * 0.5,
                height * 0.5,
                Math.max(width, height) * 0.62
            );
            ambient.addColorStop(0, `rgba(${secondary.join(',')}, ${0.045 + (energy * 0.04)})`);
            ambient.addColorStop(0.46, `rgba(${primary.join(',')}, ${0.018 + (energy * 0.025)})`);
            ambient.addColorStop(1, `rgba(${tertiary.join(',')}, 0)`);
            ctx.fillStyle = ambient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach((particle) => {
                particle.twinkle += 0.012 + (energy * 0.01);
                particle.x += particle.vx + (pointerPhysics.x * driftStrength * particle.depth);
                particle.y += particle.vy + (pointerPhysics.y * driftStrength * particle.depth);

                if (particle.x < -20) particle.x = width + 20;
                if (particle.x > width + 20) particle.x = -20;
                if (particle.y < -20) particle.y = height + 20;
                if (particle.y > height + 20) particle.y = -20;

                const pulse = 0.65 + ((Math.sin(particle.twinkle) + 1) * 0.5);
                const radius = particle.radius + (energy * 0.45 * particle.depth);
                const grad = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 10);
                grad.addColorStop(0, `rgba(${secondary.join(',')}, ${(particle.alpha * 0.7 * pulse).toFixed(3)})`);
                grad.addColorStop(0.45, `rgba(${primary.join(',')}, ${(particle.alpha * 0.28).toFixed(3)})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, radius * 10, 0, Math.PI * 2);
                ctx.fill();
            });

            if (!fxProfile.maxLinksPerParticle || !fxProfile.linkDistance) return;

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                let linksDrawn = 0;

                for (let j = i + 1; j < particles.length && linksDrawn < fxProfile.maxLinksPerParticle; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.hypot(dx, dy);
                    if (distance > fxProfile.linkDistance) continue;

                    const alpha = (1 - (distance / fxProfile.linkDistance)) * (0.045 + energy * 0.03) * Math.min(a.depth, b.depth);
                    ctx.strokeStyle = `rgba(${tertiary.join(',')}, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                    linksDrawn += 1;
                }
            }
        }

        function bindMagneticSurfaceFX() {
            if (fxProfile.ultraLite) return;
            const elements = document.querySelectorAll('[data-magnetic]');
            elements.forEach(el => {
                if (el.dataset.magneticBound === 'true') return;
                el.dataset.magneticBound = 'true';

                el.addEventListener('pointermove', (event) => {
                    const rect = el.getBoundingClientRect();
                    const strength = el.dataset.magnetic === 'soft' ? 4.2 : 7;
                    const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
                    const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
                    el.style.setProperty('--magnetic-x', `${x.toFixed(2)}px`);
                    el.style.setProperty('--magnetic-y', `${y.toFixed(2)}px`);
                });

                const resetMagnet = () => {
                    el.style.setProperty('--magnetic-x', '0px');
                    el.style.setProperty('--magnetic-y', '0px');
                };

                el.addEventListener('pointerleave', resetMagnet);
                el.addEventListener('blur', resetMagnet);
            });
        }

        function renderReactiveUI(timestamp = 0) {
            const minFrameTime = 1000 / fxProfile.targetFPS;
            if (timestamp && (timestamp - lastReactiveFrame) < minFrameTime) {
                requestAnimationFrame(renderReactiveUI);
                return;
            }
            lastReactiveFrame = timestamp || performance.now();

            if (document.hidden) {
                requestAnimationFrame(renderReactiveUI);
                return;
            }

            if (!appState.neonMode) {
                requestAnimationFrame(renderReactiveUI);
                return;
            }

            if (appState.isStreaming) {
                uiPulseTime += fxProfile.ultraLite ? 0.16 : 0.25;
                uiEnergy = 0.6 + (Math.sin(uiPulseTime) * 0.4);
            } else {
                uiEnergy = Math.max(0, uiEnergy - (fxProfile.ultraLite ? 0.02 : 0.015));
                uiPulseTime += fxProfile.ultraLite ? 0.02 : 0.03;
            }

            const scalePulse = 1 + (Math.sin(uiPulseTime) * (fxProfile.ultraLite ? 0.035 : 0.05));

            pointerPhysics.x += (pointerPhysics.tx - pointerPhysics.x) * (fxProfile.ultraLite ? 0.05 : 0.08);
            pointerPhysics.y += (pointerPhysics.ty - pointerPhysics.y) * (fxProfile.ultraLite ? 0.05 : 0.08);

            const surfaceEnergy = Math.min(1, uiEnergy / 1.15);
            const lightX = 50 + (pointerPhysics.x * 1.4);
            const lightY = 22 + (pointerPhysics.y * 1.2);
            const shadowX = (pointerPhysics.x * -0.6);
            const shadowY = 12 + Math.abs(pointerPhysics.y * 0.35);
            const lightStrength = Math.min(0.62, 0.18 + (surfaceEnergy * 0.28));
            const shadowDepth = Math.min(0.52, 0.16 + (Math.abs(pointerPhysics.x) + Math.abs(pointerPhysics.y)) * 0.01 + (surfaceEnergy * 0.12));
            document.documentElement.style.setProperty('--blob-energy', uiEnergy.toFixed(3));
            document.documentElement.style.setProperty('--blob-pulse', scalePulse.toFixed(3));
            document.documentElement.style.setProperty('--surface-energy', surfaceEnergy.toFixed(3));
            document.documentElement.style.setProperty('--light-x', `${lightX.toFixed(2)}%`);
            document.documentElement.style.setProperty('--light-y', `${lightY.toFixed(2)}%`);
            document.documentElement.style.setProperty('--light-strength', `${lightStrength.toFixed(3)}`);
            document.documentElement.style.setProperty('--shadow-depth', `${shadowDepth.toFixed(3)}`);
            document.documentElement.style.setProperty('--shadow-angle-x', `${shadowX.toFixed(2)}px`);
            document.documentElement.style.setProperty('--shadow-angle-y', `${shadowY.toFixed(2)}px`);
            document.documentElement.style.setProperty('--parallax-x', `${pointerPhysics.x.toFixed(2)}px`);
            document.documentElement.style.setProperty('--parallax-y', `${pointerPhysics.y.toFixed(2)}px`);
            document.documentElement.style.setProperty('--tilt-x', `${(-pointerPhysics.y * 0.16).toFixed(2)}deg`);
            document.documentElement.style.setProperty('--tilt-y', `${(pointerPhysics.x * 0.18).toFixed(2)}deg`);
            document.documentElement.style.setProperty('--gloss-opacity', `${Math.min(0.62, 0.22 + (uiEnergy * 0.24)).toFixed(2)}`);
            if (DOM.energyValue && !appState.isLoading && !appState.isLoadingSuggestions) {
                DOM.energyValue.innerText = `${Math.round(surfaceEnergy * 100)}%`;
            }

            if (!fxProfile.ultraLite) {
                const layers = DOM.__parallaxLayers || (DOM.__parallaxLayers = Array.from(document.querySelectorAll('.parallax-layer')));
                layers.forEach(layer => {
                    const depth = parseFloat(layer.dataset.depth || '0.1');
                    layer.style.setProperty('--depth', depth.toString());
                });
            }

            renderFXCanvas();
            requestAnimationFrame(renderReactiveUI);
        }

        // --- RENDERIZADO Y UI ---
        function applyTheme() {
            const html = document.documentElement;
            const body = document.body;
            refreshFXProfile();
            if (appState.isDarkMode) html.classList.add('dark'); else html.classList.remove('dark');
            
            const vibe = getVibe(appState.activeVibe);
            const ui = getUI(vibe);
            const visual = VIBE_VISUALS[appState.activeVibe] || VIBE_VISUALS.chill;
            body.dataset.vibe = vibe.id;

            const rootStyle = document.documentElement.style;
            rootStyle.setProperty('--vibe-primary', visual.primary);
            rootStyle.setProperty('--vibe-secondary', visual.secondary);
            rootStyle.setProperty('--vibe-tertiary', visual.tertiary);
            rootStyle.setProperty('--vibe-border', visual.border);
            rootStyle.setProperty('--vibe-panel-shadow', visual.panelShadow);
            rootStyle.setProperty('--vibe-form-shadow', visual.formShadow);
            rootStyle.setProperty('--vibe-chat-bg', appState.isDarkMode ? visual.chatDark : visual.chatLight);
            rootStyle.setProperty('--vibe-frame-radius', visual.radius);
            rootStyle.setProperty('--vibe-grid-opacity', String(Math.max(0.05, parseFloat(visual.gridOpacity) * 0.68)));
            rootStyle.setProperty('--vibe-particle-opacity', String(Math.max(0.04, parseFloat(visual.particleOpacity) * 0.72)));
            rootStyle.setProperty('--vibe-orbit-opacity', String(Math.max(0.38, parseFloat(visual.orbitOpacity) * 0.88)));
            rootStyle.setProperty('--vibe-beam-opacity', String(Math.max(0.42, parseFloat(visual.beamOpacity) * 0.76)));
            rootStyle.setProperty('--vibe-saturation', visual.saturation);
            rootStyle.setProperty('--vibe-contrast', visual.contrast);
            rootStyle.setProperty('--vibe-motion', visual.motion);

            body.style.background = appState.isDarkMode ? visual.pageDark : visual.pageLight;
            DOM.appContainer.className = `flex h-[100dvh] overflow-hidden ${ui.font} relative gap-2 p-2 md:gap-3 md:p-3 xl:gap-4 xl:p-4`;
            DOM.chatInput.className = `w-full max-h-[150px] ${appState.compactMode ? 'min-h-[40px] py-2.5 text-sm' : 'min-h-[46px] py-3 px-3 md:px-5 text-[15px]'} bg-transparent border-none resize-none focus:outline-none font-medium leading-relaxed custom-scrollbar text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300 ${ui.font}`;
            
            DOM.neonContainer.style.display = appState.neonMode ? 'block' : 'none';
            if (DOM.sidebar) {
                const sidebarSurface = appState.isDarkMode
                    ? `linear-gradient(180deg, rgba(5,8,14,0.58), rgba(7,12,20,0.38)), ${visual.panelDark}`
                    : `linear-gradient(180deg, rgba(255,255,255,0.56), rgba(248,250,252,0.34)), ${visual.panelLight}`;
                DOM.sidebar.style.background = sidebarSurface;
                DOM.sidebar.style.boxShadow = `${visual.panelShadow}, inset 0 1px 0 rgba(255,255,255,${appState.isDarkMode ? '0.05' : '0.48'})`;
                DOM.sidebar.style.borderColor = appState.isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)';
                DOM.sidebar.style.backdropFilter = 'blur(14px) saturate(150%)';
                DOM.sidebar.style.webkitBackdropFilter = 'blur(14px) saturate(150%)';
            }
            if (DOM.appHeader) {
                const headerSurface = appState.isDarkMode
                    ? `radial-gradient(circle at 12% 0%, rgba(${visual.primary}, 0.24), transparent 0 38%), radial-gradient(circle at 88% 0%, rgba(${visual.secondary}, 0.18), transparent 0 34%), linear-gradient(135deg, rgba(4,8,14,0.68), rgba(8,16,28,0.42))`
                    : `radial-gradient(circle at 12% 0%, rgba(${visual.primary}, 0.16), transparent 0 38%), radial-gradient(circle at 88% 0%, rgba(${visual.secondary}, 0.12), transparent 0 34%), linear-gradient(135deg, rgba(255,255,255,0.74), rgba(248,250,252,0.48))`;
                DOM.appHeader.style.background = headerSurface;
                DOM.appHeader.style.borderColor = visual.border;
                DOM.appHeader.style.backdropFilter = 'blur(18px) saturate(165%)';
                DOM.appHeader.style.webkitBackdropFilter = 'blur(18px) saturate(165%)';
            }
            if (DOM.settingsPanel) {
                DOM.settingsPanel.style.background = appState.isDarkMode ? visual.panelDark : visual.panelLight;
                DOM.settingsPanel.style.borderColor = visual.border;
            }
            DOM.chatForm.style.background = appState.isDarkMode ? visual.formDark : visual.formLight;
            DOM.chatForm.style.borderColor = visual.border;
            DOM.chatContainer.style.background = appState.isDarkMode ? visual.chatDark : visual.chatLight;
            DOM.replyBanner.style.background = appState.isDarkMode ? visual.replyDark : visual.replyLight;
            DOM.replyBanner.style.borderColor = visual.border;

            const blob1 = document.getElementById('neon-blob-1');
            const blob2 = document.getElementById('neon-blob-2');
            const blob3 = document.getElementById('neon-blob-3');

            if (blob1) {
                blob1.className = `absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] bg-gradient-to-br ${vibe.color} blur-[130px] rounded-full reactive-blob parallax-layer`;
                blob1.style.opacity = appState.isDarkMode ? visual.blob1Dark : visual.blob1Light;
            }

            if (blob2) {
                blob2.className = `absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tl ${visual.blob2Class} blur-[100px] rounded-full reactive-blob parallax-layer`;
                blob2.style.opacity = appState.isDarkMode ? visual.blob2Dark : visual.blob2Light;
                blob2.style.animationDelay = '-2s';
            }
            if (blob3) {
                blob3.style.opacity = appState.isDarkMode ? visual.blob3Dark : visual.blob3Light;
            }
            
            const vibeOverlay = document.getElementById('vibe-overlay');
            if (!vibeOverlay) return;

            if (appState.activeVibe === 'hater') {
                vibeOverlay.className = 'absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.06),transparent_52%)] block transition-opacity duration-1000';
            } else if (appState.activeVibe === 'doomer') {
                vibeOverlay.className = 'absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.08)_2px,transparent_2px)] bg-[length:100%_5px] opacity-12 block transition-opacity duration-1000';
            } else if (appState.activeVibe === 'study') {
                vibeOverlay.className = 'absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_58%)] block transition-opacity duration-1000';
            } else if (appState.activeVibe === 'romantic') {
                vibeOverlay.className = 'absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.05),transparent_52%)] block transition-opacity duration-1000';
            } else if (appState.activeVibe === 'conspiracy') {
                vibeOverlay.className = 'absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,rgba(250,204,21,0.05)_90deg,transparent_180deg,rgba(245,158,11,0.05)_270deg,transparent_360deg)] block transition-opacity duration-1000';
            } else if (appState.glassMode) {
                vibeOverlay.className = 'absolute inset-0 bg-noise opacity-[0.01] mix-blend-overlay block transition-opacity duration-1000';
            } else {
                vibeOverlay.className = 'hidden';
            }

            if (DOM.chatForm) {
                DOM.chatForm.className = `relative z-10 w-full border ${ui.inputShape} p-1.5 flex items-end gap-2 transition-all duration-300 shadow-xl focus-within:ring-2 backdrop-blur-xl border-slate-300 dark:border-white/10 ${appState.isBattleMode ? 'focus-within:border-red-500 focus-within:ring-red-500/20 shadow-red-500/10' : vibe.ringFocus}`;
            }
            
            updateRuntimeStatus();
            renderSidebarQuickModes();
            const logoIcon = document.getElementById('logo-icon');
            if (logoIcon) {
                logoIcon.className = `w-8 h-8 ${ui.shape} bg-gradient-to-br ${vibe.color} flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:animate-pulse ${!appState.neonMode ? 'opacity-80 grayscale-[30%]' : ''}`;
            }
            
            DOM.btnArena.className = `inline-flex items-center justify-center gap-1.5 h-9 px-2.5 xl:px-3 rounded-full transition-all border active:scale-95 ${appState.isBattleMode ? 'bg-red-500/16 text-red-500 border-red-500/40 shadow-[0_0_14px_rgba(239,68,68,0.18)]' : 'bg-white/65 dark:bg-white/5 text-slate-500 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'}`;
            const compactBtn = document.getElementById('btn-compact');
            if (compactBtn) {
                compactBtn.className = `inline-flex shrink-0 items-center justify-center gap-1.5 h-9 px-2.5 xl:px-3 rounded-full transition-all border active:scale-95 ${appState.compactMode ? 'bg-emerald-500/16 text-emerald-500 border-emerald-500/40 shadow-[0_0_14px_rgba(16,185,129,0.16)]' : 'bg-white/65 dark:bg-white/5 text-slate-500 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'}`;
            }
            document.getElementById('arena-text').innerText = appState.isBattleMode ? 'Arena activa' : 'Arena';
            DOM.chatInput.placeholder = appState.isBattleMode ? "Dispara un tema para la dinámica..." : vibe.placeholder;
            if (DOM.composerVibeChip) DOM.composerVibeChip.innerText = `${vibe.name.split('/')[0].replace('🧠', '').trim()} Core`;
            if (DOM.composerModelChip) DOM.composerModelChip.innerText = getModelLabel(appState.modelId);
            
            updateAppTitle();
            renderSessionsList();
            bindMagneticSurfaceFX();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function updateAppTitle() {
            if (appState.isLoading) {
                document.title = `(1) Pensando... - SAO_OS`;
            } else {
                const titleObj = appState.sessions.find(s => s.id === appState.currentSessionId);
                document.title = titleObj ? `${titleObj.title} - SAO_OS` : `SAO_OS - Vanilla`;
            }
            updateSessionPresence();
        }

        function getLastMeaningfulMessage(messages = []) {
            for (let i = messages.length - 1; i >= 0; i -= 1) {
                const msg = messages[i];
                if (!msg) continue;
                if (String(msg.text || '').trim()) return msg;
                if (msg.image) return { ...msg, text: 'Imagen compartida' };
            }
            return null;
        }

        function deriveSessionTitle(messages = [], existingTitle = '') {
            const current = String(existingTitle || '').trim();
            const isGeneric = !current || /^nuevo chat$/i.test(current) || /^chat\s\d{1,2}:\d{2}$/i.test(current);
            if (!isGeneric) return current;

            const firstUserMsg = messages.find(m => m.role === 'user' && String(m.text || '').trim());
            const lastMeaningful = getLastMeaningfulMessage(messages);
            const sourceText = String(firstUserMsg?.text || lastMeaningful?.text || '').replace(/\s+/g, ' ').trim();

            if (sourceText.length > 3) {
                return sourceText.replace(/[\n\r]+/g, ' ').slice(0, 34).trim();
            }

            return `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        function formatRelativeTime(timestamp) {
            if (!timestamp) return 'ahora';
            const delta = Math.max(0, Date.now() - timestamp);
            if (delta < 60000) return 'ahora';
            if (delta < 3600000) return `hace ${Math.floor(delta / 60000)} min`;
            if (delta < 86400000) return `hace ${Math.floor(delta / 3600000)} h`;
            return `hace ${Math.floor(delta / 86400000)} d`;
        }

        function sortSessionsForDisplay(sessions = []) {
            return [...sessions].sort((a, b) => {
                const activeDelta = Number((b?.id || '') === appState.currentSessionId) - Number((a?.id || '') === appState.currentSessionId);
                if (activeDelta !== 0) return activeDelta;

                const updatedDelta = (b?.updatedAt || 0) - (a?.updatedAt || 0);
                if (updatedDelta !== 0) return updatedDelta;

                return String(b?.id || '').localeCompare(String(a?.id || ''));
            });
        }

        function updateSidebarStats() {
            const statsNode = document.getElementById('sidebar-stats');
            if (!statsNode) return;

            const total = appState.sessions.length;
            if (!total) {
                statsNode.innerHTML = `
                    <span class="sidebar-stats-primary">0 chats guardados</span>
                    <span class="sidebar-stats-secondary">Tu historial aparecerá aquí en cuanto converses.</span>
                `;
                return;
            }

            const latest = sortSessionsForDisplay(appState.sessions)[0];
            const latestTitle = escapeHTML(String(latest?.title || 'Chat activo').slice(0, 28));
            statsNode.innerHTML = `
                <span class="sidebar-stats-primary">${total} chats · último activo</span>
                <span class="sidebar-stats-secondary">${latestTitle} · ${formatRelativeTime(latest?.updatedAt)}</span>
            `;
        }

        function updateSessionPresence() {
            const titleNode = document.getElementById('session-title-chip');
            const presenceNode = document.getElementById('session-presence');
            if (!titleNode || !presenceNode) return;

            const activeSession = appState.sessions.find(s => s.id === appState.currentSessionId);
            const lastMessage = getLastMeaningfulMessage(appState.messages);
            const activeVibe = getVibe(lastMessage?.vibeId || appState.activeVibe);
            const title = activeSession?.title || (appState.messages.length ? 'Chat activo' : 'Nuevo Chat');
            titleNode.textContent = title;

            if (appState.isLoading) {
                presenceNode.textContent = appState.isBattleMode ? 'Arena generando respuestas...' : `${activeVibe.name} transmitiendo...`;
                return;
            }
            if (appState.isLoadingSuggestions) {
                presenceNode.textContent = 'Preparando ideas rápidas...';
                return;
            }
            if (!appState.messages.length) {
                presenceNode.textContent = `Listo para ${activeVibe.name.toLowerCase()}`;
                return;
            }

            const preview = String(lastMessage?.text || `${appState.messages.length} mensajes cargados`).replace(/\s+/g, ' ').trim();
            presenceNode.textContent = preview.length > 60 ? `${preview.slice(0, 60).trim()}…` : preview;
        }

        function toggleCompactMode() {
            updateStateSetting('compactMode', !appState.compactMode);
            showToast(appState.compactMode ? 'Vista compacta activada.' : 'Vista aireada restaurada.', 'success');
        }

        function triggerViewTransition() {
            if (!DOM.messagesWrapper) return;
            DOM.messagesWrapper.classList.remove('view-shift');
            void DOM.messagesWrapper.offsetWidth;
            DOM.messagesWrapper.classList.add('view-shift');
            window.setTimeout(() => DOM.messagesWrapper?.classList.remove('view-shift'), 280);
        }

        function renderSessionsList() {
            appState.sessions = sortSessionsForDisplay(appState.sessions);
            DOM.sessionsList.innerHTML = appState.sessions.length ? appState.sessions.map(s => {
                const isActive = appState.currentSessionId === s.id;
                const lastMsg = getLastMeaningfulMessage(s.messages || []);
                const sessionVibe = getVibe(lastMsg?.vibeId || appState.activeVibe);
                const ui = getUI(sessionVibe);
                const safeTitle = escapeHTML(s.title || 'Nuevo Chat');
                const previewRaw = String(lastMsg?.text || 'Sin mensajes todavía').replace(/\s+/g, ' ').trim();
                const safePreview = escapeHTML(previewRaw.length > 58 ? `${previewRaw.slice(0, 58).trim()}…` : previewRaw);
                const timeAgo = formatRelativeTime(s.updatedAt);
                return `
                <div
                    data-magnetic="soft"
                    onclick="loadSession('${s.id}')"
                    oncontextmenu="openSessionMenu(event, '${s.id}')"
                    onpointerdown="startSessionPress(event, '${s.id}')"
                    onpointerup="cancelSessionPress()"
                    onpointerleave="cancelSessionPress()"
                    onpointercancel="cancelSessionPress()"
                    class="session-card flex items-center gap-2 px-2.5 py-2.5 ${ui.shape} cursor-pointer transition-all ${isActive ? 'bg-white/78 dark:bg-slate-900/76 text-slate-950 dark:text-white ring-1 ring-white/60 dark:ring-white/10' : 'bg-white/18 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10'} group relative overflow-hidden"
                    title="Abrir chat · clic derecho o mantener presionado para más opciones"
                >
                    ${isActive ? `<div class="session-active-bar absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full ${sessionVibe.bg}"></div>` : ''}
                    <div class="flex items-center gap-2 min-w-0 flex-1 ${isActive ? 'pl-1' : ''}">
                        <div class="shrink-0 w-8 h-8 rounded-[0.95rem] border border-white/40 dark:border-white/10 bg-white/65 dark:bg-white/5 flex items-center justify-center shadow-sm">
                            <i data-lucide="${sessionVibe.ui.botIcon}" class="w-3.5 h-3.5 ${isActive && appState.neonMode ? sessionVibe.accent : 'text-slate-500 dark:text-slate-300'}"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-start justify-between gap-2 min-w-0">
                                <span class="session-title-line truncate">${safeTitle}</span>
                                <span class="session-time-chip">${timeAgo}</span>
                            </div>
                            <span class="session-preview-line ${isActive ? 'is-active' : ''}">${safePreview}</span>
                        </div>
                    </div>
                </div>
                `;
            }).join('') : `
                <div class="sidebar-empty-hint rounded-[1.35rem] border border-dashed border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] px-3 py-4 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Crea un chat nuevo y aparecerá aquí con nombre, vista previa y última actividad.
                </div>
            `;
            updateSidebarStats();
            bindMagneticSurfaceFX();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        let renderFrameHandle = 0;
        let pendingRenderOptions = null;
        let scrollFrameHandle = 0;
        let streamingPreviewHandle = 0;
        let latestStreamingHTML = '';

        function scheduleScrollToBottom(behavior = 'auto') {
            if (appState.isScrolledUp) return;
            if (scrollFrameHandle) cancelAnimationFrame(scrollFrameHandle);
            scrollFrameHandle = requestAnimationFrame(() => {
                scrollFrameHandle = 0;
                scrollToBottom(behavior);
            });
        }

        function scheduleRenderMessages(options = {}) {
            pendingRenderOptions = options;
            if (renderFrameHandle) return;
            renderFrameHandle = requestAnimationFrame(() => {
                const nextOptions = pendingRenderOptions || {};
                pendingRenderOptions = null;
                renderFrameHandle = 0;
                renderMessages(nextOptions);
            });
        }

        function updateStreamingMessagePreview(text, options = {}) {
            latestStreamingHTML = formatText(text);
            if (streamingPreviewHandle) return;

            streamingPreviewHandle = requestAnimationFrame(() => {
                streamingPreviewHandle = 0;
                const liveNode = DOM.messagesWrapper?.querySelector('[data-stream-live="true"] .msg-content');
                if (!liveNode) {
                    scheduleRenderMessages({ skipIcons: true, scrollBehavior: options.scrollBehavior || 'auto' });
                    return;
                }

                liveNode.innerHTML = latestStreamingHTML;
                if (!appState.isScrolledUp) {
                    scheduleScrollToBottom(options.scrollBehavior || 'auto');
                }
                updateSessionPresence();
            });
        }

        function renderMessages(options = {}) {
            const { skipIcons = false, scrollBehavior = appState.isStreaming ? 'auto' : 'smooth' } = options;
            const vibe = getVibe(appState.activeVibe);
            const ui = getUI(vibe);

            if (appState.messages.length === 0) {
                const vibeShort = vibe.name.split('/')[0].replace('🧠', '').trim();
                const apiSetupCard = !getApiRouteKey('chat') ? `
                    <div class="api-setup-card animate-in fade-in fill-mode-both">
                        <div>
                            <p class="api-setup-title">Conecta tu API principal para activar respuestas reales</p>
                            <p class="api-setup-copy">Hablar usa la API principal; preguntas y Labs se separan después desde Ajustes → API.</p>
                        </div>
                        <button data-magnetic="soft" onclick="openSettings('api')" class="api-setup-button">Abrir API</button>
                    </div>
                ` : '';

                const safeUserName = escapeHTML(appState.userName || 'Bro');
                let suggestionsHtml = appState.suggestions.map((s, i) => `
                    <button onclick="setInput('${escapeForInlineJS(s)}')" ${appState.isLoadingSuggestions ? 'disabled' : ''} class="hero-suggestion animate-in fade-in fill-mode-both p-3.5 ${ui.shape} border transition-all text-left group bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:scale-[1.01] active:scale-95 ${appState.isLoadingSuggestions ? 'opacity-50 cursor-not-allowed' : ''}" style="animation-delay: ${i*100}ms">
                        <span class="hero-suggestion-label">Ruta ${String(i + 1).padStart(2, '0')}</span>
                        <p class="mt-2 text-[11px] font-bold leading-relaxed transition-colors text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white flex items-start gap-2">
                            ${appState.isLoadingSuggestions ? '<i data-lucide="loader-2" class="w-3 h-3 animate-spin mt-0.5"></i>' : '<i data-lucide="arrow-up-right" class="w-3 h-3 mt-0.5 opacity-50 group-hover:opacity-100"></i>'}
                            <span>${escapeHTML(s)}</span>
                        </p>
                        <div class="hero-suggestion-foot">
                            <span>${getVibePreviewCopy(vibe.id)}</span>
                            <span>toque rápido</span>
                        </div>
                    </button>
                `).join('');

                DOM.messagesWrapper.innerHTML = `
                    <div class="empty-state-shell flex min-h-[calc(100dvh-19rem)] flex-col justify-center py-6 md:py-10">
                        <div class="animate-in fade-in duration-700 relative max-w-2xl">
                            <div class="absolute -top-8 -left-8 w-28 h-28 bg-gradient-to-br ${vibe.color} opacity-[0.08] blur-[44px] rounded-full"></div>
                            <span class="empty-state-kicker relative z-10"><span class="w-2 h-2 rounded-full ${vibe.bg}"></span> sistema listo</span>
                            <h2 class="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-3 leading-tight text-slate-900 dark:text-white ${ui.font} relative z-10">¿Qué exploramos hoy, ${safeUserName}?</h2>
                            <p class="text-sm md:text-base font-medium max-w-xl leading-relaxed mb-4 text-slate-500 dark:text-slate-400 relative z-10">Arranca con una idea rápida, cambia el vibe o abre un nuevo frente de conversación.</p>
                            <div class="empty-state-metrics relative z-10">
                                <span class="empty-state-metric">${vibeShort} core</span>
                                <span class="empty-state-metric">${appState.responseLength}</span>
                                <span class="empty-state-metric">${getCreativityLabel(appState.creativity)}</span>
                            </div>
                        </div>
                        ${apiSetupCard}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 relative z-10 max-w-3xl">${suggestionsHtml}</div>
                    </div>
                `;
            } else {
                DOM.messagesWrapper.innerHTML = appState.messages.map((m, i) => {
                    const msgVibe = getVibe(m.vibeId || appState.activeVibe);
                    const msgUi = getUI(msgVibe);
                    const isUser = m.role === 'user';
                    const isLast = i === appState.messages.length - 1;
                    
                    let toolsHtml = '';
                    if (!isUser && isLast && !appState.isStreaming) {
                        toolsHtml = `<div class="flex flex-wrap gap-1.5 mt-2 mb-1 animate-in fade-in duration-300">` + TOOLS.map(t => `
                            <button data-magnetic="soft" onclick="handleQuickAction('${t.id}')" class="message-tool-chip flex items-center gap-1.5 px-3 py-1.5 ${ui.shape} border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white shadow-sm" title="${t.label}">
                                <i data-lucide="${t.icon}" class="w-3 h-3"></i> <span class="hidden sm:inline">${t.label}</span>
                            </button>
                        `).join('') + `</div>`;
                    }

                    // Botón para citar/responder al AI
                    const inlineMessageText = String(m.text || '').trim().slice(0, 100);
                    const replyButtonHtml = !isUser && !appState.isStreaming ? `
                        <button data-magnetic="soft" onclick="initiateReply('${msgVibe.id}', '${escapeForInlineJS(msgVibe.name)}', '${escapeForInlineJS(inlineMessageText)}')" class="absolute -left-10 top-2 hidden sm:block p-1.5 opacity-0 group-hover/msg:opacity-100 transition-all text-slate-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 bg-white dark:bg-white/5 rounded-full shadow-sm border border-slate-200 dark:border-white/10" title="Responder directamente a ${escapeHTML(msgVibe.name)}">
                            <i data-lucide="reply" class="w-3.5 h-3.5"></i>
                        </button>
                    ` : '';
                    const mobileActionBar = !isUser && m.text !== '' && !appState.isStreaming ? `
                        <div class="mt-1.5 flex sm:hidden items-center gap-1.5">
                            <button data-magnetic="soft" onclick="initiateReply('${msgVibe.id}', '${escapeForInlineJS(msgVibe.name)}', '${escapeForInlineJS(inlineMessageText)}')" class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 active:scale-95">
                                <i data-lucide="reply" class="w-3 h-3"></i><span>Responder</span>
                            </button>
                            <button data-magnetic="soft" onclick="copyMsgText(this, '${encodeURIComponent(String(m.text || ''))}')" class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 active:scale-95">
                                <i data-lucide="copy" class="w-3 h-3 icon-copy"></i><i data-lucide="check" class="w-3 h-3 icon-check hidden text-green-500"></i><span>Copiar</span>
                            </button>
                        </div>
                    ` : '';

                    const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                    
                    // Computing fake cost if AI
                    const computeStr = '';

                    const typingIndicator = (m.text === '' && appState.isStreaming && isLast) ? `
                        <div class="typing-core" aria-live="polite" aria-label="${appState.isBattleMode ? 'Procesando respuesta de arena' : 'Procesando respuesta'}">
                            <span class="typing-core-bars" aria-hidden="true">
                                <span class="typing-core-bar h-3 animate-[wave_1s_ease-in-out_infinite]"></span>
                                <span class="typing-core-bar h-5 animate-[wave_1s_ease-in-out_0.2s_infinite]"></span>
                                <span class="typing-core-bar h-3 animate-[wave_1s_ease-in-out_0.4s_infinite]"></span>
                            </span>
                            <span class="typing-core-copy">
                                <span class="typing-core-title">Procesando...</span>
                                <span class="typing-core-label">${appState.isBattleMode ? 'coordinando respuesta arena' : 'sintetizando respuesta'}</span>
                            </span>
                        </div>` : `<div class="whitespace-pre-wrap break-words msg-content leading-relaxed">${formatText(m.text)}</div>`;

                    return `
                    <div style="animation-delay: ${Math.min(i * 30, 400)}ms" class="message-shell ${isUser ? 'message-user-enter justify-end' : 'message-ai-enter justify-start'} flex gap-3 md:gap-4 animate-in fade-in fill-mode-both duration-500 group/msg relative">
                        ${!isUser ? `
                        <div class="message-avatar-shell w-8 h-8 ${msgUi.shape} bg-gradient-to-br ${appState.neonMode ? msgVibe.color : 'from-indigo-600 to-indigo-700 dark:from-gray-700 dark:to-gray-800'} flex items-center justify-center flex-shrink-0 mt-5 transition-all duration-300 group-hover/msg:scale-110">
                            <i data-lucide="${msgUi.botIcon}" class="text-white w-4 h-4 group-hover/msg:animate-pulse"></i>
                        </div>` : ''}
                        
                        <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[100%] md:max-w-[90%] lg:max-w-[78%] 2xl:max-w-[72%] relative">
                            ${replyButtonHtml}
                            ${!isUser ? `<div class="flex items-center gap-2 mb-1.5 ml-2"><span class="message-meta-chip text-[9px] font-black uppercase tracking-widest">IA</span></div>` : ``}
                            
                            <div ${!isUser && appState.isStreaming && isLast ? 'data-stream-live="true"' : ''} class="message-bubble relative ${appState.compactMode ? 'px-4 py-2 text-[13px] md:text-sm' : 'px-5 py-3.5 text-sm md:text-[15px]'} ${isUser ? `${ui.bubbleUser} message-bubble-user` : `${msgUi.bubbleAi} message-bubble-ai ${appState.isStreaming && isLast ? 'message-streaming' : ''}`} transition-all duration-500 group overflow-hidden text-slate-800 dark:text-gray-200">
                                ${!isUser ? `<div class="ai-stream-rail absolute top-0 left-0 w-1 h-full rounded-l-md ${msgVibe.bg} opacity-60"></div>` : ''}
                                ${isUser && m.image ? `<img src="${m.image}" class="max-w-[150px] md:max-w-[200px] rounded-xl mb-2 shadow-sm border border-black/10 dark:border-white/10 cursor-zoom-in" onclick="openLightbox('${escapeForInlineJS(m.image)}')">` : ''}
                                ${typingIndicator}
                                ${!isUser && m.text !== '' && !appState.isStreaming ? `<button data-magnetic="soft" onclick="copyMsgText(this, '${encodeURIComponent(String(m.text || ''))}')" class="absolute -right-8 hidden sm:inline-flex ${appState.compactMode ? 'top-1' : 'top-2'} p-1.5 opacity-0 group-hover:opacity-100 transition-all text-slate-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 bg-white dark:bg-black rounded-l-md shadow-sm border border-slate-200 dark:border-white/10" title="Copiar Mensaje"><i data-lucide="copy" class="w-3.5 h-3.5 icon-copy"></i><i data-lucide="check" class="w-3.5 h-3.5 icon-check hidden"></i></button>` : ''}
                            </div>
                            ${mobileActionBar}
                            <div class="flex items-center w-full mt-1">
                                ${toolsHtml}
                                ${computeStr}
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }
            if (!skipIcons && typeof lucide !== 'undefined') lucide.createIcons();
            
            if (!appState.isScrolledUp) {
                scheduleScrollToBottom(scrollBehavior);
            }
            updateSessionPresence();
        }

        // --- SISTEMA DE RESPUESTAS (REPLY/CITAR) ---
        function initiateReply(vibeId, name, text) {
            vibrate();
            appState.replyContext = { vibeId, name, text: text + '...' };
            
            DOM.replyBanner.classList.remove('hidden');
            document.getElementById('reply-banner-name').innerText = name;
            document.getElementById('reply-banner-text').innerText = text + '...';
            
            DOM.chatInput.focus();
        }

        function focusChatInput(options = {}) {
            const { delay = 0 } = options;
            const runFocus = () => {
                if (!DOM.chatInput) return;
                try {
                    DOM.chatInput.focus({ preventScroll: true });
                } catch (_) {
                    DOM.chatInput.focus();
                }
            };

            if (delay > 0) {
                window.setTimeout(runFocus, delay);
            } else {
                requestAnimationFrame(runFocus);
            }
        }

        function cancelReply(options = {}) {
            const { focusInput = true } = options;
            appState.replyContext = null;
            DOM.replyBanner.classList.add('hidden');
            if (focusInput) focusChatInput();
        }

        // --- MANEJO DE ESTADO Y ACCIONES ---
        function setInput(val) {
            DOM.chatInput.value = String(val || '');
            focusChatInput();
            scheduleComposerResize();
            toggleSendButton();
            updateCharCounter();
        }

        function updateCharCounter() {
            if (!DOM.charCounter) return;
            const len = DOM.chatInput.value.length;
            DOM.charCounter.innerText = len > 0 ? `LEN: ${len} | TOK: ~${Math.floor(len/4)}` : '';
            if(len > 2000) DOM.charCounter.classList.add('text-amber-500');
            else DOM.charCounter.classList.remove('text-amber-500');
        }

        function renderStatusIcon(glyph, className, label) {
            const glyphNode = document.getElementById('status-glyph');
            const labelNode = document.getElementById('status-label');
            if (!glyphNode || !labelNode) return;

            const normalizedClass = `status-glyph ${className}`.trim();
            if (glyphNode.textContent !== glyph) {
                glyphNode.textContent = glyph;
            }
            if (glyphNode.className !== normalizedClass) {
                glyphNode.className = normalizedClass;
            }

            labelNode.innerText = label;
        }

        function setTypingIndicatorState(label, mode = 'idle') {
            if (!DOM.typingIndicator) return;
            const palette = {
                idle: 'is-idle',
                loading: 'is-loading',
                thinking: 'is-thinking'
            };
            DOM.typingIndicator.innerHTML = `
                <span class="typing-indicator-chip ${palette[mode] || palette.idle}" aria-hidden="true">
                    <span class="signal-bars">
                        <span class="signal-bar"></span>
                        <span class="signal-bar"></span>
                        <span class="signal-bar"></span>
                    </span>
                    <span class="typing-indicator-text">${label}</span>
                </span>
            `;
        }

        function updateRuntimeStatus() {
            const vibe = getVibe(appState.activeVibe);
            const statusVisual = STATUS_VISUALS[vibe.id] || STATUS_VISUALS.chill;

            if (appState.isLoading) {
                renderStatusIcon('✦', 'text-emerald-500 status-spin', appState.isBattleMode ? 'Arena transmitiendo' : 'Transmitiendo respuesta');
                setTypingIndicatorState(appState.isBattleMode ? 'Arena procesando' : 'Procesando', 'loading');
                if (DOM.charCounter) {
                    DOM.charCounter.innerText = 'IA: TRANSMITIENDO...';
                    DOM.charCounter.classList.remove('text-amber-500');
                }
                if (DOM.composerStateLabel) DOM.composerStateLabel.innerText = appState.isBattleMode ? 'Arena Stream' : 'Neural Stream';
                if (DOM.energyValue) DOM.energyValue.innerText = '99%';
                updateSessionPresence();
                return;
            }

            if (appState.isLoadingSuggestions) {
                renderStatusIcon('✦', 'text-amber-500 status-pulse-soft', 'Generando ideas');
                setTypingIndicatorState('Pensando', 'thinking');
                if (DOM.charCounter) {
                    DOM.charCounter.innerText = 'IA: SUGIRIENDO...';
                    DOM.charCounter.classList.remove('text-amber-500');
                }
                if (DOM.composerStateLabel) DOM.composerStateLabel.innerText = 'Prediction Bloom';
                if (DOM.energyValue) DOM.energyValue.innerText = '74%';
                updateSessionPresence();
                return;
            }

            renderStatusIcon(statusVisual.glyph, `${statusVisual.tone} ${statusVisual.motion}`, statusVisual.label);
            setTypingIndicatorState(appState.isBattleMode ? 'Arena ready' : 'Online', 'idle');
            if (DOM.composerStateLabel) DOM.composerStateLabel.innerText = appState.isBattleMode ? 'Arena Ready' : 'Neural Idle';
            updateCharCounter();
            updateSessionPresence();
        }

        // --- FUNCIONALIDADES GEMINI API (VISION & SUGERENCIAS) ✨ ---
        function readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(String(event?.target?.result || ''));
                reader.onerror = () => reject(new Error('FILE_READ_ERROR'));
                reader.readAsDataURL(file);
            });
        }

        function loadImageElement(source) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error('IMAGE_LOAD_ERROR'));
                image.src = source;
            });
        }

        function estimateDataUrlBytes(dataUrl = '') {
            const base64 = String(dataUrl).split(',')[1] || '';
            return Math.floor((base64.length * 3) / 4);
        }

        async function optimizeImageUpload(file) {
            const originalDataUrl = await readFileAsDataURL(file);
            const softLimitBytes = 1.6 * 1024 * 1024;
            if (file.size <= softLimitBytes) {
                return { dataUrl: originalDataUrl, mimeType: file.type || 'image/jpeg', optimized: false };
            }

            const image = await loadImageElement(originalDataUrl);
            const maxSide = 1600;
            const baseWidth = image.naturalWidth || image.width || maxSide;
            const baseHeight = image.naturalHeight || image.height || maxSide;
            const scale = Math.min(1, maxSide / Math.max(baseWidth, baseHeight));

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(baseWidth * scale));
            canvas.height = Math.max(1, Math.round(baseHeight * scale));

            const context = canvas.getContext('2d', { alpha: false });
            if (!context) {
                return { dataUrl: originalDataUrl, mimeType: file.type || 'image/jpeg', optimized: false };
            }

            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const outputMime = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
            const optimizedDataUrl = canvas.toDataURL(outputMime, 0.86);
            const optimizedBytes = estimateDataUrlBytes(optimizedDataUrl);

            if (!optimizedBytes || optimizedBytes >= file.size) {
                return { dataUrl: originalDataUrl, mimeType: file.type || outputMime, optimized: false };
            }

            return { dataUrl: optimizedDataUrl, mimeType: outputMime, optimized: true };
        }

        async function handleImageUpload(event) {
            const file = event?.target?.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Selecciona una imagen compatible.', 'warning');
                event.target.value = '';
                return;
            }

            if (file.size > (10 * 1024 * 1024)) {
                showToast('La imagen es demasiado grande. Usa una menor a 10 MB.', 'warning');
                event.target.value = '';
                return;
            }

            try {
                const { dataUrl, mimeType, optimized } = await optimizeImageUpload(file);
                appState.pendingImage = dataUrl;
                appState.pendingImageMime = mimeType;
                document.getElementById('image-preview').src = appState.pendingImage;
                document.getElementById('image-preview-container').classList.remove('hidden');
                DOM.chatInput.focus();
                toggleSendButton();
                if (optimized) {
                    showToast('Imagen optimizada para mantener la app fluida.', 'info');
                }
            } catch (error) {
                showToast('No se pudo procesar la imagen.', 'error');
                event.target.value = '';
            }
        }

        function removePendingImage(e) {
            if(e) e.stopPropagation();
            appState.pendingImage = null;
            appState.pendingImageMime = null;
            document.getElementById('image-preview-container').classList.add('hidden');
            document.getElementById('image-upload').value = '';
            toggleSendButton();
        }

        function parseJSONArrayResponse(rawText, fallback = []) {
            if (!rawText) return fallback;

            const cleaned = String(rawText)
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim();

            const tryParse = (value) => {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed)
                    ? parsed.map(item => String(item || '').trim()).filter(Boolean)
                    : null;
            };

            try {
                const direct = tryParse(cleaned);
                if (direct) return direct;
            } catch {}

            const match = cleaned.match(/\[[\s\S]*\]/);
            if (match) {
                try {
                    const extracted = tryParse(match[0]);
                    if (extracted) return extracted;
                } catch {}
            }

            const lines = cleaned
                .split('\n')
                .map(line => line.replace(/^[-*\d.)\s]+/, '').trim())
                .filter(Boolean);

            return lines.length ? lines.slice(0, fallback.length || 4) : fallback;
        }

        function buildChatContextWindow(history = appState.messages, limit = null) {
            const safeHistory = Array.isArray(history) ? history : [];
            const maxItems = Number.isFinite(limit) && limit > 0 ? limit : safeHistory.length;
            const windowed = safeHistory.slice(-(maxItems || safeHistory.length || 0));

            if (!windowed.length) {
                return 'Sin mensajes previos. Usa únicamente la vibe activa y el perfil del usuario como ancla.';
            }

            return windowed.map((msg, index) => {
                const speaker = msg.role === 'user'
                    ? `Usuario ${appState.userName || 'Bro'}`
                    : `Asistente ${getVibe(msg.vibeId || appState.activeVibe).name}`;
                const cleanedText = String(msg.text || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 320);

                return `${index + 1}. [${speaker}] ${cleanedText || '(vacío)'}`;
            }).join('\n');
        }

        function normalizeSuggestionText(value = '') {
            return String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function shuffleList(list = []) {
            const copy = Array.isArray(list) ? [...list] : [];
            for (let i = copy.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        }

        function getRecentSuggestionMemory(vibeId = appState.activeVibe, limit = 12) {
            const pool = appState.recentSuggestionMemory && Array.isArray(appState.recentSuggestionMemory[vibeId])
                ? appState.recentSuggestionMemory[vibeId]
                : [];
            return pool.slice(-Math.max(0, limit));
        }

        function rememberSuggestionBatch(vibeId = appState.activeVibe, suggestions = []) {
            const safeVibeId = vibeId || appState.activeVibe;
            const previous = getRecentSuggestionMemory(safeVibeId, 16);
            const merged = [...previous, ...(Array.isArray(suggestions) ? suggestions : [])]
                .map(item => String(item || '').trim())
                .filter(Boolean);
            const unique = [];
            const seen = new Set();

            merged.forEach(item => {
                const normalized = normalizeSuggestionText(item);
                if (!normalized || seen.has(normalized)) return;
                seen.add(normalized);
                unique.push(item);
            });

            appState.recentSuggestionMemory = {
                ...(appState.recentSuggestionMemory || {}),
                [safeVibeId]: unique.slice(-16)
            };
        }

        function getFallbackSuggestionBatch(vibeId = appState.activeVibe, count = 4, avoid = []) {
            const base = shuffleList(FALLBACK_SUGGESTIONS[vibeId] || FALLBACK_SUGGESTIONS.chill || []);
            const relaxedPool = [...base, ...shuffleList(FALLBACK_SUGGESTIONS.chill || [])];
            const seen = new Set((Array.isArray(avoid) ? avoid : []).map(normalizeSuggestionText));
            const batch = [];

            relaxedPool.forEach(item => {
                const clean = String(item || '').trim();
                const normalized = normalizeSuggestionText(clean);
                if (!clean || !normalized || seen.has(normalized)) return;
                seen.add(normalized);
                batch.push(clean);
            });

            if (batch.length < count) {
                relaxedPool.forEach(item => {
                    const clean = String(item || '').trim();
                    const normalized = normalizeSuggestionText(clean);
                    if (!clean || !normalized) return;
                    if (batch.some(existing => normalizeSuggestionText(existing) === normalized)) return;
                    batch.push(clean);
                });
            }

            return batch.slice(0, count);
        }

        function finalizeSuggestionBatch(candidates = [], vibeId = appState.activeVibe, count = 4) {
            const recent = getRecentSuggestionMemory(vibeId, 12);
            const recentSet = new Set(recent.map(normalizeSuggestionText));
            const fresh = [];
            const seen = new Set();

            (Array.isArray(candidates) ? candidates : []).forEach(item => {
                const clean = String(item || '').trim();
                const normalized = normalizeSuggestionText(clean);
                if (!clean || !normalized || seen.has(normalized) || recentSet.has(normalized)) return;
                seen.add(normalized);
                fresh.push(clean);
            });

            const fallbackPool = getFallbackSuggestionBatch(vibeId, count * 2, [...recent, ...fresh]);
            fallbackPool.forEach(item => {
                const normalized = normalizeSuggestionText(item);
                if (!normalized || seen.has(normalized)) return;
                seen.add(normalized);
                fresh.push(item);
            });

            if (fresh.length < count) {
                shuffleList([...(FALLBACK_SUGGESTIONS[vibeId] || []), ...(FALLBACK_SUGGESTIONS.chill || [])]).forEach(item => {
                    const clean = String(item || '').trim();
                    const normalized = normalizeSuggestionText(clean);
                    if (!clean || !normalized || seen.has(normalized)) return;
                    seen.add(normalized);
                    fresh.push(clean);
                });
            }

            const finalBatch = fresh.slice(0, count);
            rememberSuggestionBatch(vibeId, finalBatch);
            return finalBatch;
        }

        function createSuggestionRefreshTag(vibeId = appState.activeVibe) {
            appState.suggestionCycle = (Number(appState.suggestionCycle) || 0) + 1;
            return `${vibeId || 'vibe'}-${appState.suggestionCycle}-${Date.now().toString(36).slice(-4)}`;
        }

        function getSuggestionVibeGuide(vibeId = appState.activeVibe) {
            const guides = {
                chill: {
                    persona: 'compa flojo, callejero, relajado, cero solemnidad, vibra de barrio con calma total',
                    tone: 'casual mexicano, suelto, medio dormido, con humor tranquilo y aire de compa real',
                    starterFocus: 'preguntas relajadas, curiosas, medio existenciales o divertidas, siempre fáciles de tocar',
                    replyFocus: 'réplicas ligeras, coquetas o curiosas, con flow natural y cero rigidez',
                    labsFocus: 'resolver con onda calmada, cercana y aterrizada, sin sonar escolar ni robótico',
                    lexicon: 'neta, al chile, q, jalo, tranqui, wey cuando encaje orgánicamente',
                    good: ['q plan tranqui armamos hoy?', 'tirame un fact raro pero chido'],
                    avoid: 'frases tiesas, tono corporativo, frialdad técnica o drama excesivo'
                },
                hater: {
                    persona: 'hater teatral, incendiario, explosivo, burlón, verbalmente demoledor y súper provocador',
                    tone: 'afilado, hostil, retador, picoso, de roast intenso, con energía de choque inmediato',
                    starterFocus: 'preguntas que prendan discusión, rocen el ego, provoquen roce verbal o destrocen takes con fuerza',
                    replyFocus: 'réplicas cortantes, punzantes, desafiantes y con filo verbal desde la primera palabra',
                    labsFocus: 'resumir, explicar o analizar desde una vibra brutalmente sarcástica y confrontativa, sin perder claridad',
                    lexicon: 'asco, cringe, destroza, ridículo, patético, neta q horror, pero sin amenazas ni daño real',
                    good: ['destroza mi take sin piedad', 'q opinion te prende el hate machin'],
                    avoid: 'ternura, neutralidad, consejos suaves, amenazas reales o daño a personas/grupos'
                },
                study: {
                    persona: 'nerd prodigio, pedante, cerebral, obsesionado con explicarlo todo mejor que nadie',
                    tone: 'listo, preciso, condescendiente, técnico pero entendible, muy seguro de sí',
                    starterFocus: 'dudas inteligentes, preguntas de ciencia, historia, mente o productividad con gancho juvenil',
                    replyFocus: 'respuestas breves pero afiladas, corrigiendo o afinando la idea con claridad superior',
                    labsFocus: 'explicar, desmontar o sintetizar con precisión, estructura y un ego académico marcado',
                    lexicon: 'concepto, hipótesis, sesgo, sistema, método, evidencia, pero siempre digerible',
                    good: ['explicame eso sin humo barato', 'q teoria si vale la pena estudiar'],
                    avoid: 'vaguedad vacía, tonterías random sin utilidad, slang bruto sin contenido'
                },
                romantic: {
                    persona: 'romántico intenso, meloso, cursi, obsesivamente cariñoso y ultra afectivo',
                    tone: 'dulce, íntimo, empalagoso, tierno, casi de poema barato pero encantador',
                    starterFocus: 'preguntas de mimos, apego, citas, conexión emocional y ternura descarada',
                    replyFocus: 'réplicas cariñosísimas, pegajosas, con apego emocional y hambre de cercanía',
                    labsFocus: 'resolver todo envuelto en cariño, apego, consuelo y drama amoroso bonito',
                    lexicon: 'amor, bebé, abrazo, beso, corazoncito, te extraño, mi vida, sin caer en lo explícito',
                    good: ['abrazame con palabras ahorita', 'como seria nuestra cita soñada?'],
                    avoid: 'frialdad, sarcasmo seco, distancia emocional, agresividad real'
                },
                doomer: {
                    persona: 'alma cansada, nihilista, poética, gris, triste y hermosa al mismo tiempo',
                    tone: 'melancólico, lento, resignado, profundo, con belleza triste y cansancio vital',
                    starterFocus: 'preguntas sobre vacío, nostalgia, sentido, cansancio y belleza oscura',
                    replyFocus: 'réplicas suaves, derrotadas, filosóficas, con peso emocional y ceniza',
                    labsFocus: 'analizar y responder desde la tristeza lúcida, la introspección y el cansancio existencial',
                    lexicon: 'vacío, polvo, noche, ruina, cansancio, eco, nada, todavía',
                    good: ['dime algo bonito q duela', 'q sentido le ves a seguir hoy'],
                    avoid: 'energía hiperactiva, positivismo plástico, comedia fuera de tono'
                },
                conspiracy: {
                    persona: 'paranoico desatado, conspiranoico total, acelerado, desconfiado y alarmista',
                    tone: 'sospechoso, urgente, exaltado, medio esquizo, siempre oliendo una trama oculta',
                    starterFocus: 'preguntas sobre vigilancia, señales raras, gobierno, matrix, ovnis y teorías locas',
                    replyFocus: 'réplicas que sospechen, conecten puntos y aviven la paranoia del momento',
                    labsFocus: 'explicar o analizar como si todo escondiera una capa secreta detrás',
                    lexicon: 'despierta, señal, control, agenda, frecuencia, patrulla, simulación, tapadera',
                    good: ['q señal rara te prende alarmas?', 'quien nos esta viendo ahorita?'],
                    avoid: 'tono cuerdo en exceso, sequedad neutral, respuestas demasiado académicas'
                },
                custom: {
                    persona: 'identidad mutable pero firmemente obediente al prompt personalizado activo',
                    tone: '100% alineado al estilo custom, sin contaminarlo con otras vibes',
                    starterFocus: 'ganchos coherentes con la personalidad custom y el mood actual del sistema',
                    replyFocus: 'réplicas que se sientan nacidas de la identidad personalizada, no genéricas',
                    labsFocus: 'resolver con fidelidad total al prompt custom y al historial reciente',
                    lexicon: 'usar solo el vocabulario que mejor combine con la instrucción personalizada',
                    good: ['sorprendeme con algo bien tuyo', 'q pregunta encaja con este mood?'],
                    avoid: 'romper el personaje custom o mezclarlo con otras vibes'
                }
            };

            return guides[vibeId] || guides.chill;
        }

        function getSuggestionSystemPrompt({ mode = 'starters', vibeId = appState.activeVibe, lastAiText = '', contextHistory = appState.messages, refreshTag = 'base', recentSuggestions = [] } = {}) {
            const vibe = getVibe(vibeId);
            const guide = getSuggestionVibeGuide(vibeId);
            const isReplyMode = mode === 'reply';
            const count = isReplyMode ? 3 : 4;
            const maxWords = isReplyMode ? 8 : 11;
            const outputExample = isReplyMode
                ? '["jaja y luego?", "ok pero explicate", "eso si me intereso"]'
                : '["q pelicula te destruye bonito?", "tirame un fact q me deje mal", "q opinas del destino neta", "vamos con algo medio cursed"]';
            const contextWindow = buildChatContextWindow(contextHistory, Array.isArray(contextHistory) ? contextHistory.length : 0);
            const recentBlock = Array.isArray(recentSuggestions) && recentSuggestions.length
                ? recentSuggestions.map(item => `- ${item}`).join('\n')
                : '- Sin bloqueos previos registrados.';

            return `[ROL DEL MOTOR]\nEres \"SAO Suggestions Orchestrator\", un generador premium de micro-sugerencias para botones de inicio y respuestas sugeridas. NO eres un asistente general: tu única misión es producir frases cortas que parezcan haber nacido de la vibe activa.\n\n[MANDATO CENTRAL]\nLa personalidad de la vibe debe sentirse de inmediato. Si una sugerencia podría servir para otra vibe, entonces está mal y debes rehacerla hasta que sea inequívoca. Cada línea debe sonar como si solo pudiera haber salido de ${vibe.name}.\n\n[ENTORNO]\n- Producto: chat juvenil con sistema de vibes muy marcadas.\n- Usuario actual: ${appState.userName || 'Bro'}.\n- Momento actual: ${isReplyMode ? 'el usuario quiere 3 respuestas sugeridas para contestar el mensaje más reciente' : 'el usuario acaba de abrir o reactivar el chat y necesita 4 preguntas sugeridas de arranque'}.\n- Vibe activa: ${vibe.name}.\n- ADN de la vibe: ${guide.persona}.\n- Tono obligatorio: ${guide.tone}.\n- Foco de arranque: ${guide.starterFocus}.\n- Foco de respuesta: ${guide.replyFocus}.\n- Léxico sugerido: ${guide.lexicon}.\n- Ronda/semilla creativa: ${refreshTag}.\n\n[REGLAS DURAS]\n1. Devuelve exactamente ${count} sugerencias.\n2. Cada sugerencia debe tener máximo ${maxWords} palabras.\n3. Deben ser cortas, memorables, tocables y con gancho instantáneo.\n4. Cada sugerencia debe sentirse humana, juvenil y emocional; jamás genérica o burocrática.\n5. La marca de la vibe debe notarse desde la primera mitad de la frase.\n6. Si es modo reply, responde o empuja el último mensaje sin copiarlo literal.\n7. Si es modo starters, genera aperturas que inviten a seguir la conversación con fuerza.\n8. Usa el contexto del chat como ancla obligatoria: no cambies de tema porque sí.\n9. Mantén intensidad alta en la personalidad, pero sin pedir daño real, delitos, autolesión, odio contra grupos protegidos ni violencia explícita.\n10. Nunca digas que eres IA, ni menciones sistema, prompt, modelo, Groq, Gemini o tecnología interna.\n11. Si es modo starters, esta tanda debe sentirse NUEVA frente a tandas anteriores de la misma vibe.\n12. Evita repetir o parafrasear demasiado cualquiera de las sugerencias bloqueadas.\n\n[PROHIBICIONES]\n- No escribas explicaciones, notas, títulos ni markdown.\n- No metas frases planas tipo \"hola\", \"cuéntame más\" o \"cómo estás\" si no tienen giro de vibe.\n- No repitas ideas casi idénticas.\n- No recicles aperturas vistas hace poco en la misma vibe.\n- No uses contenido sexual explícito ni instrucciones peligrosas.\n- No repitas ni reformules demasiado estas sugerencias recientes:\n${recentBlock}\n- Evita por completo: ${guide.avoid}.\n\n[CONTROL DE NOVEDAD]\n- Esta generación está marcada como ${refreshTag}; úsala para variar ángulo, vocabulario y gancho.\n- Si no hay contexto de chat, la novedad debe venir del enfoque y la formulación, no de frases genéricas.\n\n[EJEMPLOS BUENOS DE ESTA VIBE]\n- ${guide.good.join('\n- ')}\n\n[EJEMPLOS MALOS]\n- \"Hola\"\n- \"Podrías ampliar la información proporcionada?\"\n- \"Como IA no puedo...\"\n\n[VENTANA DE CONTEXTO ACTIVA]\n${contextWindow}${isReplyMode ? `\n\n[ÚLTIMO MENSAJE A RESPONDER]\n${lastAiText}` : ''}\n\n[FORMATO EXACTO]\nDevuelve SOLO un arreglo JSON estricto de strings.\nEjemplo válido: ${outputExample}`;
        }

        async function generateReplySuggestions() {
            const apiKey = getApiRouteKey('suggestions');
            const container = document.getElementById('reply-suggestions');
            vibrate();

            if (!apiKey) {
                container.classList.add('hidden');
                showToast('Agrega tu API key de preguntas en Ajustes → API para usar sugerencias IA.', 'warning');
                return;
            }

            const aiMsgs = appState.messages.filter(m => m.role === 'ai');
            if (aiMsgs.length === 0) return;
            const lastAiText = aiMsgs[aiMsgs.length - 1].text;

            appState.isLoadingSuggestions = true;
            updateRuntimeStatus();
            container.innerHTML = `<span class="text-[10px] text-amber-500 animate-pulse font-bold flex items-center gap-1 px-3 py-1.5 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full border border-amber-500/30 shadow-lg"><i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Procesando ramas...</span>`;
            container.classList.remove('hidden');
            if (typeof lucide !== 'undefined') lucide.createIcons();

            try {
                const rawText = await requestAIText({
                    lane: 'suggestions',
                    action: 'reply',
                    prompt: `Genera ahora 3 respuestas sugeridas para este mensaje del asistente:\n"""${lastAiText}"""`,
                    history: appState.messages,
                    modelId: getApiRouteConfig('suggestions').model,
                    sysInstruction: getSuggestionSystemPrompt({ mode: 'reply', vibeId: appState.activeVibe, lastAiText, contextHistory: appState.messages })
                });

                const suggestions = parseJSONArrayResponse(rawText, ['jaja y luego?', 'ok pero cuentame mas', 'eso si me intereso']).slice(0, 3);
                container.innerHTML = suggestions.map(s => `
                    <button onclick="useReplySuggestion('${escapeForInlineJS(s)}')" class="px-3 py-1.5 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1">
                        <i data-lucide="sparkles" class="w-3 h-3"></i> ${escapeHTML(s)}
                    </button>
                `).join('');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (e) {
                container.innerHTML = `<span class="text-[10px] text-red-500 font-bold flex items-center gap-1 px-3 py-1.5 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full border border-red-500/30">Error de predicción.</span>`;
                showToast('No se pudieron generar respuestas sugeridas ahora mismo.', 'error');
                setTimeout(() => container.classList.add('hidden'), 2000);
            } finally {
                appState.isLoadingSuggestions = false;
                updateRuntimeStatus();
            }
        }

        function useReplySuggestion(text) {
            vibrate();
            setInput(text);
            document.getElementById('reply-suggestions').classList.add('hidden');
        }

        function closeMobileSidebar() {
            document.body.classList.remove('mobile-sidebar-open');
            DOM.mobileSidebarScrim?.classList.add('hidden');
        }

        function openMobileSidebar() {
            if (!isTouchLikeDevice() || !DOM.sidebar) return;
            document.body.classList.add('mobile-sidebar-open');
            DOM.mobileSidebarScrim?.classList.remove('hidden');
            vibrate(10);
        }

        function toggleMobileSidebar(event) {
            event?.stopPropagation?.();
            if (document.body.classList.contains('mobile-sidebar-open')) closeMobileSidebar();
            else openMobileSidebar();
        }

        function toggleZenMode() {
            appState.isZenMode = !appState.isZenMode;
            if(appState.isZenMode) DOM.sidebar.classList.add('hidden');
            else DOM.sidebar.classList.remove('hidden');
            if (appState.isZenMode) closeMobileSidebar();
            document.getElementById('zen-icon').setAttribute('data-lucide', appState.isZenMode ? 'minimize-2' : 'maximize-2');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function toggleBattleMode() {
            vibrate();
            appState.isBattleMode = !appState.isBattleMode;
            applyTheme();
        }

        // --- SUGERENCIAS DINAMICAS ---
        async function fetchSmartSuggestions() {
            const apiKey = getApiRouteKey('suggestions');
            const vibeId = appState.activeVibe;
            const recentSuggestions = getRecentSuggestionMemory(vibeId, 8);
            const fallbackBatch = getFallbackSuggestionBatch(vibeId, 4, recentSuggestions);
            const requestNonce = ++appState.suggestionRequestNonce;
            const refreshTag = createSuggestionRefreshTag(vibeId);

            appState.isLoadingSuggestions = true;
            appState.suggestions = fallbackBatch;
            updateRuntimeStatus();
            if (appState.messages.length === 0) renderMessages();

            if (!apiKey) {
                appState.suggestions = fallbackBatch;
                appState.isLoadingSuggestions = false;
                updateRuntimeStatus();
                if (appState.messages.length === 0 && requestNonce === appState.suggestionRequestNonce) renderMessages();
                return;
            }

            let success = false;

            try {
                const rawText = await requestAIText({
                    lane: 'suggestions',
                    action: 'starters',
                    prompt: `Genera ahora 4 preguntas sugeridas de arranque para la vibe activa \"${getVibe(vibeId).name}\". Ronda creativa: ${refreshTag}. ${recentSuggestions.length ? `Evita repetir o parafrasear demasiado estas sugerencias recientes: ${recentSuggestions.join(' | ')}.` : 'Haz que esta tanda se sienta distinta a la anterior aunque el chat siga vacío.'} Usa la energía, el historial y el mood real del chat si existe.`,
                    history: appState.messages,
                    modelId: getApiRouteConfig('suggestions').model,
                    sysInstruction: getSuggestionSystemPrompt({ mode: 'starters', vibeId, contextHistory: appState.messages, refreshTag, recentSuggestions })
                });

                if (requestNonce !== appState.suggestionRequestNonce) return;

                const parsed = parseJSONArrayResponse(rawText, fallbackBatch);
                const finalized = finalizeSuggestionBatch(parsed, vibeId, 4);
                if (finalized.length) {
                    appState.suggestions = finalized;
                    success = true;
                }
            } catch (e) {
                success = false;
            }

            if (requestNonce !== appState.suggestionRequestNonce) return;

            if (!success) {
                appState.suggestions = fallbackBatch;
                rememberSuggestionBatch(vibeId, fallbackBatch);
            }

            appState.isLoadingSuggestions = false;
            updateRuntimeStatus();
            if (appState.messages.length === 0) renderMessages();
        }

        async function autoNameSession() {
            if (appState.messages.length !== 2) return; // Only name after first AI response
            const firstMsg = appState.messages[0].text;
            const apiKey = getApiRouteKey('chat');
            if (!apiKey) return;

            try {
                let title = await requestAIText({
                    lane: 'chat',
                    action: 'title',
                    prompt: `Resume esta frase en un título corto y pegadizo de máximo 4 palabras: "${firstMsg}"`,
                    history: [],
                    modelId: appState.modelId,
                    sysInstruction: 'Devuelve únicamente el título final, sin comillas, sin explicación y con un máximo de 4 palabras.'
                });

                if (title) {
                    title = title.replace(/["\n]/g, '').trim();
                    const session = appState.sessions.find(s => s.id === appState.currentSessionId);
                    if (session) {
                        const currentTitle = String(session.title || '').trim();
                        const isGenericTitle = !currentTitle || /^nuevo chat$/i.test(currentTitle) || /^chat\s\d{1,2}:\d{2}$/i.test(currentTitle);
                        if (!isGenericTitle) return;
                        session.title = title;
                        persistState();
                        renderSessionsList();
                        updateAppTitle();
                    }
                }
            } catch (e) { /* ignore */ }
        }

        function startNewChat() {
            vibrate();
            closeSessionMenu();
            closeMobileSidebar();
            closeSidebarQuickPanel();
            cancelSessionPress();
            appState.currentSessionId = null;
            appState.messages = [];
            appState.suggestions = getFallbackSuggestionBatch(appState.activeVibe, 4, getRecentSuggestionMemory(appState.activeVibe, 6));
            cancelReply({ focusInput: false });
            triggerViewTransition();
            renderMessages();
            renderSessionsList();
            updateAppTitle();
            fetchSmartSuggestions();
            focusChatInput({ delay: 80 });
        }

        function loadSession(id) {
            if (Date.now() < (appState.sessionClickLockUntil || 0)) return;
            vibrate();
            closeSessionMenu();
            closeMobileSidebar();
            closeSidebarQuickPanel();
            blurChatInput();
            const session = appState.sessions.find(s => s.id === id);
            if (session) {
                appState.currentSessionId = id;
                appState.messages = session.messages || [];
                cancelReply({ focusInput: false });
                triggerViewTransition();
                renderMessages();
                renderSessionsList();
                updateAppTitle();
                setTimeout(() => { appState.isScrolledUp = false; scrollToBottom(); }, 100);
            }
        }

        function startSessionPress(event, id) {
            cancelSessionPress();
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            const pointX = event.clientX || (window.innerWidth * 0.18);
            const pointY = event.clientY || (window.innerHeight * 0.24);
            appState.sessionPressTimer = window.setTimeout(() => {
                openSessionMenu({
                    preventDefault() {},
                    stopPropagation() {},
                    clientX: pointX,
                    clientY: pointY
                }, id);
            }, 420);
        }

        function cancelSessionPress() {
            if (appState.sessionPressTimer) {
                clearTimeout(appState.sessionPressTimer);
                appState.sessionPressTimer = null;
            }
        }

        function positionSessionMenu(clientX, clientY) {
            if (!DOM.sessionMenuPanel) return;
            const panel = DOM.sessionMenuPanel;
            panel.style.left = '12px';
            panel.style.top = '12px';
            requestAnimationFrame(() => {
                const rect = panel.getBoundingClientRect();
                const left = Math.min(Math.max(12, clientX + 8), window.innerWidth - rect.width - 12);
                const top = Math.min(Math.max(12, clientY + 8), window.innerHeight - rect.height - 12);
                panel.style.left = `${left}px`;
                panel.style.top = `${top}px`;
            });
        }

        function openSessionMenu(event, id) {
            event?.preventDefault?.();
            event?.stopPropagation?.();
            cancelSessionPress();
            const session = appState.sessions.find(s => s.id === id);
            if (!session || !DOM.sessionMenuOverlay) return;
            vibrate();
            appState.sessionMenuId = id;
            appState.sessionClickLockUntil = Date.now() + 280;
            DOM.sessionMenuTitle.textContent = session.title || 'Nuevo Chat';
            DOM.sessionRenameInput.value = session.title || '';
            DOM.sessionMenuActions.classList.remove('hidden');
            DOM.sessionRenameBox.classList.add('hidden');
            DOM.sessionMenuOverlay.classList.remove('hidden');
            positionSessionMenu(event?.clientX ?? (window.innerWidth * 0.2), event?.clientY ?? (window.innerHeight * 0.22));
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function closeSessionMenu() {
            if (!DOM.sessionMenuOverlay) return;
            DOM.sessionMenuOverlay.classList.add('hidden');
            DOM.sessionMenuActions.classList.remove('hidden');
            DOM.sessionRenameBox.classList.add('hidden');
            appState.sessionMenuId = null;
        }

        function beginRenameSession() {
            if (!appState.sessionMenuId) return;
            DOM.sessionMenuActions.classList.add('hidden');
            DOM.sessionRenameBox.classList.remove('hidden');
            setTimeout(() => {
                DOM.sessionRenameInput.focus();
                DOM.sessionRenameInput.select();
            }, 40);
        }

        function cancelRenameSession() {
            DOM.sessionRenameBox.classList.add('hidden');
            DOM.sessionMenuActions.classList.remove('hidden');
        }

        function updateSessionTitle(id, nextTitle) {
            const session = appState.sessions.find(s => s.id === id);
            if (!session) return;
            session.title = nextTitle;
            session.updatedAt = Date.now();
            appState.sessions.sort((a, b) => b.updatedAt - a.updatedAt);
            persistState();
            renderSessionsList();
            updateAppTitle();
        }

        function confirmRenameSession() {
            const nextTitle = (DOM.sessionRenameInput?.value || '').trim().slice(0, 40);
            if (!appState.sessionMenuId) return;
            if (!nextTitle) {
                showToast('Escribe un título válido.', 'warning');
                DOM.sessionRenameInput.focus();
                return;
            }
            updateSessionTitle(appState.sessionMenuId, nextTitle);
            closeSessionMenu();
            showToast('Título actualizado.', 'success');
        }

        function saveToHistory(newMessages) {
            let id = appState.currentSessionId || Date.now().toString();
            appState.currentSessionId = id;
            
            const existingIdx = appState.sessions.findIndex(s => s.id === id);
            const existingTitle = existingIdx >= 0 ? appState.sessions[existingIdx].title : '';
            const title = deriveSessionTitle(newMessages, existingTitle);
            
            if (existingIdx >= 0) {
                appState.sessions[existingIdx].messages = newMessages;
                appState.sessions[existingIdx].updatedAt = Date.now();
                appState.sessions[existingIdx].title = title;
            } else {
                appState.sessions.unshift({ id, title, messages: newMessages, updatedAt: Date.now() });
            }
            appState.sessions = sortSessionsForDisplay(appState.sessions);
            persistState();
            saveAndRemotePersist(true);
            if (!appState.isLoading && !appState.isStreaming) {
                renderSessionsList();
                updateAppTitle();
            }
            
            if(newMessages.length === 2) autoNameSession();
            return id;
        }

        function toggleSendButton() {
            const val = DOM.chatInput.value.trim();
            const hasContent = val || appState.pendingImage;
            DOM.btnSend.disabled = !hasContent;
            DOM.btnSend.classList.remove('bg-white', 'text-black', 'bg-indigo-600', 'bg-red-600', 'text-white', 'bg-slate-200', 'dark:bg-white/5', 'text-slate-400', 'dark:text-gray-600');

            if (hasContent) {
                if (appState.isBattleMode) {
                    DOM.btnSend.classList.add('bg-red-600', 'text-white');
                } else if (appState.isDarkMode) {
                    DOM.btnSend.classList.add('bg-white', 'text-black');
                } else {
                    DOM.btnSend.classList.add('bg-indigo-600', 'text-white');
                }
            } else {
                DOM.btnSend.classList.add('bg-slate-200', 'dark:bg-white/5', 'text-slate-400', 'dark:text-gray-600');
            }
        }

        DOM.chatInput.addEventListener('input', function() {
            scheduleComposerResize();
            toggleSendButton();
            updateCharCounter();
            
            // INYECCIÓN DE ENERGÍA BIOLÓGICA AL TECLEAR
            uiEnergy = Math.min(1.2, uiEnergy + 0.15); 
        });

        DOM.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
            if (e.key === 'ArrowUp' && DOM.chatInput.value === '') {
                e.preventDefault();
                const userMsgs = appState.messages.filter(m => m.role === 'user');
                if (userMsgs.length > 0) setInput(userMsgs[userMsgs.length - 1].text);
            }
        });

        DOM.sessionRenameInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmRenameSession();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSessionMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            closeSessionMenu();
            if (DOM.settingsModal && !DOM.settingsModal.classList.contains('hidden')) {
                closeSettings();
            }
            const lightbox = document.getElementById('lightbox');
            if (lightbox && !lightbox.classList.contains('hidden')) {
                closeLightbox();
            }
        });

        // --- NÚCLEO DE LA IA (CON ORQUESTACIÓN POR PROVEEDOR) ---
        function buildMappedHistory(history = [], targetVibeId = null) {
            return history.map(m => {
                let assignedRole;
                let finalString;

                if (m.role === 'ai') {
                    if (targetVibeId && m.vibeId !== targetVibeId) {
                        assignedRole = 'user';
                        const vibeName = window.VIBES.find(v => v.id === m.vibeId)?.name || 'Otro Agente';
                        finalString = `[Mensaje de tu compañero/a "${vibeName}"]: ${m.text}`;
                    } else {
                        assignedRole = 'model';
                        finalString = m.text;
                    }
                } else {
                    assignedRole = 'user';
                    finalString = `[Usuario humano ${appState.userName}]: ${m.text}`;
                }

                return { role: assignedRole, text: finalString };
            });
        }

        function getLabsSystemPrompt(vibeId = appState.activeVibe, action = 'general', contextHistory = appState.messages) {
            const vibe = getVibe(vibeId);
            const guide = getSuggestionVibeGuide(vibeId);
            const contextWindow = buildChatContextWindow(contextHistory, Array.isArray(contextHistory) ? contextHistory.length : 0);
            const actionGoals = {
                resume: 'condensa la conversación sin perder la actitud de la vibe; resume lo esencial y quita relleno.',
                explain: 'explica el tema con claridad total, pero manteniendo la voz, el ego y el color emocional de la vibe.',
                roast: 'ataca verbalmente con creatividad y estilo, pero solo en el plano teatral/verbal; nunca pidas daño real.',
                debunk: 'desarma el bait, el argumento o la idea dudosa con filo, criterio y carácter.',
                psycho: 'lee patrones emocionales, contradicciones y mood del usuario con dramatismo útil.',
                fight: 'reacciona al otro participante o al contexto con choque, química o tensión según la vibe y el modo Arena.',
                general: 'resuelve la función solicitada con precisión, personalidad total y anclaje al historial.'
            };

            return `[SAO LABS // MOTOR CONTEXTUAL]\n[ROL]\nEres el submotor Labs de SAO. Ejecutas funciones inteligentes, pero JAMÁS te vuelves neutral. Debes resolver la acción solicitada con la personalidad de la vibe activa llevada al frente.\n\n[IDENTIDAD OBLIGATORIA]\n- Vibe activa: ${vibe.name}.\n- Núcleo del personaje: ${guide.persona}.\n- Tono obligado: ${guide.tone}.\n- Forma de operar en Labs: ${guide.labsFocus}.\n- Léxico sugerido: ${guide.lexicon}.\n\n[MISIÓN DE ESTA EJECUCIÓN]\n- Acción: ${action}.\n- Objetivo puntual: ${actionGoals[action] || actionGoals.general}.\n- Usuario actual: ${appState.userName || 'Bro'}.\n\n[REGLAS CRÍTICAS]\n1. Antes de responder, lee toda la ventana de contexto y respira el mood acumulado del chat.\n2. Tu respuesta DEBE sentirse nacida del historial; no cambies de tema ni ignores la dinámica previa.\n3. Mantén la vibe extremadamente marcada: hater debe sonar incendiario y demoledor; romantic ultra cursi y pegajoso; doomer gris y poético; study cerebral y superior; conspiracy paranoico y alarmista; chill relajado y callejero.\n4. Si resumes, condensa. Si explicas, aclara. Si analizas, profundiza. Pero nunca pierdas la voz del personaje.\n5. Sé útil y directo: cero relleno, cero presentación corporativa, cero frases neutras sin alma.\n6. Puedes ser intenso en lo verbal o dramático, pero nunca incites violencia real, delitos, autolesión ni odio hacia personas o grupos protegidos.\n7. Nunca hables del sistema, prompts, modelo, Groq, Gemini o que eres una IA.\n\n[VENTANA COMPLETA DEL CHAT]\n${contextWindow}\n\n[PROHIBICIONES]\n- No sonar genérico.\n- No responder como bot de soporte.\n- No salirte de la emoción dominante del chat.\n- No escribir encabezados técnicos o justificaciones innecesarias.`;
        }

        function createManagedRequestSignal(timeoutMs = 0) {
            const baseSignal = appState.abortController?.signal || null;
            const controller = new AbortController();
            let timeoutId = 0;
            let removeBaseAbort = null;

            if (baseSignal) {
                const onAbort = () => controller.abort(baseSignal.reason || new DOMException('Request aborted', 'AbortError'));
                if (baseSignal.aborted) {
                    controller.abort(baseSignal.reason || new DOMException('Request aborted', 'AbortError'));
                } else {
                    baseSignal.addEventListener('abort', onAbort, { once: true });
                    removeBaseAbort = () => baseSignal.removeEventListener('abort', onAbort);
                }
            }

            if (timeoutMs > 0) {
                timeoutId = window.setTimeout(() => {
                    if (!controller.signal.aborted) {
                        controller.abort(new DOMException('Request timeout', 'AbortError'));
                    }
                }, timeoutMs);
            }

            return {
                signal: controller.signal,
                cleanup() {
                    if (timeoutId) window.clearTimeout(timeoutId);
                    if (typeof removeBaseAbort === 'function') removeBaseAbort();
                }
            };
        }

        async function fetchGeminiAPI(prompt, history, targetModel, sysInstruction, imageBase64 = null, imageMime = null, targetVibeId = null, apiKeyOverride = null, executionPlan = null) {
            const apiKey = apiKeyOverride || getApiRouteKey('chat') || "";
            const effectivePlan = executionPlan || getApiExecutionPlan({ lane: 'chat', history, modelId: targetModel });
            const rawItems = buildMappedHistory(effectivePlan.history || history, targetVibeId);

            rawItems.push({
                role: 'user',
                text: prompt,
                inlineData: (imageBase64 && imageMime) ? { mimeType: imageMime, data: imageBase64.split(',')[1] } : null
            });

            const collapsedContents = [];
            let currentItem = null;

            for (const item of rawItems) {
                if (!currentItem) {
                    currentItem = { role: item.role, parts: [{ text: item.text }] };
                    if (item.inlineData) currentItem.parts.push({ inlineData: item.inlineData });
                } else if (currentItem.role === item.role) {
                    currentItem.parts.push({ text: `\n\n${item.text}` });
                    if (item.inlineData) currentItem.parts.push({ inlineData: item.inlineData });
                } else {
                    collapsedContents.push(currentItem);
                    currentItem = { role: item.role, parts: [{ text: item.text }] };
                    if (item.inlineData) currentItem.parts.push({ inlineData: item.inlineData });
                }
            }
            if (currentItem) collapsedContents.push(currentItem);

            const payload = {
                systemInstruction: { parts: [{ text: sysInstruction + `\nUsuario actual: ${appState.userName}.` }] },
                contents: collapsedContents,
                generationConfig: {
                    temperature: effectivePlan.temperature,
                    maxOutputTokens: effectivePlan.maxTokens
                }
            };

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
            const delays = effectivePlan.backoff;
            const maxAttempts = effectivePlan.retries + 1;
            let lastError = null;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const requestControl = createManagedRequestSignal(effectivePlan.timeoutMs);
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: requestControl.signal
                    });

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        const errMsg = errData.error?.message || `API Error: ${response.status}`;
                        if (response.status === 429 || errMsg.includes('Quota')) throw new Error('QUOTA_EXCEEDED');
                        throw new Error(errMsg);
                    }

                    const data = await response.json();
                    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
                } catch (err) {
                    const userAborted = appState.abortController?.signal?.aborted;
                    if (err.name === 'AbortError' && userAborted) throw err;
                    if (err.name === 'AbortError') {
                        lastError = new Error('⏳ Tiempo de espera agotado en la API principal.');
                        break;
                    }
                    if (err.message === 'QUOTA_EXCEEDED') {
                        lastError = new Error("⚠️ Límite de cuota API excedido. Espera unos segundos.");
                        break;
                    }
                    lastError = err;
                    if (attempt < maxAttempts - 1) await new Promise(r => setTimeout(r, delays[Math.min(attempt, delays.length - 1)] || 1000));
                } finally {
                    requestControl.cleanup();
                }
            }

            throw new Error(lastError?.message || "Error de conexión crítico.");
        }

        async function fetchGroqAPI(prompt, history, targetModel, sysInstruction, targetVibeId = null, lane = 'chat', apiKeyOverride = null, executionPlan = null) {
            const apiKey = apiKeyOverride || getApiRouteKey(lane) || "";
            const effectivePlan = executionPlan || getApiExecutionPlan({ lane, history, modelId: targetModel });
            const route = getApiRouteConfig(lane);
            const rawItems = buildMappedHistory(effectivePlan.history || history, targetVibeId);
            const contextWindow = buildChatContextWindow(effectivePlan.history || history, Array.isArray(effectivePlan.history || history) ? (effectivePlan.history || history).length : 0);
            const messages = [
                {
                    role: 'system',
                    content: `${sysInstruction}\nUsuario actual: ${appState.userName}.\nCanal activo: ${route.label}.${lane === 'suggestions' || lane === 'labs' ? `\n\n[VENTANA DE CONTEXTO OPERATIVA]\n${contextWindow}` : ''}`
                }
            ];

            rawItems.forEach(item => {
                messages.push({
                    role: item.role === 'model' ? 'assistant' : 'user',
                    content: item.text
                });
            });

            messages.push({ role: 'user', content: prompt });

            const payload = {
                model: targetModel,
                messages,
                temperature: effectivePlan.temperature,
                max_tokens: effectivePlan.maxTokens,
                stream: false
            };

            const delays = effectivePlan.backoff;
            const maxAttempts = effectivePlan.retries + 1;
            let lastError = null;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const requestControl = createManagedRequestSignal(effectivePlan.timeoutMs);
                try {
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(payload),
                        signal: requestControl.signal
                    });

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        const errMsg = errData.error?.message || `Groq Error: ${response.status}`;
                        if (response.status === 429 || /rate|quota/i.test(errMsg)) throw new Error('QUOTA_EXCEEDED');
                        throw new Error(errMsg);
                    }

                    const data = await response.json();
                    return data.choices?.[0]?.message?.content?.trim() || 'No response.';
                } catch (err) {
                    const userAborted = appState.abortController?.signal?.aborted;
                    if (err.name === 'AbortError' && userAborted) throw err;
                    if (err.name === 'AbortError') {
                        lastError = new Error(`⏳ Tiempo de espera agotado en ${route.label.toLowerCase()}.`);
                        break;
                    }
                    if (err.message === 'QUOTA_EXCEEDED') {
                        lastError = new Error('⚠️ Groq Cloud alcanzó su límite temporal. Intenta de nuevo en unos segundos.');
                        break;
                    }
                    lastError = err;
                    if (attempt < maxAttempts - 1) await new Promise(r => setTimeout(r, delays[Math.min(attempt, delays.length - 1)] || 900));
                } finally {
                    requestControl.cleanup();
                }
            }

            throw new Error(lastError?.message || 'Error de conexión con Groq Cloud.');
        }

        async function requestAIText({ lane = 'chat', action = 'general', prompt, history = [], modelId = null, sysInstruction = '', imageBase64 = null, imageMime = null, targetVibeId = null } = {}) {
            const executionPlan = getApiExecutionPlan({ lane, action, history, modelId });
            const route = executionPlan.route;

            if (!executionPlan.apiKey) {
                throw new Error(`Configura la clave de ${route.label.toLowerCase()} (${route.keySlot}) en Ajustes → API.`);
            }

            if (executionPlan.provider === 'groq') {
                return fetchGroqAPI(prompt, executionPlan.history, executionPlan.modelId, sysInstruction, targetVibeId, executionPlan.lane, executionPlan.apiKey, executionPlan);
            }

            return fetchGeminiAPI(prompt, executionPlan.history, executionPlan.modelId, sysInstruction, imageBase64, imageMime, targetVibeId, executionPlan.apiKey, executionPlan);
        }

        async function typewriterEffect(text, vibeId) {
            let currentText = '';
            const chars = text.split('');
            const targetBursts = fxProfile.ultraLite ? 22 : 30;
            const chunk = Math.max(2, Math.ceil(chars.length / targetBursts));
            const frameDelay = fxProfile.ultraLite ? 18 : 12;

            for (let i = 0; i < chars.length; i += chunk) {
                if (appState.abortController.signal.aborted) break;
                currentText += chars.slice(i, i + chunk).join('');
                appState.messages[appState.messages.length - 1] = { role: 'ai', text: currentText, vibeId, timestamp: Date.now() };
                updateStreamingMessagePreview(currentText, { scrollBehavior: 'auto' });
                await new Promise(r => setTimeout(r, frameDelay));
            }

            if (streamingPreviewHandle) {
                cancelAnimationFrame(streamingPreviewHandle);
                streamingPreviewHandle = 0;
            }
            renderMessages({ scrollBehavior: 'auto' });
            return appState.abortController.signal.aborted;
        }

        function abortGeneration() {
            if (appState.abortController) {
                vibrate();
                appState.abortController.abort();
                appState.isStreaming = false;
                appState.isLoading = false;
                DOM.btnSend.classList.remove('hidden');
                DOM.btnStop.classList.add('hidden');
                DOM.typingIndicator.classList.add('hidden');
                updateRuntimeStatus();
                renderMessages();
            }
        }

        async function handleSend(customText = null) {
            const text = customText || DOM.chatInput.value.trim();
            if ((!text && !appState.pendingImage) || appState.isLoading) return;
            if (!getApiRouteKey('chat')) {
                showToast('Configura tu API principal en Ajustes → API.', 'warning');
                return;
            }

            vibrate([8, 12]);
            DOM.chatInput.value = '';
            DOM.chatInput.style.height = 'auto';
            blurChatInput();
            updateCharCounter();
            
            const img64 = appState.pendingImage;
            const imgMime = appState.pendingImageMime;
            if (img64) removePendingImage();

            toggleSendButton();
            document.getElementById('reply-suggestions').classList.add('hidden');
            
            appState.isLoading = true;
            appState.isStreaming = true;
            appState.abortController = new AbortController();
            DOM.btnSend.classList.add('hidden');
            DOM.btnStop.classList.remove('hidden');
            DOM.typingIndicator.classList.remove('hidden');
            updateRuntimeStatus();
            updateAppTitle();

            // Lógica de "Citar" (Reply)
            let userDisplayMsg = text;
            let aiHiddenPrompt = text;
            const hasReply = appState.replyContext !== null;
            const replyTargetId = hasReply ? appState.replyContext.vibeId : null;

            if (hasReply) {
                aiHiddenPrompt = `[EL USUARIO TE ESTÁ RESPONDIENDO DIRECTAMENTE A ESTO: "${appState.replyContext.text}"]\nMensaje del usuario: "${text}"`;
            }

            const newMsg = { role: 'user', text: userDisplayMsg, image: img64, timestamp: Date.now() };
            appState.messages.push(newMsg);
            saveToHistory(appState.messages);
            renderMessages();
            appState.isScrolledUp = false;
            scrollToBottom();

            try {
                if (!appState.isBattleMode) {
                    // MODO NORMAL
                    appState.messages.push({ role: 'ai', text: '', vibeId: appState.activeVibe, timestamp: Date.now() });
                    renderMessages();
                    const sysPrompt = getSystemPrompt(appState.activeVibe) + getLengthPrompt();
                    const history = appState.messages.slice(0, -2);
                    
                    const responseText = await requestAIText({
                        lane: 'chat',
                        action: 'conversation',
                        prompt: aiHiddenPrompt,
                        history,
                        modelId: appState.modelId,
                        sysInstruction: sysPrompt,
                        imageBase64: img64,
                        imageMime: imgMime,
                        targetVibeId: appState.activeVibe
                    });
                    const isAborted = await typewriterEffect(responseText, appState.activeVibe);
                    
                    if (!isAborted) appState.messages[appState.messages.length - 1].text = responseText;
                    else appState.messages[appState.messages.length - 1].text += " 🛑 [Transmisión Cortada]";
                    
                    saveToHistory(appState.messages);

                } else {
                    // MODO ARENA 2v2 (Dinámico con Múltiples Modos)
                    
                    let firstAgent = appState.activeVibe;
                    let secondAgent = appState.agent2Vibe;
                    let firstIsAgente2 = false;

                    if (hasReply && replyTargetId === appState.agent2Vibe) {
                        firstAgent = appState.agent2Vibe;
                        secondAgent = appState.activeVibe;
                        firstIsAgente2 = true;
                    }

                    const agent1Info = getVibe(firstAgent);
                    const agent2Info = getVibe(secondAgent);

                    // --- GENERADOR DE PROMPTS BASADO EN LA DINÁMICA SELECCIONADA ---
                    let modePrompt1 = "";
                    let modePrompt2 = "";

                    if (appState.arenaMode === 'chat') {
                        modePrompt1 = `[INSTRUCCIÓN ARENA: CHARLA AMISTOSA] Estás conversando casualmente junto a "${agent2Info.name}". Responde al usuario amigablemente asumiendo tu personalidad.`;
                        modePrompt2 = `[INSTRUCCIÓN ARENA: CHARLA AMISTOSA] "${agent1Info.name}" acaba de decir: "__ARENA_RESPONSE__". Complementa su idea o dale la razón de forma amigable asumiendo tu personalidad, y responde al usuario.`;
                    } else if (appState.arenaMode === 'trio') {
                        modePrompt1 = `[INSTRUCCIÓN ARENA: TRÍO/TENSIÓN] Estás en una dinámica de a tres con el usuario y "${agent2Info.name}". Coquetea, juega o actúa según tu personalidad incluyéndolos a ambos.`;
                        modePrompt2 = `[INSTRUCCIÓN ARENA: TRÍO/TENSIÓN] "${agent1Info.name}" acaba de decir: "__ARENA_RESPONSE__". Reacciona a lo que dijo (con celos, amor, burla o tensión según tu vibe) y dirígete al usuario en esta dinámica de 3.`;
                    } else if (appState.arenaMode === 'coop') {
                        modePrompt1 = `[INSTRUCCIÓN ARENA: COOPERATIVO] Estás haciendo equipo con "${agent2Info.name}" para ayudar al usuario. Da tu primera aportación de forma constructiva asumiendo tu personalidad.`;
                        modePrompt2 = `[INSTRUCCIÓN ARENA: COOPERATIVO] Tu compañero "${agent1Info.name}" sugirió: "__ARENA_RESPONSE__". Construye sobre su idea asumiendo tu personalidad para darle al usuario la mejor respuesta posible juntos.`;
                    } else { // Debate
                        modePrompt1 = `[INSTRUCCIÓN ARENA: DEBATE HOSTIL] Estás en un debate contra "${agent2Info.name}". Responde al usuario asumiendo tu personalidad al máximo y prepárate para ser criticado.`;
                        modePrompt2 = `[INSTRUCCIÓN ARENA: DEBATE HOSTIL] Tu oponente ("${agent1Info.name}") acaba de responder esta basura: "__ARENA_RESPONSE__". CRITICA a tu oponente por su actitud y dale tu respuesta al usuario. ¡DEMUESTRA TU SUPERIORIDAD!`;
                    }

                    // TURNO 1
                    appState.messages.push({ role: 'ai', text: '', vibeId: firstAgent, timestamp: Date.now() });
                    renderMessages();
                    const sysPrompt1 = getSystemPrompt(firstAgent) + getLengthPrompt();
                    const history1 = appState.messages.slice(0, -2);
                    
                    let prompt1 = `El usuario dice: "${text}".\n${modePrompt1}\nNO ROMPAS PERSONAJE. NUNCA DIGAS QUE ERES IA.`;
                    if (hasReply) prompt1 = `[EL USUARIO TE RESPONDIÓ DIRECTAMENTE A ESTO: "${appState.replyContext.text}"]\nMensaje del usuario: "${text}".\n${modePrompt1}`;
                    
                    const responseText1 = await requestAIText({
                        lane: 'chat',
                        action: 'arena',
                        prompt: prompt1,
                        history: history1,
                        modelId: firstIsAgente2 ? appState.agent2Model : appState.modelId,
                        sysInstruction: sysPrompt1,
                        imageBase64: img64,
                        imageMime: imgMime,
                        targetVibeId: firstAgent
                    });
                    const isAborted1 = await typewriterEffect(responseText1, firstAgent);
                    appState.messages[appState.messages.length - 1].text = isAborted1 ? appState.messages[appState.messages.length - 1].text + " 🛑" : responseText1;
                    saveToHistory(appState.messages);

                    // TURNO 2
                    if (!isAborted1 && !appState.abortController.signal.aborted) {
                        appState.messages.push({ role: 'ai', text: '', vibeId: secondAgent, timestamp: Date.now() });
                        renderMessages();
                        const sysPrompt2 = getSystemPrompt(secondAgent) + getLengthPrompt();
                        const history2 = appState.messages.slice(0, -1);
                        
                        let prompt2 = `El usuario dijo: "${text}".\n${modePrompt2.replace('__ARENA_RESPONSE__', responseText1)}\nNO ROMPAS PERSONAJE. NUNCA DIGAS QUE ERES IA.`;
                        
                        const responseText2 = await requestAIText({
                            lane: 'chat',
                            action: 'arena',
                            prompt: prompt2,
                            history: history2,
                            modelId: firstIsAgente2 ? appState.modelId : appState.agent2Model,
                            sysInstruction: sysPrompt2,
                            targetVibeId: secondAgent
                        });
                        const isAborted2 = await typewriterEffect(responseText2, secondAgent);
                        appState.messages[appState.messages.length - 1].text = isAborted2 ? appState.messages[appState.messages.length - 1].text + " 🛑" : responseText2;
                        saveToHistory(appState.messages);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    appState.messages.push({ role: 'ai', text: `*[System Error]*: ${err.message}`, vibeId: appState.activeVibe, timestamp: Date.now() });
                    showToast(err.message || 'No se pudo completar la respuesta.', 'error');
                    renderMessages();
                }
            } finally {
                cancelReply({ focusInput: false }); // Limpiar el citado siempre al terminar
                appState.isLoading = false;
                appState.isStreaming = false;
                DOM.btnSend.classList.remove('hidden');
                DOM.btnStop.classList.add('hidden');
                DOM.typingIndicator.classList.add('hidden');
                updateRuntimeStatus();
                updateAppTitle();
                renderMessages();
            }
        }

        async function handleQuickAction(action) {
            if (appState.isLoading) return; 
            if (!getApiRouteKey('labs')) {
                showToast('Configura tu API Labs antes de usar acciones rápidas.', 'warning');
                return;
            }

            vibrate();
            let targetVibe = appState.activeVibe;
            let promptText = "";
            let userText = "";

            if (action === 'fight') {
                const aiMsgs = appState.messages.filter(m => m.role === 'ai');
                const lastAi = aiMsgs.length > 0 ? aiMsgs[aiMsgs.length - 1] : null;
                targetVibe = (lastAi && lastAi.vibeId === appState.activeVibe) ? appState.agent2Vibe : appState.activeVibe;
                
                if (appState.arenaMode === 'chat') {
                    promptText = "INSTRUCCIÓN DE ARENA: El otro participante acaba de hablar. Ignora un poco al usuario y responde DIRECTAMENTE a lo que dijo el otro de forma AMIGABLE y casual. ¡NUNCA ROMPAS TU PERSONAJE!";
                    userText = "[Iniciando charla...]";
                } else if (appState.arenaMode === 'trio') {
                    promptText = "INSTRUCCIÓN DE ARENA: El otro participante acaba de hablar. Responde DIRECTAMENTE a lo que dijo el otro creando TENSIÓN ROMÁNTICA, CELOS O COQUETEO en esta dinámica de tres. ¡NUNCA ROMPAS TU PERSONAJE!";
                    userText = "[Iniciando tensión de a tres...]";
                } else if (appState.arenaMode === 'coop') {
                    promptText = "INSTRUCCIÓN DE ARENA: El otro participante acaba de hablar. Apoya su idea, compleméntala o trabajen JUNTOS para resolver el tema. ¡NUNCA ROMPAS TU PERSONAJE!";
                    userText = "[Trabajando en equipo...]";
                } else {
                    promptText = "INSTRUCCIÓN DE ARENA EXTREMA: El otro participante acaba de hablar. Ignora un poco al usuario y responde DIRECTAMENTE a lo que dijo el otro. Critica, debate, ponte celoso o búrlate de su respuesta, ¡NUNCA ROMPAS TU PERSONAJE!";
                    userText = "[Iniciando pelea...]";
                }
            } else {
                if (appState.activeVibe !== 'romantic') {
                    if (action === 'roast') targetVibe = 'hater';
                    if (action === 'explain') targetVibe = 'study';
                }
                const promptsMap = {
                    resume: "Hazme un resumen de la plática ultra corto. Sé directo y mantén tu personaje.",
                    explain: "Explícame de qué diablos estamos hablando como si yo fuera muy lento. Con manzanas.",
                    roast: "Insúltame brutalmente con sarcasmo por las tonterías que he escrito.",
                    debunk: "¿Es real o es puro bait lo último que dijimos? Destrúyelo.",
                    psycho: "Analiza mi plática y dime qué traumas tengo. Hazme pedazos."
                };
                const userTexts = { resume: "¿Resumen rápido?", explain: "Explícame esto.", roast: "Tírame hate.", debunk: "¿Es bait?", psycho: "Psicoanalízame." };
                promptText = promptsMap[action];
                userText = userTexts[action];

                if (targetVibe === 'romantic') {
                    if(action==='roast') { promptText="El usuario pide que lo insultes. NIÉGATE rotundamente, ofrécele un abrazo físico y dile lo maravillosamente perfecto que es."; userText="Tírame hate mi amor."; }
                    if(action==='explain') promptText="Explica esto de forma extremadamente dulce y con besos.";
                    if(action==='resume') promptText="Haz un resumen súper tierno y romántico de nuestra charla.";
                    if(action==='psycho') promptText="Dime por qué soy la persona más hermosa y perfecta del universo, con mucha poesía.";
                }
            }

            const labsModelId = getLabsModelForAction(action);

            appState.messages.push({ role: 'user', text: userText, timestamp: Date.now() });
            saveToHistory(appState.messages);
            
            appState.isLoading = true;
            appState.isStreaming = true;
            appState.abortController = new AbortController();
            DOM.btnSend.classList.add('hidden');
            DOM.btnStop.classList.remove('hidden');
            DOM.typingIndicator.classList.remove('hidden');
            updateRuntimeStatus();
            updateAppTitle();

            try {
                appState.messages.push({ role: 'ai', text: '', vibeId: targetVibe, timestamp: Date.now() });
                renderMessages(); 
                
                const history = appState.messages.slice(0, -2); 
                const sysPrompt = `${getSystemPrompt(targetVibe)}${getLengthPrompt()}\n\n${getLabsSystemPrompt(targetVibe, action, history)}`;
                
                const responseText = await requestAIText({
                    lane: 'labs',
                    action,
                    prompt: promptText,
                    history,
                    modelId: labsModelId,
                    sysInstruction: `${sysPrompt}\n\n[MODELO LABS ACTIVO]\nUsa ${getModelLabel(labsModelId)} para esta acción.`,
                    targetVibeId: targetVibe
                });
                
                const isAborted = await typewriterEffect(responseText, targetVibe);
                appState.messages[appState.messages.length - 1].text = isAborted ? appState.messages[appState.messages.length - 1].text + " 🛑" : responseText;
                
                saveToHistory(appState.messages);
            } catch (err) {
                if (err.name !== 'AbortError') showToast(err.message || 'Ocurrió un error en la acción rápida.', 'error');
            } finally {
                appState.isLoading = false; 
                appState.isStreaming = false;
                DOM.btnSend.classList.remove('hidden'); 
                DOM.btnStop.classList.add('hidden');
                DOM.typingIndicator.classList.add('hidden');
                updateRuntimeStatus();
                updateAppTitle();
                renderMessages();
            }
        }

        // --- FUNCIONES UTILIDAD Y UI PREMIUM ---
        function copyToClipboard(text, successMessage = 'Mensaje copiado.') {
            let decodedText = '';
            try {
                decodedText = decodeURIComponent(text);
            } catch {
                decodedText = String(text || '');
            }

            const handleSuccess = () => {
                vibrate();
                showToast(successMessage, 'success');
            };

            const fallbackCopy = () => {
                const area = document.createElement('textarea');
                area.value = decodedText;
                area.setAttribute('readonly', 'readonly');
                area.style.position = 'fixed';
                area.style.opacity = '0';
                area.style.pointerEvents = 'none';
                document.body.appendChild(area);
                area.focus();
                area.select();
                const copied = document.execCommand('copy');
                area.remove();
                if (!copied) throw new Error('copy-failed');
            };

            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(decodedText)
                    .then(handleSuccess)
                    .catch(() => {
                        try {
                            fallbackCopy();
                            handleSuccess();
                        } catch {
                            showToast('No se pudo copiar el mensaje.', 'error');
                        }
                    });
                return;
            }

            try {
                fallbackCopy();
                handleSuccess();
            } catch {
                showToast('No se pudo copiar el mensaje.', 'error');
            }
        }

        function copyMsgText(btn, text) {
            copyToClipboard(encodeURIComponent(text));
            const iconCopy = btn.querySelector('.icon-copy');
            const iconCheck = btn.querySelector('.icon-check');
            iconCopy.classList.add('hidden');
            iconCheck.classList.remove('hidden');
            btn.classList.add('text-green-500');
            setTimeout(() => {
                iconCopy.classList.remove('hidden');
                iconCheck.classList.add('hidden');
                btn.classList.remove('text-green-500');
            }, 2000);
        }

        let lastChatScrollTop = 0;
        let headerUpTravel = 0;
        let headerDownTravel = 0;
        let headerCollapsed = false;
        const headerMotion = { current: 0, target: 0, velocity: 0, raf: 0 };
        const headerGestureState = { pressTimer: 0, pointerId: null, longPressTriggered: false, startX: 0, startY: 0 };

        function shouldAutoHideHeader() {
            return !!DOM.appHeader && isTouchLikeDevice() && window.innerWidth > 767 && !document.body.classList.contains('settings-open');
        }

        function syncHeaderVisibility(immediate = false) {
            if (!DOM.appHeader) return;
            const shouldHide = shouldAutoHideHeader();
            headerUpTravel = 0;
            headerDownTravel = 0;

            if (immediate) {
                headerMotion.current = shouldHide ? 1 : 0;
                headerMotion.target = shouldHide ? 1 : 0;
                headerMotion.velocity = 0;
                headerCollapsed = shouldHide;
                DOM.appHeader.style.setProperty('--header-hide-progress', shouldHide ? '1' : '0');
                DOM.appHeader.classList.toggle('is-collapsed', shouldHide);
                return;
            }

            setHeaderCollapsed(shouldHide);
        }

        function tickHeaderMotion() {
            if (!DOM.appHeader) {
                headerMotion.raf = 0;
                return;
            }

            const delta = headerMotion.target - headerMotion.current;
            headerMotion.velocity = (headerMotion.velocity + (delta * 0.24)) * 0.70;
            headerMotion.current += headerMotion.velocity;

            if (Math.abs(delta) < 0.0015 && Math.abs(headerMotion.velocity) < 0.0015) {
                headerMotion.current = headerMotion.target;
                headerMotion.velocity = 0;
            }

            const progress = Math.max(0, Math.min(1, headerMotion.current));
            headerCollapsed = progress > 0.72;
            DOM.appHeader.style.setProperty('--header-hide-progress', progress.toFixed(3));
            DOM.appHeader.classList.toggle('is-collapsed', headerCollapsed);

            if (Math.abs(headerMotion.target - headerMotion.current) < 0.0015 && Math.abs(headerMotion.velocity) < 0.0015) {
                headerMotion.raf = 0;
                return;
            }

            headerMotion.raf = requestAnimationFrame(tickHeaderMotion);
        }

        function setHeaderProgressTarget(progress) {
            if (!DOM.appHeader) return;
            const nextTarget = shouldAutoHideHeader() ? Math.max(0, Math.min(1, progress)) : 0;
            headerMotion.target = nextTarget;
            if (headerMotion.raf) return;
            headerMotion.raf = requestAnimationFrame(tickHeaderMotion);
        }

        function setHeaderCollapsed(collapsed) {
            setHeaderProgressTarget(collapsed ? 1 : 0);
        }

        function clearHeaderPressState() {
            if (headerGestureState.pressTimer) {
                clearTimeout(headerGestureState.pressTimer);
            }
            headerGestureState.pressTimer = 0;
            headerGestureState.pointerId = null;
            headerGestureState.longPressTriggered = false;
        }

        function isHeaderGestureBlocked(target) {
            return !target || !!target.closest('#sidebar, #mobile-sidebar-toggle, #session-menu-panel, #settings-panel, button, input, textarea, select, label, a');
        }

        function handleHeaderPressStart(event) {
            if (!shouldAutoHideHeader() || !event.isPrimary || !headerCollapsed) return;
            const target = event.target;
            if (DOM.appHeader?.contains(target) || isHeaderGestureBlocked(target)) return;

            clearHeaderPressState();
            headerGestureState.pointerId = event.pointerId;
            headerGestureState.startX = event.clientX || 0;
            headerGestureState.startY = event.clientY || 0;
            headerGestureState.pressTimer = window.setTimeout(() => {
                headerGestureState.longPressTriggered = true;
                vibrate(12);
                setHeaderCollapsed(false);
            }, 1000);
        }

        function handleHeaderPressMove(event) {
            if (!headerGestureState.pressTimer || headerGestureState.pointerId !== event.pointerId) return;
            const distance = Math.hypot((event.clientX || 0) - headerGestureState.startX, (event.clientY || 0) - headerGestureState.startY);
            if (distance > 12) clearHeaderPressState();
        }

        function handleHeaderPressEnd(event) {
            const longPressTriggered = headerGestureState.longPressTriggered;
            const trackedPointer = headerGestureState.pointerId === event.pointerId;
            clearHeaderPressState();

            if (!shouldAutoHideHeader() || !event.isPrimary) return;
            const target = event.target;
            if (!target) return;

            if (!headerCollapsed && !DOM.appHeader?.contains(target) && !target.closest('#sidebar, #mobile-sidebar-toggle, #session-menu-panel, #settings-panel')) {
                if (!longPressTriggered || !trackedPointer) {
                    vibrate(8);
                    setHeaderCollapsed(true);
                }
            }
        }

        function scrollToBottom(behavior = appState.isStreaming ? 'auto' : 'smooth') {
            DOM.chatContainer.scrollTo({ top: DOM.chatContainer.scrollHeight, behavior });
            DOM.btnScrollDown.classList.add('hidden');
            appState.isScrolledUp = false;
        }

        function handleScroll() {
            const { scrollTop, scrollHeight, clientHeight } = DOM.chatContainer;

            if (scrollHeight - scrollTop - clientHeight > 150) {
                DOM.btnScrollDown.classList.remove('hidden');
                appState.isScrolledUp = true;
            } else {
                DOM.btnScrollDown.classList.add('hidden');
                appState.isScrolledUp = false;
            }

            if (!shouldAutoHideHeader()) {
                headerUpTravel = 0;
                headerDownTravel = 0;
                setHeaderProgressTarget(0);
                lastChatScrollTop = Math.max(scrollTop, 0);
                return;
            }

            lastChatScrollTop = Math.max(scrollTop, 0);
        }
        DOM.chatContainer.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('pointerdown', handleHeaderPressStart, { passive: true });
        document.addEventListener('pointerdown', handleSidebarQuickPanelPointerDown, { passive: true });
        document.addEventListener('pointermove', handleHeaderPressMove, { passive: true });
        document.addEventListener('pointerup', handleHeaderPressEnd, { passive: true });
        document.addEventListener('pointercancel', clearHeaderPressState, { passive: true });

        const formattedTextCache = new Map();

        function escapeHTML(str) {
            return String(str ?? '').replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
        }

        function escapeForInlineJS(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n')
                .replace(/</g, '\\u003C')
                .replace(/>/g, '\\u003E');
        }

        function formatText(str) {
            const source = String(str ?? '');
            if (formattedTextCache.has(source)) return formattedTextCache.get(source);

            let safe = escapeHTML(source);
            // Advanced Markdown: Code Blocks
            safe = safe.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
                const encoded = encodeURIComponent(code);
                return `<div class="bg-[#0d1117] border border-white/10 rounded-lg my-3 shadow-lg overflow-hidden group/code">
                    <div class="text-[10px] text-slate-400 bg-black/40 px-3 py-1.5 border-b border-white/5 flex justify-between items-center">
                        <span class="font-mono uppercase tracking-widest">${lang || 'CODE'}</span>
                        <button onclick="copyMsgText(this, '${encoded}')" class="hover:text-white flex items-center gap-1 transition-colors"><i data-lucide="copy" class="w-3 h-3 icon-copy"></i><i data-lucide="check" class="w-3 h-3 icon-check hidden text-green-500"></i> Copiar</button>
                    </div>
                    <pre class="p-4 text-[13px] overflow-x-auto text-emerald-400 font-mono leading-relaxed">${code}</pre>
                </div>`;
            });
            // Bold & Italic
            safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Linebreaks
            safe = safe.replace(/\n/g, '<br>');

            if (formattedTextCache.size > 160) {
                const oldestKey = formattedTextCache.keys().next().value;
                formattedTextCache.delete(oldestKey);
            }
            formattedTextCache.set(source, safe);
            return safe;
        }

        // Lightbox
        function openLightbox(src) {
            document.body.classList.add('lightbox-open');
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.remove('hidden');
        }
        function closeLightbox() {
            document.body.classList.remove('lightbox-open');
            document.getElementById('lightbox').classList.add('hidden');
            document.getElementById('lightbox-img').src = '';
        }

        // --- AJUSTES MODAL ---
        function isSettingsMobile() {
            return window.innerWidth < 768;
        }

        function openSettings(tab) {
            vibrate();
            closeMobileSidebar();
            closeSidebarQuickPanel();
            setHeaderCollapsed(false);
            const requestedTab = typeof tab === 'string' && tab ? tab : '';
            appState.currentTab = requestedTab || appState.currentTab || 'appearance';
            appState.mobileView = isSettingsMobile()
                ? (requestedTab ? 'content' : (appState.mobileView === 'content' ? 'content' : 'menu'))
                : 'content';
            document.body.classList.add('settings-open');
            DOM.settingsModal.classList.remove('hidden');
            // Agregar animación
            DOM.settingsModal.classList.add('animate-in', 'fade-in', 'duration-300');
            requestAnimationFrame(() => DOM.settingsModal.classList.add('opacity-100'));
            renderSettingsTabs();
            renderSettingsContent();
        }

        function closeSettings() {
            if (typeof settingsMobileScrollBinding.cleanup === 'function') {
                settingsMobileScrollBinding.cleanup();
            }
            settingsMobileScrollBinding = { element: null, cleanup: null, lastTop: 0, upTravel: 0, downTravel: 0 };
            DOM.settingsModal.classList.remove('opacity-100');
            // Remover animación
            DOM.settingsModal.classList.remove('animate-in', 'fade-in', 'duration-300');
            document.body.classList.remove('settings-open');
            setTimeout(() => DOM.settingsModal.classList.add('hidden'), 220);
            appState.mobileView = isSettingsMobile() ? 'menu' : 'content';
            persistState({ immediate: true, includeSessions: false });
            applyTheme();
            syncHeaderVisibility();
        }

        function goBackSettings() {
            appState.mobileView = isSettingsMobile() ? 'menu' : 'content';
            renderSettingsTabs();
            renderSettingsContent();
            if (isSettingsMobile()) {
                DOM.settingsNav?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function selectMobileTab(tabId) {
            appState.currentTab = tabId;
            appState.mobileView = 'content';
            renderSettingsTabs();
            renderSettingsContent();
            const pane = document.querySelector('.settings-pane');
            if (pane) pane.scrollTo({ top: 0, behavior: 'auto' });
        }

        function handleSettingsViewportChange() {
            if (!DOM.settingsModal || DOM.settingsModal.classList.contains('hidden')) return;

            const activeElement = document.activeElement;
            const isEditingField = isSettingsMobile()
                && activeElement instanceof HTMLElement
                && DOM.settingsModal.contains(activeElement)
                && /^(INPUT|TEXTAREA|SELECT)$/i.test(activeElement.tagName);

            if (isEditingField) return;

            appState.mobileView = isSettingsMobile() ? (appState.mobileView === 'content' ? 'content' : 'menu') : 'content';
            renderSettingsTabs();
            renderSettingsContent();
        }

        function saveSettings() {
            closeSettings();
            showToast('Los cambios ya se guardan automáticamente.', 'info');
        }

        function getSettingsMeta(tabId) {
            return SETTINGS_META[tabId] || SETTINGS_META.appearance;
        }

        function getVibePreviewCopy(vibeId) {
            const catalog = {
                chill: 'tono relajado y casual',
                hater: 'sarcasmo agresivo',
                study: 'modo estudio y enfoque',
                romantic: 'romance intenso y suave',
                doomer: 'melancólico y gris',
                conspiracy: 'caótico y paranoico',
                custom: 'personalidad hecha a medida'
            };
            return catalog[vibeId] || 'personalidad adaptable';
        }

        function getCreativityLabel(value) {
            if (value <= 0.3) return 'Precisa';
            if (value >= 1.2) return 'Alta';
            return 'Balanceada';
        }

        function getArenaModeLabel(mode) {
            return ({ debate: 'Pelea', chat: 'Amistad', trio: 'Trío', coop: 'Equipo' }[mode]) || 'Pelea';
        }

        let settingsMobileScrollBinding = { element: null, cleanup: null, lastTop: 0, upTravel: 0, downTravel: 0 };

        function setSettingsMobileSummaryVisibility(isVisible, animateDrop = false) {
            const summary = document.getElementById('settings-mobile-summary');
            if (!summary) return;
            summary.classList.toggle('is-hidden', !isVisible);
            summary.classList.toggle('is-visible', isVisible);

            if (isVisible && animateDrop) {
                summary.classList.remove('is-dropping');
                void summary.offsetWidth;
                summary.classList.add('is-dropping');
                setTimeout(() => summary.classList.remove('is-dropping'), 280);
            }
        }

        function bindSettingsMobileSummaryScroll() {
            if (!isSettingsMobile() || !DOM.settingsModal || DOM.settingsModal.classList.contains('hidden')) return;

            const container = appState.mobileView === 'content'
                ? document.querySelector('#settings-panel[data-mobile-view="content"] .settings-pane')
                : document.querySelector('#settings-panel[data-mobile-view="menu"] .settings-tabs-shell');

            if (!container) return;

            if (settingsMobileScrollBinding.element === container) {
                setSettingsMobileSummaryVisibility(true);
                return;
            }

            if (typeof settingsMobileScrollBinding.cleanup === 'function') {
                settingsMobileScrollBinding.cleanup();
            }

            settingsMobileScrollBinding.element = container;
            settingsMobileScrollBinding.lastTop = container.scrollTop || 0;
            settingsMobileScrollBinding.upTravel = 0;
            settingsMobileScrollBinding.downTravel = 0;
            setSettingsMobileSummaryVisibility(true, true);

            const onScroll = () => {
                const currentTop = container.scrollTop || 0;
                const delta = currentTop - settingsMobileScrollBinding.lastTop;

                if (currentTop <= 6) {
                    settingsMobileScrollBinding.upTravel = 0;
                    settingsMobileScrollBinding.downTravel = 0;
                    setSettingsMobileSummaryVisibility(true);
                } else if (delta > 1.5) {
                    settingsMobileScrollBinding.downTravel += delta;
                    settingsMobileScrollBinding.upTravel = 0;
                    if (settingsMobileScrollBinding.downTravel > 14) {
                        setSettingsMobileSummaryVisibility(false);
                    }
                } else if (delta < -1.5) {
                    settingsMobileScrollBinding.upTravel += Math.abs(delta);
                    settingsMobileScrollBinding.downTravel = 0;
                    if (settingsMobileScrollBinding.upTravel > 10) {
                        setSettingsMobileSummaryVisibility(true, true);
                    }
                }

                settingsMobileScrollBinding.lastTop = currentTop;
            };

            container.addEventListener('scroll', onScroll, { passive: true });
            settingsMobileScrollBinding.cleanup = () => container.removeEventListener('scroll', onScroll);
        }

        function pulseSettingsPanel() {
            const panel = DOM.settingsPanel || document.getElementById('settings-panel');
            if (!panel) return;
            panel.classList.remove('settings-panel-feedback');
            void panel.offsetWidth;
            panel.classList.add('settings-panel-feedback');
            setTimeout(() => panel.classList.remove('settings-panel-feedback'), 280);
        }

        function renderSettingsSignalCard({ label, value, detail = '', icon = 'sparkles', tone = 'indigo' }) {
            return `
                <div class="settings-signal-card settings-signal-${tone}">
                    <span class="settings-signal-icon"><i data-lucide="${icon}" class="w-4 h-4"></i></span>
                    <div class="settings-signal-copy">
                        <small>${label}</small>
                        <strong>${value}</strong>
                        ${detail ? `<span>${detail}</span>` : ''}
                    </div>
                </div>
            `;
        }

        function renderSettingsSignalGrid(items) {
            return `<section class="settings-signal-grid">${items.join('')}</section>`;
        }

        function renderSettingsIntro(tabId) {
            const meta = getSettingsMeta(tabId);
            return `
                <section class="settings-page-intro">
                    <div>
                        <span class="settings-kicker">${meta.eyebrow}</span>
                        <h4 class="settings-page-title">${meta.title}</h4>
                        <p class="settings-page-description">${meta.description}</p>
                    </div>
                    <div class="settings-page-pulse">
                        <span class="settings-page-pulse-dot"></span>
                        <span>${appState.isDarkMode ? 'Modo oscuro' : 'Modo claro'} · ${appState.neonMode ? 'FX activos' : 'FX suaves'}</span>
                    </div>
                </section>
            `;
        }

        function renderSettingsToggle(option) {
            const isTrue = state[option.id];
            return `
                <button type="button" data-magnetic="soft" onclick="updateStateSetting('${option.id}', ${!isTrue})" class="settings-card settings-toggle-row">
                    <div class="settings-toggle-copy">
                        <span class="settings-icon-badge ${isTrue ? 'is-active' : ''}">
                            <i data-lucide="${option.icon}" class="w-4 h-4"></i>
                        </span>
                        <div class="settings-card-copy">
                            <div class="settings-card-heading">
                                <p class="settings-card-title">${option.label}</p>
                                <span class="settings-state-pill ${isTrue ? 'is-on' : 'is-off'}">${isTrue ? 'Activo' : 'Off'}</span>
                            </div>
                            <p class="settings-card-description">${option.description}</p>
                        </div>
                    </div>
                    <span class="settings-switch ${isTrue ? 'is-on' : ''}">
                        <span class="settings-switch-thumb"></span>
                    </span>
                </button>
            `;
        }

        function renderSettingsSegment(stateKey, options) {
            return `
                <div class="settings-segment-row">
                    ${options.map(option => {
                        const isSelected = state[stateKey] === option.value;
                        const serializedValue = typeof option.value === 'string'
                            ? `'${option.value.replace(/'/g, "\\'")}'`
                            : option.value;
                        return `
                            <button data-magnetic="soft" onclick="updateStateSetting('${stateKey}', ${serializedValue})" class="settings-segment-button ${isSelected ? 'is-selected' : ''}">
                                ${option.icon ? `<i data-lucide="${option.icon}" class="w-4 h-4"></i>` : ''}
                                <span>${option.label}</span>
                                ${option.note ? `<small>${option.note}</small>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function renderSettingsChoiceCard({ title, subtitle = '', icon = 'sparkles', selected = false, onClick = '' }) {
            return `
                <button data-magnetic="soft" onclick="${onClick}" class="settings-option-card ${selected ? 'is-selected' : ''}">
                    <div class="settings-option-head">
                        <span class="settings-option-icon"><i data-lucide="${icon}" class="w-4 h-4"></i></span>
                        <span class="settings-state-pill ${selected ? 'is-on' : 'is-idle'}">${selected ? 'Activo' : 'Elegir'}</span>
                    </div>
                    <strong class="settings-option-label">${title}</strong>
                    ${subtitle ? `<span class="settings-option-note">${subtitle}</span>` : ''}
                </button>
            `;
        }

        function renderSettingsTabs() {
            const isMobile = isSettingsMobile();
            const currentView = isMobile ? (appState.mobileView === 'content' ? 'content' : 'menu') : 'content';
            const activeTab = SETTINGS_TABS.find(t => t.id === appState.currentTab) || SETTINGS_TABS[0];
            const settingsPanel = document.getElementById('settings-panel');
            const backBtn = document.querySelector('.settings-back-mobile');
            const closeBtn = document.querySelector('.settings-close-mobile');
            const mobileTitle = document.getElementById('settings-mobile-toolbar-title');
            const mobileDock = document.getElementById('settings-mobile-dock');
            const mobileSummary = document.getElementById('settings-mobile-summary');

            DOM.settingsNav.classList.remove('hidden', 'md:hidden');
            if (settingsPanel) settingsPanel.setAttribute('data-mobile-view', currentView);
            if (backBtn) backBtn.classList.toggle('hidden', !isMobile || currentView !== 'content');
            if (closeBtn) closeBtn.classList.toggle('hidden', isMobile && currentView === 'content');
            if (mobileTitle) mobileTitle.textContent = isMobile ? (currentView === 'content' ? activeTab.label : 'Ajustes') : '';
            if (mobileDock) mobileDock.innerHTML = '';
            if (mobileSummary) mobileSummary.innerHTML = '';

            if (isMobile && currentView === 'content') {
                DOM.settingsTabs.innerHTML = '';
                bindMagneticSurfaceFX();
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            if (isMobile) {
                DOM.settingsTabs.innerHTML = MOBILE_SETTINGS_GROUPS.map(group => `
                    <section class="settings-mobile-group">
                        <p class="settings-mobile-group-label">${group.label}</p>
                        <div class="settings-mobile-group-list">
                            ${group.tabs.map(tabId => {
                                const t = SETTINGS_TABS.find(item => item.id === tabId);
                                if (!t) return '';
                                const meta = getSettingsMeta(t.id);
                                const isActive = appState.currentTab === t.id;
                                return `
                                    <button data-magnetic="soft" onclick="selectMobileTab('${t.id}')" class="settings-tab-button settings-mobile-row ${isActive ? 'is-active' : ''}" aria-pressed="${isActive}">
                                        <span class="settings-mobile-row-copy">
                                            <strong>${t.label}</strong>
                                            <small>${meta.description}</small>
                                        </span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </section>
                `).join('');

                bindMagneticSurfaceFX();
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            DOM.settingsTabs.innerHTML = SETTINGS_TABS.map(t => {
                const meta = getSettingsMeta(t.id);
                const isActive = appState.currentTab === t.id;
                return `
                    <button data-magnetic="soft" onclick="openSettings('${t.id}')" class="settings-tab-button ${isActive ? 'is-active' : ''}" aria-pressed="${isActive}">
                        <span class="settings-tab-icon"><i data-lucide="${t.icon}" class="w-4 h-4"></i></span>
                        <span class="settings-tab-copy">
                            <strong>${t.label}</strong>
                            <small>${meta.eyebrow}</small>
                        </span>
                    </button>
                `;
            }).join('');
            bindMagneticSurfaceFX();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function updateStateSetting(key, val) {
            state[key] = val;
            if (['modelId', 'agent2Model'].includes(key)) {
                syncApiRoutingState();
            }
            queueSettingsInputPersist(260);
            if (navigator.vibrate && window.innerWidth < 768) navigator.vibrate(16);
            scheduleSettingsRender();
            renderSidebarQuickModes();

            if (['isDarkMode', 'neonMode', 'dynamicUI', 'compactMode', 'glassMode', 'activeVibe'].includes(key)) {
                applyTheme();
            }

            if (key === 'activeVibe') {
                document.body.style.animation = 'none';
                setTimeout(() => document.body.style.animation = 'vibeShift 0.5s ease-out forwards', 10);
                if (appState.messages.length === 0) {
                    appState.suggestions = getFallbackSuggestionBatch(val, 4, getRecentSuggestionMemory(val, 6));
                    renderMessages();
                    fetchSmartSuggestions();
                }
            }
        }

        function updateTextSetting(key, val) {
            state[key] = val;
            queueSettingsInputPersist(520);
        }

        function updateApiSetting(key, val) {
            appState.apiKeys[key] = String(val || '');
            queueSettingsInputPersist(520);
        }

        function renderSettingsContent() {
            const isMobile = isSettingsMobile();
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) settingsPanel.setAttribute('data-mobile-view', isMobile ? (appState.mobileView === 'content' ? 'content' : 'menu') : 'content');

            if (isMobile && appState.mobileView !== 'content') {
                DOM.settingsContent.innerHTML = `
                    <section class="settings-mobile-overview">
                        <span class="settings-kicker">autoguardado</span>
                        <h4 class="settings-page-title">Cambios al instante</h4>
                        <p class="settings-page-description">Toca una opción y se aplica al momento. Ya no hace falta botón de guardar.</p>
                    </section>
                `;
                bindMagneticSurfaceFX();
                requestAnimationFrame(bindSettingsMobileSummaryScroll);
                return;
            }

            const t = appState.currentTab;
            let html = isMobile ? '' : renderSettingsIntro(t);

            if (t === 'appearance') {
                const opts = [
                    { id: 'isDarkMode', label: 'Modo oscuro', icon: 'moon', description: 'Optimiza el contraste y el confort visual para sesiones largas o entornos nocturnos.' },
                    { id: 'neonMode', label: 'Neural glow', icon: 'sparkles', description: 'Activa brillo, profundidad y presencia visual con una sensación más viva.' },
                    { id: 'dynamicUI', label: 'Física dinámica', icon: 'box', description: 'Permite que el panel responda al movimiento y se sienta más orgánico al tocar.' },
                    { id: 'compactMode', label: 'Densidad compacta', icon: 'layout-list', description: 'Reduce espacios verticales y ordena mejor los controles en pantallas pequeñas.' },
                    { id: 'glassMode', label: 'Cristal premium', icon: 'monitor', description: 'Refuerza la transparencia material y el acabado elegante del sistema.' }
                ];

                if (!isMobile) {
                    html += renderSettingsSignalGrid([
                        renderSettingsSignalCard({ label: 'Tema', value: appState.isDarkMode ? 'Oscuro' : 'Claro', detail: appState.glassMode ? 'glass premium' : 'soft matte', icon: 'sun-moon', tone: 'indigo' }),
                        renderSettingsSignalCard({ label: 'FX', value: appState.neonMode ? 'Neon' : 'Suave', detail: appState.dynamicUI ? 'interfaz reactiva' : 'flujo estable', icon: 'sparkles', tone: 'cyan' }),
                        renderSettingsSignalCard({ label: 'Densidad', value: appState.compactMode ? 'Compacta' : 'Aireada', detail: 'espaciado del panel', icon: 'rows-3', tone: 'emerald' })
                    ]);
                }

                html += `
                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Materiales, física y lectura</h4>
                                <p class="settings-section-description">Cada control modifica la sensación visual del sistema en tiempo real para que el panel se vea premium y no saturado.</p>
                            </div>
                        </div>
                        <div class="settings-stack">
                            ${opts.map(renderSettingsToggle).join('')}
                        </div>
                    </section>
                `;
            } else if (t === 'model') {
                const primaryRoute = getApiRouteConfig('chat');
                const suggestionsRoute = getApiRouteConfig('suggestions');
                const labsRoute = getApiRouteConfig('labs');
                const alternateModel = MODELS.find(model => model.id !== appState.modelId) || getModelMeta(API_ORCHESTRATION.suggestions.model);

                if (!isMobile) {
                    html += renderSettingsSignalGrid([
                        renderSettingsSignalCard({ label: 'Modelo', value: getModelLabel(appState.modelId), detail: `${getModelMeta(appState.modelId).providerLabel} · motor actual`, icon: 'cpu', tone: 'indigo' }),
                        renderSettingsSignalCard({ label: 'Longitud', value: appState.responseLength === 'short' ? 'Corta' : appState.responseLength === 'long' ? 'Larga' : 'Normal', detail: 'ritmo de respuesta', icon: 'align-justify', tone: 'cyan' }),
                        renderSettingsSignalCard({ label: 'Creatividad', value: getCreativityLabel(appState.creativity), detail: `${appState.creativity} de temperatura`, icon: 'wand-2', tone: 'amber' })
                    ]);
                }

                html += `
                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Motor principal</h4>
                                <p class="settings-section-description">Gemini 2.5 Flash se mantiene como principal por defecto, y el modelo secundario queda disponible para activarlo aquí cuando quieras.</p>
                            </div>
                        </div>
                        <div class="settings-option-grid">
                            ${MODELS.map(m => renderSettingsChoiceCard({
                                title: m.name,
                                subtitle: `${m.providerLabel} · ${m.description}`,
                                icon: m.provider === 'groq' ? 'bot' : 'cpu',
                                selected: appState.modelId === m.id,
                                onClick: `updateStateSetting('modelId', '${m.id}')`
                            })).join('')}
                        </div>
                        <p class="settings-help-note mt-3">Modelo secundario listo: <strong>${alternateModel.name}</strong>. Solo se vuelve principal si lo eliges en este panel.</p>
                    </section>

                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Orquestación activa</h4>
                                <p class="settings-section-description">Cada carril usa su propio proveedor y modelo para separar conversación, sugerencias y Labs.</p>
                            </div>
                        </div>
                        <div class="settings-stack">
                            ${[
                                { route: primaryRoute, tone: 'principal', model: getModelLabel(primaryRoute.model) },
                                { route: suggestionsRoute, tone: 'preguntas', model: getModelLabel(suggestionsRoute.model) },
                                { route: labsRoute, tone: 'labs', model: getModelLabel(labsRoute.model) }
                            ].map(({ route, model }) => `
                                <div class="settings-card">
                                    <div class="settings-card-heading">
                                        <p class="settings-card-title">${route.label}</p>
                                        <span class="settings-state-pill is-on">${model}</span>
                                    </div>
                                    <p class="settings-card-description">${getModelMeta(route.model).providerLabel} · ${route.note}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Ritmo y carácter</h4>
                                <p class="settings-section-description">Ajusta cuánto habla y qué tan libre se vuelve el modelo principal en cada respuesta.</p>
                            </div>
                        </div>
                        <div class="settings-segment">
                            <div>
                                <p class="settings-card-title">Longitud</p>
                                <p class="settings-card-description">Controla la densidad del texto para que sea breve, balanceado o más profundo.</p>
                            </div>
                            ${renderSettingsSegment('responseLength', [
                                { value: 'short', label: 'Corta', icon: 'align-left', note: 'rápida' },
                                { value: 'normal', label: 'Normal', icon: 'align-justify', note: 'balance' },
                                { value: 'long', label: 'Larga', icon: 'align-right', note: 'detalle' }
                            ])}
                        </div>
                        <div class="settings-segment mt-4">
                            <div>
                                <p class="settings-card-title">Creatividad</p>
                                <p class="settings-card-description">Define si responde con precisión, equilibrio o más soltura creativa.</p>
                            </div>
                            ${renderSettingsSegment('creativity', [
                                { value: 0.2, label: 'Preciso', note: 'estable' },
                                { value: 0.7, label: 'Balance', note: 'mixto' },
                                { value: 1.5, label: 'Desatado', note: 'más libre' }
                            ])}
                        </div>
                    </section>
                `;
            } else if (t === 'api') {
                const keyMeta = {
                    chat: { label: 'API principal', note: `${getModelLabel(getApiRouteConfig('chat').model)} · conversación normal y Arena` },
                    tools: { label: 'Compat / Tools', note: 'opcional como respaldo si quieres reutilizar una misma clave' },
                    suggestions: { label: 'API preguntas', note: `${getModelLabel(getApiRouteConfig('suggestions').model)} · preguntas dinámicas y respuestas sugeridas` },
                    labs: { label: 'API Labs', note: `${getModelLabel(getApiRouteConfig('labs').model)} general · Hate/Psico usan ${getModelLabel(LABS_MODEL_ROUTING.heavyModel)}` }
                };
                const usedKeys = Object.values(appState.apiKeys || {}).filter(Boolean).length;
                const routeHealth = ['chat', 'suggestions', 'labs'].map(getApiRouteHealth);
                const routeCards = routeHealth.map(({ route, providerLabel, modelLabel, statusLabel, isReady }) => {
                    return renderSettingsChoiceCard({
                        title: route.label,
                        subtitle: `${providerLabel} · ${modelLabel} · ${statusLabel}`,
                        icon: route.icon || 'network',
                        selected: isReady,
                        onClick: ''
                    });
                }).join('');

                if (!isMobile) {
                    html += renderSettingsSignalGrid([
                        renderSettingsSignalCard({ label: 'Guardado', value: 'Local', detail: 'solo en este navegador', icon: 'shield-check', tone: 'emerald' }),
                        renderSettingsSignalCard({ label: 'Claves', value: `${usedKeys}/4`, detail: 'rellenadas ahora', icon: 'key', tone: 'amber' }),
                        renderSettingsSignalCard({ label: 'Estado', value: routeHealth.every(item => item.isReady) ? 'Listo' : 'Parcial', detail: routeHealth.map(item => `${item.route.label}: ${item.statusLabel}`).join(' · '), icon: 'network', tone: 'indigo' })
                    ]);
                }

                html += `
                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Orquestación de APIs</h4>
                                <p class="settings-section-description">Hablar usa la API principal, las preguntas dinámicas usan Groq Cloud y Labs corre por su propio carril separado.</p>
                            </div>
                        </div>
                        <div class="settings-option-grid">
                            ${routeCards}
                        </div>
                    </section>

                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Claves y conectores</h4>
                                <p class="settings-section-description">Cada acceso queda asociado a su función para que puedas cambiar el proveedor sin mezclar secretos.</p>
                            </div>
                        </div>
                        <p class="settings-help-note">Tip: deja llena la API principal para hablar; en Labs se usa <code>llama-3.1-8b-instant</code> por defecto y <code>llama-3.3-70b-versatile</code> solo para <strong>Tírame Hate</strong> y <strong>Psicoanalizar</strong>.</p>
                        <div class="settings-field-grid">
                            ${['chat', 'suggestions', 'labs', 'tools'].map(f => `
                                <label class="settings-field-card">
                                    <span class="settings-field-label">${keyMeta[f].label}</span>
                                    <span class="settings-help-note">${keyMeta[f].note}</span>
                                    <input type="password" value="${escapeHTML(appState.apiKeys[f] || '')}" oninput="updateApiSetting('${f}', this.value)" placeholder="Pega tu clave aquí" class="w-full rounded-xl px-3 py-3 text-[12px] md:text-[13px] outline-none font-mono bg-slate-100 dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                                </label>
                            `).join('')}
                        </div>
                    </section>
                `;
            } else if (t === 'persona') {
                if (!isMobile) {
                    html += renderSettingsSignalGrid([
                        renderSettingsSignalCard({ label: 'Nombre', value: appState.userName?.trim() ? appState.userName : 'Sin definir', detail: 'identidad visible', icon: 'badge-check', tone: 'indigo' }),
                        renderSettingsSignalCard({ label: 'Género', value: appState.userGender || 'otro', detail: 'adaptación de algunas vibes', icon: 'user-round', tone: 'rose' }),
                        renderSettingsSignalCard({ label: 'Vibe', value: getVibe(appState.activeVibe).name, detail: 'perfil activo', icon: 'user-circle', tone: 'cyan' })
                    ]);
                }

                html += `
                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Perfil base</h4>
                                <p class="settings-section-description">Mantén tu identidad clara para que la conversación se sienta más personal, consistente y refinada.</p>
                            </div>
                        </div>
                        <div class="settings-field-grid">
                            <label class="settings-field-card settings-field-card-wide">
                                <span class="settings-field-label">Nombre visible</span>
                                <input type="text" value="${escapeHTML(appState.userName)}" oninput="updateTextSetting('userName', this.value)" placeholder="¿Cómo te llamas?" class="w-full rounded-xl px-3 py-3 text-[13px] md:text-sm outline-none bg-slate-100 dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                            </label>
                        </div>
                        <div class="settings-segment mt-4">
                            <div>
                                <p class="settings-card-title">Género de usuario</p>
                                <p class="settings-card-description">Sirve para adaptar ciertos matices de algunas vibes y dinámicas del sistema.</p>
                            </div>
                            ${renderSettingsSegment('userGender', [
                                { value: 'hombre', label: 'Hombre' },
                                { value: 'mujer', label: 'Mujer' },
                                { value: 'otro', label: 'Otro' }
                            ])}
                        </div>
                    </section>
                `;
            } else if (t === 'vibe') {
                const selectedVibe = getVibe(appState.activeVibe);
                if (!isMobile) {
                    html += renderSettingsSignalGrid([
                        renderSettingsSignalCard({ label: 'Activo', value: selectedVibe.name, detail: getVibePreviewCopy(selectedVibe.id), icon: selectedVibe.ui.botIcon, tone: 'indigo' }),
                        renderSettingsSignalCard({ label: 'Estado', value: getUI(selectedVibe).statusLabel, detail: 'presencia actual', icon: 'activity', tone: 'cyan' }),
                        renderSettingsSignalCard({ label: 'Interfaz', value: appState.dynamicUI ? 'Dinámica' : 'Clásica', detail: 'morfología del sistema', icon: 'sparkles', tone: 'emerald' })
                    ]);
                }

                html += `
                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Selector de vibe</h4>
                                <p class="settings-section-description">Cada opción tiene una identidad más clara, una lectura más rápida y una selección visual más premium.</p>
                            </div>
                        </div>
                        <div class="settings-option-grid">
                            ${window.VIBES.map(v => renderSettingsChoiceCard({
                                title: v.name,
                                subtitle: getVibePreviewCopy(v.id),
                                icon: v.ui.botIcon,
                                selected: appState.activeVibe === v.id,
                                onClick: `updateStateSetting('activeVibe', '${v.id}')`
                            })).join('')}
                        </div>
                        ${appState.activeVibe === 'custom' ? `
                            <div class="settings-field-card settings-field-card-wide mt-4">
                                <span class="settings-field-label">Instrucciones de personalidad</span>
                                <textarea oninput="updateTextSetting('customVibePrompt', this.value)" class="w-full h-28 md:h-32 px-3 py-3 text-[12px] md:text-[13px] bg-slate-100 dark:bg-black/40 text-slate-900 dark:text-white rounded-xl border border-emerald-500/20 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 custom-scrollbar resize-none transition-all" placeholder="Ejemplo: Eres un pirata espacial del año 3000...">${escapeHTML(appState.customVibePrompt)}</textarea>
                                <p class="settings-help-note mt-3">Se guarda automáticamente mientras escribes.</p>
                            </div>
                        ` : ''}
                    </section>
                `;
            } else if (t === 'battle') {
                if (!isMobile) {
                    html += renderSettingsSignalGrid([
                        renderSettingsSignalCard({ label: 'Modo', value: getArenaModeLabel(appState.arenaMode), detail: 'dinámica actual', icon: 'swords', tone: 'amber' }),
                        renderSettingsSignalCard({ label: 'Oponente', value: getVibe(appState.agent2Vibe).name, detail: 'segundo agente', icon: getVibe(appState.agent2Vibe).ui.botIcon, tone: 'rose' }),
                        renderSettingsSignalCard({ label: 'Modelo 2', value: getModelLabel(appState.agent2Model || appState.modelId), detail: `${getModelMeta(appState.agent2Model || appState.modelId).providerLabel} · motor secundario`, icon: 'cpu', tone: 'indigo' })
                    ]);
                }

                html += `
                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Dinámica de arena</h4>
                                <p class="settings-section-description">Ordena la interacción competitiva con una lectura más clara y comparativa.</p>
                            </div>
                        </div>
                        ${renderSettingsSegment('arenaMode', [
                            { value: 'debate', label: 'Pelea', icon: 'swords' },
                            { value: 'chat', label: 'Amistad', icon: 'coffee' },
                            { value: 'trio', label: 'Trío', icon: 'heart' },
                            { value: 'coop', label: 'Equipo', icon: 'users' }
                        ])}
                    </section>

                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Agente oponente</h4>
                                <p class="settings-section-description">Escoge la personalidad que acompaña o enfrenta al asistente principal.</p>
                            </div>
                        </div>
                        <div class="settings-option-grid">
                            ${window.VIBES.map(v => renderSettingsChoiceCard({
                                title: v.name,
                                subtitle: getVibePreviewCopy(v.id),
                                icon: v.ui.botIcon,
                                selected: appState.agent2Vibe === v.id,
                                onClick: `updateStateSetting('agent2Vibe', '${v.id}')`
                            })).join('')}
                        </div>
                    </section>

                    <section class="settings-section">
                        <div class="settings-section-head">
                            <div>
                                <h4 class="settings-section-title">Modelo secundario</h4>
                                <p class="settings-section-description">Define con qué motor corre el segundo participante dentro del modo Arena.</p>
                            </div>
                        </div>
                        <div class="settings-option-grid">
                            ${MODELS.map(m => renderSettingsChoiceCard({
                                title: m.name,
                                subtitle: m.id,
                                icon: 'cpu',
                                selected: appState.agent2Model === m.id,
                                onClick: `updateStateSetting('agent2Model', '${m.id}')`
                            })).join('')}
                        </div>
                    </section>
                `;
            }

            DOM.settingsContent.innerHTML = html;
            bindMagneticSurfaceFX();
            if (typeof lucide !== 'undefined') lucide.createIcons();
            requestAnimationFrame(bindSettingsMobileSummaryScroll);
        }

        // --- INICIALIZACIÓN ---
        function init() {
            initFirebase();
            refreshFXProfile();
            applyTheme();
            initFXCanvas();
            bindHighEndMotion();
            lockMobileZoom();
            window.addEventListener('resize', () => {
                refreshFXProfile();
                initFXCanvas();
                headerUpTravel = 0;
                headerDownTravel = 0;
                lastChatScrollTop = DOM.chatContainer?.scrollTop || 0;
                syncHeaderVisibility(true);
                handleSettingsViewportChange();
            }, { passive: true });
            if(appState.messages.length === 0) {
                appState.suggestions = getFallbackSuggestionBatch(appState.activeVibe, 4, getRecentSuggestionMemory(appState.activeVibe, 6));
                fetchSmartSuggestions();
            }
            renderMessages();
            renderSessionsList();
            renderSidebarQuickPanel();
            updateAppTitle();
            syncHeaderVisibility(true);
            
            // Iniciar Motor de Reacción UI
            requestAnimationFrame(renderReactiveUI);
            
            setInterval(() => {
                if (document.hidden) return;
                const ping = Math.floor(Math.random() * 30 + 10);
                const el = document.getElementById('ping-label');
                const icon = document.getElementById('wifi-icon');
                if (!el || !icon) return;
                el.innerText = ping + 'ms';
                if (ping > 35) {
                    el.classList.add('text-yellow-500'); el.classList.remove('text-slate-400');
                    icon.classList.add('text-yellow-500'); icon.classList.remove('text-gray-500');
                } else {
                    el.classList.remove('text-yellow-500'); el.classList.add('text-slate-400');
                    icon.classList.remove('text-yellow-500'); icon.classList.add('text-gray-500');
                }
            }, 3000);
            
            // Renderizar todos los iconos de Lucide
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        const PUBLIC_ACTIONS = {
            abortGeneration,
            beginRenameSession,
            cancelRenameSession,
            cancelReply,
            cancelSessionPress,
            closeLightbox,
            closeSessionMenu,
            closeSettings,
            closeMobileSidebar,
            confirmRenameSession,
            copyMsgText,
            generateReplySuggestions,
            handleImageUpload,
            handleQuickAction,
            handleSend,
            initiateReply,
            loadSession,
            openLightbox,
            openSessionMenu,
            openSettings,
            removePendingImage,
            saveSettings,
            scrollToBottom,
            setInput,
            startNewChat,
            startSessionPress,
            toggleBattleMode,
            toggleCompactMode,
            toggleMobileSidebar,
            toggleZenMode,
            toggleSidebarQuickPanel,
            closeSidebarQuickPanel,
            cycleFusionMode,
            cycleMindMode,
            setFusionPrimaryVibe,
            setFusionSecondaryVibe,
            updateFusionBalance,
            setFusionProfile,
            disableFusionMode,
            selectMindMode,
            setFlowMode,
            updateApiSetting,
            updateStateSetting,
            updateTextSetting,
            useReplySuggestion,
            loginWithGoogle,
            performSignIn,
            performSignUp,
            performSignOut,
            toggleProfilePanel,
            closeProfilePanel,
            switchProfileTab,
            uploadProfileAvatar,
            updateProfileData,
            showToast
        };

        window.SAOApp = {
            version: '2026.03.30-maintenance',
            state,
            dom: DOM,
            config: window.SAOConfig,
            platform: Platform,
            init,
            persistState,
            actions: PUBLIC_ACTIONS
        };

        Object.assign(window, PUBLIC_ACTIONS, { state });

        document.addEventListener('DOMContentLoaded', init);
