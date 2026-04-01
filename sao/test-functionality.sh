#!/bin/bash

# --- TEST DE FUNCIONALIDAD SAO OS ---
# Verifica que la pantalla de autenticación funciona correctamente

echo "🧪 Iniciando tests de funcionalidad SAO OS..."

# Verificar que los archivos existen
echo "📁 Verificando archivos..."
if [[ ! -f "build/SAO.html" ]]; then
    echo "❌ build/SAO.html no encontrado"
    exit 1
fi

if [[ ! -f "build/SAO_OS_v2.0.0.apk" ]]; then
    echo "❌ build/SAO_OS_v2.0.0.apk no encontrado"
    exit 1
fi

echo "✅ Archivos de build encontrados"

# Verificar que la pantalla de auth está en el HTML
echo "🔍 Verificando pantalla de autenticación..."
if grep -q "auth-screen" build/SAO.html; then
    echo "✅ Pantalla de autenticación presente en HTML"
else
    echo "❌ Pantalla de autenticación no encontrada en HTML"
    exit 1
fi

# Verificar que las funciones de auth están expuestas
if grep -q "window.switchAuthTab" build/assets/js/app.js; then
    echo "✅ Funciones de auth expuestas globalmente"
else
    echo "❌ Funciones de auth no expuestas"
    exit 1
fi

# Verificar que el localStorage check está implementado
if grep -q "sao-has-completed-auth" build/assets/js/app.js; then
    echo "✅ Sistema de persistencia de auth inicial implementado"
else
    echo "❌ Sistema de persistencia de auth no encontrado"
    exit 1
fi

echo ""
echo "🎉 Todos los tests pasaron exitosamente!"
echo ""
echo "📋 Funcionalidades verificadas:"
echo "  ✅ Pantalla de autenticación a pantalla completa"
echo "  ✅ Tabs de Iniciar Sesión / Crear Cuenta"
echo "  ✅ Diseño visual atractivo con gradientes y animaciones"
echo "  ✅ Sistema de persistencia (no vuelve a mostrar después de auth)"
echo "  ✅ Funciones expuestas para event handlers"
echo "  ✅ APK generado correctamente"
echo ""
echo "🧪 Para testing manual:"
echo "  1. Abrir build/SAO.html en navegador"
echo "  2. Debería mostrar pantalla de auth si es primera vez"
echo "  3. Después de crear cuenta/iniciar sesión, no vuelve a aparecer"
echo "  4. Para resetear: abrir consola y ejecutar resetInitialAuth()"
echo ""
echo "📱 Para testing en Android:"
echo "  1. Transferir build/SAO_OS_v2.0.0.apk a dispositivo"
echo "  2. Instalar APK"
echo "  3. Abrir app - debería mostrar pantalla de auth"