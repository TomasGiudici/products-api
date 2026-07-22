# Catalog API

API de catálogo de ítems.

Permite registrar y consultar ítems mediante un tipo de identificador y un valor de identificador, junto con sus marcas, categorías, unidades de medida, metadata e imágenes. Está pensada para ser consumida principalmente por otros sistemas backend.

La API no maneja precios, sucursales ni historial de precios.

## Tecnologías

- NestJS
- Prisma
- PostgreSQL / Supabase
- Supabase Storage

## Base URL

```http
https://tu-api-deployada.com/catalog
```

## Variables de entorno

Crear un archivo `.env` a partir de `.env.template`.

### Descripción de variables

| Variable | Descripción |
|---|---|
| `NODE_ENV` | Entorno de ejecución. Ejemplo: `development` o `production`. |
| `DATABASE_URL` | URL de conexión a PostgreSQL/Supabase usada por Prisma. |
| `PORT` | Puerto donde levanta la API. En producción puede ser asignado por el proveedor. |
| `CORS_ORIGINS` | Orígenes permitidos para requests desde navegador. Separar múltiples URLs con coma. |
| `API_KEY` | Clave privada requerida para endpoints de escritura. |
| `SUPABASE_URL` | URL del proyecto de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role de Supabase. Solo debe usarse en backend. |
| `SUPABASE_PRODUCT_IMAGES_BUCKET` | Nombre del bucket de Supabase Storage donde se guardan imágenes de ítems/productos. |

## Autenticación

Los endpoints de escritura (`POST` y `PATCH`) requieren API Key.

Debe enviarse el siguiente header:

```http
x-api-key: TU_API_KEY
```

Los endpoints `GET` no requieren API Key.

Endpoints protegidos:

```http
POST /items
PATCH /items/:id
POST /brand
POST /category
POST /unit-of-measure
POST /identifier-types
POST /item-types
```

Endpoints públicos:

```http
GET /health
GET /items
GET /items?brandName=:brandName
GET /items?categoryName=:categoryName
GET /items/:id
GET /items/ean/:eanValue
GET /items/ean/:eanValue/summary
GET /brand
GET /brand/:id
GET /category
GET /category/:id
GET /unit-of-measure
GET /unit-of-measure/:id
GET /identifier-types
GET /identifier-types/:id
GET /item-types
GET /item-types/:id
```

## Health check

### GET `/health`

Permite verificar que la API está activa.

Ejemplo:

```http
GET http://localhost:3000/catalog/health
```

Respuesta:

```json
{
  "status": "ok",
  "timestamp": "2026-07-13T15:00:00.000Z"
}
```

## Ítems / productos

### GET `/items/ean/:ean`

Consulta un ítem por tipo de identificador y valor de identificador.

Ejemplo:

```http
GET http://localhost:3000/catalog/items/ean/7790000000001
```

Respuesta:

```json
{
  "id": "7d2b17fd-0f57-4f26-b57b-5a9bb81afeee",
  "ean": "7790000000001",
  "itemType": "Producto de supermercado",
  "name": "Producto de prueba 500 ml",
  "description": "Gaseosa sabor cola en botella de 500 ml.",
  "brand": "Coca Cola",
  "category": "Bebidas",
  "quantity": 500,
  "unitAbbreviation": "ml",
  "imagePath": "items/ean13-7790000000001.jpg",
  "dimensions": {
    "width": 6.5,
    "height": 20,
    "depth": 6.5,
    "unit": "cm"
  },
  "metadata": {
    "container": "bottle",
    "flavor": "cola"
  }
}
```

Los campos opcionales pueden responder `null`.

Si el ítem no existe, responde `404 Not Found`.

### GET `/items`

Lista ítems. Puede usarse sin filtros o con filtros por marca y categoría.

Ejemplo sin filtros:

```http
GET http://localhost:3000/catalog/items
```

Ejemplo filtrando por marca:

```http
GET http://localhost:3000/catalog/items?brandName=Coca%20Cola
```

Ejemplo filtrando por categoría:

```http
GET http://localhost:3000/catalog/items?categoryName=Bebidas
```

Ejemplo filtrando por marca y categoría:

```http
GET http://localhost:3000/catalog/items?brandName=Coca%20Cola&categoryName=Bebidas
```

Respuesta:

```json
[
  {
    "id": "7d2b17fd-0f57-4f26-b57b-5a9bb81afeee",
    "ean": "7790000000001",
    "itemType": "Producto de supermercado",
    "name": "Producto de prueba 500 ml",
    "description": "Gaseosa sabor cola en botella de 500 ml.",
    "brand": "Coca Cola",
    "category": "Bebidas",
    "quantity": 500,
    "unitAbbreviation": "ml",
    "imagePath": "items/ean13-7790000000001.jpg",
    "dimensions": {
      "width": 6.5,
      "height": 20,
      "depth": 6.5,
      "unit": "cm"
    },
    "metadata": {
      "container": "bottle",
      "flavor": "cola"
    }
  }
]
```

### GET `/items/ean/:ean/summary`

Consulta un ítem por identificador y devuelve una respuesta resumida.

Ejemplo:

```http
GET http://localhost:3000/catalog/items/ean/7790000000001/summary
```

Respuesta:

