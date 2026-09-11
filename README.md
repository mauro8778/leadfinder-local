# LeadFinder Local

Prospección de comercios **sin web** usando **OpenStreetMap** (Overpass + Nominatim). Panel Next.js + API REST + SQLite.

## Funciones MVP

- Buscar negocios por **zona + rubro** (OSM automático, sin CSV manual)
- Clasificar: sin web / solo redes / tiene web
- CRM básico: estados de contacto
- Botón **WhatsApp** (`wa.me`) con mensaje prellenado
- API lista para deploy con Docker

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/leads/search` | `{ "zona": "Merlo, Buenos Aires, Argentina", "rubro": "peluqueria" }` |
| GET | `/api/leads?sinWebOnly=true` | Listar leads + stats |
| PATCH | `/api/leads/:id` | `{ "status": "contactado" }` |

## Desarrollo local

Requisito: **Node.js 20+** (LTS).

```bash
npm install
npm run dev
```

Abrí http://127.0.0.1:4317

### Puerto ocupado (`EADDRINUSE`)

Algo ya usa el 4317 (otra instancia del proyecto, Docker, etc.):

```bash
# Ver qué proceso lo usa
ss -tlnp | grep 4317
# o: lsof -i :4317

# Matar ese proceso (reemplazá PID)
kill PID

# O levantar en otro puerto
PORT=4318 npm run dev
```

Abrí entonces http://127.0.0.1:4318

## Deploy (recomendado: Docker / Railway / Fly.io)

SQLite necesita disco persistente → **no usar Vercel serverless** sin cambiar DB.

### Docker

```bash
docker compose up --build -d
```

App en http://localhost:4317 — datos en volumen `leadfinder-data`.

### Railway / Fly.io / VPS

1. Subí el repo
2. Build con `Dockerfile`
3. Variable `DATA_DIR=/data` + volumen persistente
4. Puerto `4317` (o `PORT` del host)

## Rubros OSM incluidos

- `peluqueria`, `gomeria`, `ferreteria`, `restaurant`, `farmacia`

## Atribución

© [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors — ODbL.

## Notas

- WhatsApp: apertura manual vía `wa.me` (no spam automático)
- Teléfonos en OSM pueden estar incompletos en Merlo/GBA
- Personalizá mensajes en `lib/whatsapp.ts`
