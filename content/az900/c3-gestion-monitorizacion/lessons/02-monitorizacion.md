---
title: Advisor, Service Health y Azure Monitor
minutes: 7
---

## Qué problema resuelve

Tu aplicación va lenta. ¿Es tu código, tu base de datos o una caída de Azure en la región? ¿Hay algo mal configurado que te cuesta dinero o te deja expuesto? Sin datos no lo sabes. Azure tiene herramientas para **recibir recomendaciones**, **conocer el estado de la plataforma** y **medir y alertar** sobre tus propios recursos.

## Analogía

- **Advisor** es el **mecánico** que, en la revisión, te dice qué mejorar.
- **Service Health** es el **parte de tráfico**: te avisa de los cortes en tus carreteras.
- **Azure Monitor** es el **cuadro de mandos** del coche, con sus testigos de aviso.

## Concepto

### Azure Advisor

**Azure Advisor** analiza tus recursos y da **recomendaciones personalizadas** en cinco categorías:

| Categoría | Ejemplo |
|---|---|
| **Reliability** | Desplegar en varias zonas |
| **Security** | Activar MFA, cerrar puertos expuestos |
| **Performance** | Mejorar la velocidad de una aplicación |
| **Operational Excellence** | Buenas prácticas de despliegue y gestión |
| **Cost** | Apagar o reducir VMs infrautilizadas |

### Azure Service Health

Tiene **tres niveles**:

1. **Azure status**: estado **global** de todos los servicios en todas las regiones.
2. **Service Health**: lo que afecta a **tus** servicios y regiones: incidencias, **mantenimientos planificados** y avisos. Permite configurar **alertas**.
3. **Resource Health**: el estado de **cada recurso** concreto (por ejemplo, una VM) y su historial.

### Azure Monitor

**Azure Monitor** recoge, analiza y actúa sobre los datos de telemetría de Azure, on-premises y otras nubes:

- **Métricas**: valores numéricos en el tiempo (CPU, peticiones/s).
- **Logs**: registros de eventos, que se guardan en un workspace de **Log Analytics**.
- **Log Analytics**: herramienta para **consultar los logs** con **KQL** (*Kusto Query Language*).
- **Alertas** (*Azure Monitor alerts*): avisan cuando una métrica o un log cumple una condición, y llaman a un **action group** (correo, SMS, webhook, runbook…).
- **Application Insights**: monitorización del rendimiento de **aplicaciones** (APM): tasa de peticiones, tiempos de respuesta, errores, dependencias, vistas de página… También puede hacer **pruebas de disponibilidad** periódicas.

## Ejemplo

Un lunes, la tienda online va lenta:

1. **Service Health** no muestra incidencias en West Europe: no es Azure.
2. En **Application Insights** se ve que las peticiones a `/checkout` tardan 8 s y que el cuello de botella es una llamada a la base de datos.
3. Con **Log Analytics** consultan con KQL los errores de la última hora.
4. Crean una **alerta** que avisa por correo cuando la CPU de la base de datos supera el 80 %.
5. **Advisor** recomienda, además, reducir dos VMs que llevan semanas al 5 % de CPU.

## Errores comunes

- **Confundir Service Health con Resource Health.** El primero informa de incidencias de Azure en tus servicios y regiones; el segundo, del estado de un recurso concreto.
- **Confundir Advisor con Defender for Cloud.** Advisor da recomendaciones generales (incluida seguridad); Defender se dedica a la postura de seguridad y a las amenazas.
- **Pensar que Application Insights monitoriza la infraestructura.** Se centra en la aplicación; la infraestructura se ve con las métricas y los logs de Monitor.

## Lo que debes saber

**¿En qué categorías da recomendaciones Azure Advisor?**
Reliability, Security, Performance, Operational Excellence y Cost.

**¿Dónde ves un mantenimiento planificado que afecta a tus recursos?**
En Azure Service Health.

**¿Con qué lenguaje se consultan los logs en Log Analytics?**
Con KQL (Kusto Query Language).

## Resumen

- **Advisor**: recomendaciones en 5 categorías (fiabilidad, seguridad, rendimiento, excelencia operativa y coste).
- **Service Health**: Azure status (global), Service Health (tus servicios) y Resource Health (cada recurso).
- **Azure Monitor**: métricas, logs, **Log Analytics** (KQL), **alertas** con action groups y **Application Insights** (APM).
