# SAO Android APK

Este proyecto empaqueta el sitio actual en una app Android nativa con `WebView`, manteniendo `SAO.html` y `assets/` como fuente original.

## Cómo compilar

1. Abre la carpeta `android/` en Android Studio.
2. Deja que descargue Gradle y el SDK si lo pide.
3. Ejecuta la tarea `assembleDebug`.
4. El APK queda en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Notas

- El contenido web se copia automáticamente desde la raíz del proyecto mediante la tarea `syncWebAssets`.
- La app carga `SAO.html` desde `https://appassets.androidplatform.net/assets/www/SAO.html` para conservar `fetch`, `localStorage`, subida de imágenes y recursos relativos.
