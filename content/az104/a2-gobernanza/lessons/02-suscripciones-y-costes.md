---
title: Suscripciones, management groups y costes
minutes: 7
---

## Qué problema resuelve

La empresa crece: pasa de una suscripción a veinte, de un equipo a diez. Hay que **organizar** las suscripciones para aplicar normas en bloque, **mover** recursos cuando cambia un proyecto y **vigilar el gasto** antes de que llegue la factura.

## Analogía

Los **management groups** son las **carpetas** del armario de suscripciones. Los **budgets** son la **alarma del móvil** que te avisa cuando has gastado el 80 % del dinero del mes.

## Concepto

### Management groups

```bash
az account management-group create --name produccion --display-name "Producción"
az account management-group list --output table
```

- Agrupan suscripciones; las políticas y los roles asignados en un management group **se heredan**.
- Las suscripciones nuevas caen en el **Tenant root group** por defecto.
- Diseño típico: separar por **entorno** (producción, desarrollo, sandbox) o por **área de negocio**.

### Resource groups y suscripciones

- **Mover recursos**: `az resource move` a otro resource group o suscripción (dentro del mismo tenant). No todos los tipos de recurso lo admiten, y durante el traslado ambos grupos se bloquean para escrituras.
- Mover un recurso **no cambia su región**. Para cambiar de región se usa **Azure Resource Mover** o se vuelve a desplegar.
- Una suscripción puede cambiar de management group sin afectar a sus recursos.

### Costes: budgets, alertas y Advisor

En **Cost Management**:

- **Budgets**: importe por periodo (mensual, trimestral, anual) en una suscripción, resource group o management group, con **umbrales** que envían alertas: sobre el gasto **real** o el **previsto** (*forecasted*).
- Un budget puede llamar a un **action group** (correo, SMS, webhook, runbook) para automatizar una respuesta, como apagar VMs de desarrollo.
- **Alertas de anomalías**: avisan de picos de gasto inesperados.
- **Cost analysis**: agrupa el gasto por servicio, resource group o **tag**.

**Azure Advisor** recomienda ahorros concretos: redimensionar o apagar VMs infrautilizadas, comprar **reservas** para cargas estables, borrar discos o IPs públicas sin uso. Cada recomendación se puede **posponer** o **descartar**.

## Ejemplo

```
Tenant root group
├── produccion  (Allowed locations, tags obligatorias)
│   ├── sub-tienda-pro
│   └── sub-datos-pro
└── no-produccion (budget de 500 €/mes con alerta al 80 % del gasto previsto)
    ├── sub-tienda-dev
    └── sub-sandbox
```

A mitad de mes, la alerta de gasto **previsto** del 80 % salta en *no-produccion*. Advisor muestra tres VMs de pruebas al 2 % de CPU; el equipo las apaga y el gasto previsto baja.

## Errores comunes

- **Pensar que `az resource move` cambia la región.** Solo cambia de grupo o de suscripción.
- **Configurar solo alertas sobre gasto real**: cuando saltan, el dinero ya está gastado. Usa también el gasto previsto.
- **Dejar todas las suscripciones en el root group**: se pierde la posibilidad de aplicar normas por entorno.
- **Ignorar las recomendaciones de Advisor** en lugar de revisarlas o descartarlas con motivo.

## Lo que debes saber

**¿Dónde caen las suscripciones nuevas en la jerarquía?**
En el Tenant root group, hasta que las muevas.

**¿Puedes cambiar un recurso de región con `az resource move`?**
No; mueve entre resource groups o suscripciones. Para otra región, Azure Resource Mover o volver a desplegar.

**¿Qué puede disparar un budget además de un correo?**
Un action group: SMS, webhook, runbook de automatización…

## Resumen

- **Management groups** para organizar suscripciones y heredar políticas y roles.
- `az resource move`: otro grupo o suscripción, misma región; bloquea los grupos durante el traslado.
- **Budgets** con alertas sobre gasto real o previsto y action groups; **alertas de anomalías**.
- **Advisor**: recomendaciones de coste (redimensionar, reservas, borrar lo que sobra).
