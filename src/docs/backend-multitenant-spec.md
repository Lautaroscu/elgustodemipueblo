# Especificación: Backend Multi-Tenant & Servidor MCP

Esta especificación describe la arquitectura para transformar el motor de e-commerce y logística local en un backend **SaaS Multi-Tenant** implementado en **FastAPI (Python)**, acompañado de un servidor **MCP (Model Context Protocol)** para permitir que agentes de Inteligencia Artificial (bots de WhatsApp, asistentes de voz, etc.) interactúen directamente con la plataforma.

---

## 1. Arquitectura de Multi-Tenancy

Para dar soporte a múltiples comercios (hamburgueserías, pizzerías, farmacias, tiendas de ropa, etc.) con una única instancia del backend, utilizaremos una estrategia de **aislamiento lógico en base de datos compartida** mediante una columna discriminadora (`tenant_id`). Esto mantiene los costos de infraestructura bajos y simplifica el mantenimiento.

### 1.1 Modelo de Datos (Esquema Conceptual)

Cada consulta y operación de escritura debe estar aislada por el `tenant_id`.

```mermaid
erDiagram
    Tenant ||--o{ TenantConfig : "tiene"
    Tenant ||--o{ Category : "posee"
    Tenant ||--o{ Product : "vende"
    Tenant ||--o{ Customer : "registra"
    Tenant ||--o{ Order : "recibe"
    
    Category ||--o{ Product : "agrupa"
    Product ||--o{ OrderItem : "incluye"
    Order ||--o{ OrderItem : "contiene"
    Order ||--o{ OrderEvent : "registra"
    Customer ||--o{ Address : "guarda"
    Order }o--|| Address : "despacha_a"
```

#### Entidades Clave:
*   **Tenant (Inquilino):** Identifica el comercio.
    *   `id` (UUID), `slug` (ej: "el-gusto", "burger-house"), `name`, `status` (ACTIVE, SUSPENDED), `created_at`.
*   **TenantConfig (Configuración Operativa):**
    *   `tenant_id` (FK), `costo_envio_base`, `envio_gratis_desde`, `retiro_disponible` (bool), `direccion_local`, `horarios_retiro`, `campos_entrega` (JSON - campos dinámicos activos en checkout), `mercado_pago_token` (encriptado), `coordenadas` (Point - lat/lng del local).
*   **Product & Category:**
    *   Aislados por `tenant_id`. Incluyen precio, stock, descripción, imágenes y `prep_minutos` (tiempo estimado de preparación).
*   **Customer & Address:**
    *   Clientes identificados por teléfono/email. El cliente es transversal o específico del tenant (se recomienda que sea transversal por número único, pero con direcciones `Address` asociadas a cada `tenant_id` para evitar mezclar zonas de reparto).
*   **Order, OrderItem & OrderEvent:**
    *   Contienen el flujo de estados logísticos (`PENDIENTE`, `CONFIRMADO`, `EN_PREPARACION`, `LISTO`, `EN_REPARTO`, `ENTREGADO`, `CANCELADO`) y los tiempos de preparación calculados.

### 1.2 Resolución del Tenant en FastAPI

El tenant activo se resolverá dinámicamente en cada petición mediante inyección de dependencias (`Depends` en FastAPI) analizando:
1.  **Subdominio de la petición:** (ej. `hamburguesas.pedidos.com` -> busca tenant con slug `"hamburguesas"`).
2.  **Cabecera personalizada:** (`X-Tenant-ID`) útil para aplicaciones móviles o SPAs.
3.  **API Key en la cabecera de autorización:** (`Authorization: Bearer <api_key>`) usado por integraciones externas y el servidor MCP.

