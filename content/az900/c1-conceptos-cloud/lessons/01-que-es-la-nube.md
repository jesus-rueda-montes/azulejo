---
title: Qué es la nube y qué ventajas tiene
minutes: 7
---

## Qué problema resuelve

Montar tu propio centro de datos implica comprar servidores, esperar semanas a que lleguen, pagar luz, refrigeración y personal, y dimensionar todo para el **pico** de uso aunque el resto del año sobre capacidad. **Cloud computing** resuelve esto: alquilas capacidad de cómputo, almacenamiento y red **por internet**, cuando la necesitas y pagando **solo por lo que usas**.

## Analogía

Es la diferencia entre **comprar un coche** y **usar un servicio de alquiler por minutos**. Con el coche propio pagas aunque esté aparcado, y tú te ocupas del seguro y las revisiones. Con el alquiler pagas los minutos que conduces, y el mantenimiento es cosa de la empresa.

## Concepto

### Definición

**Cloud computing** es la entrega de servicios informáticos (servidores, almacenamiento, bases de datos, redes, software, análisis…) **a través de internet**, con capacidad que se reserva y se libera a demanda.

### Modelo de consumo y tipos de gasto

| | CapEx (gasto de capital) | OpEx (gasto operativo) |
|---|---|---|
| Qué es | Inversión inicial en activos físicos | Pago continuo por servicios |
| Ejemplo | Comprar servidores | Factura mensual de Azure |
| Cuándo se paga | Por adelantado | A medida que se consume |

La nube sigue un **modelo basado en el consumo** (*consumption-based*): sin costes iniciales, sin comprar infraestructura que luego sobra, y pagando por recursos adicionales solo cuando hacen falta. Es **OpEx**.

Modelos de precio habituales en Azure:

- **Pago por uso** (*pay-as-you-go*): sin compromiso; el más flexible.
- **Reservas** (*reservations*): te comprometes a 1 o 3 años de uso a cambio de un descuento.
- **Spot**: capacidad sobrante muy barata que Azure puede retirar con poco aviso.

### Ventajas de la nube

| Ventaja | Qué significa |
|---|---|
| **High availability** | El servicio sigue disponible aunque falle algo. Se mide con el **SLA** (p. ej. 99,9 %). |
| **Scalability** | Añadir capacidad: **vertical** (*scale up*, una máquina más grande) u **horizontal** (*scale out*, más máquinas). |
| **Elasticity** | Escalar **automáticamente** según la demanda, hacia arriba y hacia abajo. |
| **Reliability** | Capacidad de recuperarse de fallos; la nube distribuye recursos por varias regiones. |
| **Predictability** | De **rendimiento** (autoescalado, balanceo) y de **coste** (calculadoras, presupuestos). |
| **Security y governance** | Plantillas, políticas y parches gestionados por el proveedor para cumplir normas. |
| **Manageability** | Gestión **de** la nube (escalado automático, alertas) y **en** la nube (portal, CLI, API). |

## Ejemplo

Una tienda online recibe 20 veces más visitas en el Black Friday.

- **En su propio centro de datos:** compra servidores para el pico; 11 meses al año están casi parados (CapEx desperdiciado).
- **En Azure:** configura **autoescalado** (elasticidad). El viernes pasa de 2 a 40 servidores y el lunes vuelve a 2. Paga los 40 solo durante esas horas (OpEx, modelo de consumo).

## Errores comunes

- **Confundir escalabilidad con elasticidad.** Escalar es poder crecer; la elasticidad es hacerlo **automáticamente** según la carga.
- **Creer que «nube» significa «siempre más barato».** Recursos encendidos sin usar también se pagan. El ahorro llega dimensionando bien y apagando lo que no se usa.
- **Pensar que alta disponibilidad es lo mismo que fiabilidad.** La disponibilidad mide el tiempo en servicio; la fiabilidad, la capacidad de recuperarse de un fallo.

## Lo que debes saber

**¿Qué es el modelo basado en el consumo?**
Pagar solo por los recursos que usas, sin inversión inicial. Convierte el CapEx en OpEx.

**¿Qué diferencia hay entre escalar vertical y horizontalmente?**
Vertical (*up*) es dar más CPU o RAM a una máquina; horizontal (*out*) es añadir más máquinas.

**¿Qué es un SLA?**
El acuerdo en el que el proveedor garantiza un porcentaje de disponibilidad de un servicio (y compensa si no lo cumple).

## Resumen

- La nube es cómputo, almacenamiento y red **por internet**, a demanda.
- **Modelo de consumo**: pagas lo que usas; gasto **OpEx** en lugar de **CapEx**.
- Precios: **pago por uso**, **reservas** (1 o 3 años, con descuento) y **Spot**.
- Ventajas: **alta disponibilidad**, **escalabilidad** y **elasticidad**, **fiabilidad**, **predictibilidad**, **seguridad y gobernanza**, **gestionabilidad**.
