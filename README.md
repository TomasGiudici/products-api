# Products API

API de catálogo de productos.

Permite registrar y consultar productos por EAN-13, junto con sus marcas, categorías, unidades de medida e imágenes. Está pensada para ser consumida principalmente por otros sistemas backend.

La API no maneja precios, sucursales ni historial de precios.

## Tecnologías

- NestJS
- Prisma
- PostgreSQL / Supabase
- Supabase Storage

## Base URL

En desarrollo:

```http
http://localhost:3000/scanner
```

En producción, reemplazar por la URL correspondiente del despliegue.

Ejemplo:

```http
https://tu-api-deployada.com/scanner
```

## Variables de entorno

Crear un archivo `.env` a partir de `.env.template`.

### Descripción de variables

| Variable | Descripción |
| `NODE_ENV` | Entorno de ejecución. Ejemplo: `development` o `production`. |
| `DATABASE_URL` | URL de conexión a PostgreSQL/Supabase usada por Prisma. |
| `PORT` | Puerto donde levanta la API. En producción puede ser asignado por el proveedor. |
| `CORS_ORIGINS` | Orígenes permitidos para requests desde navegador. Separar múltiples URLs con coma. |
| `API_KEY` | Clave privada requerida para endpoints de escritura. |
| `SUPABASE_URL` | URL del proyecto de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role de Supabase. Solo debe usarse en backend. |
| `SUPABASE_PRODUCT_IMAGES_BUCKET` | Nombre del bucket de Supabase Storage donde se guardan imágenes de productos. |

## Autenticación

Los endpoints de escritura (POST) requieren API Key.

Debe enviarse el siguiente header:

x-api-key: TU_API_KEY

Los endpoints `GET` no requieren API Key.

Endpoints protegidos:

POST /product
POST /brand
POST /category
POST /unit-of-measure

Endpoints públicos:

GET /health
GET /product/ean/:ean
GET /brand
GET /brand/:id
GET /category
GET /category/:id
GET /unit-of-measure
GET /unit-of-measure/:id

## Health check

### GET `/health`

Permite verificar que la API está activa.

Ejemplo:

```http
GET http://localhost:3000/scanner/health
```

Respuesta:

```json
{
  "status": "ok",
  "timestamp": "2026-07-13T15:00:00.000Z"
}
```

## Productos

### GET `/product/ean/:ean`

Consulta un producto por su código EAN-13.

Ejemplo:

```http
GET http://localhost:3000/scanner/product/ean/7790000000001
```

Respuesta:

```json
{
  "ean": "7790000000001",
  "name": "Producto de prueba 500 ml",
  "brand": {
    "id": 1,
    "name": "Coca Cola"
  },
  "category": {
    "id": 1,
    "name": "Bebidas"
  },
  "quantity": 500,
  "unitsPerPack": 1,
  "unit": {
    "id": 1,
    "name": "Mililitro",
    "abbreviation": "ml"
  },
  "imagePath": "products/7790000000001.jpg"
}
```

Si el producto no existe, responde `404 Not Found`.

### POST `/product`

Crea un producto.

Requiere API Key.

Este endpoint acepta `multipart/form-data`, porque puede recibir una imagen.

Campos:

| Campo | Tipo | Requerido | Descripción |
| `ean` | string | Sí | Código EAN-13 del producto. Debe tener exactamente 13 dígitos. |
| `name` | string | Sí | Nombre del producto. |
| `brandName` | string | Sí | Nombre de la marca. Si no existe, se crea automáticamente. |
| `categoryName` | string | Sí | Nombre de la categoría. Debe existir previamente. |
| `quantity` | number | No | Cantidad del producto. Ejemplo: `500`, `1.5`. |
| `unitAbbreviation` | string | No | Abreviatura de unidad de medida. Ejemplo: `ml`, `g`, `kg`. Debe existir previamente. |
| `unitsPerPack` | number | No | Unidades por pack. |
| `image` | file | No | Imagen del producto. Formatos permitidos: JPG, PNG o WEBP. |

Ejemplo con `curl` en Windows CMD:

