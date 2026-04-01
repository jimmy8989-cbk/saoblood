// --- ARQUITECTURA AVANZADA SAO OS ---
// Sistema modular escalable con servicios especializados

class ErrorHandler {
    static retryConfig = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2
    };

    constructor() {
        this.logger = window.SAO?.logger;
        this.retryConfig = ErrorHandler.retryConfig;
    }

    log(level, message, data = null, category = 'error-handler') {
        if (this.logger) {
            this.logger[level](message, data, category);
        } else {
            // Fallback a console si no hay logger
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logEntry, data);
        }
    }

    async handleAsync(fn, context = 'unknown', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.log('error', `Error in ${context}`, {
                error: error.message,
                stack: error.stack,
                context
            }, 'async-error');
            return fallback;
        }
    }

    static withRetry(fn, maxRetries = 3, baseDelay = 1000, context = 'unknown') {
        const config = {
            maxRetries,
            baseDelay,
            maxDelay: ErrorHandler.retryConfig.maxDelay,
            backoffMultiplier: ErrorHandler.retryConfig.backoffMultiplier
        };

        return async (...args) => {
            let lastError;
            for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
                try {
                    const result = await fn(...args);
                    if (attempt > 1) {
                        console.log(`✓ Operation succeeded after ${attempt} attempts [${context}]`);
                    }
                    return result;
                } catch (error) {
                    lastError = error;
                    const isLastAttempt = attempt === config.maxRetries;

                    if (isLastAttempt) {
                        console.error(`✗ Attempt ${attempt}/${config.maxRetries} failed in ${context}: ${error.message}`);
                    } else {
                        console.warn(`⚠ Attempt ${attempt}/${config.maxRetries} failed in ${context}, retrying...`);
                    }

                    if (!isLastAttempt) {
                        const delay = Math.min(config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1), config.maxDelay);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            throw lastError;
        };
    }

    // Método para errores críticos del sistema
    handleCriticalError(error, context = 'unknown') {
        this.log('fatal', `Critical system error in ${context}`, {
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        }, 'critical-error');

        // Aquí podríamos agregar lógica para reportar a servicios externos
        // o mostrar UI de error crítico
    }

    // Método para errores de red
    handleNetworkError(error, context = 'unknown', retryable = true) {
        const level = retryable ? 'warn' : 'error';
        this.log(level, `Network error in ${context}`, {
            error: error.message,
            context,
            retryable,
            online: navigator.onLine
        }, 'network-error');
    }

    // Método para errores de validación
    handleValidationError(field, value, reason, context = 'unknown') {
        this.log('warn', `Validation error in ${context}`, {
            field,
            value: typeof value === 'object' ? JSON.stringify(value) : value,
            reason,
            context
        }, 'validation-error');
    }
}

class StateManager {
    constructor() {
        this.state = {};
        this.listeners = new Map();
        this.history = [];
        this.maxHistorySize = 10;
        this.logger = window.SAO?.logger;
        this.performanceLogger = window.SAO?.performanceLogger;
    }

    setState(updates) {
        const startTime = performance.now();
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };

        // Guardar en historial para undo/redo
        this.history.push(prevState);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        // Notificar listeners
        this.notifyListeners(updates);

        // Logging y performance
        const duration = performance.now() - startTime;
        this.performanceLogger?.logSlowOperation('StateManager.setState', duration, 5);

        if (this.logger) {
            this.logger.debug('State updated', {
                updates: Object.keys(updates),
                stateSize: JSON.stringify(this.state).length,
                duration: `${duration.toFixed(2)}ms`
            }, 'state-manager');
        }
    }

    getState() {
        return { ...this.state };
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        if (this.logger) {
            this.logger.debug('Listener subscribed', {
                key,
                totalListeners: this.listeners.get(key).size
            }, 'state-manager');
        }

        // Retornar función para unsubscribe
        return () => this.listeners.get(key)?.delete(callback);
    }

    notifyListeners(changes) {
        Object.keys(changes).forEach(key => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.forEach(callback => {
                    try {
                        callback(changes[key], this.state[key]);
                    } catch (error) {
                        console.error('State listener error', { key, error: error.message });
                    }
                });
            }
        });
    }

    undo() {
        if (this.history.length > 0) {
            const prevState = this.history.pop();
            this.state = prevState;
            this.notifyListeners(this.state);
            return true;
        }
        return false;
    }
}

