// --- CONFIGURACIÓN AVANZADA SAO OS ---
// Configuraciones escalables y optimizaciones de rendimiento

const SAO_CONFIG = Object.freeze({
    // Versiones y metadatos
    version: '2.0.0',
    build: 'advanced-architecture',
    environment: 'production',

    // Límites y restricciones
    limits: {
        maxSessions: 100,
        maxMessagesPerSession: 1000,
        maxTokensPerRequest: 4096,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxConcurrentRequests: 3,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    },

    // Configuración de autoguardado
    autoSave: {
        enabled: true,
        interval: 30000, // 30 segundos
        maxRetries: 3,
        backoffMultiplier: 2,
        saveOnVisibilityChange: true,
        saveOnBeforeUnload: true,
    },

    // Configuración de Firebase
    firebase: {
        enableOfflinePersistence: true,
        enableNetworkMonitoring: true,
        firestoreBatchSize: 10,
        realtimeDebounceMs: 500,
    },

    // Configuración de APIs
    apis: {
        groq: {
            baseURL: 'https://api.groq.com/openai/v1',
            timeout: 45000,
            retries: 4,
            backoff: [1000, 2000, 4000, 8000],
        },
        gemini: {
            baseURL: 'https://generativelanguage.googleapis.com/v1beta',
            timeout: 60000,
            retries: 3,
            backoff: [2000, 4000, 8000],
        },
    },

    // Configuración de UI
    ui: {
        renderDebounceMs: 16, // ~60fps
        scrollDebounceMs: 100,
        toastDuration: 3000,
        maxSuggestions: 4,
        messageAnimationDuration: 300,
        themeTransitionDuration: 700,
    },

    // Configuración de vibes
    vibes: {
        maxCustomPromptLength: 2000,
        fusionProfiles: {
            balanced: { primary: 70, secondary: 30 },
            dominant: { primary: 85, secondary: 15 },
            blended: { primary: 50, secondary: 50 },
            subtle: { primary: 60, secondary: 40 },
        },
    },

    // Configuración de modos avanzados
    advancedModes: {
        mindModes: ['normal', 'creative', 'analytical', 'empathetic', 'sarcastic'],
        flowModes: ['flash', 'quick', 'balanced', 'deep', 'thorough'],
        arenaModes: ['chat', 'trio', 'coop', 'debate'],
    },

    // Configuración de monitoreo
    monitoring: {
        enableErrorReporting: true,
        enablePerformanceTracking: true,
        enableUsageAnalytics: false, // GDPR compliant
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    },

    // Configuración de caché
    cache: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        strategies: {
            suggestions: 'memory', // 'memory', 'localStorage', 'indexedDB'
            responses: 'memory',
            userData: 'localStorage',
        },
    },

    // Configuración de seguridad
    security: {
        encryptLocalStorage: false, // Para futuras implementaciones
        sanitizeInputs: true,
        rateLimitRequests: true,
        maxRequestsPerMinute: 60,
    },

    // Características experimentales
    experimental: {
        enableVoiceInput: false,
        enableImageGeneration: false,
        enableCodeExecution: false,
        enableMultiModal: false,
    },
});

// --- UTILIDADES DE CONFIGURACIÓN ---

class ConfigManager {
    constructor() {
        this.config = { ...SAO_CONFIG };
        this.overrides = {};
    }