```json
{
  "id": "7d2b17fd-0f57-4f26-b57b-5a9bb81afeee",
  "name": "Producto de prueba 500 ml",
  "brand": "Coca Cola"
}
```

### POST `/items`

Crea un ítem. Para registrar un producto de supermercado, se usa normalmente `itemTypeCode: "SUPERMARKET_PRODUCT"`.

Requiere API Key.

Este endpoint acepta `application/json`. También acepta `multipart/form-data` si se envía una imagen.

Campos:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `ean` | string | Sí | Valor del identificador. Para `EAN13`, sería el código de barras del producto. |
| `name` | string | Sí | Nombre del ítem/producto. |
| `itemTypeCode` | string | No | Código del tipo de ítem. Si se informa, debe existir previamente. Ejemplo: `SUPERMARKET_PRODUCT`. |
| `description` | string | No | Descripción del ítem/producto. |
| `brandName` | string | No | Nombre de la marca. Si no existe, se crea automáticamente. |
| `categoryName` | string | No | Nombre de la categoría. Si se informa, debe existir previamente. |
| `quantity` | number | No | Cantidad del producto. Ejemplo: `500`, `1.5`. |
| `unitAbbreviation` | string | No | Abreviatura de unidad de medida. Ejemplo: `ml`, `g`, `kg`. Debe existir previamente si se informa. |
| `unitsPerPack` | number | No | Unidades por pack. |
| `dimensions` | object | No | Objeto JSON con dimensiones del ítem/producto. |
| `metadata` | object | No | Objeto JSON con información específica del ítem/producto. |
| `image` | file | No | Imagen del ítem/producto. Solo para `multipart/form-data`. Formatos permitidos: JPG, PNG o WEBP. |

Ejemplo JSON sin imagen:

```json
{
  "ean": "7790000000001",
  "itemTypeCode": "SUPERMARKET_PRODUCT",
  "name": "Producto de prueba 500 ml",
  "description": "Gaseosa sabor cola en botella de 500 ml.",
  "brandName": "Coca Cola",
  "categoryName": "Bebidas",
  "quantity": 500,
  "unitAbbreviation": "ml",
  "unitsPerPack": 1,
  "dimensions": {
    "width": 6.5,
    "height": 20,
    "depth": 6.5,
    "unit": "cm"
  },
  "metadata": {
    "container": "bottle",
    "flavor": "cola"
  }
}
```

Notas importantes:

- El tipo de identificador debe existir previamente.
- El tipo de ítem debe existir previamente si se informa `itemTypeCode`.
- La marca se crea automáticamente si no existe.
- La categoría debe existir previamente si se informa `categoryName`.
- La unidad de medida debe existir previamente si se informa `unitAbbreviation`.
- La descripción es opcional.
- Las dimensiones son opcionales.
- La metadata es opcional.
- La imagen es opcional.
- Si se envía imagen, la API la sube a Supabase Storage.
- En la base de datos se guarda solo el `imagePath`, no el archivo completo.
- Si la imagen se sube correctamente pero falla la creación del ítem/producto, la API intenta borrar la imagen para evitar archivos huérfanos.

Respuesta esperada:

```json
{
  "id": "7d2b17fd-0f57-4f26-b57b-5a9bb81afeee",
  "ean": "7790000000001",
  "itemType": "Producto de supermercado",
  "name": "Producto de prueba 500 ml",
  "description": "Gaseosa sabor cola en botella de 500 ml.",
  "brand": "Coca Cola",
  "category": "Bebidas",
  "quantity": 500,
  "unitAbbreviation": "ml",
  "imagePath": "items/ean13-7790000000001.jpg",
  "dimensions": {
    "width": 6.5,
    "height": 20,
    "depth": 6.5,
    "unit": "cm"
  },
  "metadata": {
    "container": "bottle",
    "flavor": "cola"
  }
}
```

## Marcas

- La API normaliza internamente el nombre para evitar duplicados equivalentes.
- Ejemplo: `Coca Cola`, `coca-cola` y `CÓCA  COLA` se consideran equivalentes.

## Categorías

- La API normaliza internamente el nombre para evitar duplicados equivalentes.
- Las categorías no se crean automáticamente al crear un ítem/producto. Deben existir previamente si se informan.

## Unidades de medida

- La abreviatura se normaliza internamente.
- Ejemplo: `ML`, `ml` y `ml.` se consideran equivalentes.

## Imágenes

Las imágenes de ítems/productos se envían en el campo `image` del `multipart/form-data`.

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

La API guarda el archivo en Supabase Storage usando el tipo de identificador y el valor normalizado del identificador como nombre base.

Ejemplo de `imagePath` guardado:

```text
items/ean13-7790000000001.jpg
```

La respuesta del ítem/producto devuelve `imagePath`, no una URL pública completa.

Si otro sistema necesita mostrar la imagen, debe resolver ese path según la configuración de Supabase Storage del proyecto.

## Códigos de error comunes

| Código | Caso |
|---:|---|
| `400 Bad Request` | Datos inválidos, tipo de identificador inexistente, tipo de ítem inexistente, categoría inexistente, unidad inexistente o imagen inválida. |
| `401 Unauthorized` | API Key faltante o inválida. |
| `404 Not Found` | Recurso no encontrado. |
| `409 Conflict` | Recurso duplicado, por ejemplo ítem/producto con identificador ya registrado. |
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
GET http://localhost:3000/catalog/health
```