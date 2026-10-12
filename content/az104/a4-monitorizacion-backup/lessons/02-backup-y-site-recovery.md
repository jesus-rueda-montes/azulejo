---
title: Azure Backup y Site Recovery
minutes: 8
---

## Qué problema resuelve

Alguien borra la carpeta de facturas, un ransomware cifra el servidor o toda una región se queda sin servicio. Las copias de seguridad recuperan **datos**; la recuperación ante desastres levanta **el servicio entero** en otro sitio. Un administrador tiene que configurar las dos cosas y, sobre todo, **probar que funcionan**.

## Analogía

- **Backup**: las **fotocopias** de los documentos importantes, guardadas en una caja fuerte con fecha.
- **Site Recovery**: una **segunda oficina** equipada en otra ciudad, con todo sincronizado, a la que te mudas si la primera se inunda.

## Concepto

### Dos tipos de vault

| Vault | Protege, entre otros |
|---|---|
| **Recovery Services vault** | VMs de Azure, SQL Server y SAP HANA en VMs, Azure Files, servidores on-premises (agente MARS) |
| **Backup vault** | Azure Disks, Azure Blobs, Azure Database for PostgreSQL, AKS |

- Para hacer copia de una VM, el vault debe estar en la **misma región** que la VM.
- La **redundancia** del vault (LRS, ZRS, GRS) se elige **antes de la primera copia**. Con GRS puedes activar **Cross Region Restore**.

```bash
az backup vault create -n rsv-tienda -g rg-backup -l westeurope
```

### Políticas y copias de VMs

```bash
az backup protection enable-for-vm -v rsv-tienda -g rg-backup --vm vm-web-01 -p DefaultPolicy
az backup job list -v rsv-tienda -g rg-backup --status Failed
```

- Una **backup policy** define la **frecuencia** (diaria, semanal; la política **Enhanced** permite varias copias al día) y la **retención** (días, semanas, meses, años).
- La copia es de la VM entera (snapshot de sus discos), coherente con las aplicaciones cuando es posible.
- **Soft delete**: las copias borradas se conservan un tiempo antes de eliminarse definitivamente, como protección frente a borrados maliciosos.

### Restaurar

- **Crear una VM nueva** desde un punto de restauración.
- **Restaurar los discos** y crear o adjuntar la VM a tu manera.
- **Reemplazar** los discos de la VM existente.
- **Recuperar ficheros sueltos** montando el punto de restauración (file recovery).

### Azure Site Recovery (ASR)

- **Replica** VMs de forma continua a **otra región** (o desde on-premises a Azure).
- **Test failover**: levanta las réplicas en una red aislada para **probar** el plan sin afectar a producción.
- **Failover**: pasa el servicio a la región secundaria; después, **failback** al volver la normalidad.
- **Recovery plans**: ordenan el arranque (primero la base de datos, luego la web) y pueden ejecutar scripts.
- Dos conceptos: **RPO** (cuántos datos puedes perder) y **RTO** (cuánto tiempo puedes estar caído).

## Ejemplo

1. `rsv-tienda` en West Europe, con **GRS** y Cross Region Restore, elegido antes de la primera copia.
2. Política diaria a las 02:00, retención de 30 días, 12 semanas y 12 meses, aplicada a las VMs.
3. Un usuario borra un fichero: se recupera con **file recovery**, sin restaurar la VM.
4. Site Recovery replica la VM de la base de datos y la web a otra región, con un recovery plan; se hace un **test failover** cada trimestre.

## Errores comunes

- **Crear el vault en otra región** distinta de la de las VMs.
- **Querer cambiar la redundancia** del vault después de la primera copia.
- **No probar las restauraciones** ni hacer test failover: un backup no probado no es un backup.
- **Confundir backup con DR**: el backup recupera datos; Site Recovery recupera el servicio en otra región.

## Lo que debes saber

**¿Qué vault usas para hacer copia de VMs y Azure Files? ¿Y de blobs o discos?**
Recovery Services vault para VMs y Azure Files; Backup vault para blobs, discos, PostgreSQL y AKS.

**¿Qué diferencia hay entre RPO y RTO?**
RPO: la pérdida de datos máxima aceptable (en tiempo). RTO: el tiempo máximo hasta recuperar el servicio.

**¿Para qué sirve un test failover?**
Para probar la recuperación en una red aislada sin tocar producción.

## Resumen

- **Recovery Services vault** (VMs, SQL/SAP HANA en VM, Azure Files, MARS) y **Backup vault** (discos, blobs, PostgreSQL, AKS).
- Vault en la región de la VM; redundancia antes de la primera copia; GRS + Cross Region Restore.
- **Políticas**: frecuencia y retención. **Soft delete** protege las copias.
- Restaurar: VM nueva, discos, reemplazar o ficheros sueltos.
- **Site Recovery**: replicación a otra región, test failover, failover, failback y recovery plans; **RPO** y **RTO**.
