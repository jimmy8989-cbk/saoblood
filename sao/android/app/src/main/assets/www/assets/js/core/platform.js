(function initSAOPlatform(global) {
    'use strict';

    if (global.SAOPlatform) return;

    const STORAGE_KEYS = Object.freeze({
        sessions: 'sao_chat_history',
        apiKeys: 'sao_api_keys',
        apiRouting: 'sao_api_routing',
        modelId: 'sao_model_id',
        activeVibe: 'sao_vibe',
        customVibePrompt: 'sao_custom_vibe_prompt',
        userName: 'sao_user_name',
        userGender: 'sao_user_gender',
        responseLength: 'sao_length',
        creativity: 'sao_creativity',
        neonMode: 'sao_neon_mode',
        compactMode: 'sao_compact_mode',
        glassMode: 'sao_glass_mode',
        isDarkMode: 'sao_dark_mode',
        dynamicUI: 'sao_dynamic_ui',
        fusionMode: 'sao_fusion_mode',
        fusionPrimaryVibe: 'sao_fusion_primary_vibe',
        fusionSecondaryVibe: 'sao_fusion_secondary_vibe',
        fusionBalance: 'sao_fusion_balance',
        fusionProfile: 'sao_fusion_profile',
        mindMode: 'sao_mind_mode',
        flowMode: 'sao_flow_mode',
        arenaMode: 'sao_arena_mode',
        agent2Vibe: 'sao_agent2_vibe',
        agent2Model: 'sao_agent2_model',
        authUserId: 'sao_auth_user_id',
        authUserEmail: 'sao_auth_user_email',
        userName: 'sao_user_name_profile',
        userProfilePhotoUrl: 'sao_user_profile_photo'
    });

    const DEFAULT_API_ROUTING = Object.freeze({
        chat: { provider: 'gemini', keySlot: 'chat', model: 'gemini-2.5-flash' },
        suggestions: { provider: 'groq', keySlot: 'suggestions', model: 'llama-3.1-8b-instant' },
        labs: { provider: 'groq', keySlot: 'labs', model: 'llama-3.1-8b-instant' }
    });

    const storageWriteCache = new Map();

    function logStorageWarning(action, key, error) {
        console.warn(`[SAOPlatform] No se pudo ${action} "${key}"`, error);
    }

    function readText(key, fallback = '') {
        try {
            const value = global.localStorage.getItem(key);
            if (value != null) storageWriteCache.set(key, value);
            return value ?? fallback;
        } catch (error) {
            logStorageWarning('leer', key, error);
            return fallback;
        }
    }

    function readJSON(key, fallback) {
        try {
            const value = global.localStorage.getItem(key);
            if (value != null) storageWriteCache.set(key, value);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            logStorageWarning('parsear', key, error);
            return fallback;
        }
    }

    function readBoolean(key, fallback) {
        try {
            const value = global.localStorage.getItem(key);
            return value == null ? fallback : JSON.parse(value);
        } catch (error) {
            logStorageWarning('parsear', key, error);
            return fallback;
        }
    }

    function readNumber(key, fallback) {
        const parsed = Number.parseFloat(readText(key, String(fallback)));
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function writeValue(key, value) {
        if (storageWriteCache.get(key) === value) return;
        try {
            global.localStorage.setItem(key, value);
            storageWriteCache.set(key, value);
        } catch (error) {
            logStorageWarning('guardar', key, error);
        }
    }

    function writeJSON(key, value) {
        writeValue(key, JSON.stringify(value));
    }

    function createStorageSafeSessions(sessions) {
        if (!Array.isArray(sessions)) return [];

        return sessions.slice(0, 40).map(session => ({
            ...session,
            messages: Array.isArray(session?.messages)
                ? session.messages.slice(-80).map(message => {
                    const safeMessage = { ...message };

                    if (typeof safeMessage.image === 'string' && safeMessage.image.startsWith('data:')) {
                        safeMessage.image = '';
                        safeMessage.imageOmitted = true;
                    }

                    if (typeof safeMessage.text === 'string' && safeMessage.text.length > 12000) {
                        safeMessage.text = safeMessage.text.slice(0, 12000);
                    }

                    return safeMessage;
                })
                : []
        }));
    }

    function normalizeApiRouting(routing) {
        const safeRouting = routing && typeof routing === 'object' ? routing : {};
        const safeChat = safeRouting.chat && typeof safeRouting.chat === 'object' ? safeRouting.chat : {};

        return {
            chat: {
                provider: safeChat.provider || DEFAULT_API_ROUTING.chat.provider,
                keySlot: DEFAULT_API_ROUTING.chat.keySlot,
                model: safeChat.model || DEFAULT_API_ROUTING.chat.model
            },
            suggestions: {
                provider: DEFAULT_API_ROUTING.suggestions.provider,
                keySlot: DEFAULT_API_ROUTING.suggestions.keySlot,
                model: DEFAULT_API_ROUTING.suggestions.model
            },
            labs: {
                provider: DEFAULT_API_ROUTING.labs.provider,
                keySlot: DEFAULT_API_ROUTING.labs.keySlot,
                model: DEFAULT_API_ROUTING.labs.model
            }
        };
    }

    function createInitialState() {
        return {
            sessions: readJSON(STORAGE_KEYS.sessions, []),
            apiKeys: readJSON(STORAGE_KEYS.apiKeys, { chat: '', tools: '', suggestions: '', labs: '' }),
            apiRouting: normalizeApiRouting(readJSON(STORAGE_KEYS.apiRouting, DEFAULT_API_ROUTING)),
            modelId: readText(STORAGE_KEYS.modelId, 'gemini-2.5-flash'),
            activeVibe: readText(STORAGE_KEYS.activeVibe, 'chill'),
            customVibePrompt: readText(STORAGE_KEYS.customVibePrompt, 'Eres un asistente útil.'),
            userName: readText(STORAGE_KEYS.userName, 'Bro'),
            userGender: readText(STORAGE_KEYS.userGender, 'hombre'),
            responseLength: readText(STORAGE_KEYS.responseLength, 'normal'),
            creativity: readNumber(STORAGE_KEYS.creativity, 0.7),
            neonMode: readBoolean(STORAGE_KEYS.neonMode, true),
            compactMode: readBoolean(STORAGE_KEYS.compactMode, false),
            glassMode: readBoolean(STORAGE_KEYS.glassMode, true),
            isDarkMode: readBoolean(STORAGE_KEYS.isDarkMode, true),
            dynamicUI: readBoolean(STORAGE_KEYS.dynamicUI, true),
            fusionMode: readText(STORAGE_KEYS.fusionMode, 'off'),
            fusionPrimaryVibe: readText(STORAGE_KEYS.fusionPrimaryVibe, 'chill'),
            fusionSecondaryVibe: readText(STORAGE_KEYS.fusionSecondaryVibe, 'study'),
            fusionBalance: readNumber(STORAGE_KEYS.fusionBalance, 70),
            fusionProfile: readText(STORAGE_KEYS.fusionProfile, 'balanced'),
            mindMode: readText(STORAGE_KEYS.mindMode, 'normal'),
            flowMode: readText(STORAGE_KEYS.flowMode, 'steady'),
            sidebarQuickPanel: '',
            isBattleMode: false,
            arenaMode: readText(STORAGE_KEYS.arenaMode, 'debate'),
            agent2Vibe: readText(STORAGE_KEYS.agent2Vibe, 'hater'),
            agent2Model: readText(STORAGE_KEYS.agent2Model, 'gemini-2.5-flash'),
            authUserId: readText(STORAGE_KEYS.authUserId, ''),
            authUserEmail: readText(STORAGE_KEYS.authUserEmail, ''),
            userProfilePhotoUrl: readText(STORAGE_KEYS.userProfilePhotoUrl, ''),

            currentSessionId: null,
            messages: [],
            isLoading: false,
            isStreaming: false,
            isZenMode: false,
            suggestions: [],
            isLoadingSuggestions: false,
            isScrolledUp: false,
            currentTab: 'appearance',
            abortController: null,
            pendingImage: null,
            pendingImageMime: null,
            replyContext: null,
            sessionMenuId: null,
            sessionPressTimer: null,
            sessionClickLockUntil: 0
        };
    }

    function persistPreferences(state) {
        writeJSON(STORAGE_KEYS.apiKeys, state.apiKeys);
        writeJSON(STORAGE_KEYS.apiRouting, normalizeApiRouting(state.apiRouting));
        writeValue(STORAGE_KEYS.modelId, state.modelId);
        writeValue(STORAGE_KEYS.activeVibe, state.activeVibe);
        writeValue(STORAGE_KEYS.customVibePrompt, state.customVibePrompt);
        writeValue(STORAGE_KEYS.userName, state.userName);
        writeValue(STORAGE_KEYS.userGender, state.userGender);
        writeValue(STORAGE_KEYS.responseLength, state.responseLength);
        writeValue(STORAGE_KEYS.creativity, String(state.creativity));
        writeValue(STORAGE_KEYS.neonMode, JSON.stringify(state.neonMode));
        writeValue(STORAGE_KEYS.compactMode, JSON.stringify(state.compactMode));
        writeValue(STORAGE_KEYS.glassMode, JSON.stringify(state.glassMode));
        writeValue(STORAGE_KEYS.isDarkMode, JSON.stringify(state.isDarkMode));
        writeValue(STORAGE_KEYS.dynamicUI, JSON.stringify(state.dynamicUI));
        writeValue(STORAGE_KEYS.fusionMode, state.fusionMode);
        writeValue(STORAGE_KEYS.fusionPrimaryVibe, state.fusionPrimaryVibe);
        writeValue(STORAGE_KEYS.fusionSecondaryVibe, state.fusionSecondaryVibe);
        writeValue(STORAGE_KEYS.fusionBalance, String(state.fusionBalance));
        writeValue(STORAGE_KEYS.fusionProfile, state.fusionProfile);
        writeValue(STORAGE_KEYS.mindMode, state.mindMode);
        writeValue(STORAGE_KEYS.flowMode, state.flowMode);
        writeValue(STORAGE_KEYS.arenaMode, state.arenaMode);
        writeValue(STORAGE_KEYS.agent2Vibe, state.agent2Vibe);
        writeValue(STORAGE_KEYS.agent2Model, state.agent2Model);
        writeValue(STORAGE_KEYS.authUserId, state.authUserId || '');
        writeValue(STORAGE_KEYS.authUserEmail, state.authUserEmail || '');
        writeValue(STORAGE_KEYS.userProfilePhotoUrl, state.userProfilePhotoUrl || '');
    }

    function persistState(state, options = {}) {
        const { includeSessions = true } = options;
        persistPreferences(state);
        if (includeSessions) {
            writeJSON(STORAGE_KEYS.sessions, createStorageSafeSessions(state.sessions));
        }
    }

    function createDOMBindings(root = document) {
        const get = (id) => root.getElementById(id);

        return Object.freeze({
            appContainer: get('app-container'),
            appHeader: get('app-header'),
            sidebar: get('sidebar'),
            chatContainer: get('chat-container'),
            messagesWrapper: get('messages-wrapper'),
            chatInput: get('chat-input'),
            chatForm: get('chat-form'),
            btnSend: get('btn-send'),
            btnStop: get('btn-stop'),
            btnScrollDown: get('btn-scroll-down'),
            sessionsList: get('sessions-list'),
            sidebarQuickPanel: get('sidebar-quick-panel'),
            settingsModal: get('settings-modal'),
            settingsPanel: get('settings-panel'),
            settingsNav: get('settings-nav'),
            settingsTabs: get('settings-tabs'),
            settingsContent: get('settings-content'),
            neonContainer: get('neon-container'),
            btnArena: get('btn-arena'),
            charCounter: get('char-counter'),
            replyBanner: get('reply-banner'),
            typingIndicator: get('typing-indicator-header'),
            toastContainer: get('toast-container'),
            fxCanvas: get('fx-canvas'),
            mobileSidebarScrim: get('mobile-sidebar-scrim'),
            mobileSidebarToggle: get('mobile-sidebar-toggle'),
            sessionMenuOverlay: get('session-menu-overlay'),
            sessionMenuPanel: get('session-menu-panel'),
            sessionMenuTitle: get('session-menu-title'),
            sessionMenuActions: get('session-menu-actions'),
            sessionRenameBox: get('session-rename-box'),
            sessionRenameInput: get('session-rename-input'),
            energyValue: get('energy-value'),
            composerVibeChip: get('composer-vibe-chip'),
            composerModelChip: get('composer-model-chip'),
            composerStateLabel: get('composer-state-label')
        });
    }

    function syncWindowState(state) {
        global.state = state;
        return state;
    }

    global.SAOPlatform = Object.freeze({
        STORAGE_KEYS,
        DEFAULT_API_ROUTING,
        createInitialState,
        persistState,
        normalizeApiRouting,
        createDOMBindings,
        syncWindowState,
        readText,
        readJSON,
        readBoolean,
        readNumber,
        createStorageSafeSessions
    });
})(window);
