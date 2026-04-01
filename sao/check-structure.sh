#!/bin/bash

echo "=== Analizando estructura de app.js ==="
echo ""

echo "Línea 3 (IIFE abierta):"
sed -n '3p' /home/sao/sao/assets/js/app.js
echo ""

echo "Línea 911 (¿Cierre de IIFE?):"
sed -n '911p' /home/sao/sao/assets/js/app.js
echo ""

echo "Línea 5561 (función init):"
sed -n '5561p' /home/sao/sao/assets/js/app.js
echo ""

echo "Línea 5680 (addEventListener DOMContentLoaded):"
sed -n '5680p' /home/sao/sao/assets/js/app.js
echo ""

echo "Total de líneas:"
wc -l /home/sao/sao/assets/js/app.js
echo ""

echo "Buscando '))();' con contexto:"
grep -B2 -A2 '})();' /home/sao/sao/assets/js/app.js | head -20