```cmd
curl.exe -X POST "http://localhost:3000/scanner/product" ^
  -H "x-api-key: YOUR_PRIVATE_API_KEY" ^
  -F "ean=7790000000001" ^
  -F "name=Producto de prueba 500 ml" ^
  -F "brandName=Coca Cola" ^
  -F "categoryName=Bebidas" ^
  -F "quantity=500" ^
  -F "unitAbbreviation=ml" ^
  -F "unitsPerPack=1" ^
  -F "image=@C:\ruta\a\imagen.jpg;type=image/jpeg"
```

Ejemplo con `curl` en PowerShell:

```powershell
curl.exe -X POST "http://localhost:3000/scanner/product" `
  -H "x-api-key: YOUR_PRIVATE_API_KEY" `
  -F "ean=7790000000001" `
  -F "name=Producto de prueba 500 ml" `
  -F "brandName=Coca Cola" `
  -F "categoryName=Bebidas" `
  -F "quantity=500" `
  -F "unitAbbreviation=ml" `
  -F "unitsPerPack=1" `
  -F "image=@C:\ruta\a\imagen.jpg;type=image/jpeg"
```

Notas importantes:

- La marca se crea automáticamente si no existe.
- La categoría debe existir previamente.
- La unidad de medida debe existir previamente si se informa `unitAbbreviation`.
- La imagen es opcional.
- Si se envía imagen, la API la sube a Supabase Storage.
- En la base de datos se guarda solo el `imagePath`, no el archivo completo.
- Si la imagen se sube correctamente pero falla la creación del producto, la API intenta borrar la imagen para evitar archivos huérfanos.

Respuesta esperada:

```json
{
  "ean": "7790000000001",
  "name": "Producto de prueba 500 ml",
  "brand": {
    "id": 1,
    "name": "Coca Cola"
  },
  "category": {
    "id": 1,
    "name": "Bebidas"
  },
  "quantity": 500,
  "unitsPerPack": 1,
  "unit": {
    "id": 1,
    "name": "Mililitro",
    "abbreviation": "ml"
  },
  "imagePath": "products/7790000000001.jpg"
}
```

## Marcas

- La API normaliza internamente el nombre para evitar duplicados equivalentes.
- Ejemplo: `Coca Cola`, `coca-cola` y `CÓCA  COLA` se consideran equivalentes.

## Categorías

- La API normaliza internamente el nombre para evitar duplicados equivalentes.
- Las categorías no se crean automáticamente al crear un producto. Deben existir previamente.

## Unidades de medida

- La abreviatura se normaliza internamente.
- Ejemplo: `ML`, `ml` y `ml.` se consideran equivalentes.

## Imágenes

Las imágenes de productos se envían en el campo `image` del `multipart/form-data`.

Formatos permitidos:

```text
image/jpeg
image/png
image/webp
```

Tamaño máximo:

```text
2 MB
```

La API guarda el archivo en Supabase Storage usando el EAN como nombre base.

Ejemplo de `imagePath` guardado:

```text
products/7790000000001.jpg
```

La respuesta del producto devuelve `imagePath`, no una URL pública completa.

Si otro sistema necesita mostrar la imagen, debe resolver ese path según la configuración de Supabase Storage del proyecto.

## Códigos de error comunes

| Código | Caso |
|---:|---|
| `400 Bad Request` | Datos inválidos, categoría inexistente, unidad inexistente o imagen inválida. |
| `401 Unauthorized` | API Key faltante o inválida. |
| `404 Not Found` | Recurso no encontrado. |
| `409 Conflict` | Recurso duplicado, por ejemplo producto con EAN ya registrado. |
| `500 Internal Server Error` | Error interno del servidor. |

## CORS

La variable `CORS_ORIGINS` solo afecta requests realizados desde navegadores.

Las integraciones backend-to-backend no dependen de CORS.

Si la API solo es consumida por otros backends, CORS no limita esas integraciones.

## Ejecución local

Instalar dependencias:

```bash
npm install
```

Generar Prisma Client:

```bash
npx prisma generate
```

Ejecutar en desarrollo:

```bash
npm run start:dev
```

Compilar:

```bash
npm run build
```

Ejecutar versión compilada:

```bash
npm run start:prod
```

## Pruebas rápidas

Health check:

```http
GET http://localhost:3000/scanner/health
```