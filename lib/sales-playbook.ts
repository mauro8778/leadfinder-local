export interface SalesPlaybook {
  id: string;
  name: string;
  sell: string;
  ifTheySay: string;
  implement: string;
  youNeed: string;
}

export const PACKAGE_PLAYBOOKS: SalesPlaybook[] = [
  {
    id: "landing",
    name: "Landing — $120.000",
    sell: "Hoy si te buscan en Google o Instagram y no hay una página tuya, se van a otro. Con una sola página ya existís: qué hacés, horarios, mapa y un botón que abre tu WhatsApp. No es un proyecto eterno: en una o dos semanas estás online. Es el puntapié para peluquería, barbería, farmacia, estudio, lo que sea que viva de la consulta.",
    ifTheySay: "“Tengo Instagram”. Instagram se cae, no aparece bien en Google y el cliente no sabe horario ni dónde queda. La landing no reemplaza la red: la convierte en turno o mensaje. “Es caro para una página”. Comparalo con una semana de publicidad tirada a un perfil que no cierra. “Lo hago con Wix”. Puede ser: el valor es que te lo dejo listo, con tu rubro, y no tenés que pelear vos con el constructor.",
    implement:
      "Partís de la demo del rubro (ya la tenés). Cambiás nombre, textos, fotos, horarios, mapa embebido de Google y el wa.me. Publicás en tu hosting (Railway, VPS o páginas estáticas). Le apuntás el dominio cuando lo tenga. Capacitación: 15 minutos — “este botón es el WhatsApp”. Sin panel complejo. Tope: una página, dos rondas de cambio chicas. Si piden carta, galería y blog, pasás a sitio.",
    youNeed: "Nombre, rubro, 4–8 fotos, horarios, dirección, WhatsApp. Demo del rubro. Dominio opcional (o se vende el pack).",
  },
  {
    id: "sitio",
    name: "Sitio profesional — $280.000",
    sell: "Cuando el negocio ya no entra en una página (estudio, colegio, restaurante, clínica), hace falta un sitio que se sienta serio: servicios, fotos, quiénes son, cómo contactarlos. Aparece en Google, manda a WhatsApp o a un formulario, y el cliente entiende el prestigio. Es la opción si te dicen “quiero que se vea como un lugar establecido”.",
    ifTheySay: "“¿No alcanza la landing?”. Si tienen 4 servicios, equipo y hay que explicar el método, la landing se siente pobre. “¿Puedo cargar yo las cosas?”. En este pack no hay CMS pesado: los cambios los pedís vos o se suma un recargo. Si quieren cargar cada semana, hablá de un blog o de un panel chico (sistema).",
    implement:
      "Misma base que la landing, pero 4–5 secciones: inicio, servicios o carta, galería, nosotros, contacto. Formulario (email o aviso a tu mail/WhatsApp). Metadatos, sitemap y textos con el barrio. Entrega 15–20 días. Dos o tres rondas de revisión. No incluye turnos ni chat IA: van como extra.",
    youNeed: "Textos o una charla de 30 min para redactar. 8–15 fotos. Logo si hay. Lista de servicios/precios si los quieren públicos.",
  },
  {
    id: "ecommerce",
    name: "Tienda online — $520.000 + $25.000/mes",
    sell: "Instagram no es una tienda: no hay stock, ni pago, ni envío. Acá el cliente elige, paga con Mercado Pago y vos ves el pedido. Sirve para ferretería, indumentaria, celulares, almacén con delivery. El mensual cubre que la tienda no se caiga, backups y un rato de soporte — no rediseños infinitos.",
    ifTheySay: "“Tengo Mercado Libre”. ML cobra comisión y no es tu marca. La tienda propia es margen y la lista de clientes. “¿Cuántos productos incluye?”. La tienda vacía y el checkout. La carga es extra (50 o 200) o la hacen ellos. Dejalo clarísimo o regalás 20 horas. “Es mucho”. Mostrá una venta semanal: si cierran 3 pedidos extra por mes, se paga sola.",
    implement:
      "Partís de la demo Mercado Norte. Catálogo, ficha, carrito, Checkout Pro de Mercado Pago, stock simple, zonas de envío GBA (tabla de precios o retiro). Panel para alta de productos. 20–30 días. Mantenimiento: hosting, SSL, backups, bugs. No incluye Andreani a todo el país ni fotos de 80 SKUs.",
    youNeed: "Cuenta Mercado Pago. Lista de zonas y costos de envío. Al menos 10 productos de prueba o el pack de carga. CUIT para facturar ellos (AFIP es otro pack).",
  },
  {
    id: "sistema_ventas",
    name: "Sistema de ventas — $780.000 + $35.000/mes",
    sell: "No es una web bonita: es el mostrador digital. Quién compró, qué stock queda, la caja del día, si hay dos usuarios (dueño y empleado). Para locales que anotan en un cuaderno o en el chat y después no saben qué se vendió. Si te dicen “necesito controlar el negocio”, este es el producto — la web pública es secundaria.",
    ifTheySay: "“Uso Excel”. Excel no avisa stock, no hay usuarios ni caja del día. “¿Reemplaza Mercado Libre?”. No. Es el local. “¿Y la factura?”. Eso es el extra AFIP; no lo prometas adentro. El primer cliente te come horas: a partir del segundo, reutilizás el mismo panel (Pulse).",
    implement:
      "App propia (como el panel de LeadFinder): productos, clientes, ventas, caja, usuarios, reporte del día. Base SQLite o Postgres en un VPS. Capacitación 1 hora. 30–45 días. El mensual es soporte y que no se pierdan los datos. Alcance cerrado: no es un ERP ni sucursales múltiples salvo que se cobre aparte.",
    youNeed: "Lista de productos o Excel. Cómo venden hoy (mostrador, mayorista, preventa). Quiénes van a usar el sistema. Demo Pulse Ventas para mostrar.",
  },
  {
    id: "sistema_cuentas",
    name: "Cuentas para pymes — $890.000 + $40.000/mes",
    sell: "Para el dueño que mezcla la caja del kiosco con la de la casa. Ingresos, gastos, un pantallazo de IVA y un reporte a fin de mes. No reemplaza al contador: le llega la info ordenada. Vendelo a comercios y a estudios chicos que atienden 20–40 clientes y viven en Excel + WhatsApp.",
    ifTheySay: "“Tengo contador”. Perfecto: esto le baja el desorden. No vendas que liquida sueldos o presenta DDJJ. “¿Es un AFIP?”. No. Es el libro del negocio. Factura electrónica y portal son extras.",
    implement:
      "Panel tipo Folio: movimientos, categorías, proveedores, caja, resumen mensual exportable (PDF/Excel). IVA estimado (alícuotas simples), no liquidación profesional. 35–50 días. El mensual es soporte y backup. El primer armado de categorías lo hacés vos con ellos en una reunión.",
    youNeed: "Cómo cobran (efectivo, MP, transferencia). Tipos de gasto típicos. Si hay contador, qué le quieren mandar cada mes. Demo Folio Cuentas.",
  },
  {
    id: "sistema",
    name: "Web + sistema — desde $650.000",
    sell: "Cuando no es “una web” ni “un ERP”: necesitan la cara pública y un panel para UNA cosa (turnos, pedidos, o fichas). El “desde” es sagrado: cotizás el flujo, no un cheque en blanco. Usalo si el cliente describe un proceso (“me escriben, anoto, confirmo, olvido”).",
    ifTheySay: "“Quiero todo: stock, sueldos, turnos, app”. Partilo. Este pack es un flujo. Si son dos flujos grandes, son dos presupuestos o vas a sistema de ventas + extras.",
    implement:
      "Web (landing o sitio corto) + un panel con el flujo acordado por escrito: pantallas, roles, qué entra y qué sale. 4–6 semanas según el flujo. Todo lo que no esté en esa hoja se cobra. Reutilizá turnos o pedidos si ya los resolviste en otro cliente.",
    youNeed: "Una hoja de alcance firmada (aunque sea por WhatsApp): “incluye X, no incluye Y”. Ejemplos de cómo trabajan hoy.",
  },
];

