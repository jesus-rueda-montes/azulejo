---
title: Azure Policy, locks y tags en la práctica
minutes: 9
---

## Qué problema resuelve

En AZ-900 viste **qué** son Azure Policy, los locks y las tags. Como administrador tienes que **aplicarlos**: elegir el efecto correcto, asignar en el scope adecuado, corregir lo que ya no cumple y proteger lo crítico sin bloquear el trabajo diario.

## Analogía

Azure Policy es un **inspector** con un reglamento. Según la regla, **impide** la obra (*deny*), **apunta** la infracción (*audit*), **arregla** algo pequeño sobre la marcha (*modify*) o **instala lo que falta** (*deployIfNotExists*).

## Concepto

### Efectos de Azure Policy más usados

| Efecto | Qué hace |
|---|---|
| **Deny** | Rechaza la creación o actualización que no cumple |
| **Audit** | Permite, pero marca el recurso como **no conforme** |
| **Append** | Añade propiedades al crear o actualizar (por ejemplo, reglas de IP) |
| **Modify** | Añade, cambia o quita propiedades o **tags** |
| **AuditIfNotExists** | Audita si falta un recurso relacionado (por ejemplo, una extensión) |
| **DeployIfNotExists** | **Despliega** el recurso relacionado si falta |
| **Disabled** | Desactiva la política sin borrarla |

- **Modify** y **DeployIfNotExists** necesitan una **managed identity** en la asignación, porque actúan en tu nombre.
- Los recursos que **ya existían** se corrigen con una **tarea de remediación** (*remediation task*).
- Con **enforcement mode `DoNotEnforce`** la política evalúa y muestra el cumplimiento, pero no bloquea: útil para probar su impacto.
- Una **exención** (*exemption*) excluye un scope concreto de una asignación.

```bash
az policy assignment create --name solo-ue --policy e56962a6-4747-49cd-b67b-bf8b01975c4c \
  --scope /subscriptions/<id> \
  --params '{"listOfAllowedLocations": {"value": ["westeurope", "northeurope"]}}'
```

(`e56962a6-…` es el ID de la definición integrada **Allowed locations**).

### Resource locks

```bash
az lock create --name no-borrar --lock-type CanNotDelete --resource-group rg-datos
az lock list --resource-group rg-datos
az lock delete --name no-borrar --resource-group rg-datos
```

- **CanNotDelete**: lectura y modificación sí; borrado no.
- **ReadOnly**: solo lectura. Ojo: bloquea operaciones que son POST aunque parezcan de lectura, como **listar las claves** de una storage account.
- Para crear o borrar locks hace falta permiso `Microsoft.Authorization/locks/*`: lo tienen **Owner** y **User Access Administrator**, no Contributor.

### Tags

```bash
az group update --name rg-web --tags entorno=pro centro-coste=ventas
az resource list --tag entorno=pro --output table
```

- Las tags **no se heredan**. Políticas integradas útiles: **Require a tag on resource groups** y **Inherit a tag from the resource group** (efecto Modify).
- Cada recurso admite un número limitado de tags; define un **esquema común** (entorno, propietario, centro de coste) para toda la organización.

## Ejemplo

El equipo de plataforma:

1. Asigna **Allowed locations** en el management group de producción, primero con `DoNotEnforce` una semana para ver qué rompería, y después en modo normal.
2. Asigna **Inherit a tag from the resource group** para `centro-coste`, con managed identity, y lanza una **remediation task** para los recursos antiguos.
3. Pone un lock **CanNotDelete** en `rg-datos`. Un Contributor ya no puede borrar la base de datos, ni quitar el lock.

## Errores comunes

- **Elegir Deny sin probar**: rompe despliegues existentes. Empieza con Audit o `DoNotEnforce`.
- **Olvidar la remediation task**: Modify y DeployIfNotExists solo actúan solos sobre recursos nuevos o actualizados.
- **Poner ReadOnly en una storage account** y que las aplicaciones dejen de poder obtener sus claves.
- **Esperar que un Contributor gestione locks.** Necesita Owner o User Access Administrator.

## Lo que debes saber

**¿Qué efecto de Policy corrige propiedades o tags de un recurso?**
Modify (y DeployIfNotExists si hay que desplegar un recurso que falta). Ambos necesitan una managed identity.

**¿Cómo corriges los recursos que ya existían antes de asignar la política?**
Con una remediation task.

**¿Qué rol hace falta para gestionar locks?**
Owner o User Access Administrator (permisos `Microsoft.Authorization/locks/*`).

## Resumen

- Efectos: **Deny**, **Audit**, **Append**, **Modify**, **AuditIfNotExists**, **DeployIfNotExists**, **Disabled**.
- Modify y DeployIfNotExists: **managed identity** + **remediation task** para lo existente.
- `DoNotEnforce` para probar; **exenciones** para excluir.
- Locks **CanNotDelete** y **ReadOnly** (`az lock create`); requieren Owner o User Access Administrator.
- Tags con `az group update --tags`; herencia mediante políticas.
