---
title: Recursos, resource groups, suscripciones y management groups
minutes: 8
---

## Qué problema resuelve

Una empresa con cientos de recursos necesita saber **quién paga** cada uno, **quién puede tocarlo** y **qué normas** debe cumplir. Si todo está mezclado, borrar un proyecto o dar acceso a un equipo se convierte en un caos. Azure organiza todo en una **jerarquía de cuatro niveles** donde los permisos y las políticas se **heredan** hacia abajo.

## Analogía

Es como un **archivo de oficina**: el **armario** (management group) contiene **cajones** (suscripciones), cada cajón tiene **carpetas** (resource groups) y cada carpeta contiene **documentos** (recursos). Si pones un candado al cajón, afecta a todas sus carpetas y documentos.

## Concepto

### Los cuatro niveles

```
Management groups  →  agrupan suscripciones (y otros management groups)
   Suscripciones   →  límite de facturación y de acceso
 Resource groups   →  contenedores lógicos de recursos
       Recursos    →  VMs, storage accounts, bases de datos…
```

**Recurso**: cada elemento que creas (una VM, una VNet, una base de datos).

**Resource group**: contenedor lógico que agrupa recursos, normalmente con el **mismo ciclo de vida** (se crean y se borran juntos):

- Un recurso está en **un solo** resource group.
- Los resource groups **no se pueden anidar**.
- Se pueden **mover** recursos de un grupo a otro.
- **Borrar un resource group borra todo lo que contiene.**
- Los permisos y políticas que apliques al grupo los heredan sus recursos.

**Suscripción**: unidad de gestión, **facturación** y escala. Necesitas al menos una para usar Azure. Es un doble límite:

- **Límite de facturación**: cada suscripción tiene su factura; separar suscripciones por departamento o entorno ayuda a repartir costes.
- **Límite de acceso**: las políticas de acceso se aplican por suscripción.

Una **cuenta de Azure** puede tener varias suscripciones, y todas confían en un **tenant** de Microsoft Entra ID (el directorio de identidades de la organización).

**Management group**: agrupa suscripciones para aplicarles **acceso y políticas en bloque**. Datos clave:

- Un directorio admite **hasta 10 000** management groups.
- El árbol tiene **hasta seis niveles** de profundidad, sin contar el nivel raíz ni el de suscripciones.
- Cada management group y cada suscripción tiene **un único padre**.
- Todo cuelga del **root management group** (*Tenant root group*).

### Azure Resource Manager

**Azure Resource Manager (ARM)** es el servicio de despliegue y gestión de Azure. Todas las peticiones (del portal, de la CLI, de PowerShell o de la API) pasan por él, así que los resultados son los mismos uses la herramienta que uses. Sobre ARM funcionan los permisos, las etiquetas, los bloqueos y las plantillas.

## Ejemplo

Una empresa organiza Azure así:

```
Tenant root group
├── MG Producción   (política: solo regiones de la UE)
│   ├── Suscripción Tienda-Pro
│   │   ├── rg-tienda-web   (App Service, Azure SQL)
│   │   └── rg-tienda-datos (storage account)
│   └── Suscripción Interna-Pro
└── MG Desarrollo
    └── Suscripción Sandbox
        └── rg-tienda-pruebas (VMs de pruebas)
```

La política «solo regiones de la UE» se asigna **una vez** en el management group *Producción* y la heredan todas sus suscripciones, grupos y recursos. Cuando el proyecto de pruebas termina, se borra `rg-tienda-pruebas` y desaparece todo su contenido de golpe.

## Errores comunes

- **Mezclar en un resource group recursos con ciclos de vida distintos**: al borrar el grupo de un proyecto temporal puedes llevarte por delante una base de datos que debía quedarse.
- **Creer que los resource groups se anidan.** No se puede; para agrupar a más alto nivel están las suscripciones y los management groups.
- **Pensar que la región del resource group limita la de sus recursos.** El grupo guarda sus metadatos en una región, pero sus recursos pueden estar en otras.
- **Confundir cuenta, tenant y suscripción.** El tenant es el directorio de identidades; la suscripción, la unidad de facturación y acceso.

## Lo que debes saber

**Ordena la jerarquía de mayor a menor.**
Management groups → suscripciones → resource groups → recursos.

**¿Qué pasa si borras un resource group?**
Se borran todos los recursos que contiene.

**¿Para qué sirven los management groups?**
Para aplicar acceso (RBAC) y políticas a varias suscripciones a la vez; lo asignado se hereda hacia abajo.

**¿Qué es Azure Resource Manager?**
La capa de despliegue y gestión por la que pasan todas las peticiones a Azure, sea cual sea la herramienta.

## Resumen

- Jerarquía: **management groups → suscripciones → resource groups → recursos**; permisos y políticas se **heredan**.
- **Resource group**: un recurso en un solo grupo, sin anidamiento; borrar el grupo borra su contenido.
- **Suscripción**: límite de **facturación** y de **acceso**.
- **Management groups**: hasta 10 000 por directorio y seis niveles de profundidad; un único padre.
- **ARM**: capa común de gestión para el portal, la CLI, PowerShell y la API.
