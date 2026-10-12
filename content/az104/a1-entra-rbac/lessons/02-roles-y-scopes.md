---
title: Roles de Azure, scopes y asignaciones
minutes: 8
---

## Qué problema resuelve

Un desarrollador dice: «no puedo reiniciar la VM, pero ayer sí podía». Otro tiene permisos que nadie recuerda haberle dado. Para responder hay que entender **cómo se forma el acceso efectivo**: qué roles hay, en qué **scope** están asignados y cómo se **heredan**.

## Analogía

Una **asignación de rol** es como una **llave** con tres datos grabados: **a quién** se la das, **qué puertas** abre y **en qué edificio** (scope). Una llave del edificio entero abre todas sus plantas; una de la planta 3 solo abre esa.

## Concepto

### Asignación de rol = principal + rol + scope

| Pieza | Ejemplos |
|---|---|
| **Security principal** (quién) | Usuario, grupo, service principal, managed identity |
| **Role definition** (qué) | Owner, Contributor, Reader, Virtual Machine Contributor… |
| **Scope** (dónde) | Management group › suscripción › resource group › recurso |

```bash
az role assignment create --assignee ana@tienda.com --role "Virtual Machine Contributor" \
  --scope /subscriptions/<id>/resourceGroups/rg-web
```

### Roles integrados

| Rol | Permisos |
|---|---|
| **Owner** | Todo, incluido asignar roles |
| **Contributor** | Gestionar todos los recursos, **sin** asignar roles |
| **Reader** | Ver todo, sin cambiar nada |
| **User Access Administrator** | Gestionar el acceso (asignar roles) |
| **Role Based Access Control Administrator** | Gestionar asignaciones de roles, sin otros permisos |
| Roles por servicio | Virtual Machine Contributor, Storage Blob Data Reader, Network Contributor… |

Una definición de rol lista **Actions** y **NotActions** (operaciones de gestión) y **DataActions** y **NotDataActions** (acceso a los datos, como leer blobs). Por eso, **Contributor** de una storage account puede gestionarla, pero para leer blobs con Entra ID hace falta un rol de datos como **Storage Blob Data Reader**.

Si ningún rol encaja, se crea un **rol personalizado** con sus `AssignableScopes`.

### Interpretar el acceso

- **Herencia**: lo asignado en un scope vale para todo lo que hay debajo.
- **Suma**: el acceso efectivo es la **unión** de todas las asignaciones (directas, por grupo y heredadas).
- **NotActions no es una denegación**: solo quita operaciones de ese rol; si otro rol las concede, se tienen.
- Las **deny assignments** sí bloquean, pero las crea Azure (por ejemplo, en aplicaciones gestionadas); no las asignas tú como un rol normal.

```bash
# Qué tiene Ana, incluyendo lo heredado de scopes superiores
az role assignment list --assignee ana@tienda.com --all --include-inherited --output table
```

En el portal, **Access control (IAM) › Check access** muestra el acceso efectivo de una identidad sobre un recurso.

### Roles de Azure frente a roles de Entra ID

- **Roles de Azure (RBAC)**: controlan los **recursos de Azure** (VMs, redes, storage).
- **Roles de Microsoft Entra** (Global Administrator, User Administrator…): controlan el **directorio** (usuarios, grupos, licencias).

Un Global Administrator no tiene acceso a los recursos de Azure por defecto, aunque puede **elevarse** a User Access Administrator en el root management group.

## Ejemplo

Ana es **Reader** en la suscripción (asignado a su grupo «Desarrollo») y **Virtual Machine Contributor** en `rg-web` (asignado a ella).

- En `rg-web` puede ver todo (Reader heredado) y gestionar VMs (VM Contributor).
- En `rg-datos` solo puede ver.
- No puede leer los blobs de `rg-web` con su identidad: ningún rol suyo tiene DataActions de blobs.

## Errores comunes

- **Dar Owner cuando basta Contributor**, o Contributor cuando basta un rol del servicio.
- **Asignar a personas** en vez de a grupos.
- **Pensar que NotActions deniega.** Solo resta del rol; otro rol puede concederlo.
- **Confundir roles de Entra con roles de Azure**: ser User Administrator no da acceso a ninguna VM.

## Lo que debes saber

**¿Qué tres piezas forman una asignación de rol?**
Security principal, role definition y scope.

**¿Cómo se calcula el acceso efectivo?**
Es la suma de todas las asignaciones (directas, por grupo y heredadas de scopes superiores).

**¿Por qué un Contributor de una storage account puede no leer sus blobs?**
Porque Contributor da permisos de gestión (Actions), no de datos (DataActions); hace falta un rol como Storage Blob Data Reader.

## Resumen

- Asignación = **principal + rol + scope**; se **hereda** y se **suma**.
- Roles: **Owner**, **Contributor**, **Reader**, **User Access Administrator** y roles por servicio; personalizados si hace falta.
- **Actions** (gestión) frente a **DataActions** (datos); NotActions no deniega.
- `az role assignment create/list`; **Check access** en el portal.
- Roles de **Azure** (recursos) frente a roles de **Entra** (directorio).