class FirebaseService {
    constructor() {
        this.initialized = false;
        this.auth = null;
        this.database = null;
        this.firestore = null;
        this.storage = null;
        this.firestoreAvailable = true;
        this.remotePersistHandle = 0;
        this.connectionStatus = 'disconnected'; // 'connected', 'connecting', 'disconnected'
        this.logger = window.SAO?.logger;
        this.performanceLogger = window.SAO?.performanceLogger;
        this.errorHandler = new ErrorHandler();
    }

    async initialize() {
        if (this.initialized) return true;

        try {
            // Esperar a que Firebase esté disponible
            let attempts = 0;
            while (typeof window.firebaseModular === 'undefined' && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }

            if (typeof window.firebaseModular === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }

            this.auth = window.firebaseModular.auth;
            this.database = window.firebaseModular.database;
            this.firestore = window.firebaseModular.firestore;
            this.storage = window.firebaseModular.storage;

            // Configurar listeners de conexión
            this.setupConnectionMonitoring();

            // Configurar auth state listener
            window.firebaseModular.onAuthStateChanged(this.auth, (user) => {
                this.handleAuthStateChange(user);
            });

            this.initialized = true;
            this.connectionStatus = 'connected';
            console.log('info', 'Firebase initialized successfully');
            return true;

        } catch (error) {
            console.error('Firebase initialization failed', error);
            this.connectionStatus = 'disconnected';
            return false;
        }
    }

    setupConnectionMonitoring() {
        // RTDB connection monitoring
        if (this.database) {
            const connectedRef = window.firebaseModular.rtdbRef(this.database, '.info/connected');
            window.firebaseModular.rtdbGet(connectedRef).then(snapshot => {
                this.connectionStatus = snapshot.val() ? 'connected' : 'disconnected';
            });
        }
    }

    async signIn(email, password) {
        return ErrorHandler.withRetry(async () => {
            const result = await window.firebaseModular.signInWithEmailAndPassword(this.auth, email, password);
            return result.user;
        }, 3, 1000, 'signIn');
    }

    async signUp(email, password) {
        return ErrorHandler.withRetry(async () => {
            const result = await window.firebaseModular.createUserWithEmailAndPassword(this.auth, email, password);
            return result.user;
        }, 3, 1000, 'signUp');
    }

    async signOut() {
        return ErrorHandler.withRetry(async () => {
            await window.firebaseModular.signOut(this.auth);
        }, 2, 500, 'signOut');
    }

    async updateProfile(user, updates) {
        return ErrorHandler.withRetry(async () => {
            await window.firebaseModular.updateProfile(user, updates);
        }, 2, 500, 'updateProfile');
    }

    async saveUserData(uid, data, includeSessions = true) {
        if (!this.database) return false;
        if (!uid) {
            console.log('Operación cancelada: No hay usuario autenticado');
            return false;
        }

        try {
            const userRef = window.firebaseModular.rtdbRef(this.database, `users/${uid}`);
            const payload = {
                updatedAt: Date.now(),
                preferences: data.preferences || {},
                currentSessionId: data.currentSessionId
            };

            if (includeSessions && data.sessions) {
                payload.sessions = data.sessions;
            }

            await window.firebaseModular.rtdbSet(userRef, payload);
            console.log(`RTDB: Saved user data for ${uid}`, { sessionsCount: data.sessions?.length || 0 });

            // También guardar en Firestore si está disponible
            if (this.firestore && this.firestoreAvailable) {
                await this.saveToFirestore(uid, payload);
            }

            return true;
        } catch (error) {
            console.error('Failed to save user data to RTDB', error);
            return false;
        }
    }

