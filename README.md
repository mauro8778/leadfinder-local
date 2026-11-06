# 🎯 LeadFinder Local — Automated B2B Prospecting & WhatsApp Outreach Engine

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite_/_LibSQL-Persistent-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Overpass_%26_Nominatim-7EBC6F?style=flat-square&logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

**LeadFinder Local** es un motor SaaS integral diseñado para agencias y profesionales digitales orientado a la prospección, auditoría y conversión en frío de negocios locales sin presencia web digital. Integra scraping geoespacial en tiempo real vía **OpenStreetMap (Overpass + Nominatim)**, un pipeline CRM con métricas, un **generador dinámico de páginas demo en vivo** para mostrar a los prospectos, y un sistema de plantillas y contacto directo automatizado para WhatsApp.

---

## 🏛️ Flujo Arquitectónico

```mermaid
flowchart TD
    User["👨‍💼 Consultor / Closer de Ventas"] --> Dashboard["🖥️ Panel Web Next.js 16 (App Router + Tailwind v4)"]

    subgraph ScrapingEngine["🔍 Motor Geoespacial & Detección"]
        Nominatim["🗺️ Nominatim API\n(Resolución de zona / Bounding Box)"]
        Overpass["⚡ Overpass Turbo API\n(Extracción de comercios por rubro)"]
        Classifier["🏷️ Clasificador Inteligente\n(Sin Web / Solo Redes / Con Web)"]
    end

    subgraph CoreEngine["⚙️ Núcleo de Conversión & CRM"]
        SQLite[("💾 LibSQL / SQLite Local\n(Historial de Leads, Estados, Contactos)")]
        DemoGen["🎨 Generador de Demos en Vivo\n(Landing pages personalizadas para el cliente)"]
        Templates["📝 Motor de Plantillas & Playbook de Ventas"]
    end

    subgraph Outreach["💬 Canal de Salida & Contacto"]
        WhatsApp["📱 WhatsApp Direct / wa.me API\n(Mensajes hiper-personalizados con pitch + demo)"]
        EvolutionAPI["🤖 Evolution API Gateway (Opcional)\n(Automatización y monitoreo de inbox)"]
    end

    Dashboard -->|POST /api/leads/search| Nominatim --> Overpass --> Classifier
    Classifier --> SQLite
    SQLite --> Dashboard
    Dashboard -->|Generar Demo| DemoGen
    Dashboard -->|Disparar Pitch| Templates --> WhatsApp
    WhatsApp -.-> EvolutionAPI
```

---

## 🌟 Capacidades Destacadas

### 1. 🔍 Prospección Geoespacial Automatizada (Sin APIs de Pago)
- Busca comercios por **Zona + Rubro** (Peluquerías, Gomerías, Ferreterías, Restaurantes, Farmacias, etc.) utilizando nodos y polígonos de OpenStreetMap sin costo de Google Maps API.
- Bounding-box inteligente y resolución de coordenadas mediante Nominatim.

### 2. 🏷️ Clasificación Automática de Madurez Digital
- Detecta si el negocio:
  - ❌ **No tiene web:** Prospecto de alta prioridad para venta de landing pages.
  - 📱 **Solo redes sociales:** Prospecto para digitalización y tienda e-commerce.
  - ✅ **Tiene presencia web completa:** Descartado o marcado como baja prioridad.

### 3. 🎨 Generador de Páginas Demo en Tiempo Real
- Crea instantáneamente una landing page interactiva con el nombre y rubro del negocio prospectado (`/demo/...`).
- El mensaje de WhatsApp incluye un enlace a su demo para que el dueño del comercio vea su potencial web antes de responder.

### 4. 📊 CRM Liviano y Pipeline de Estados
- Seguimiento de estados: `Descubierto` ➔ `Contactado` ➔ `En Negociación` ➔ `Cerrado` ➔ `Descartado`.
- Registro y auditoría de interacciones en el Inbox.

### 5. 🐳 Despliegue Portable con Docker y SQLite Persistente
- Cero dependencias complejas de bases de datos externas: opera con LibSQL / SQLite de baja latencia montado en un volumen Docker persistente.

---

## 🚀 Estructura del Código

```
leadfinder-local/
├── app/
│   ├── api/
│   │   ├── health/           # Healthcheck del servicio
│   │   ├── inbox/            # Registro y sincronización de mensajes
│   │   ├── leads/            # Búsqueda, importación y CRUD de prospectos
│   │   └── whatsapp/         # Emparejamiento y estado de la sesión
│   ├── components/           # Componentes UI de panel y tablas
│   ├── demo/                 # Renderizador de landing pages de demostración
│   └── page.tsx              # Dashboard interactivo principal
│
├── lib/
│   ├── classify.ts           # Algoritmo de clasificación de presencia online
│   ├── db.ts                 # Conector y migraciones SQLite / LibSQL
│   ├── demo-pages.ts         # Generador de layouts comerciales
│   ├── nominatim.ts          # Normalización geográfica
│   ├── osm-search.ts         # Orquestador de consultas Overpass
│   ├── outreach-templates.ts # Scripts y plantillas de persuasión
│   ├── sales-playbook.ts     # Estrategias de objeción y cierre
│   └── whatsapp-provider.ts  # Adaptador de mensajería
│
├── docker-compose.yml        # Configuración para despliegue
├── Dockerfile                # Imagen multi-stage optimizada
└── render.yaml               # Manifiesto de despliegue en la nube
```

---

## 🛠️ Instalación y Uso Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/mauro8778/leadfinder-local.git
cd leadfinder-local

# 2. Iniciar el contenedor
docker compose up --build -d
```
Ingresa a: `http://localhost:4317`

---

### Opción 2: Desarrollo Local

#### Requisitos
- **Node.js:** >= 20.x LTS

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar el servidor Next.js
npm run dev
```
La aplicación correrá en `http://127.0.0.1:4317`.

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Payload de Ejemplo |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio y base de datos | — |
| `POST` | `/api/leads/search` | Ejecuta prospección en OpenStreetMap | `{"zona": "Palermo, Buenos Aires", "rubro": "peluqueria"}` |
| `GET` | `/api/leads?sinWebOnly=true` | Obtiene lista filtrada de prospectos y métricas | — |
| `PATCH` | `/api/leads/:id` | Actualiza estado CRM del prospecto | `{"status": "contactado"}` |
| `POST` | `/api/inbox/send` | Dispara o registra mensaje enviado | `{"leadId": "...", "message": "..."}` |

---

## ⚖️ Atribución Legal

Los datos geográficos provienen de © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, bajo licencia Open Database License (ODbL).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
