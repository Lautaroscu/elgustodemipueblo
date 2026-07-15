# Módulo Post-Compra y Gestión de Logística

Quiero que diseñes un sistema completo de **Post-Compra** y **Gestión de Logística** para el e-commerce.

No debe ser simplemente una lista de pedidos.

Debe convertirse en el centro operativo del negocio, permitiendo administrar de manera eficiente la preparación, organización y entrega de todos los pedidos.

Piensa como un Product Designer especializado en software logístico (Uber Eats, Rappi, PedidosYa, Amazon Logistics, etc.), pero adaptado a un emprendimiento de postres.

---

# Objetivo

Luego de que un cliente realiza el pago mediante Mercado Pago, comienza una nueva etapa del flujo.

El sistema debe permitir:

- Confirmar automáticamente el pedido.
- Obtener toda la información necesaria para preparar el producto.
- Organizar la logística.
- Agrupar pedidos.
- Optimizar recorridos.
- Reducir tiempos de entrega.
- Minimizar kilómetros recorridos.
- Mostrar el estado completo del pedido tanto al cliente como al administrador.

---

# Flujo Post Compra

Una vez aprobado el pago:

El pedido pasa automáticamente a:

```
Pendiente de preparación
```

El administrador podrá avanzar el pedido por los siguientes estados:

- Pendiente
- Confirmado
- En preparación
- Listo para despacho
- En reparto
- Entregado
- Cancelado

Cada cambio debe quedar registrado en un historial.

---

# Información del cliente

Durante el checkout el usuario deberá indicar cómo desea recibir el pedido.

Dos opciones:

## Retiro en local

Si selecciona:

```
Retirar personalmente
```

No debe solicitar dirección.

Simplemente mostrar:

- Dirección del local
- Horarios de retiro
- Mapa
- Indicaciones

La dirección será configurable desde el Backoffice.

---

## Envío a domicilio

Si selecciona:

```
Enviar a domicilio
```

Se habilitarán automáticamente los siguientes campos:

- Nombre y apellido
- Teléfono
- Calle
- Número
- Piso
- Departamento
- Barrio
- Ciudad
- Código Postal
- Referencias

Ejemplo:

"Casa blanca con portón negro"

Todos estos datos deberán almacenarse junto al pedido.
# Dirección de entrega configurable

No quiero que el formulario de envío tenga campos fijos.

Cada emprendimiento trabaja de manera distinta.

Por ello, el administrador deberá poder configurar qué información solicitar al cliente durante el checkout.

---

# Configuración desde el Backoffice

Crear una sección llamada:

```
Configuración → Datos de entrega
```

Desde allí el administrador podrá activar o desactivar cada campo.

Por ejemplo:

- Nombre y apellido
- Teléfono
- Calle
- Número
- Piso
- Departamento
- Barrio
- Ciudad
- Provincia
- Código Postal
- Referencias
- Entre calles
- Empresa
- Timbre
- Coordenadas GPS (opcional)

Cada campo podrá configurarse como:

- Oculto
- Opcional
- Obligatorio

De esta manera el checkout podrá adaptarse a distintos modelos de negocio sin necesidad de modificar el código.

---

# Formulario dinámico

Cuando el cliente seleccione:

```
Enviar a domicilio
```

El sistema generará automáticamente el formulario utilizando la configuración definida por el administrador.

No deberán existir campos hardcodeados.

Todo debe construirse dinámicamente.

---

# Persistencia de direcciones

Cuando el cliente complete su dirección por primera vez, el sistema deberá crear automáticamente una entidad Address asociada a su cuenta.

Modelo conceptual:

Customer
 └── Addresses
      ├── Casa
      ├── Trabajo
      └── Otra

Cada dirección podrá tener:

- Nombre (Casa, Trabajo, etc.)
- Dirección completa
- Coordenadas (cuando estén disponibles)
- Fecha de creación
- Fecha de actualización

---

# Compras futuras

En compras posteriores, el cliente no deberá volver a escribir toda su dirección.

Si ya posee direcciones registradas, el checkout mostrará:

○ Casa

○ Trabajo

○ Otra

[ + Agregar nueva dirección ]

Al seleccionar una dirección existente, el formulario se completará automáticamente.

El cliente podrá editarla si lo desea.

---

# Dirección predeterminada

El usuario podrá marcar una dirección como predeterminada.

Esta será seleccionada automáticamente en futuras compras.

---

# Edición

El cliente podrá:

- Crear nuevas direcciones.
- Editar direcciones existentes.
- Eliminar direcciones.
- Marcar una como favorita.

---

# Beneficio

El objetivo es reducir el tiempo necesario para completar el checkout.

En una segunda compra, el cliente debería poder finalizar el pedido prácticamente sin escribir información nuevamente.

---

# Fecha y horario deseado

Este punto es extremadamente importante.

El cliente debe poder elegir cuándo quiere recibir el pedido.

Opciones:

## Lo antes posible

```
ASAP
```

El pedido ingresa automáticamente a la cola de prioridad.

---

## Programar entrega

Permitir elegir:

- Fecha
- Hora

Ejemplo:

Viernes

18:30

El sistema deberá tener en cuenta esta información al planificar la logística.

---

# Preparación

Cada producto tendrá un tiempo estimado de preparación.

Ejemplo:

Brownie