export const ADDON_PLAYBOOKS: SalesPlaybook[] = [
  {
    id: "chat_ia",
    name: "Chat IA web + WhatsApp",
    sell: "A las 22 hs preguntan “¿están abiertos?” y nadie contesta: se van. El bot responde horarios, precios sueltos y “dónde quedan”, y si es un caso raro te avisa a vos. No reemplaza a una persona en una queja o una venta grande: filtra lo repetido.",
    ifTheySay: "“El bot se va a equivocar”. Lo entrenamos con SU info (horarios, servicios, FAQs). Si no sabe, deriva. “¿Y si me escriben 300?”. Por eso el mensual: API de WhatsApp + el modelo. Si el volumen explota, se revisa el mensual — no lo dejes eterno a $20k si es una farmacia 24 hs.",
    implement:
      "Juntás un documento del negocio (horarios, servicios, tono). Widget en la web + canal WhatsApp (API oficial o Evolution/n8n). GPT/Claude con ese documento. Palabra clave “hablar con una persona” → tu número. Pruebas 2–3 días antes de ir live.",
    youNeed: "PDF o nota de FAQs. Número de WhatsApp Business. Decidir qué NUNCA debe responder solo (precios de obra, diagnósticos, legales).",
  },
  {
    id: "carga_ia_50",
    name: "Carga 50 productos con IA",
    sell: "La tienda vacía no vende. Ellos te mandan fotos o un Excel; vos les devolvés 50 fichas listas: título, texto, categoría, precio. En una semana el catálogo se ve profesional. Es el extra que más cierra ecommerce.",
    ifTheySay: "“Pensé que estaba incluido”. No: el paquete es la tienda, no el catálogo. 50 productos a mano son días. “Tengo 12”. Cobrás este pack igual o un proporcional, pero no lo regales dentro de los $520k.",
    implement:
      "Recibís carpeta de fotos o Excel. Un script o ChatGPT genera título + descripción + categoría. Vos revisás precios y errores. Importás CSV al panel. Tope 50 SKUs, 1 variante simple. Más de eso: pack 200.",
    youNeed: "Fotos o lista con precio. Marca de voz (formal / de barrio). Categorías que ellos usan en el local.",
  },
  {
    id: "carga_ia_200",
    name: "Carga 200 productos con IA",
    sell: "Catálogo grande (ferretería, celulares, zapatería). Sin esto tardan meses en cargar. Vendelo cuando ves más de 80 ítems. No es magia: hay una pasada tuya de revisión.",
    ifTheySay: "“Que lo haga el empleado”. Puede, pero sale desparejo y no lanzan. Este pack es velocidad + prolijidad.",
    implement:
      "Igual que 50, en tandas de 40–50. Variantes (talle/color) si las hay. 1–2 semanas de revisión. No prometas 200 perfectos en 48 hs.",
    youNeed: "Excel o fotos por tandas. Qué campos son obligatorios (SKU, stock, precio).",
  },
  {
    id: "fotos_ia",
    name: "Fotos de producto con IA",
    sell: "La foto con la mesa sucia baja la venta. Acá recortamos, fondo limpio y 3 variantes (blanco, lifestyle suave, detalle). Hasta 40 productos. Instagram y la tienda se ven del mismo nivel.",
    ifTheySay: "“Saco yo las fotos”. Bien: este pack las deja vendibles. “¿Quedan raras?”. Revisás vos; si una no da, se usa la original recortada.",
    implement:
      "Recorte + fondo (Remove.bg / modelo de imagen). 3 salidas por ítem. Entregás carpeta lista para subir. No es producción de estudio ni video.",
    youNeed: "Foto más o menos de frente, buena luz. No milagros con fotos borrosas.",
  },
  {
    id: "carritos_ia",
    name: "Recuperar carritos por WhatsApp",
    sell: "7 de cada 10 dejan el carrito. Un WhatsApp a los 30–60 minutos con el link de pago recupera plata que ya estaba decidida. Es de los ROI más fáciles de explicar.",
    ifTheySay: "“Es spam”. Es a alguien que YA eligió productos. Un mensaje, no una campaña. “¿Es legal?”. Con consentimiento en el checkout (casilla) y tu número comercial, sí.",
    implement:
      "El checkout guarda el teléfono. Un job (n8n/cron) a los 45 min si no pagó: template de WhatsApp con link. Tope: 1 recordatorio. El mensual cubre el envío de esos mensajes.",
    youNeed: "WhatsApp API. Texto del mensaje aprobado por ellos. Casilla de “acepto novedades de mi pedido”.",
  },
  {
    id: "upsell_ia",
    name: "Recomendaciones IA",
    sell: "“Quien lleva pintura lleva rodillo”. En la ficha y el carrito aparecen 2–3 sugerencias. Sube el ticket sin que el vendedor esté encima.",
    ifTheySay: "“No quiero que los maree”. Son 2 sugerencias, no un mall. Se apaga por categoría si molesta.",
    implement:
      "Reglas (categoría / “se lleva con”) o embeddings si el catálogo es grande. Bloque en ficha y carrito. Arrancás con 10 reglas hechas a mano y listo.",
    youNeed: "Que te digan 10 combos típicos del local. Catálogo ya cargado.",
  },
  {
    id: "ml_fichas",
    name: "Fichas Mercado Libre con IA",
    sell: "Venden en ML pero las publicaciones son un título corto y una foto fea. Les entregás hasta 40 fichas: título que rankea, viñetas, foto. Ellos publican (o las subís si te dan acceso). No es “te armo la tienda de ML”.",
    ifTheySay: "“Haceme las 200”. Este pack es 40. Después otro tajo o el de 200 de la tienda propia.",
    implement:
      "Mismas fotos/lista. Prompt con límites de ML (título, caracteres). Entrega en Excel o copiar/pegar. Publicar en ML es de ellos salvo que pactes un extra.",
    youNeed: "Acceso de lectura a publicaciones actuales o la lista. Rubro (celulares, ferretería, etc.).",
  },
  {
    id: "combo_ecom_ia",
    name: "Combo Ecommerce IA",
    sell: "El atajo para cerrar tienda: chat + 50 productos + carritos abandonados, más barato que sueltos. Si vacilan entre extras, tirá este. Es el “llave en mano” de la tienda que sí vende.",
    ifTheySay: "“¿Y las fotos?”. Van aparte. Este combo es atención + catálogo arranque + recupero.",
    implement: "Entregás los tres packs juntos, en ese orden: catálogo → checkout → bot y carritos. Un solo mensual ($25k) que cubre chat + mensajes.",
    youNeed: "Lo mismo que los tres packs. No vendas el combo si no tenés WhatsApp API lista.",
  },
  {
    id: "envios_pais",
    name: "Envíos a todo el país",
    sell: "GBA no les alcanza: tienen familia en Córdoba o venden por redes al interior. Al pagar se ve el costo (Andreani/OCA o sucursal). Sin esto, la tienda es solo zona.",
    ifTheySay: "“Que pongan el envío a mano”. Ahí se cae la venta. El cálculo en el checkout cierra.",
    implement:
      "Tabla de costos por CP o integración Andreani/OCA si dan de alta la cuenta. Punto de retiro. No prometas cotización en vivo el día 1 si no tienen contrato con el correo: se puede arrancar con tabla por región.",
    youNeed: "Si tienen cuenta Andreani/OCA. Peso/bulto típico. Precio que quieren para CABA, GBA, interior.",
  },
  {
    id: "turnos_online",
    name: "Turnos online",
    sell: "Dejan de atender el teléfono para anotar. El cliente elige día y hora, le llega un recordatorio y puede cancelar. Menos huecos y menos “pensé que era a las 17”. Oro en peluquería, barbería, dentista, vet, gym.",
    ifTheySay: "“Mis clientas de siempre me llaman”. Que sigan. Esto es para las nuevas y para las que escriben a las 23. “¿Y si se superponen?”. Vos definís duración y cantidad de sillas/profesionales.",
    implement:
      "Cal.com, Calendly o agenda propia (1 profesional primero). Embed en la web. Recordatorio WhatsApp 24 h antes (n8n o el mismo Cal). Link de cancelar. No es un hospital con obras sociales y 12 profesionales el día 1: eso se cotiza aparte.",
    youNeed: "Horarios, duración de cada servicio, cuántas personas atienden a la vez. Número para recordatorios.",
  },
  {
    id: "seo_local",
    name: "SEO local + Google Business",
    sell: "Si buscás “peluquería Merlo” y no salís, no existís. Armamos o reclamamos la ficha de Maps, fotos, horarios, y textos con el barrio. Es el extra más fácil de justificar: una consulta por mes lo paga.",
    ifTheySay: "“Ya tengo Maps”. Muchas están a nombre de otro, sin fotos o cerradas. Lo revisamos. “¿Salgo primero?”. Nadie puede prometer puesto #1. Sí: estar completo y coherente.",
    implement:
      "Alta/reclamo de Google Business, categorías, fotos, posts iniciales, NAP igual que en la web. 4–6 textos con zona + rubro. Search Console. 1 semana. No es SEO nacional ni linkbuilding.",
    youNeed: "Acceso al mail que usaron en Google. Foto de frente del local. Horarios reales.",
  },
  {
    id: "contenido_ia",
    name: "Textos y fotos con IA",
    sell: "No tienen copy ni fotos buenas. Con 2–3 del local armamos los textos del sitio y 8 imágenes de marca (clima, no stock). Destraba el arranque cuando el cliente no escribe ni saca el celular.",
    ifTheySay: "“Que ponga Lorem ipsum”. Se ve falso y no cierra. Este pack es para que la demo deje de parecer demo.",
    implement:
      "Entrevista de 20 min o un audio. Generás copy por sección. Imágenes a partir de las fotos reales (estilo, no caras inventadas de “equipo”). Ellos aprueban. Una ronda de correcciones.",
    youNeed: "2–3 fotos del local. Cómo hablan (de vos / más formal). Qué NO quieren decir.",
  },
  {
    id: "blog_ia",
    name: "Blog SEO con IA",
    sell: "Google come contenido nuevo. 4 notas de arranque y 2 por mes sobre el rubro (“cuándo cambiar el aceite”, “cómo elegir color”). No es un diario: es para que la web no muera a los 30 días.",
    ifTheySay: "“¿Eso sirve?”. En rubros con búsqueda (“abogado laboral Merlo”, “veterinaria cachorro”) sí. En un kiosco, no lo vendas.",
    implement:
      "Keyword simple + 4 artículos revisados por vos. CMS o markdown. El mensual son 2 notas editadas (no crudas). $12k está justo: no prometas periodismo, prometé constancia.",
    youNeed: "Temas que ellos quieren (o los proponés). Aprobación antes de publicar.",
  },
  {
    id: "ads_setup",
    name: "Campaña Ads inicial",
    sell: "La web sola no trae gente el día 1. Pixel, 3 anuncios y 15 días de seguimiento. Ellos ponen la plata de pauta (eso NO está en los $75k). Vos dejás la máquina lista y no se tiran el presupuesto a ciegas.",
    ifTheySay: "“¿Garantizás clientes?”. No. Garantizás que está bien medido y apuntado al barrio. “¿Después?”. O siguen ellos o un mensual de gestión (otro precio).",
    implement:
      "Alta Business Manager / Google Ads. Pixel o etiqueta. 3 creatividades (historia + imagen + aviso). Audiencia zona + rubro. Informe a los 15 días. El gasto de ads lo carga el cliente.",
    youNeed: "Acceso a Instagram/Facebook o Google. Presupuesto diario que ellos acepten (ej. $8–15k de pauta). Fotos o el pack de contenido.",
  },
  {
    id: "dominio_email",
    name: "Dominio + email profesional",
    sell: "escribir desde gmail.com se ve amateur. tunegocio.com.ar e info@ es confianza. Barato, fácil de cerrar atrás de cualquier web. El costo del dominio se come parte: no lo regales si ya está ajustado el margen.",
    ifTheySay: "“Uso Gmail”. El cliente no sabe si es el negocio o un primo. El mail con dominio cierra presupuestos.",
    implement:
      "Alta NIC Argentina o .com. DNS. 2 casillas (Zoho free, Google Workspace o el mail del hosting). Guía de 1 página para el celular. Renovación anual: avisarles, no asumirla vos gratis.",
    youNeed: "CUIT para .com.ar. Qué nombres quieren (info@, nombre@). Quién paga la renovación el año 2.",
  },
  {
    id: "combo_sitio_ia",
    name: "Combo Sitio IA",
    sell: "Sitio que atiende, aparece en el barrio y no se ve vacío. Chat + SEO local + textos/fotos. Cuando el cliente dice “quiero que se vea bien y que me escriban”, este combo cierra más que ir ítem por ítem.",
    ifTheySay: "“Es un montón”. Es menos que los tres sueltos y evita un sitio mudo. Landing no lleva este combo: es para sitio.",
    implement: "Orden: contenidos → sitio → ficha Google → chat. Un mensual para el bot.",
    youNeed: "FAQs, fotos del local, acceso a Google.",
  },
  {
    id: "carga_stock_ia",
    name: "Carga de stock con IA",
    sell: "Tienen el stock en la cabeza, en un Excel viejo o en fotos de góndola. Lo pasamos a productos con cantidad. El sistema el día 1 ya sirve; si no, es un cascarón.",
    ifTheySay: "“Lo cargo yo”. Bien, pero no arrancan. Este pack es el onboarding.",
    implement:
      "Excel o fotos → filas (nombre, cantidad, precio). Import al sistema de ventas/tienda. Revisión de duplicados. No es inventario físico con pistola el día 1.",
    youNeed: "El Excel o una tarde fotografiando góndola. Unidad (unidades, kg, cajas).",
  },
  {
    id: "reportes_wa",
    name: "Reporte diario por WhatsApp",
    sell: "El dueño no entra al sistema. A las 21 le llega: vendí X, caja Y, se acaba Z. Es el extra que hace que el sistema se use de verdad.",
    ifTheySay: "“Me fijo yo”. No se fijan. El push diario es el hábito.",
    implement:
      "Cron nocturno: suma ventas del día, caja, stock bajo un umbral. Un WhatsApp (texto). Número del dueño, no del empleado.",
    youNeed: "A qué hora cierra el local. Umbral de “poco stock”. Teléfono del dueño.",
  },
  {
    id: "afip_factura",
    name: "Factura electrónica AFIP",
    sell: "Venden y después cargan la factura a mano a la noche. Desde la venta o el pedido sale A/B/C. Vendelo a quienes YA están inscriptos y facturan siempre. El primer cliente es inversión; los siguientes reutilizan el conector.",
    ifTheySay: "“¿Hacés también la DDJJ?”. No. Emitís el comprobante. El contador sigue existiendo. No lo vendas a un monotributista que factura 2 veces al mes: no les cierra el precio.",
    implement:
      "Certificado digital AFIP + un facturador (WSFE, o un intermediario tipo servicio de facturación). Desde “venta cobrada” → emitir. Guardás PDF/CAE. Homologación primero, producción después. No improvises en el local el viernes.",
    youNeed: "Nivel de facturación (A/B/C). Certificado o que el contador lo gestione. Punto de venta. El primer setup es largo: cobralo, no lo regales.",
  },
  {
    id: "ocr_gastos",
    name: "Gastos con IA (foto del ticket)",
    sell: "El dueño junta tickets en la guantera. Saca foto y el sistema anota monto, fecha y rubro. El reporte de fin de mes deja de ser una pelea.",
    ifTheySay: "“Se va a equivocar”. Revisan 10 segundos. Sigue siendo más rápido que tipear 40 tickets.",
    implement:
      "Subida de foto → visión (GPT) → monto, fecha, proveedor, categoría sugerida. Queda en borrador hasta que confirman. No es un scanner fiscal certificado.",
    youNeed: "Categorías de gasto ya creadas. Que acepten revisar el borrador.",
  },
  {
    id: "vencimientos_wa",
    name: "Vencimientos por WhatsApp",
    sell: "Para el estudio o el comercio que se olvida el IVA. Tres días antes, un WhatsApp. Barato, concreto, se entiende en un segundo. Ideal si el cliente es contador o tiene uno encima.",
    ifTheySay: "“El contador avisa”. A veces no. Esto es la red.",
    implement:
      "Calendario de vencimientos (IVA, monotributo, sueldos). Cron 3 días antes. Texto fijo. Ellos cargan las fechas o usás el calendario AFIP del mes.",
    youNeed: "Qué impuestos les importan. Números a avisar (dueño y/o contador).",
  },
  {
    id: "portal_cliente",
    name: "Portal para clientes",
    sell: "El estudio se muere de “¿me pasás la constancia?”. El cliente entra, baja PDF, ve vencimientos y sube el extracto. Menos WhatsApp basura, más cara de estudio grande.",
    ifTheySay: "“Que te escriban”. Eso es lo que quieren dejar. “¿Es seguro?”. Login, cada uno ve lo suyo. No es homebanking: es una carpeta por cliente.",
    implement:
      "Usuarios (email + clave). Carpetas: constancias, vencimientos, subida de archivos. Aviso cuando suben algo. No es un ERP jurídico/contable completo.",
    youNeed: "Lista de clientes a dar de alta (o que se den de alta con un código). Qué documentos se publican.",
  },
  {
    id: "form_caso",
    name: "Formulario de caso + documentos",
    sell: "El abogado pierde la primera reunión en “contame de nuevo”. El potencial cliente llena el caso y adjunta PDFs antes. Llegás leído; el que no completa no era tan serio.",
    ifTheySay: "“Es frío”. Es filtro. La consulta cara se reserva para quien ya mandó papeles.",
    implement:
      "Formulario largo (hechos, montos, fechas) + subida de archivos (límite de peso). Aviso al mail del estudio. Carpeta por lead. Encaja en landing o sitio del abogado.",
    youNeed: "Las preguntas que SIEMPRE hacen. Tipos de archivo (DNI, telegrama, contrato).",
  },
  {
    id: "inscripcion_online",
    name: "Inscripción online",
    sell: "El colegio o jardín anota en papel y después cobra la matrícula por transferencia suelta. Acá: ficha, vacantes y pago. Menos filas en secretaría en febrero.",
    ifTheySay: "“Las familias son grandes, no entienden”. Si pagan con MP en el kiosco, pagan acá. Interfaz simple, no un SIU.",
    implement:
      "Formulario de alumno + cupo por sala. Pago Mercado Pago de matrícula. Estado (pendiente / pagada). No es un académico completo (notas, boletines).",
    youNeed: "Salas y vacantes. Importe de matrícula. Datos que pide el ministerio/colegio.",
  },
  {
    id: "portal_padres",
    name: "Portal de familias",
    sell: "Circulares en el grupo de WhatsApp se pierden. Acá: circulares, inasistencias y estado de cuotas. El colegio se ve ordenado; la secretaria deja de reenviar 40 veces lo mismo.",
    ifTheySay: "“Usamos el grupo”. El grupo es ruido. El portal es el registro. “Es caro”. Comparalo con una secretaria extra en marzo.",
    implement:
      "Login por familia. Muro de circulares, inasistencias (carga la escuela), cuotas (pagada / adeuda). No es aula virtual ni Zoom. 3–4 semanas si el sitio ya está.",
    youNeed: "Lista de familias. Qué se publica. Quién carga inasistencias. Cómo marcan las cuotas hoy.",
  },
];

const ALL = [...PACKAGE_PLAYBOOKS, ...ADDON_PLAYBOOKS];

export function getPlaybook(id: string): SalesPlaybook | undefined {
  return ALL.find((item) => item.id === id);
}

export function playbooksForSelection(
  pricingId: string,
  addonIds: string[],
): SalesPlaybook[] {
  const selected: SalesPlaybook[] = [];
  if (pricingId === "todos") {
    selected.push(...PACKAGE_PLAYBOOKS);
  } else {
    const pack = getPlaybook(pricingId);
    if (pack) selected.push(pack);
  }
  for (const id of addonIds) {
    const extra = getPlaybook(id);
    if (extra) selected.push(extra);
  }
  return selected;
}
