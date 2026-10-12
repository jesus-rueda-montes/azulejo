---
title: Regiones y availability zones
minutes: 7
---

## Qué problema resuelve

Si todos tus servidores están en un único edificio, un incendio o un corte de luz te deja sin servicio. Además, tus usuarios de Europa notan la latencia si la aplicación está en Estados Unidos, y algunas leyes obligan a guardar los datos dentro de un país. Azure organiza su infraestructura física en **regiones** y **availability zones** para que elijas **dónde** están tus recursos y **cuánto** resisten a los fallos.

## Analogía

Una cadena de supermercados tiene **ciudades** (regiones) y, dentro de cada ciudad, **varias tiendas** en barrios distintos, cada una con su propio suministro eléctrico (zonas). Si una tienda se inunda, las otras de la ciudad siguen abiertas. Algunas ciudades tienen además una **ciudad hermana** (region pair) que sirve de respaldo.

## Concepto

### Centros de datos y regiones

Todo empieza en los **centros de datos** (*datacenters*): edificios con servidores, refrigeración, energía y red. Tú no eliges un centro de datos concreto; eliges una **región**.

Una **región** es una zona geográfica con **uno o más centros de datos** cercanos, unidos por una red de baja latencia. Al crear un recurso indicas su región (`westeurope`, `spaincentral`…). Algunos servicios son **globales** y no tienen región, como Microsoft Entra ID o Azure DNS.

### Availability zones

Una **availability zone** es un grupo de uno o más centros de datos **físicamente separados** dentro de una región, con **energía, refrigeración y red independientes**. Las regiones con zonas tienen **un mínimo de tres**.

| Tipo de servicio | Qué hace | Ejemplo |
|---|---|---|
| **Zonal** | Fijas el recurso a una zona concreta | Una VM en la zona 1 |
| **Zone-redundant** | La plataforma replica el recurso entre zonas automáticamente | Almacenamiento ZRS |
| **No regional** | Siempre disponible, no depende de zonas ni regiones | Microsoft Entra ID |

Para alta disponibilidad, se despliegan copias de la aplicación en **varias zonas**: si cae una, las otras siguen.

### Region pairs

Microsoft asocia algunas regiones con otra de la **misma geografía** (por ejemplo, North Europe con West Europe). Ventajas de usar la pareja como región secundaria:

- **Actualizaciones secuenciales**: las actualizaciones planificadas se escalonan entre las dos regiones.
- **Recuperación prioritaria**: ante un desastre que afecte a toda una geografía, una región de cada pareja tiene prioridad para recuperarse.
- **Residencia de datos**: casi todas las parejas están en la misma geografía.

Muchas regiones nuevas **no tienen pareja** (por ejemplo, Spain Central o Italy North) y usan las availability zones como principal mecanismo de redundancia. Tener pareja **no** te da failover automático: el plan de recuperación lo diseñas tú.

### Sovereign regions

Son instancias de Azure **aisladas** de la principal, para requisitos legales o de cumplimiento:

- **Azure Government** (Estados Unidos): para organismos públicos de EE. UU.
- **Azure en China**: la opera **21Vianet**, no Microsoft directamente.

## Ejemplo

Una tienda española despliega su aplicación en **Spain Central** (latencia baja y datos en España). Pone una VM en cada una de las **tres zonas** y un balanceador delante: si un centro de datos se queda sin energía, las otras dos VMs siguen atendiendo. Como Spain Central no tiene pareja, si quiere protegerse ante la caída de toda la región debe elegir y configurar ella misma una segunda región.

## Errores comunes

- **Creer que una región es un centro de datos.** Una región puede tener varios; una zona también puede agrupar más de uno.
- **Pensar que todas las regiones tienen pareja o zonas.** Hay regiones sin pareja y regiones sin availability zones.
- **Suponer que la pareja hace failover automático.** La pareja facilita la recuperación, pero el plan de recuperación ante desastres es tuyo.
- **Desplegar varias VMs en la misma zona** pensando que así hay alta disponibilidad entre zonas.

## Lo que debes saber

**¿Qué es una availability zone?**
Uno o más centros de datos físicamente separados dentro de una región, con energía, refrigeración y red independientes. Hay un mínimo de tres en las regiones que las tienen.

**¿Para qué sirven los region pairs?**
Para la replicación entre regiones (por ejemplo, GRS), con actualizaciones secuenciales y recuperación prioritaria. Suelen estar en la misma geografía.

**¿Qué son las sovereign regions?**
Instancias aisladas de Azure para cumplimiento legal: Azure Government (EE. UU.) y Azure en China (operada por 21Vianet).

## Resumen

- **Región**: área geográfica con uno o más centros de datos. Es lo que eliges al crear un recurso.
- **Availability zone**: centros de datos separados dentro de una región; un mínimo de tres por región.
- Servicios **zonales**, **zone-redundant** y **no regionales**.
- **Region pair**: actualizaciones secuenciales y recuperación prioritaria; muchas regiones nuevas no tienen pareja.
- **Sovereign regions**: Azure Government y Azure en China (21Vianet).