    async saveToFirestore(uid, payload) {
        if (!this.firestore || !this.firestoreAvailable) return;

        try {
            const userDocRef = window.firebaseModular.fsDoc(this.firestore, 'users', uid);
            const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
            const preferences = payload.preferences || {};

            // Guardar preferences
            await window.firebaseModular.fsSetDoc(userDocRef, {
                updatedAt: payload.updatedAt,
                preferences
            }, { merge: true });

            // Guardar sesiones en batch
            if (sessions.length > 0) {
                const batch = window.firebaseModular.fsWriteBatch(this.firestore);
                sessions.forEach(session => {
                    const sessionId = session?.id || Date.now().toString();
                    const docRef = window.firebaseModular.fsDoc(this.firestore, 'users', uid, 'conversations', sessionId);
                    batch.set(docRef, {
                        ...session,
                        updatedAt: session.updatedAt || Date.now()
                    }, { merge: true });
                });
                await batch.commit();
                console.log(`Firestore: Saved ${sessions.length} sessions for ${uid}`);
            }

        } catch (error) {
            console.log('error', 'Failed to save to Firestore', error);
            this.firestoreAvailable = false; // Deshabilitar temporalmente
        }
    }

    async loadUserData(uid) {
        if (!uid) {
            console.log('Operación cancelada: No hay usuario autenticado');
            return { preferences: {}, sessions: [], currentSessionId: null };
        }

        const result = { preferences: {}, sessions: [], currentSessionId: null };

        // Cargar desde RTDB primero (más rápido)
        if (this.database) {
            try {
                const userRef = window.firebaseModular.rtdbRef(this.database, `users/${uid}`);
                const snapshot = await window.firebaseModular.rtdbGet(userRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data.preferences) result.preferences = data.preferences;
                    if (data.sessions) result.sessions = data.sessions;
                    if (data.currentSessionId) result.currentSessionId = data.currentSessionId;
                    console.log(`RTDB: Loaded user data for ${uid}`);
                }
            } catch (error) {
                console.error('Failed to load from RTDB', error);
            }
        }

        // Cargar desde Firestore si RTDB falló o para enriquecer datos
        if (this.firestore && this.firestoreAvailable && result.sessions.length === 0) {
            try {
                const userDocRef = window.firebaseModular.fsDoc(this.firestore, 'users', uid);
                const userDocSnap = await window.firebaseModular.fsGetDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    if (data.preferences) result.preferences = { ...result.preferences, ...data.preferences };

                    // Cargar conversaciones
                    const convColRef = window.firebaseModular.fsCollection(this.firestore, 'users', uid, 'conversations');
                    const convSnap = await window.firebaseModular.fsGetDocs(convColRef);

                    if (!convSnap.empty) {
                        result.sessions = convSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        console.log(`Firestore: Loaded ${result.sessions.length} sessions for ${uid}`);
                    }
                }
            } catch (error) {
                console.error('Failed to load from Firestore', error);
            }
        }

        return result;
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('User authenticated', { uid: user.uid, email: user.email });
            // Emitir evento de autenticación
            window.dispatchEvent(new CustomEvent('firebase:auth:signin', { detail: user }));
        } else {
            console.log('User signed out');
            window.dispatchEvent(new CustomEvent('firebase:auth:signout'));
        }
    }

    get currentUser() {
        return this.auth?.currentUser || null;
    }

    get isConnected() {
        return this.connectionStatus === 'connected';
    }
}

class AutoSaveManager {
    constructor(firebaseService, stateManager) {
        this.firebase = firebaseService;
        this.state = stateManager;
        this.saveInterval = 30000; // 30 segundos
        this.maxRetries = 3;
        this.isEnabled = true;
        this.lastSave = 0;
        this.saveHandle = null;
        this.pendingChanges = false;
        this.saveQueue = [];
    }