15 minutos

Cheesecake

60 minutos

Torta personalizada

4 horas

El sistema deberá calcular automáticamente cuándo comenzar la preparación para llegar a tiempo a la entrega.

---

# Backoffice

Crear un módulo exclusivo llamado:

```
Logística
```

Este será el corazón operativo del negocio.

---

# Vista principal

Mostrar todos los pedidos en forma de tablero.

Agrupados por:

- Pendientes
- Preparación
- Listos
- En reparto
- Entregados

Cada tarjeta mostrará:

- Cliente
- Hora solicitada
- Tipo de entrega
- Dirección
- Productos
- Tiempo restante
- Estado
- Total

Con colores según prioridad.

---

# Agrupación automática

El sistema deberá detectar pedidos compatibles.

Ejemplo:

Tres pedidos:

Cliente A

18:00

Cliente B

18:10

Cliente C

18:15

Todos viven relativamente cerca.

El sistema sugerirá automáticamente:

```
Grupo de reparto #14
```

---

# Optimización de recorridos

Este es uno de los puntos más importantes.

El sistema deberá calcular automáticamente el recorrido más eficiente.

Debe considerar:

- Distancia
- Tiempo estimado
- Tránsito (si la API lo permite)
- Hora solicitada
- Prioridad
- Productos preparados
- Pedidos ASAP

La optimización debe minimizar:

- Tiempo total
- Kilómetros recorridos
- Retrasos

---

# Integración con mapas

Preparar la arquitectura para integrar:

- Google Maps
- Mapbox
- OpenRouteService

Cada pedido debe estar geolocalizado.

El administrador podrá visualizar todos los pedidos sobre un mapa.

---

# Vista de mapa

Mostrar:

- Local
- Clientes
- Ruta sugerida
- Distancias
- Tiempo estimado

Cada pedido tendrá un pin.

Los grupos tendrán colores distintos.

---

# Motor de priorización

Diseñar un algoritmo que considere:

- Hora solicitada
- ASAP
- Tiempo de preparación
- Distancia
- Estado del pedido
- Tiempo restante
- Prioridad manual

No ordenar únicamente por hora.

Debe priorizar inteligentemente.

---

# Repartos

Permitir crear repartos.

Cada reparto tendrá:

- Nombre
- Fecha
- Hora de salida
- Responsable
- Vehículo (opcional)
- Pedidos asignados

---

# Drag & Drop

El administrador debe poder mover pedidos entre repartos mediante Drag & Drop.

---

# Orden de entregas

Dentro de cada reparto poder modificar el orden manualmente.

Aunque el sistema sugiera uno automáticamente.

---

# Vista cronológica

Mostrar una línea de tiempo.

Ejemplo:

17:30

Comenzar preparación pedido 32

17:45

Comenzar pedido 18

18:00

Salir reparto A

18:12

Entrega Cliente Juan

18:18

Entrega Cliente María

18:27

Entrega Cliente Pedro

---

# Alertas

El sistema debe alertar cuando:

- Un pedido está retrasado.
- Un pedido aún no comenzó a prepararse.
- El horario comprometido está en riesgo.
- No hay stock.
- Un reparto está sobrecargado.

---

# Notificaciones

Preparar la arquitectura para enviar:

WhatsApp

Email

Push Notifications

Ejemplos:

Pedido confirmado.

Pedido en preparación.

Pedido listo.

Pedido en camino.

Pedido entregado.

---

# Dashboard Logístico

Mostrar métricas como:

- Pedidos de hoy
- Tiempo promedio de preparación
- Tiempo promedio de entrega
- Pedidos entregados a tiempo
- Pedidos retrasados
- Kilómetros recorridos
- Repartos realizados
- Tiempo promedio por reparto

---

# Escalabilidad

El sistema debe diseñarse pensando en crecimiento.

Hoy existe un solo emprendimiento.

Mañana podrían existir:

- Múltiples cocinas.
- Múltiples sucursales.
- Varios repartidores.
- Cientos de pedidos diarios.

La arquitectura debe soportarlo sin necesidad de rediseñar todo el sistema.

---

# Base de datos

Diseñar correctamente las entidades necesarias.

Por ejemplo:

- Orders
- OrderItems
- DeliveryAddress
- DeliveryGroup
- DeliveryRoute
- RouteStop
- KitchenTask
- DeliverySchedule
- DeliveryStatus
- DeliveryEvent

Crear relaciones limpias y escalables.

---

# Experiencia del administrador

No quiero un panel lleno de tablas.

Quiero una experiencia moderna.

Inspirarse en herramientas como:

- Linear
- Notion
- Stripe Dashboard
- Shopify Admin
- Vercel Dashboard

Todo debe sentirse rápido, intuitivo y visual.

---

# Objetivo final

Quiero que este módulo no sea simplemente un administrador de pedidos.

Quiero construir un pequeño sistema de gestión logística (mini TMS) integrado al e-commerce, capaz de organizar automáticamente la operación diaria, optimizar recorridos y facilitar la toma de decisiones.

Si identificas oportunidades para mejorar el flujo, agregar automatizaciones o aplicar algoritmos de optimización (clustering geográfico, cálculo de rutas, heurísticas tipo Traveling Salesman Problem, ventanas de tiempo, etc.), propónlas y explica por qué aportarían valor al negocio.