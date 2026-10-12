---
title: Storage accounts y control de acceso
minutes: 9
---

## Qué problema resuelve

Una storage account mal configurada es una de las causas más típicas de fugas de datos: claves compartidas por correo, contenedores públicos, acceso desde cualquier IP de internet. Como administrador tienes que **crear** la cuenta con la redundancia y el cifrado adecuados y **cerrar** el acceso: quién, desde dónde y durante cuánto tiempo.

## Analogía

- La **clave de acceso** de la cuenta es la **llave maestra** del edificio: abre todo.
- Un **SAS** es una **tarjeta de invitado** que abre una sola puerta, unas horas.
- El **firewall** es el **portero** que solo deja pasar a quien viene de ciertas direcciones.

## Concepto

### Crear la cuenta

```bash
az storage account create -n tiendadatos2026 -g rg-datos -l westeurope \
  --sku Standard_ZRS --kind StorageV2 --access-tier Hot \
  --min-tls-version TLS1_2 --allow-blob-public-access false
```

- **`--sku`** combina rendimiento y redundancia: `Standard_LRS`, `Standard_ZRS`, `Standard_GRS`, `Standard_RAGRS`, `Standard_GZRS`, `Standard_RAGZRS`, `Premium_LRS`, `Premium_ZRS`…
- La redundancia se puede **cambiar** después (con algunas limitaciones, por ejemplo si hay blobs en archive).
- **Cifrado**: todos los datos se cifran siempre en reposo (*Storage Service Encryption*). Por defecto con **claves gestionadas por Microsoft**; opcionalmente con **claves gestionadas por el cliente** guardadas en **Azure Key Vault**. Se puede añadir **cifrado de infraestructura** (doble cifrado).

### Formas de autorizar el acceso a los datos

| Método | Cómo funciona | Recomendación |
|---|---|---|
| **Microsoft Entra ID + RBAC** | Roles de datos: Storage Blob Data Reader/Contributor/Owner… | La opción preferida: sin secretos |
| **Claves de acceso** | Dos claves por cuenta con acceso total | Rotarlas; se puede desactivar el acceso con clave (*Shared Key*) |
| **SAS** | Token con permisos, recursos y caducidad | Acceso limitado y temporal |

Hay **dos claves** para poder **rotarlas sin cortes**: las aplicaciones pasan a la clave 2, regeneras la 1, y al revés.

### Shared access signatures (SAS)

| Tipo | Firmado con | Alcance |
|---|---|---|
| **User delegation SAS** | Credenciales de **Entra ID** | Blobs, colas, tablas o Files. **Recomendado** |
| **Service SAS** | Clave de la cuenta | Un servicio |
| **Account SAS** | Clave de la cuenta | Uno o varios servicios, incluidas operaciones de servicio |

Una **stored access policy** se define en un contenedor (o share, cola o tabla) y fija inicio, caducidad y permisos para los **service SAS** que la referencian. Ventaja: **revocar** esos SAS cambiando o borrando la política, **sin regenerar las claves**. Máximo **cinco** por contenedor. Los user delegation SAS y los account SAS no admiten stored access policies.

```bash
az storage blob generate-sas --account-name tiendadatos2026 --container-name facturas \
  --name f-2026-001.pdf --permissions r --expiry 2026-12-31T23:59Z \
  --auth-mode login --as-user --full-uri
```

### Red: firewall y endpoints

- **`--default-action Deny`**: bloquea todo salvo lo permitido.
- **Reglas de red**: rangos de **IP** públicas o **subnets** de VNets (con el *service endpoint* `Microsoft.Storage` en esa subnet).
- **Private endpoint**: IP privada en tu VNet; puedes desactivar el acceso público por completo.
- Excepción para **servicios de confianza de Microsoft** (por ejemplo, Azure Backup).

```bash
az storage account update -n tiendadatos2026 -g rg-datos --default-action Deny
az storage account network-rule add --account-name tiendadatos2026 -g rg-datos --ip-address 203.0.113.0/24
```

### Acceso a Azure Files por identidad

Los file shares por SMB pueden autenticar con identidades de **AD DS on-premises**, **Microsoft Entra Domain Services** o **Microsoft Entra Kerberos** (para identidades híbridas). Los permisos se dan en dos niveles:

1. **Share**: roles de Azure como **Storage File Data SMB Share Reader**, **Contributor** o **Elevated Contributor**.
2. **Directorios y ficheros**: permisos **NTFS** (ACL de Windows).

## Ejemplo

La cuenta `tiendadatos2026` guarda facturas:

1. Se crea con `Standard_ZRS`, TLS 1.2 y sin acceso público a blobs.
2. Las aplicaciones usan su **managed identity** con **Storage Blob Data Contributor**: no hay claves en el código.
3. Para que un cliente descargue su factura se genera un **user delegation SAS** de solo lectura, válido 24 horas.
4. El firewall está en **Deny**, con una regla para la subnet de la aplicación y un private endpoint para la oficina conectada por VPN.

## Errores comunes

- **Compartir la clave de la cuenta** en lugar de un SAS: da acceso total.
- **SAS con caducidad muy larga** sin stored access policy: no hay forma de revocarlo salvo regenerar la clave.
- **Activar el firewall sin incluir la subnet o IP de la aplicación**: deja de funcionar.
- **Dar solo el rol de share en Azure Files** y olvidar los permisos NTFS (o al revés).

## Lo que debes saber

**¿Qué tipo de SAS recomienda Microsoft y por qué?**
El user delegation SAS: se firma con credenciales de Entra ID, no con la clave de la cuenta.

**¿Para qué sirve una stored access policy?**
Para controlar y revocar los service SAS asociados sin regenerar las claves (máximo cinco por contenedor).

**¿Por qué hay dos claves de acceso?**
Para rotarlas sin cortar el servicio.

## Resumen

- `az storage account create` con `--sku` (redundancia), `--kind`, `--access-tier`, TLS y acceso público.
- Cifrado siempre activo: claves de Microsoft o del cliente (Key Vault).
- Acceso: **Entra ID + roles de datos** (preferido), **claves** (dos, rotables) y **SAS** (user delegation, service, account).
- **Stored access policy**: revoca service SAS; cinco por contenedor.
- Firewall con `--default-action Deny`, reglas de IP o subnet y private endpoints.
- Azure Files: identidad (AD DS, Entra Domain Services, Entra Kerberos) + rol de share + NTFS.
