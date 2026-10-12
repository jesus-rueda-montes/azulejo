---
title: Crear y operar máquinas virtuales
minutes: 9
---

## Qué problema resuelve

Crear una VM es fácil; administrarla bien no tanto: elegir el tamaño, añadir discos, cifrarla, cambiarla de tamaño cuando se queda corta, apagarla sin seguir pagando y moverla cuando el proyecto cambia de dueño. Este es el día a día del administrador de Azure.

## Analogía

Una VM es un **coche de alquiler**: eliges el modelo (tamaño), puedes cambiarlo por otro mayor (resize), añadir un portaequipajes (disco de datos) y, si lo devuelves al garaje (*deallocate*), dejas de pagar; si solo apagas el motor en la calle (*stop*), sigues pagando la plaza.

## Concepto

### Crear una VM

```bash
az vm create -n vm-web-01 -g rg-web --image Ubuntu2204 --size Standard_B2s \
  --admin-username azureuser --generate-ssh-keys --zone 1 --public-ip-address ""
```

- `--image` acepta alias (`Ubuntu2204`, `Debian11`, `Win2019Datacenter`…) o un URN completo.
- `--size` elige la familia y el tamaño: **B** (burstable, cargas variables), **D** (uso general), **E** (memoria), **F** (cómputo), **L** (almacenamiento), **N** (GPU).
- `--public-ip-address ""` crea la VM **sin IP pública** (acceso por Bastion o VPN).
- `--encryption-at-host true` activa el **cifrado en el host**.

### Tamaños

```bash
az vm list-sizes --location westeurope --output table
az vm list-vm-resize-options -n vm-web-01 -g rg-web --output table
az vm resize -n vm-web-01 -g rg-web --size Standard_D4s_v5
```

Cambiar el tamaño **reinicia** la VM. Si el nuevo tamaño no está disponible en el clúster de hardware actual, primero hay que **desasignarla** (*deallocate*).

### Estados de energía

| Comando | Estado | ¿Se paga el cómputo? |
|---|---|---|
| `az vm stop` | **Stopped** (detenida, sigue asignada) | **Sí** |
| `az vm deallocate` | **Stopped (deallocated)** | **No** (los discos sí) |
| `az vm start` / `restart` | En ejecución | Sí |

### Discos

| Rol | Uso |
|---|---|
| **Disco del SO** | Sistema operativo y arranque. Persistente |
| **Discos de datos** | Aplicaciones y datos. El número máximo depende del tamaño de la VM |
| **Disco temporal** | No es un managed disk. Para paginación o ficheros temporales: **sus datos pueden perderse** en mantenimientos, al redistribuir o al detener la VM |

Tipos de managed disk: **Ultra Disk**, **Premium SSD v2**, **Premium SSD**, **Standard SSD** y **Standard HDD**.

```bash
az vm disk attach --vm-name vm-web-01 -g rg-web --name disco-datos --new --size-gb 128 --sku Premium_LRS
```

### Cifrado

- **Server-side encryption** (SSE): **siempre activo** en los discos del SO y de datos. No cifra el disco temporal ni las cachés.
- **Encryption at host**: cifra también el **disco temporal** y las **cachés**, y los datos viajan cifrados hacia el almacenamiento. Es la opción recomendada para VMs nuevas.
- **Azure Disk Encryption** (BitLocker/DM-Crypt): se **retira el 15 de septiembre de 2028**; hay que migrar a encryption at host.

### Mover una VM

- **A otro resource group o suscripción**: `az resource move` con la VM y sus recursos dependientes (discos, NIC, IP…). Se mantiene la región.
- **A otra región**: **Azure Resource Mover**, o replicar con **Azure Site Recovery**.

## Ejemplo

La VM `vm-informes` va lenta a fin de mes:

1. `az vm list-vm-resize-options` muestra que `Standard_E4s_v5` (más memoria) está disponible.
2. `az vm resize` la cambia de tamaño (se reinicia).
3. Se le añade un disco de datos Premium SSD de 256 GiB para los informes.
4. Fuera del cierre mensual se **desasigna** con `az vm deallocate` para no pagar el cómputo.

## Errores comunes

- **Usar `az vm stop` para ahorrar**: la VM sigue asignada y se sigue cobrando. Usa `deallocate`.
- **Guardar datos en el disco temporal**: se pueden perder.
- **Habilitar Azure Disk Encryption en VMs nuevas** en lugar de encryption at host.
- **Mover una VM sin sus recursos dependientes** (disco, NIC): el traslado falla.

## Lo que debes saber

**¿Qué diferencia hay entre `az vm stop` y `az vm deallocate`?**
Stop apaga el SO pero mantiene el hardware asignado (se sigue pagando el cómputo); deallocate lo libera y deja de cobrarse.

**¿Qué cifra encryption at host que SSE no cifra?**
El disco temporal y las cachés, y el flujo de datos hacia el almacenamiento.

**¿Qué pasa con los datos del disco temporal?**
Pueden perderse en mantenimientos, al redistribuir la VM o al detenerla.

## Resumen

- `az vm create` con `--image`, `--size`, credenciales, zona y red.
- `list-sizes`, `list-vm-resize-options` y `resize` (reinicia; a veces exige deallocate).
- **stop** (se paga) frente a **deallocate** (no se paga el cómputo).
- Discos: SO, datos y **temporal** (volátil); tipos Ultra, Premium SSD v2, Premium SSD, Standard SSD y Standard HDD.
- Cifrado: SSE siempre; **encryption at host** recomendado; ADE se retira en 2028.
- Mover: `az resource move` (misma región) o Resource Mover / Site Recovery (otra región).