```python
# app/dependencies/tenant.py
from fastapi import Header, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tenant import Tenant

async def get_current_tenant(request: Request, db: Session = Depends(get_db)) -> Tenant:
    # 1. Intentar por subdominio
    host = request.headers.get("host", "")
    subdomain = host.split(".")[0] if len(host.split(".")) > 2 else None
    
    if subdomain and subdomain not in ("www", "api", "admin"):
        tenant = db.query(Tenant).filter(Tenant.slug == subdomain, Tenant.status == "ACTIVE").first()
        if tenant:
            return tenant
            
    # 2. Intentar por Header X-Tenant-ID
    tenant_id = request.headers.get("X-Tenant-ID")
    if tenant_id:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.status == "ACTIVE").first()
        if tenant:
            return tenant
            
    raise HTTPException(status_code=400, detail="Tenant context missing or inactive")
```

---

## 2. Especificación del Servidor MCP

El **Model Context Protocol (MCP)** es un estándar abierto que permite a los clientes de IA (como Claude, asistentes conversacionales, etc.) consumir herramientas y recursos provistos por un servidor. 

Al exponer la lógica de nuestro backend mediante un Servidor MCP, un Agente de IA (como un bot de WhatsApp operando con LLMs) puede charlar en lenguaje natural con el cliente y usar las herramientas del MCP para automatizar la venta.

### 2.1 Herramientas Expuestas (Tools)

El servidor MCP expondrá las siguientes herramientas esenciales, autenticadas con la API Key del comercio (`tenant_id` implícito en la sesión de la API Key):

#### 1. `get_catalog`
*   **Descripción:** Consulta la lista de productos disponibles organizados por categoría.
*   **Parámetros:**
    *   `category_id` (opcional, string): Filtrar por categoría específica.
    *   `only_in_stock` (opcional, boolean, default: `true`): Ocultar productos sin stock.
*   **Salida (JSON):**
    ```json
    [
      {
        "id": "prod_123",
        "nombre": "Cheesecake de Frutos Rojos",
        "descripcion": "Porción individual con salsa artesanal",
        "precio": 4500.0,
        "stock": 14,
        "prep_minutos": 10,
        "categoria": "Postres"
      }
    ]
    ```

#### 2. `check_product_stock`
*   **Descripción:** Consulta el stock exacto y el tiempo estimado de preparación para una lista de productos y cantidades específicas.
*   **Parámetros:**
    *   `items` (array de objetos): Lista de `{ product_id: string, cantidad: integer }`.
*   **Salida (JSON):**
    ```json
    {
      "disponible": true,
      "stock_suficiente": true,
      "prep_minutos_total": 25,
      "detalles": [
        { "product_id": "prod_123", "stock_actual": 14, "requerido": 2, "ok": true }
      ]
    }
    ```

#### 3. `lookup_customer`
*   **Descripción:** Busca a un cliente por su número de teléfono. Si existe, devuelve sus datos básicos y la lista de direcciones guardadas.
*   **Parámetros:**
    *   `telefono` (string, requerido): Número de teléfono o WhatsApp del cliente (ej. `5492281400000`).
*   **Salida (JSON):**
    ```json
    {
      "encontrado": true,
      "nombre": "Sofia Gonzalez",
      "email": "sofia@gmail.com",
      "direcciones": [
        {
          "id": "addr_999",
          "etiqueta": "Trabajo",
          "resumen": "Av. Mitre 1234, Piso 1, Dpto B",
          "datos": {
            "calle": "Av. Mitre",
            "numero": "1234",
            "piso": "1",
            "departamento": "B"
          }
        }
      ]
    }
    ```

#### 4. `create_order`
*   **Descripción:** Registra un nuevo pedido en el sistema, calculando los precios finales en el servidor, validando stock y agendando la entrega.
*   **Parámetros:**
    *   `nombre_cliente` (string, requerido)
    *   `telefono_cliente` (string, requerido)
    *   `email_cliente` (string, opcional)
    *   `metodo_entrega` (enum: `ENVIO`, `RETIRO`, requerido)
    *   `direccion_id` (string, opcional): ID de una dirección guardada.
    *   `direccion_nueva` (objeto, opcional): Datos para crear una nueva dirección según el esquema dinámico del tenant.
    *   `zona_envio` (string, requerido si metodo_entrega es `ENVIO`)
    *   `cuando` (enum: `ASAP`, `PROGRAMADO`, requerido)
    *   `fecha_entrega` (string, formato YYYY-MM-DD, requerido si es `PROGRAMADO`)
    *   `hora_entrega` (string, formato HH:MM, requerido si es `PROGRAMADO`)
    *   `metodo_pago` (enum: `MERCADO_PAGO`, `TRANSFERENCIA`, `EFECTIVO`, requerido)
    *   `items` (array de objetos, requerido): Lista de `{ product_id: string, cantidad: integer }`
    *   `observaciones` (string, opcional): Notas adicionales del pedido.
