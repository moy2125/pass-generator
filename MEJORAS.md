# Plan de Mejoras - Password Generator

## Seguridad

### 1. CSP muy permisivo (PRIORIDAD ALTA)
- `unsafe-inline` en script-src permite XSS
- Solución: Migrar event handlers inline a addEventListener en JS
- **Estado**: ✅ Completado

### 2. anime.js desde CDN
- Aunque tiene integrity hash, podrías bundlear localmente para zero-dependency
- **Estado**: ✅ Completado

### 3. No hay Rate Limiting
- Un atacante podría generar millones de passwords localmente para análisis (impacto bajo)
- Solución: Agregado cooldown de 500ms entre generaciones para prevenir spam accidental
- **Estado**: ✅ Completado

---

## UX/UI

### 4. Botones con IDs genéricos
- `button`, `copy` son IDs poco descriptivos
- Usar clases semánticas
- **Estado**: ✅ Completado

### 5. No hay slider para length
- Más intuitivo que input numérico
- **Estado**: ✅ Completado

### 6. Sin feedback visual de fortaleza
- Indicador de "password strength" ayudaría
- **Estado**: ✅ Completado

### 7. No hay opción de excluir caracteres ambiguos
- (0/O, l/1/I)
- **Estado**: ❌ Descartado por el usuario

### 8. No hay botón para regenerar rápidamente
- Teclado shortcut (Enter/space)
- **Estado**: ✅ Completado

---

## Código

### 9. Funciones globales sin encapsular
- Todo en global scope
- Podrías usar IIFE o module pattern
- **Estado**: ✅ Completado

### 10. Constantes hardcodeadas
- `letters`, `numbers`, `specials` hardcodeadas
- Podrían extraerse a configuración
- **Estado**: ✅ Completado

### 11. No hay tests unitarios
- Solo E2E con Playwright; unit tests serían más rápidos
- **Estado**: ⚠️ Descartado - 36 tests E2E cubren la funcionalidad

### 12. Error en mensaje de copy
- "Error al copiar texto" está en español mixto con inglés
- **Estado**: ✅ Completado (ya estaba corregido)

---

## Features

### 13. No hay opción para uppercase/lowercase only
- **Estado**: ✅ Completado

### 14. No hay historial reciente
- (opt-in, localStorage)
- **Estado**: ✅ Completado

### 15. No hay mostrar/ocultar password toggle
- **Estado**: ✅ Completado

### 16. No hay opción de exportar passwords generados
- **Estado**: ✅ Completado