    start() {
        if (!this.isEnabled) return;

        this.stop(); // Limpiar cualquier intervalo anterior
        this.saveHandle = setInterval(() => {
            this.performAutoSave();
        }, this.saveInterval);

        // Guardar también en eventos de visibilidad
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performAutoSave(true); // Guardado inmediato al ocultar
            }
        });

        window.addEventListener('beforeunload', () => {
            this.performAutoSave(true); // Guardado síncrono al cerrar
        });

        console.log('AutoSaveManager started', { interval: this.saveInterval });
    }

    stop() {
        if (this.saveHandle) {
            clearInterval(this.saveHandle);
            this.saveHandle = null;
        }
    }

    markChanged() {
        this.pendingChanges = true;
    }

    async performAutoSave(immediate = false) {
        if (!this.firebase.currentUser || !this.pendingChanges) return;

        const now = Date.now();
        if (!immediate && (now - this.lastSave) < this.saveInterval) return;

        try {
            const state = this.state.getState();
            const success = await this.firebase.saveUserData(
                this.firebase.currentUser.uid,
                {
                    preferences: state.preferences || {},
                    sessions: state.sessions || [],
                    currentSessionId: state.currentSessionId
                },
                true
            );

            if (success) {
                this.lastSave = now;
                this.pendingChanges = false;
                console.log('Auto-save completed successfully');
            }

        } catch (error) {
            console.log('error', 'Auto-save failed', error);
        }
    }

    async forceSave() {
        return this.performAutoSave(true);
    }

    setInterval(seconds) {
        this.saveInterval = seconds * 1000;
        this.start(); // Reiniciar con nuevo intervalo
    }

    enable() {
        this.isEnabled = true;
        this.start();
    }

    disable() {
        this.isEnabled = false;
        this.stop();
    }
}

class SessionManager {
    constructor(stateManager, autoSave) {
        this.state = stateManager;
        this.autoSave = autoSave;
        this.sessions = [];
        this.currentSessionId = null;
        this.maxSessions = 100; // Límite para evitar sobrecarga
    }

    createSession(title = null, vibeId = 'chill') {
        const session = {
            id: Date.now().toString(),
            title: title || this.generateTitle(),
            messages: [],
            vibeId: vibeId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: {
                messageCount: 0,
                lastActivity: Date.now(),
                totalTokens: 0
            }
        };

        this.sessions.unshift(session);
        this.currentSessionId = session.id;
        this.trimSessions();
        this.autoSave.markChanged();

        console.log('Session created', { id: session.id, title: session.title });
        return session;
    }

    loadSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            this.currentSessionId = sessionId;
            session.metadata.lastActivity = Date.now();
            this.autoSave.markChanged();
            return session;
        }
        return null;
    }

    updateSession(sessionId, updates) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            Object.assign(session, updates);
            session.updatedAt = Date.now();
            session.metadata.lastActivity = Date.now();
            this.autoSave.markChanged();
            return session;
        }
        return null;
    }

    deleteSession(sessionId) {
        const index = this.sessions.findIndex(s => s.id === sessionId);
        if (index >= 0) {
            const deleted = this.sessions.splice(index, 1)[0];

            // Si era la sesión actual, cambiar a la siguiente
            if (this.currentSessionId === sessionId) {
                this.currentSessionId = this.sessions[0]?.id || null;
            }

            this.autoSave.markChanged();
            console.log('Session deleted', { id: sessionId });
            return deleted;
        }
        return null;
    }

    addMessage(sessionId, message) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            session.messages.push(message);
            session.updatedAt = Date.now();
            session.metadata.lastActivity = Date.now();
            session.metadata.messageCount = session.messages.length;

            // Estimar tokens (aproximado)
            session.metadata.totalTokens += Math.ceil(message.text.length / 4);

            this.autoSave.markChanged();
            return message;
        }
        return null;
    }

    getCurrentSession() {
        return this.sessions.find(s => s.id === this.currentSessionId) || null;
    }

    getSessionsSorted() {
        return [...this.sessions].sort((a, b) => b.updatedAt - a.updatedAt);
    }

    trimSessions() {
        if (this.sessions.length > this.maxSessions) {
            // Mantener solo las más recientes
            this.sessions = this.sessions
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, this.maxSessions);
        }
    }

    generateTitle() {
        const now = new Date();
        return `Chat ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    exportSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return null;

        return {
            ...session,
            exportedAt: Date.now(),
            version: '1.0'
        };
    }

    importSession(data) {
        if (!data.id || !data.messages) {
            throw new Error('Invalid session data');
        }

        // Verificar que no exista ya
        if (this.sessions.find(s => s.id === data.id)) {
            throw new Error('Session already exists');
        }

        const session = {
            ...data,
            importedAt: Date.now()
        };

        this.sessions.unshift(session);
        this.trimSessions();
        this.autoSave.markChanged();

        return session;
    }
}

class APIService {
    constructor() {
        this.baseURL = 'https://api.groq.com/openai/v1';
        this.timeout = 45000;
        this.maxRetries = 4;
        this.backoff = [1000, 2000, 4000, 8000];
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${options.apiKey}`,
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: options.signal
        };

        return ErrorHandler.withRetry(async () => {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API Error ${response.status}: ${error}`);
            }

            return response.json();
        }, this.maxRetries, this.backoff[0], `API ${endpoint}`);
    }

    async chatCompletion({ messages, model, apiKey, temperature = 0.7, maxTokens = 1024, signal }) {
        const payload = {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false
        };

        const response = await this.request('/chat/completions', {
            apiKey,
            body: payload,
            signal
        });

        return response.choices[0]?.message?.content || '';
    }

    async createTitle({ prompt, model, apiKey, signal }) {
        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        return this.chatCompletion({
            messages,
            model,
            apiKey,
            temperature: 0.25,
            maxTokens: 80,
            signal
        });
    }

    async generateSuggestions({ prompt, model, apiKey, count = 4, signal }) {
        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        const response = await this.chatCompletion({
            messages,
            model,
            apiKey,
            temperature: 0.8,
            maxTokens: 512,
            signal
        });

        // Parsear sugerencias (asumiendo formato JSON)
        try {
            const parsed = JSON.parse(response);
            return Array.isArray(parsed) ? parsed.slice(0, count) : [];
        } catch {
            // Fallback: dividir por líneas
            return response.split('\n').filter(s => s.trim()).slice(0, count);
        }
    }
}

class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.renderQueue = new Map();
        this.isRendering = false;
        this.domCache = new Map();
    }

    cacheElement(selector) {
        if (!this.domCache.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.domCache.set(selector, element);
            }
        }
        return this.domCache.get(selector);
    }

    queueRender(component, priority = 'normal') {
        this.renderQueue.set(component, priority);

        if (!this.isRendering) {
            this.processRenderQueue();
        }
    }

    async processRenderQueue() {
        if (this.isRendering || this.renderQueue.size === 0) return;

        this.isRendering = true;

        // Procesar por prioridad
        const priorities = ['high', 'normal', 'low'];
        for (const priority of priorities) {
            const components = Array.from(this.renderQueue.entries())
                .filter(([_, p]) => p === priority)
                .map(([c, _]) => c);

            for (const component of components) {
                try {
                    await this.renderComponent(component);
                } catch (error) {
                    console.error(`Render error for ${component}`, error);
                }
                this.renderQueue.delete(component);
            }
        }

        this.isRendering = false;
    }

    async renderComponent(component) {
        switch (component) {
            case 'messages':
                this.renderMessages();
                break;
            case 'sessions':
                this.renderSessionsList();
                break;
            case 'ui':
                this.updateUI();
                break;
        }
    }

    renderMessages() {
        const container = this.cacheElement('#messages-container');
        if (!container) return;

        const state = this.state.getState();
        const session = state.currentSession;

        if (!session) {
            container.innerHTML = '<div class="text-center text-gray-500 mt-8">No hay mensajes</div>';
            return;
        }

        const messagesHTML = session.messages.map(message => this.renderMessage(message)).join('');
        container.innerHTML = messagesHTML;

        // Scroll to bottom
        this.scrollToBottom();
    }

    renderMessage(message) {
        const isUser = message.role === 'user';
        const vibe = this.getVibe(message.vibeId || 'chill');

        return `
            <div class="message ${isUser ? 'user' : 'ai'} ${vibe.ui.bubbleClass || ''}">
                <div class="message-content">
                    ${this.escapeHTML(message.text)}
                </div>
                <div class="message-time">
                    ${new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `;
    }

    renderSessionsList() {
        const container = this.cacheElement('#sessions-list');
        if (!container) return;

        const state = this.state.getState();
        const sessions = state.sessions || [];

        if (sessions.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500">No hay sesiones</div>';
            return;
        }

        const sessionsHTML = sessions.map(session => `
            <div class="session-item ${session.id === state.currentSessionId ? 'active' : ''}"
                 onclick="loadSession('${session.id}')">
                <div class="session-title">${this.escapeHTML(session.title)}</div>
                <div class="session-meta">
                    ${session.messages?.length || 0} mensajes •
                    ${new Date(session.updatedAt).toLocaleDateString()}
                </div>
            </div>
        `).join('');

        container.innerHTML = sessionsHTML;
    }

    updateUI() {
        const state = this.state.getState();

        // Actualizar tema
        document.documentElement.classList.toggle('dark', state.isDarkMode);

        // Actualizar vibe activo
        this.updateVibeUI(state.activeVibe);

        // Actualizar indicadores de estado
        this.updateStatusIndicators(state);
    }

    updateVibeUI(vibeId) {
        const vibe = this.getVibe(vibeId);
        if (!vibe) return;

        // Actualizar colores y estilos
        document.documentElement.style.setProperty('--vibe-accent', vibe.color);
        // ... más actualizaciones de UI
    }

    updateStatusIndicators(state) {
        // Actualizar indicadores de conexión, guardado, etc.
        const statusEl = this.cacheElement('#status-indicator');
        if (statusEl) {
            statusEl.className = state.isConnected ? 'status-connected' : 'status-disconnected';
        }
    }

    scrollToBottom() {
        const container = this.cacheElement('#messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        // Implementar sistema de toasts
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getVibe(vibeId) {
        return VIBES.find(v => v.id === vibeId) || VIBES[0];
    }
}

// --- INICIALIZACIÓN DEL SISTEMA MODULAR ---

// Crear stub de window.SAO antes de instanciar clases para evitar dependencias circulares
// Las clases esperan window.SAO.logger durante su construcción
if (!window.SAO) {
    window.SAO = {};
}

const stateManager = new StateManager();
const firebaseService = new FirebaseService();
const autoSaveManager = new AutoSaveManager(firebaseService, stateManager);
const sessionManager = new SessionManager(stateManager, autoSaveManager);
const apiService = new APIService();
const uiManager = new UIManager(stateManager);

// Hacer servicios disponibles globalmente para compatibilidad
window.SAO = {
    state: stateManager,
    firebase: firebaseService,
    autoSave: autoSaveManager,
    sessions: sessionManager,
    api: apiService,
    ui: uiManager,
    error: new ErrorHandler(),
    // Mantener las referencias que se podrían haber establecido antes (config, logger, etc)
    logger: window.SAO.logger || undefined,
    performanceLogger: window.SAO.performanceLogger || undefined,
    config: window.SAO.config || undefined,
    cache: window.SAO.cache || undefined,
    performance: window.SAO.performance || undefined
};

// Inicializar sistema
async function initializeAdvancedSystem() {
    try {
        console.log('Initializing SAO Advanced System...');

        // Inicializar Firebase
        const firebaseReady = await firebaseService.initialize();
        if (!firebaseReady) {
            console.log('error', 'Firebase initialization failed');
            return;
        }

        // Configurar servicios
        autoSaveManager.start();

        // Configurar listeners de estado
        stateManager.subscribe('sessions', () => uiManager.queueRender('sessions'));
        stateManager.subscribe('currentSession', () => uiManager.queueRender('messages'));
        stateManager.subscribe('ui', () => uiManager.queueRender('ui'));

        console.log('info', 'SAO Advanced System initialized successfully');

    } catch (error) {
        console.log('error', 'Failed to initialize advanced system', error);
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdvancedSystem);
} else {
    initializeAdvancedSystem();
}