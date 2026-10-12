---
title: Azure Policy, resource locks y Microsoft Purview
minutes: 7
---

## Qué problema resuelve

Con decenas de equipos creando recursos, alguien acabará desplegando VMs enormes en una región prohibida, sin etiquetas, o borrando por error la base de datos de producción. Hacen falta **reglas que se cumplan solas**, **candados** para lo crítico y una **visión global de los datos** de la organización.

## Analogía

- **Azure Policy** es el **reglamento de una comunidad de vecinos** que el portero hace cumplir: «no se pueden poner toldos de otro color».
- Un **resource lock** es el **precinto** en la puerta del cuarto de contadores: hasta el presidente tiene que quitarlo antes de abrir.
- **Microsoft Purview** es el **inventario** de todo lo que hay en el edificio y de quién puede verlo.

## Concepto

### Azure Policy

**Azure Policy** crea, asigna y gestiona **políticas** que controlan o auditan tus recursos:

- Una **definición de política** describe la regla (por ejemplo, «solo se permiten estas regiones») y su **efecto**: **denegar** la creación, **auditar** (marcar como no conforme), **modificar** el recurso, etc.
- Una **asignación** aplica la política a un **scope** (management group, suscripción o resource group) y se **hereda** hacia abajo.
- Una **iniciativa** (*initiative*) agrupa varias políticas relacionadas para gestionarlas juntas.
- Evalúa los recursos nuevos **y los existentes**, muestra el **estado de cumplimiento** y, con algunas políticas, puede **remediar** automáticamente lo que no cumple.
- Hay muchas definiciones **integradas** listas para usar.

### Resource locks

Un **resource lock** impide que se **borren** o **modifiquen** recursos por accidente. Se aplica a una suscripción, un resource group o un recurso, y **se hereda**.

| Tipo | En la CLI | Efecto |
|---|---|---|
| **Delete** | `CanNotDelete` | Se puede leer y modificar, pero **no borrar** |
| **Read-only** | `ReadOnly` | Solo se puede leer: **ni modificar ni borrar** |

Los locks aplican **a todos**, incluidos los usuarios con rol **Owner**. Para borrar el recurso hay que **quitar antes el lock** (lo que requiere permisos para gestionar locks).

### Microsoft Purview

**Microsoft Purview** es una familia de soluciones de **gobierno de datos**, **riesgo** y **cumplimiento**:

- **Gobierno de datos**: descubre y clasifica automáticamente datos de orígenes on-premises, multicloud y SaaS, con un mapa de datos actualizado y su linaje.
- **Riesgo y cumplimiento**: protege datos sensibles en Microsoft 365, Teams, OneDrive, Exchange…, gestiona riesgos y ayuda a cumplir normativas.

## Ejemplo

El equipo de plataforma asigna en el management group **Producción**:

- Una política **«Allowed locations»** con efecto *deny*: nadie puede crear recursos fuera de West Europe y North Europe.
- Una **iniciativa** que exige la tag `centro-coste` en los resource groups.

Además, pone un lock **CanNotDelete** en `rg-tienda-datos`. Cuando un administrador intenta borrar la base de datos por error, Azure lo bloquea, aunque sea Owner.

## Errores comunes

- **Confundir Azure Policy con Azure RBAC.** RBAC decide **quién** puede actuar; Policy decide **qué configuraciones** están permitidas, actúe quien actúe.
- **Pensar que un Owner se salta un lock.** El lock aplica a todos; hay que quitarlo primero.
- **Poner ReadOnly sin pensar en los efectos**: algunas operaciones que parecen de lectura (como listar las claves de una storage account) se bloquean.
- **Creer que Policy solo actúa sobre recursos nuevos.** También evalúa los existentes y muestra su cumplimiento.

## Lo que debes saber

**¿Qué diferencia hay entre Azure Policy y Azure RBAC?**
RBAC controla qué acciones puede hacer cada usuario; Policy, qué propiedades pueden tener los recursos.

**¿Qué tipos de resource lock existen?**
Delete (CanNotDelete): no se puede borrar. Read-only (ReadOnly): no se puede modificar ni borrar.

**¿Qué es una iniciativa de Azure Policy?**
Un conjunto de definiciones de política agrupadas para asignarlas y seguirlas juntas.

## Resumen

- **Azure Policy**: definiciones con efectos (deny, audit, modify…), asignadas a un scope y heredadas; **iniciativas** = grupos de políticas; cumplimiento y remediación.
- **Resource locks**: **CanNotDelete** y **ReadOnly**; afectan también a los Owner; se heredan.
- **Microsoft Purview**: gobierno de datos, riesgo y cumplimiento en entornos híbridos y multicloud.
