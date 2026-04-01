#!/bin/bash

# --- BUILD AVANZADO SAO OS ---
# Script de construcción automatizado con validaciones y optimizaciones

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."

    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        error "npm no está instalado"
        exit 1
    fi

    if ! command -v java &> /dev/null; then
        error "Java no está instalado"
        exit 1
    fi

    success "Dependencias verificadas"
}

# Verificar archivos de la arquitectura
check_architecture() {
    log "Verificando arquitectura avanzada..."

    local required_files=(
        "assets/js/core/config.js"
        "assets/js/core/logging.js"
        "assets/js/core/architecture.js"
        "assets/js/app.js"
        "SAO.html"
    )

    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Archivo requerido faltante: $file"
            exit 1
        fi
    done

    success "Arquitectura verificada"
}

# Validar sintaxis JavaScript
validate_javascript() {
    log "Validando sintaxis JavaScript..."

    local js_files=(
        "assets/js/core/config.js"
        "assets/js/core/logging.js"
        "assets/js/core/architecture.js"
        "assets/js/app.js"
        "assets/js/tailwind-config.js"
    )

    for file in "${js_files[@]}"; do
        if [[ -f "$file" ]]; then
            if ! node -c "$file" 2>/dev/null; then
                error "Error de sintaxis en $file"
                exit 1
            fi
        fi
    done

    success "Sintaxis JavaScript validada"
}

# Verificar configuración
validate_config() {
    log "Validando configuración..."

    # Verificar que el config se pueda cargar
    if ! node -e "
        try {
            const fs = require('fs');
            const config = fs.readFileSync('assets/js/core/config.js', 'utf8');
            // Verificar que tenga la estructura básica
            if (!config.includes('SAO_CONFIG') || !config.includes('Object.freeze')) {
                throw new Error('Configuración inválida');
            }
            console.log('Configuración válida');
        } catch (error) {
            console.error('Error en configuración:', error.message);
            process.exit(1);
        }
    "; then
        error "Configuración inválida"
        exit 1
    fi

    success "Configuración validada"
}

# Optimizar assets
optimize_assets() {
    log "Optimizando assets..."

    # Crear directorio de build si no existe
    mkdir -p build

    # Copiar archivos principales
    cp SAO.html build/
    cp -r assets build/

    # Minificar archivos JavaScript (si terser está disponible)
    if command -v terser &> /dev/null; then
        log "Minificando JavaScript..."

        # Archivos a minificar
        local files_to_minify=(
            "build/assets/js/core/config.js"
            "build/assets/js/core/logging.js"
            "build/assets/js/core/architecture.js"
            "build/assets/js/app.js"
        )

        for file in "${files_to_minify[@]}"; do
            if [[ -f "$file" ]]; then
                terser "$file" --compress --mangle --output "${file%.js}.min.js"
                mv "${file%.js}.min.js" "$file"
            fi
        done

        success "JavaScript minificado"
    else
        warn "terser no está disponible, omitiendo minificación"
    fi

    success "Assets optimizados"
}

# Construir APK
build_apk() {
    log "Construyendo APK..."

    # Verificar que estamos en el directorio correcto
    if [[ ! -f "android/build.gradle.kts" ]]; then
        error "No se encuentra el proyecto Android"
        exit 1
    fi

    cd android

    # Limpiar build anterior
    ./gradlew clean

    # Construir APK
    if ./gradlew assembleDebug; then
        success "APK construido exitosamente"

        # Copiar APK al directorio raíz
        local apk_path="app/build/outputs/apk/debug/app-debug.apk"
        if [[ -f "$apk_path" ]]; then
            cp "$apk_path" "../build/SAO_OS_v2.0.0.apk"
            success "APK copiado a build/SAO_OS_v2.0.0.apk"
        else
            warn "APK no encontrado en la ruta esperada"
        fi
    else
        error "Error al construir APK"
        exit 1
    fi

    cd ..
}

# Generar reporte de build
generate_report() {
    log "Generando reporte de build..."

    local report_file="build/build-report.txt"
    {
        echo "=== SAO OS Build Report ==="
        echo "Fecha: $(date)"
        echo "Versión: 2.0.0"
        echo "Arquitectura: Advanced Modular"
        echo ""
        echo "=== Archivos Incluidos ==="
        find build -type f -name "*.js" -o -name "*.html" -o -name "*.css" | sort
        echo ""
        echo "=== Estadísticas ==="
        echo "Total archivos JS: $(find build -name "*.js" | wc -l)"
        echo "Total archivos HTML: $(find build -name "*.html" | wc -l)"
        echo "Total archivos CSS: $(find build -name "*.css" | wc -l)"
        echo "Tamaño total: $(du -sh build | cut -f1)"
        echo ""
        echo "=== APK ==="
        if [[ -f "build/SAO_OS_v2.0.0.apk" ]]; then
            echo "APK generado: build/SAO_OS_v2.0.0.apk"
            echo "Tamaño APK: $(du -sh build/SAO_OS_v2.0.0.apk | cut -f1)"
        else
            echo "APK no generado"
        fi
    } > "$report_file"

    success "Reporte generado: $report_file"
}

# Función principal
main() {
    log "🚀 Iniciando build avanzado de SAO OS v2.0.0"

    check_dependencies
    check_architecture
    validate_javascript
    validate_config
    optimize_assets
    build_apk
    generate_report

    success "🎉 Build completado exitosamente!"
    echo ""
    echo "Archivos generados:"
    echo "  - build/SAO.html (aplicación web optimizada)"
    echo "  - build/assets/ (assets optimizados)"
    echo "  - build/SAO_OS_v2.0.0.apk (APK Android)"
    echo "  - build/build-report.txt (reporte de build)"
    echo ""
    echo "Para probar la aplicación web: abrir build/SAO.html en un navegador"
    echo "Para instalar el APK: transferir build/SAO_OS_v2.0.0.apk a un dispositivo Android"
}

# Manejar argumentos
case "${1:-}" in
    "check")
        check_dependencies
        check_architecture
        validate_javascript
        validate_config
        success "Todas las verificaciones pasaron"
        ;;
    "optimize")
        optimize_assets
        ;;
    "apk")
        build_apk
        ;;
    "report")
        generate_report
        ;;
    *)
        main
        ;;
esac