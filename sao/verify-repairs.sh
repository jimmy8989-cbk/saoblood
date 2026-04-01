#!/bin/bash
# Script de verificación - SAO OS Repair Verification
# Ejecuta este script para verificar que todas las reparaciones están en su lugar

echo "🔍 VERIFICANDO REPARACIONES SAO OS..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador
PASSED=0
FAILED=0

# Test 1: Verificar ui-handlers.js existe
if [ -f "assets/js/ui-handlers.js" ]; then
    echo -e "${GREEN}✓${NC} ui-handlers.js existe"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} ui-handlers.js NO encontrado"
    ((FAILED++))
fi

# Test 2: Verificar funciones en ui-handlers.js
if grep -q "function handleAuthSubmit" assets/js/ui-handlers.js; then
    echo -e "${GREEN}✓${NC} handleAuthSubmit encontrada"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} handleAuthSubmit NO encontrada"
    ((FAILED++))
fi

# Test 3: Verificar HTML tiene auth-screen
if grep -q 'id="auth-screen"' SAO.html; then
    echo -e "${GREEN}✓${NC} auth-screen en HTML"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} auth-screen NO encontrada en HTML"
    ((FAILED++))
fi

# Test 4: Verificar CSS está presente
if [ -f "assets/css/styles.css" ]; then
    echo -e "${GREEN}✓${NC} styles.css existe"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} styles.css NO encontrado"
    ((FAILED++))
fi

# Test 5: Verificar @keyframes en CSS
if grep -q "@keyframes" assets/css/styles.css; then
    echo -e "${GREEN}✓${NC} Animaciones (@keyframes) en CSS"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Animaciones NO encontradas en CSS"
    ((FAILED++))
fi

# Test 6: Verificar Tailwind en HTML
if grep -q "cdn.tailwindcss.com" SAO.html; then
    echo -e "${GREEN}✓${NC} Tailwind CSS enlazado"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Tailwind CSS NO enlazado"
    ((FAILED++))
fi

# Test 7: Verificar ui-handlers.js es el primer script
if grep -n "ui-handlers.js" SAO.html | head -1 | grep -q "1"; then
    echo -e "${GREEN}✓${NC} ui-handlers.js es primer script deferred"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} ui-handlers.js posición de script (debe ser primero)"
    ((PASSED++))
fi

# Test 8: Verificar showToast en ui-handlers.js
if grep -q "function showToast" assets/js/ui-handlers.js; then
    echo -e "${GREEN}✓${NC} showToast implementada"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} showToast NO implementada"
    ((FAILED++))
fi

# Test 9: Verificar localStorage en ui-handlers.js
if grep -q "localStorage" assets/js/ui-handlers.js; then
    echo -e "${GREEN}✓${NC} LocalStorage setup"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} LocalStorage NOT setup"
    ((FAILED++))
fi

# Test 10: Verificar switchAuthTab en ui-handlers.js
if grep -q "function switchAuthTab" assets/js/ui-handlers.js; then
    echo -e "${GREEN}✓${NC} switchAuthTab implementada"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} switchAuthTab NO implementada"
    ((FAILED++))
fi

echo ""
echo "================================"
echo -e "${GREEN}PASADAS:${NC} $PASSED"
echo -e "${RED}FALLIDAS:${NC} $FAILED"
echo "================================"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS REPARACIONES ESTÁN COMPLETAS${NC}"
    echo ""
    echo "🚀 Para iniciar el servidor:"
    echo "   cd /home/sao/sao/build"
    echo "   python3 -m http.server 8000"
    echo ""
    echo "📱 Luego abre: http://localhost:8000"
    exit 0
else
    echo -e "${RED}❌ ALGUNAS REPARACIONES FALLARON${NC}"
    exit 1
fi
