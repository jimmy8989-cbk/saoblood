#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ANALIZADOR PROFUNDO DE SAO OS\n');
console.log('=' .repeat(60) + '\n');

// 1. ANALIZAR HTML
console.log('📄 ANÁLISIS DE SAO.html\n');
const htmlPath = '/home/sao/sao/SAO.html';
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Buscar todos los botones con onclick
const buttonRegex = /<button[^>]*onclick\s*=\s*["']([^"']+)["'][^>]*>/g;
const buttons = [];
let match;
while ((match = buttonRegex.exec(htmlContent)) !== null) {
    buttons.push(match[1]);
}

console.log(`✓ Botones encontrados: ${buttons.length}\n`);

// Extraer nombres de funciones llamadas desde onclick
const functionCallRegex = /(\w+)\s*\(/g;
const functionsUsed = new Set();
buttons.forEach(onclick => {
    let funcMatch;
    while ((funcMatch = functionCallRegex.exec(onclick)) !== null) {
        functionsUsed.add(funcMatch[1]);
    }
});

console.log('Funciones llamadas desde onclick handlers:');
Array.from(functionsUsed).sort().forEach(fn => {
    console.log(`  • ${fn}`);
});
console.log();

// 2. ANALIZAR ui-handlers.js
console.log('=' .repeat(60));
console.log('\n📝 ANÁLISIS DE ui-handlers.js\n');

const uiHandlersPath = '/home/sao/sao/assets/js/ui-handlers.js';
const uiHandlersContent = fs.readFileSync(uiHandlersPath, 'utf8');

// Buscar definiciones de funciones
const functionDefRegex = /(?:^|\n)(?:async\s+)?function\s+(\w+)\s*\(/g;
const definedFunctions = new Set();
let defMatch;
while ((defMatch = functionDefRegex.exec(uiHandlersContent)) !== null) {
    definedFunctions.add(defMatch[1]);
}

console.log(`✓ Funciones definidas: ${definedFunctions.size}\n`);

// 3. COMPARAR
console.log('=' .repeat(60));
console.log('\n🔁 COMPARACIÓN: Onclick vs Definidas\n');

const missing = [];
const found = [];

Array.from(functionsUsed).sort().forEach(fn => {
    if (definedFunctions.has(fn)) {
        found.push(fn);
        console.log(`✓ ${fn}`);
    } else {
        missing.push(fn);
        console.log(`✗ ${fn} - NO DEFINIDA`);
    }
});

if (missing.length > 0) {
    console.log('\n' + '⚠️  FUNCIONES FALTANTES:');
    missing.forEach(fn => console.log(`  ✗ ${fn}`));
}

// 4. VERIFICAR SCOPE GLOBAL
console.log('\n' + '=' .repeat(60));
console.log('\n🌐 VERIFICACIÓN DE SCOPE GLOBAL\n');

const globalAssigns = uiHandlersContent.match(/window\.\w+\s*=/g) || [];
console.log(`Asignaciones a window encontradas: ${globalAssigns.length}`);

if (globalAssigns.length < 5) {
    console.log('⚠️  Pocas asignaciones a window detectadas');
    console.log('Problema posible: Las funciones podrían no estar en scope global\n');
}

// 5. VERIFICAR ERRORES DE SINTAXIS
console.log('=' .repeat(60));
console.log('\n✅ VERIFICACIÓN DE SINTAXIS\n');

const uiErrors = require('child_process').execSync(`node -c "${uiHandlersPath}" 2>&1 || true`).toString();
if (uiErrors.trim()) {
    console.log('❌ Errores en ui-handlers.js:');
    console.log(uiErrors);
} else {
    console.log('✓ Sin errores de sintaxis en ui-handlers.js');
}

// 6. VERIFICAR DEFERENCIA DE SCRIPTS
console.log('\n' + '=' .repeat(60));
console.log('\n📦 ORDEN DE CARGA DE SCRIPTS\n');

const scriptRegex = /<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/g;
const scripts = [];
while ((match = scriptRegex.exec(htmlContent)) !== null) {
    scripts.push(match[1]);
}

scripts.forEach((script, i) => {
    console.log(`${i+1}. ${script}`);
});

// 7. VERIFICAR INICIALIZACIÓN DE app.js
console.log('\n' + '=' .repeat(60));
console.log('\n🚀 ANÁLISIS DE app.js\n');

const appJsPath = '/home/sao/sao/assets/js/app.js';
if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Buscar si sobrescribe window o interfiere
    const windowOverride = appJsContent.match(/window\.(\w+)\s*=/g) || [];
    console.log(`Modificaciones a window: ${windowOverride.length}`);
    
    // Buscar inicializaciones complejas
    if (appJsContent.match(/DOMContentLoaded|addEventListener.*load/)) {
        console.log('✓ app.js tiene listeners de carga');
    }
    
    if (appJsContent.match(/function\s+init|export|addEventListener/)) {
        console.log('✓ app.js tiene lógica de inicialización');
    }
} else {
    console.log('⚠️  app.js no existe');
}

// 8. RESUMEN FINAL
console.log('\n' + '=' .repeat(60));
console.log('\n📊 RESUMEN FINAL\n');

console.log(`Botones en HTML: ${buttons.length}`);
console.log(`Funciones usadas en onclick: ${functionsUsed.size}`);
console.log(`Funciones definidas: ${definedFunctions.size}`);
console.log(`Funciones encontradas: ${found.length}`);
console.log(`Funciones FALTANTES: ${missing.length}`);

if (missing.length > 0) {
    console.log('\n🔴 ESTADO: PROBLEMA CRÍTICO');
    console.log('Hay funciones onclick que no están definidas');
} else if (definedFunctions.size === 0) {
    console.log('\n🔴 ESTADO: PROBLEMA CRÍTICO');
    console.log('No se encontraron funciones definidas en ui-handlers.js');
} else {
    console.log('\n🟢 ESTADO: TODAS LAS FUNCIONES ESTÁN DEFINIDAS');
    console.log('El problema debe ser de inicialización o ejecución en runtime');
}

console.log('\n' + '=' .repeat(60));
console.log('\n💡 RECOMENDACIONES:\n');

if (missing.length > 0) {
    console.log('1. Agregar funciones faltantes a ui-handlers.js');
}

if (globalAssigns.length < 5) {
    console.log('2. Asegurar que las funciones estén en scope global (window.*)');
}

console.log('3. Verificar en browser console si hay errores');
console.log('4. Abrir DIAGNOSTICO.html en navegador para pruebas interactivas');
console.log('5. Probar el archivo con servidor local (HTTP)');

console.log('\n');
