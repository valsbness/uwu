# UwU Café — Pago semanal

Herramienta independiente basada únicamente en la parte de **Pago semanal** del proyecto de valsbness.

## Incluye
- Área de pago semanal protegida por PIN.
- Carpetas individuales de trabajadores.
- Hasta 100 facturas por trabajador.
- Hasta 100 propinas por trabajador.
- Cálculo automático: **40% de facturas + 100% de propinas**.
- Resumen individual por trabajador.
- Resumen general de toda la semana.
- Eliminar trabajadores protegido por PIN.
- Cerrar/limpiar la semana protegido por PIN.
- Datos guardados localmente en el navegador.
- Logo de UwU Café incluido.

## PIN
El PIN inicial es `****`.

Cámbialo en `script.js`, en la primera línea:
`const PIN="****";`

## Importante
El PIN de esta versión es una protección de interfaz del navegador, no una seguridad de servidor. Para una protección real entre varios dispositivos habría que conectar autenticación y una base de datos (por ejemplo, Supabase).

## Uso
Abre `index.html` en un navegador. No necesita instalación ni servidor para funcionar localmente.
