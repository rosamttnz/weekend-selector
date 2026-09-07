# Weekend Selector — Vercel

MVP listo para desplegar como una única aplicación Next.js en Vercel.

## 1. GitHub

Sube todo el contenido de este proyecto a un repositorio de GitHub.

## 2. PostgreSQL

Crea una base de datos PostgreSQL. Copia su connection string.

## 3. Vercel

Importa el repositorio en Vercel y añade:

DATABASE_URL=tu_connection_string

Vercel ejecutará automáticamente:

prisma generate && prisma migrate deploy && next build

## 4. Resultado

Vercel te dará una URL tipo:

https://weekend-selector-xxxxx.vercel.app

No necesitas comprar ningún dominio.

## Rutas

/                  Crear encuesta
/poll/<slug>       Encuesta pública + resultados
/edit/<token>      Editar una respuesta

## Nota

El MVP no tiene autenticación. El token de edición funciona como un enlace privado: cualquiera que tenga ese enlace puede modificar esa respuesta.