*   **Salida (JSON):**
    ```json
    {
      "success": true,
      "codigo_pedido": "EGMP-8742",
      "total": 12500.0,
      "pago_requerido": true,
      "checkout_url": "https://www.mercadopago.com.ar/sandbox/showcase/...",
      "estado": "PENDIENTE",
      "fecha_entrega_estimada": "2026-07-15T12:30:00Z"
    }
    ```

#### 5. `get_order_status`
*   **Descripción:** Obtiene el estado operativo en tiempo real de un pedido mediante su código alfanumérico.
*   **Parámetros:**
    *   `codigo_pedido` (string, requerido): El código único del pedido (ej: `EGMP-8742`).
*   **Salida (JSON):**
    ```json
    {
      "codigo": "EGMP-8742",
      "estado": "EN_PREPARACION",
      "estado_pago": "APROBADO",
      "metodo_entrega": "ENVIO",
      "total": 12500.0,
      "tiempo_estimado_despacho": "2026-07-15T12:15:00Z",
      "eventos": [
        { "estado": "EN_PREPARACION", "fecha": "2026-07-15T11:45:00Z" },
        { "estado": "CONFIRMADO", "fecha": "2026-07-15T11:40:00Z" }
      ]
    }
    ```

---

## 3. Ejemplo de Flujo Conversacional usando MCP

Un agente de IA integrado en WhatsApp funcionaría de la siguiente manera ante un cliente:

1.  **Saludo y Consulta de Menú:**
    *   *Cliente:* "Hola, ¿qué tenés para comer hoy?"
    *   *Agente (IA) ejecuta:* `get_catalog()`
    *   *Agente responde:* "¡Hola! Hoy tenemos Cheesecakes de Frutos Rojos ($4500), Budines de Limón ($3200) y Alfajores de Pistacho ($1500). ¿Qué te gustaría tentar?"
2.  **Armado del Pedido:**
    *   *Cliente:* "Quiero 2 Cheesecakes por favor. ¿Hacen envíos?"
    *   *Agente (IA) ejecuta:* `check_product_stock(items=[{"product_id": "cheesecake_id", "cantidad": 2}])` y verifica el `TenantConfig` (para confirmar si hay envíos activos).
    *   *Agente responde:* "¡Perfecto, tenemos stock! Sí, hacemos envíos. ¿Me pasás tu número de teléfono para ver si ya tenemos cargada tu dirección?"
3.  **Identificación del Cliente:**
    *   *Cliente:* "Es el 2281401234"
    *   *Agente (IA) ejecuta:* `lookup_customer(telefono="2281401234")`
    *   *Agente responde:* "¡Te encontré, Sofía! ¿Querés que te lo enviemos a tu dirección habitual en 'Av. Mitre 1234, Piso 1, Dpto B'?"
4.  **Confirmación y Pago:**
    *   *Cliente:* "Sí, a esa misma."
    *   *Agente (IA) ejecuta:* `create_order(nombre_cliente="Sofia Gonzalez", telefono_cliente="2281401234", metodo_entrega="ENVIO", direccion_id="addr_999", metodo_pago="MERCADO_PAGO", items=[{"product_id": "cheesecake_id", "cantidad": 2}])`
    *   *Agente responde:* "¡Excelente! Tu pedido **EGMP-8742** ya fue registrado. Para confirmarlo, podés realizar el pago de $9000 (envío incluido) en este enlace de Mercado Pago: [Pagar Pedido](https://link-de-pago...). Una vez abonado, ¡empezamos a prepararlo!"
