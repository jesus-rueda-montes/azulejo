---
title: Blobs, file shares y protección de datos
minutes: 9
---

## Qué problema resuelve

Los datos crecen sin parar y algunos dejan de usarse a las pocas semanas. Además, alguien borrará o sobrescribirá un fichero importante por error. Necesitas **mover automáticamente** los datos al nivel más barato, **recuperar** lo borrado y **mantener copias** en otra región.

## Analogía

La **lifecycle management** es un **archivero automático** que cada noche baja al sótano las carpetas que nadie ha tocado en un mes. El **soft delete** es la **papelera de reciclaje**, y el **versioning**, el **historial de versiones** de un documento compartido.

## Concepto

### Contenedores y blobs

```bash
az storage container create --account-name tiendadatos2026 --name facturas --auth-mode login
az storage blob upload --account-name tiendadatos2026 --container-name facturas \
  --name f-2026-001.pdf --file ./f-2026-001.pdf --tier Cool --auth-mode login
```

- Nivel de acceso público del contenedor: `off` (privado, lo normal), `blob` o `container`. Solo funciona si la cuenta permite el acceso público.
- El nivel (hot, cool, cold, archive) se puede fijar **por blob**; si no, se hereda el de la cuenta.

### Lifecycle management

Reglas en JSON que **mueven de nivel** o **borran** blobs según los días desde la última **modificación**, la **creación** o el último **acceso** (si activas el seguimiento de último acceso), con filtros por **tipo de blob** y **prefijo**:

```json
{
  "rules": [
    {
      "enabled": true,
      "name": "logs-a-frio",
      "type": "Lifecycle",
      "definition": {
        "filters": { "blobTypes": ["blockBlob"], "prefixMatch": ["logs/"] },
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 30 },
            "tierToArchive": { "daysAfterModificationGreaterThan": 90 },
            "delete": { "daysAfterModificationGreaterThan": 365 }
          }
        }
      }
    }
  ]
}
```

```bash
az storage account management-policy create --account-name tiendadatos2026 -g rg-datos --policy @politica.json
```

Una regla de lifecycle **no puede rehidratar** blobs de archive.

### Protección de datos de blobs

| Función | Protege frente a |
|---|---|
| **Soft delete de blobs** | Borrado o sobrescritura de blobs. Retención de **1 a 365 días** |
| **Soft delete de contenedores** | Borrado de un contenedor entero |
| **Versioning** | Sobrescrituras: cada cambio guarda la versión anterior |
| **Snapshots** | Copia de solo lectura de un blob en un momento dado, hecha a mano |
| **Object replication** | Copia **asíncrona** de block blobs a otra cuenta (otra región, suscripción o incluso tenant) |

```bash
az storage account blob-service-properties update --account-name tiendadatos2026 -g rg-datos \
  --enable-versioning true --enable-delete-retention true --delete-retention-days 14 \
  --enable-container-delete-retention true --container-delete-retention-days 7
```

- Ninguna de estas funciones protege frente al **borrado de la storage account**: para eso, un **lock** y Azure Backup.
- **Object replication** exige **versioning en origen y destino** y **change feed en el origen**. Solo replica block blobs, y el contenedor de destino pasa a ser de solo lectura.

### Azure Files

```bash
az storage share-rm create --storage-account tiendadatos2026 -g rg-datos --name contabilidad --quota 100 --access-tier Hot
```

- Niveles de los shares estándar: **Transaction optimized**, **Hot** y **Cool**; los shares **Premium** usan SSD.
- **Snapshots de share**: copia de solo lectura de todo el share, para restaurar ficheros sueltos.
- **Soft delete de shares**: recupera un share borrado durante el periodo de retención.

### Herramientas

- **Azure Storage Explorer**: aplicación gráfica para navegar, subir, descargar y gestionar SAS y permisos.
- **AzCopy**: CLI para copias masivas (`azcopy copy`, `azcopy sync`), también de cuenta a cuenta.

## Ejemplo

La cuenta de logs aplica una regla de lifecycle: a cool a los 30 días, a archive a los 90 y borrado al año. Las facturas tienen **versioning** y **soft delete** de 14 días. Un error en un script sobrescribe 200 facturas: el equipo recupera la versión anterior de cada una. Para la oficina de México, **object replication** copia las facturas nuevas a una cuenta en Mexico Central.

## Errores comunes

- **Esperar que soft delete recupere un contenedor borrado**: hace falta el soft delete de contenedores.
- **Activar object replication sin versioning en el destino** o sin change feed en el origen.
- **Borrar con lifecycle datos recién movidos a cool o archive** y pagar la penalización por borrado anticipado.
- **Contar con soft delete si se borra la cuenta**: no la protege.

## Lo que debes saber

**¿Qué puede hacer una regla de lifecycle management?**
Mover blobs de nivel (cool, cold, archive) o borrarlos según los días desde la modificación, la creación o el último acceso, filtrando por prefijo y tipo de blob.

**¿Qué requisitos tiene object replication?**
Versioning en las dos cuentas y change feed en la de origen; solo block blobs.

**¿Qué rango de retención admite el soft delete de blobs?**
De 1 a 365 días.

## Resumen

- Contenedores privados por defecto; niveles por blob.
- **Lifecycle management**: reglas JSON para cambiar de nivel o borrar.
- **Soft delete** (blobs y contenedores, 1-365 días), **versioning**, **snapshots** y **object replication**.
- **Azure Files**: shares con cuota y nivel, snapshots y soft delete.
- **Storage Explorer** (gráfico) y **AzCopy** (CLI).
