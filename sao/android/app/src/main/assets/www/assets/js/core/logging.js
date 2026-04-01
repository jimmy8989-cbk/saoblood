// --- SISTEMA DE LOGGING AVANZADO ---
// Logging estructurado con niveles, filtros y persistencia

class Logger {
    constructor(config) {
        this.config = config;
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4
        };
        this.currentLevel = this.levels[config.get('monitoring.logLevel')] || this.levels.info;
        this.logs = [];
        this.maxLogs = 1000;
        this.filters = new Set();
        this.transports = new Set();
        this.initTransports();
    }

    initTransports() {
        // Transport de consola
        this.addTransport(new ConsoleTransport());

        // Transport de memoria (para debugging)
        this.addTransport(new MemoryTransport());

        // Transport de localStorage (opcional)
        if (this.config.get('monitoring.enableErrorReporting')) {
            this.addTransport(new LocalStorageTransport());
        }
    }

    addTransport(transport) {
        this.transports.add(transport);
    }

    removeTransport(transport) {
        this.transports.delete(transport);
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }

    addFilter(filter) {
        this.filters.add(filter);
    }

    removeFilter(filter) {
        this.filters.delete(filter);
    }

    shouldLog(level, category = null) {
        if (this.levels[level] < this.currentLevel) {
            return false;
        }

        if (category && this.filters.size > 0) {
            return Array.from(this.filters).some(filter => filter(category, level));
        }

        return true;
    }

    log(level, message, data = null, category = 'general') {
        if (!this.shouldLog(level, category)) {
            return;
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            data,
            stack: level === 'error' || level === 'fatal' ? new Error().stack : null,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: window.SAO?.session?.currentSession?.id || null
        };

        // Agregar a memoria
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Enviar a todos los transports
        this.transports.forEach(transport => {
            try {
                transport.log(logEntry);
            } catch (error) {
                console.error('Transport error:', error);
            }
        });

        return logEntry;
    }

    debug(message, data = null, category = 'debug') {
        return this.log('debug', message, data, category);
    }

    info(message, data = null, category = 'info') {
        return this.log('info', message, data, category);
    }

    warn(message, data = null, category = 'warn') {
        return this.log('warn', message, data, category);
    }

    error(message, data = null, category = 'error') {
        return this.log('error', message, data, category);
    }

    fatal(message, data = null, category = 'fatal') {
        return this.log('fatal', message, data, category);
    }

    // Métodos de consulta
    getLogs(level = null, category = null, limit = 100) {
        let filtered = this.logs;

        if (level) {
            filtered = filtered.filter(log => log.level === level);
        }

        if (category) {
            filtered = filtered.filter(log => log.category === category);
        }

        return filtered.slice(-limit);
    }

    getRecentErrors(limit = 10) {
        return this.getLogs(null, 'error', limit);
    }

    getLogsSince(timestamp) {
        return this.logs.filter(log => new Date(log.timestamp) > new Date(timestamp));
    }

    // Exportar logs
    exportLogs(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.logs, null, 2);
            case 'csv':
                return this.logsToCSV();
            default:
                return this.logs;
        }
    }

    logsToCSV() {
        if (this.logs.length === 0) return '';

        const headers = Object.keys(this.logs[0]);
        const csvRows = [headers.join(',')];

        this.logs.forEach(log => {
            const row = headers.map(header => {
                const value = log[header];
                if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                return `"${String(value || '').replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Limpiar logs
    clearLogs() {
        this.logs = [];
        this.transports.forEach(transport => {
            if (transport.clear) {
                transport.clear();
            }
        });
    }

    // Estadísticas
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byCategory: {},
            timeRange: {
                oldest: this.logs[0]?.timestamp,
                newest: this.logs[this.logs.length - 1]?.timestamp
            }
        };

        this.logs.forEach(log => {
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
        });

        return stats;
    }
}

// --- TRANSPORTS DE LOGGING ---

class ConsoleTransport {
    log(entry) {
        const { level, message, data, category, timestamp } = entry;
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;

        switch (level) {
            case 'debug':
                console.debug(prefix, message, data);
                break;
            case 'info':
                console.info(prefix, message, data);
                break;
            case 'warn':
                console.warn(prefix, message, data);
                break;
            case 'error':
            case 'fatal':
                console.error(prefix, message, data, entry.stack);
                break;
        }
    }
}

class MemoryTransport {
    constructor() {
        this.logs = [];
    }

    log(entry) {
        this.logs.push(entry);
        // Mantener solo los últimos 100 logs en memoria
        if (this.logs.length > 100) {
            this.logs.shift();
        }
    }

    clear() {
        this.logs = [];
    }
}

class LocalStorageTransport {
    constructor() {
        this.key = 'sao-error-logs';
        this.maxEntries = 50;
        this.load();
    }

    load() {
        try {
            const stored = localStorage.getItem(this.key);
            this.logs = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load error logs from localStorage', error);
            this.logs = [];
        }
    }

    save() {
        try {
            // Solo guardar errores y fatales
            const errors = this.logs.filter(log => log.level === 'error' || log.level === 'fatal');
            localStorage.setItem(this.key, JSON.stringify(errors.slice(-this.maxEntries)));
        } catch (error) {
            console.warn('Failed to save error logs to localStorage', error);
        }
    }

    log(entry) {
        // Solo loguear errores y fatales
        if (entry.level === 'error' || entry.level === 'fatal') {
            this.logs.push(entry);
            this.save();
        }
    }

    clear() {
        this.logs = [];
        localStorage.removeItem(this.key);
    }
}

// --- LOGGING DE PERFORMANCE ---

class PerformanceLogger {
    constructor(logger) {
        this.logger = logger;
    }

    logSlowOperation(name, duration, threshold = 100) {
        if (duration > threshold) {
            this.logger.warn(`Slow operation: ${name}`, {
                duration: `${duration.toFixed(2)}ms`,
                threshold: `${threshold}ms`,
                operation: name
            }, 'performance');
        }
    }

    logMemoryUsage() {
        const mem = window.SAO?.performance?.getMemoryUsage();
        if (mem) {
            const usagePercent = (mem.used / mem.limit * 100).toFixed(2);
            this.logger.info('Memory usage', {
                used: `${(mem.used / 1024 / 1024).toFixed(2)}MB`,
                total: `${(mem.total / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(mem.limit / 1024 / 1024).toFixed(2)}MB`,
                usagePercent: `${usagePercent}%`
            }, 'performance');
        }
    }

    logAPIRequest(endpoint, method, duration, status) {
        const level = status >= 400 ? 'error' : 'info';
        this.logger[level](`API Request: ${method} ${endpoint}`, {
            duration: `${duration.toFixed(2)}ms`,
            status,
            endpoint,
            method
        }, 'api');
    }

    logFirebaseOperation(operation, duration, success = true) {
        const level = success ? 'debug' : 'error';
        this.logger[level](`Firebase ${operation}`, {
            duration: `${duration.toFixed(2)}ms`,
            success
        }, 'firebase');
    }
}

// --- INICIALIZACIÓN ---

// Crear instancia global del logger
const logger = new Logger(window.SAO?.config || { get: () => 'info' });
const performanceLogger = new PerformanceLogger(logger);

// Hacer disponibles globalmente
window.SAO = window.SAO || {};
window.SAO.logger = logger;
window.SAO.performanceLogger = performanceLogger;

// Logging de inicialización
logger.info('Advanced logging system initialized', {
    level: Object.keys(logger.levels)[logger.currentLevel],
    transports: logger.transports.size,
    filters: logger.filters.size
}, 'system');

console.log('📝 SAO Advanced Logging System loaded');