    get(key) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            value = value?.[k];
        }

        // Aplicar overrides si existen
        const override = this.getOverride(key);
        return override !== undefined ? override : value;
    }

    setOverride(key, value) {
        this.overrides[key] = value;
        this.persistOverrides();
    }

    getOverride(key) {
        return this.overrides[key];
    }

    resetOverride(key) {
        delete this.overrides[key];
        this.persistOverrides();
    }

    persistOverrides() {
        try {
            localStorage.setItem('sao-config-overrides', JSON.stringify(this.overrides));
        } catch (error) {
            console.warn('Failed to persist config overrides', error);
        }
    }

    loadOverrides() {
        try {
            const stored = localStorage.getItem('sao-config-overrides');
            if (stored) {
                this.overrides = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load config overrides', error);
        }
    }

    // Validar configuración
    validate() {
        const errors = [];

        // Validar límites
        if (this.get('limits.maxSessions') < 1) {
            errors.push('maxSessions must be at least 1');
        }

        if (this.get('autoSave.interval') < 1000) {
            errors.push('autoSave.interval must be at least 1000ms');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Obtener configuración para un servicio específico
    getServiceConfig(serviceName) {
        return this.config[serviceName] || {};
    }
}

// --- SISTEMA DE CACHÉ AVANZADO ---

class CacheManager {
    constructor(config) {
        this.config = config;
        this.stores = new Map();
        this.initStores();
    }

    initStores() {
        const strategies = this.config.get('cache.strategies');

        Object.entries(strategies).forEach(([key, strategy]) => {
            switch (strategy) {
                case 'memory':
                    this.stores.set(key, new MemoryStore());
                    break;
                case 'localStorage':
                    this.stores.set(key, new LocalStorageStore(key));
                    break;
                case 'indexedDB':
                    this.stores.set(key, new IndexedDBStore(key));
                    break;
            }
        });
    }

    async get(storeName, key) {
        const store = this.stores.get(storeName);
        if (!store) return null;

        const item = await store.get(key);
        if (!item) return null;

        // Verificar expiración
        if (Date.now() > item.expires) {
            await this.delete(storeName, key);
            return null;
        }

        return item.data;
    }

    async set(storeName, key, data, ttl = null) {
        const store = this.stores.get(storeName);
        if (!store) return false;

        const expires = ttl ? Date.now() + ttl : Date.now() + this.config.get('cache.maxAge');

        const item = {
            data,
            expires,
            created: Date.now()
        };

        return await store.set(key, item);
    }

    async delete(storeName, key) {
        const store = this.stores.get(storeName);
        return store ? await store.delete(key) : false;
    }

    async clear(storeName) {
        const store = this.stores.get(storeName);
        return store ? await store.clear() : false;
    }

    async cleanup() {
        // Limpiar elementos expirados
        for (const [storeName, store] of this.stores) {
            await store.cleanup();
        }
    }
}

// --- STORES DE CACHÉ ---

class MemoryStore {
    constructor() {
        this.data = new Map();
    }

    async get(key) {
        return this.data.get(key) || null;
    }

    async set(key, item) {
        this.data.set(key, item);
        return true;
    }

    async delete(key) {
        return this.data.delete(key);
    }

    async clear() {
        this.data.clear();
        return true;
    }

    async cleanup() {
        // Memory store no necesita cleanup
        return true;
    }
}

class LocalStorageStore {
    constructor(prefix) {
        this.prefix = `sao-cache-${prefix}-`;
    }

    async get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('LocalStorage get error', error);
            return null;
        }
    }

    async set(key, item) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.warn('LocalStorage set error', error);
            return false;
        }
    }

    async delete(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.warn('LocalStorage delete error', error);
            return false;
        }
    }

    async clear() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.warn('LocalStorage clear error', error);
            return false;
        }
    }

    async cleanup() {
        try {
            const now = Date.now();
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));

            for (const key of keys) {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && now > item.expires) {
                    localStorage.removeItem(key);
                }
            }
            return true;
        } catch (error) {
            console.warn('LocalStorage cleanup error', error);
            return false;
        }
    }
}

// IndexedDB store (para futuras implementaciones complejas)
class IndexedDBStore {
    constructor(storeName) {
        this.storeName = storeName;
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        // Implementación básica - se puede expandir según necesidades
        return new Promise((resolve) => {
            setTimeout(resolve, 0); // Simular inicialización async
        });
    }

    async get(key) {
        await this.initPromise;
        // Implementación simplificada
        return null;
    }

    async set(key, item) {
        await this.initPromise;
        // Implementación simplificada
        return false;
    }

    async delete(key) {
        await this.initPromise;
        return false;
    }

    async clear() {
        await this.initPromise;
        return false;
    }

    async cleanup() {
        await this.initPromise;
        return false;
    }
}

// --- SISTEMA DE PERFORMANCE ---

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.enabled = SAO_CONFIG.monitoring.enablePerformanceTracking;
    }

    startMeasurement(name) {
        if (!this.enabled) return;
        this.metrics.set(name, {
            start: performance.now(),
            marks: []
        });
    }

    mark(name, markName) {
        if (!this.enabled) return;
        const metric = this.metrics.get(name);
        if (metric) {
            metric.marks.push({
                name: markName,
                time: performance.now()
            });
        }
    }

    endMeasurement(name) {
        if (!this.enabled) return null;

        const metric = this.metrics.get(name);
        if (!metric) return null;

        const end = performance.now();
        const duration = end - metric.start;

        const result = {
            name,
            duration,
            start: metric.start,
            end,
            marks: metric.marks
        };

        this.metrics.delete(name);
        return result;
    }

    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    logSlowOperation(name, threshold = 100) {
        const metric = this.endMeasurement(name);
        if (metric && metric.duration > threshold) {
            console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
        }
    }
}

// --- INICIALIZACIÓN DE CONFIGURACIÓN ---

const configManager = new ConfigManager();
const cacheManager = new CacheManager(configManager);
const performanceMonitor = new PerformanceMonitor();

// Cargar overrides guardados
configManager.loadOverrides();

// Hacer disponibles globalmente
window.SAO = window.SAO || {};
window.SAO.config = configManager;
window.SAO.cache = cacheManager;
window.SAO.performance = performanceMonitor;

// Cleanup periódico del caché
setInterval(() => {
    cacheManager.cleanup();
}, 60 * 60 * 1000); // Cada hora

console.log('🎯 SAO Advanced Configuration loaded', {
    version: SAO_CONFIG.version,
    environment: SAO_CONFIG.environment,
    features: Object.keys(SAO_CONFIG).filter(k => typeof SAO_CONFIG[k] === 'object')
});