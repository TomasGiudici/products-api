# Products Catalog API

API de catálogo de productos. Permite consultar, crear, modificar, exportar e importar productos identificados por EAN.

La API solo maneja información de catálogo: nombre, marca, categoría, unidad, imagen, descripción, dimensiones y metadata. No maneja precios, supermercados, sucursales ni historial de precios.

## Base URL

Local:

```http
http://localhost:3000/catalog
```

Deploy:

```http
https://tu-api-deployada.com/catalog
```

## Autenticación

Los endpoints protegidos requieren este header:

```http
x-api-key: TU_API_KEY
```

Los endpoints públicos de consulta no requieren API Key.

## Respuesta de producto

Los endpoints que devuelven productos usan esta estructura general:

```json
{
  "id": "uuid-del-producto",
  "ean": "7790000000001",
  "itemType": "Producto de supermercado",
  "name": "Coca Cola 500 ml",
  "description": "Gaseosa sabor cola.",
  "brand": "Coca Cola",
  "category": "Bebidas",
  "quantity": 500,
  "unitAbbreviation": "ml",
  "imageUrl": "https://...",
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

Los campos opcionales pueden venir como `null`.

## Endpoints principales

| Método | Endpoint | API Key | Descripción |
|---|---|---:|---|
| `GET` | `/health` | No | Verifica que la API esté activa. |
| `GET` | `/items` | No | Lista productos en JSON paginado. |
| `GET` | `/items/ean/:ean` | No | Busca un producto por EAN. |
| `GET` | `/items/ean/:ean/summary` | No | Devuelve una versión resumida del producto. |
| `POST` | `/items` | Sí | Crea un producto. |
| `PATCH` | `/items/:id` | Sí | Modifica un producto. |
| `GET` | `/items/export` | Sí | Exporta productos en CSV. |
| `POST` | `/items/import` | Sí | Importa productos desde CSV o XLSX. |

## Consultar productos

### `GET /items`

Devuelve productos paginados. Cada página devuelve hasta 50 productos.

Query params opcionales:

| Param | Descripción |
|---|---|
| `page` | Número de página. Si no se envía, usa `1`. |
| `search` | Busca por nombre. |
| `brandName` | Filtra por marca. |
| `categoryName` | Filtra por categoría. |

Ejemplo:

```http
GET /catalog/items?page=1&search=coca&brandName=Coca%20Cola
```

Respuesta:

```json
{
  "data": [
    {
      "id": "uuid-del-producto",
      "ean": "7790000000001",
      "itemType": "Producto de supermercado",
      "name": "Coca Cola 500 ml",
      "description": "Gaseosa sabor cola.",
      "brand": "Coca Cola",
      "category": "Bebidas",
      "quantity": 500,
      "unitAbbreviation": "ml",
      "imageUrl": "https://...",
      "dimensions": null,
      "metadata": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### `GET /items/ean/:ean`

Busca un producto exacto por código EAN.

```http
GET /catalog/items/ean/7790000000001
```

Devuelve un producto completo. Si no existe, responde `404`.

### `GET /items/ean/:ean/summary`

Devuelve solo datos mínimos:

```json
{
  "id": "uuid-del-producto",
  "name": "Coca Cola 500 ml",
  "brand": "Coca Cola"
}
```

## Crear productos

### `POST /items`

Crea un producto. Requiere API Key.

Body mínimo:

```json
{
  "ean": "7790000000001",
  "name": "Coca Cola 500 ml"
}
```

Campos aceptados:

| Campo | Requerido | Descripción |
|---|---:|---|
| `ean` | Sí | Código EAN de 13 dígitos. |
| `name` | Sí | Nombre del producto. |
| `itemTypeCode` | No | Tipo de producto. Debe existir previamente si se envía. |
| `description` | No | Descripción del producto. |
| `brandName` | No | Marca. Si no existe, se crea automáticamente. |
| `categoryName` | No | Categoría. Debe existir previamente si se envía. |
| `quantity` | No | Cantidad del producto. |
| `unitAbbreviation` | No | Unidad de medida. Debe existir previamente si se envía. |
| `unitsPerPack` | No | Unidades por pack. |
| `dimensions` | No | Objeto con `width`, `height`, `depth` y `unit`. |
| `metadata` | No | Objeto JSON libre. |
| `image` | No | Imagen enviada por `multipart/form-data`. |

Para crear con imagen, enviar `multipart/form-data` usando el campo `image`. Formatos permitidos: JPG, PNG y WEBP. Tamaño máximo: 2 MB.

## Modificar productos

### `PATCH /items/:id`

Modifica un producto existente. Requiere API Key.

```json
{
  "name": "Coca Cola 500 ml actualizada",
  "description": "Nueva descripción."
}
```

También acepta imagen por `multipart/form-data` en el campo `image`.

## Exportar productos

### `GET /items/export`

Exporta productos en CSV. Requiere API Key.

Acepta los mismos filtros que `GET /items`:

```http
GET /catalog/items/export?brandName=Coca%20Cola
x-api-key: TU_API_KEY
```

El CSV se genera por lotes para evitar cargar todos los productos en memoria.

Columnas exportadas:

```text
id,ean,itemType,name,description,brand,category,quantity,unitAbbreviation,imageUrl,dimensions,metadata
```

## Importar productos

### `POST /items/import`

Importa productos desde un archivo CSV o XLSX. Requiere API Key.

El archivo se envía como `multipart/form-data` en el campo `file`.

Modos disponibles:

| Modo | Descripción |
|---|---|
| `upsert` | Si el EAN existe, actualiza. Si no existe, crea. Es el modo por defecto. |
| `createOnly` | Solo crea productos nuevos. Si el EAN ya existe, marca error. |

Ejemplo:

```http
POST /catalog/items/import?mode=upsert
x-api-key: TU_API_KEY
file: productos.csv
```

Columnas aceptadas:

```text
ean,name,itemTypeCode,description,brandName,categoryName,quantity,unitAbbreviation,unitsPerPack,dimensionsWidth,dimensionsHeight,dimensionsDepth,dimensionsUnit,metadata
```

Obligatorias:

```text
ean,name
```

Respuesta:

```json
{
  "mode": "upsert",
  "totalRows": 1500,
  "processed": 1450,
  "created": 1200,
  "updated": 250,
  "failed": 50,
  "errors": [
    {
      "row": 17,
      "ean": "779000000000X",
      "message": "ean debe contener exactamente 13 dígitos."
    }
  ]
}
```

## Catálogos auxiliares

Estos endpoints sirven para consultar o cargar datos auxiliares usados por los productos.

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/brand` | Lista marcas. |
| `POST` | `/brand` | Crea una marca. |
| `GET` | `/brand/:id` | Busca una marca por ID. |
| `GET` | `/category` | Lista categorías. |
| `POST` | `/category` | Crea una categoría. |
| `GET` | `/category/:id` | Busca una categoría por ID. |
| `GET` | `/unit-of-measure` | Lista unidades de medida. |
| `POST` | `/unit-of-measure` | Crea una unidad de medida. |
| `GET` | `/unit-of-measure/:id` | Busca una unidad por ID. |
| `GET` | `/item-types` | Lista tipos de producto. |
| `POST` | `/item-types` | Crea un tipo de producto. Requiere API Key. |
| `GET` | `/item-types/:id` | Busca un tipo de producto por ID. |

Notas:

- `brandName` se crea automáticamente al crear o importar productos.
- `categoryName`, `unitAbbreviation` e `itemTypeCode` deben existir previamente si se envían.

## Errores comunes

| Código | Caso |
|---:|---|
| `400` | Datos inválidos, archivo inválido, categoría inexistente, unidad inexistente o tipo de producto inexistente. |
| `401` | API Key faltante o inválida. |
| `404` | Recurso no encontrado. |
| `409` | Producto duplicado, por ejemplo un EAN ya registrado. |
| `500` | Error interno del servidor. |

## Ejecución local

```bash
npm install
npx prisma generate
npm run start:dev
```

Para compilar:

```bash
npm run build
```

Variables de entorno requeridas: ver `.env.template`.
