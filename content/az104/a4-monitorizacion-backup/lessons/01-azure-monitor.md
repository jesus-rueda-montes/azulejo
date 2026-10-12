---
title: Métricas, logs y alertas con Azure Monitor
minutes: 9
---

## Qué problema resuelve

Te enteras de que la web está caída porque llama un cliente. Necesitas ver cómo se comportan los recursos, guardar sus logs en un sitio donde puedas consultarlos y que Azure te avise (o actúe solo) **antes** de que el problema llegue al usuario.

## Analogía

Azure Monitor es el **cuadro de mandos de un coche**: las **métricas** son las agujas (velocidad, temperatura), los **logs** son la caja negra, y las **alertas** son el testigo que se enciende y el pitido que te avisa.

## Concepto

### Métricas y logs

| | Métricas | Logs |
|---|---|---|
| Qué son | Números a intervalos regulares (CPU, peticiones…) | Registros con detalle (eventos, trazas, auditoría) |
| Dónde | Base de datos de métricas, sin configurar nada | Un **Log Analytics workspace** |
| Cómo se consultan | Metrics explorer o `az monitor metrics list` | **KQL** |

```bash
az monitor metrics list --resource <id-vm> --metrics "Percentage CPU" --aggregation Average --interval PT5M
```

- El **activity log** registra las operaciones de gestión de la suscripción (quién creó, cambió o borró qué).
- Los logs de un recurso **no se guardan por defecto**: hay que crear un **diagnostic setting** que los envíe a un Log Analytics workspace, una storage account o un Event Hub.

```bash
az monitor log-analytics workspace create -n law-tienda -g rg-monitor --retention-time 30
```

### KQL en dos minutos

```kusto
AzureActivity
| where TimeGenerated > ago(1d)
| where OperationNameValue has "delete"
| summarize total = count() by Caller
| order by total desc
```

Se empieza por una **tabla** y se encadenan operadores con `|`: `where` (filtrar), `project` (elegir columnas), `summarize ... by` (agregar), `order by`, `take` (limitar).

### Alertas

```bash
az monitor metrics alert create -n cpu-alta -g rg-web --scopes <id-vm> \
  --condition "avg Percentage CPU > 90" --window-size 5m --evaluation-frequency 1m \
  --severity 2 --action ag-guardia
```

- Tipos: **metric**, **log search** (una consulta KQL), **activity log** (por ejemplo, «alguien borró una VM») y **service health**.
- **Severidad** de 0 (crítica) a 4 (informativa).
- **Action group**: qué hacer al dispararse. Notificaciones (email, SMS, push, voz) y acciones (webhook, Logic App, Function, Automation runbook, ITSM). Se reutiliza entre alertas.
- **Alert processing rules**: modifican las alertas ya disparadas, por ejemplo para **silenciarlas en una ventana de mantenimiento** o añadir un action group a todas las de una suscripción.

### Insights y Network Watcher

- **VM insights**, **Container insights**, **Storage insights**…: paneles prediseñados por tipo de recurso.
- **Application Insights**: monitorización de aplicaciones (peticiones, dependencias, errores, disponibilidad).
- **Network Watcher**: diagnóstico de red (IP flow verify, next hop, connection troubleshoot, flow logs).

## Ejemplo

La tienda en producción:

1. Diagnostic settings de la web app y de la storage account hacia `law-tienda`.
2. Alerta de métrica: CPU media > 90 % durante 5 minutos, severidad 2.
3. Alerta de activity log: borrado de cualquier recurso en `rg-prod`.
4. Ambas usan el action group `ag-guardia` (email + SMS al de guardia).
5. Alert processing rule que las silencia el domingo de 02:00 a 04:00, en la ventana de mantenimiento.

## Errores comunes

- **Buscar logs de un recurso** sin haber creado su diagnostic setting.
- **Crear un action group por alerta** en lugar de reutilizarlos.
- **Desactivar alertas a mano** en cada mantenimiento: para eso están las alert processing rules.
- **Confundir el activity log** (operaciones de gestión) con los logs del recurso (lo que pasa dentro).

## Lo que debes saber

**¿Cómo envías los logs de un recurso a Log Analytics?**
Con un diagnostic setting.

**¿Qué es un action group?**
El conjunto reutilizable de notificaciones y acciones que se ejecutan cuando salta una alerta.

**¿Cómo silencias las alertas durante una ventana de mantenimiento?**
Con una alert processing rule de supresión programada.

## Resumen

- **Métricas** (numéricas, automáticas) y **logs** (en Log Analytics, consultados con **KQL**).
- **Activity log**: operaciones de gestión. Logs del recurso: con **diagnostic settings**.
- **Alertas** de métrica, log search, activity log y service health; severidad 0-4.
- **Action groups** reutilizables; **alert processing rules** para silenciar o enrutar.
- Insights, Application Insights y Network Watcher.
