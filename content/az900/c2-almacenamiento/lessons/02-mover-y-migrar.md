---
title: Mover datos y migrar a Azure
minutes: 5
---

## Qué problema resuelve

Tienes datos en tus servidores o en tu portátil y quieres llevarlos a Azure: a veces unos pocos ficheros, a veces terabytes, a veces servidores enteros. Copiar a mano no escala, y por internet hay volúmenes que tardarían semanas. Azure tiene herramientas para **mover ficheros** y para **migrar** cargas completas.

## Analogía

- **AzCopy**: un **camión de mudanzas** que manejas tú desde la terminal.
- **Storage Explorer**: el mismo camión con **cuadro de mandos gráfico**.
- **Azure File Sync**: un **buzón compartido** entre tu oficina y la nube que siempre tiene lo mismo.
- **Data Box**: cuando la mudanza es enorme, Microsoft te **envía un contenedor**, lo llenas y lo devuelves.

## Concepto

### Mover ficheros

| Herramienta | Qué es | Cuándo |
|---|---|---|
| **AzCopy** | Utilidad de línea de comandos para copiar blobs o ficheros hacia, desde o entre storage accounts. Puede **sincronizar** en un solo sentido. | Scripts y automatización. |
| **Azure Storage Explorer** | Aplicación gráfica (Windows, macOS y Linux) para gestionar storage accounts. Usa AzCopy por debajo. | Gestión visual del día a día. |
| **Azure File Sync** | Sincroniza un servidor de ficheros **Windows Server** on-premises con Azure Files. Con **cloud tiering**, lo poco usado se queda solo en Azure y en local se conserva lo reciente. | Oficinas que siguen necesitando un servidor de ficheros local. |

### Migrar a Azure

**Azure Migrate** es el **hub centralizado** para migrar: descubre lo que tienes on-premises, **evalúa** qué tal funcionaría en Azure (tamaño y coste estimados) y **migra** servidores, bases de datos, aplicaciones web y escritorios virtuales. Integra herramientas propias y de terceros.

**Azure Data Box** es un **dispositivo físico** que Microsoft te envía para transferir grandes volúmenes **sin internet**: copias los datos, lo devuelves y Microsoft los sube a tu storage account. Al final, el disco se borra de forma segura. Encaja cuando:

- La conexión es lenta, cara o no existe.
- Hay que hacer una **migración inicial** muy grande o una recuperación de desastres.
- También sirve en sentido contrario: **exportar** datos de Azure.

## Ejemplo

Un estudio de arquitectura:

1. Usa **Azure Migrate** para evaluar sus 40 servidores y saber qué tamaño de VM necesita cada uno.
2. Envía sus 60 TB de planos históricos en un **Azure Data Box**, porque su conexión tardaría semanas.
3. Instala **Azure File Sync** en el servidor de ficheros de la oficina: el equipo sigue usando la unidad de red de siempre, pero los proyectos antiguos solo ocupan espacio en Azure.
4. Un script nocturno con **AzCopy** copia los renders del día a Blob Storage.

## Errores comunes

- **Confundir Azure File Sync con AzCopy.** File Sync mantiene sincronizados un servidor Windows y Azure Files de forma continua; AzCopy copia cuando lo ejecutas.
- **Intentar subir decenas de terabytes por una conexión lenta** en lugar de usar Data Box.
- **Pensar que Azure Migrate solo migra VMs.** También evalúa y migra bases de datos, aplicaciones web y escritorios virtuales.

## Lo que debes saber

**¿Qué herramienta sincroniza un servidor de ficheros Windows con Azure Files?**
Azure File Sync.

**¿Cómo transfieres muchos terabytes si la red no da para ello?**
Con Azure Data Box, un dispositivo físico que se envía a Microsoft.

**¿Qué es Azure Migrate?**
El hub para descubrir, evaluar y migrar cargas on-premises a Azure.

## Resumen

- **AzCopy**: copia por línea de comandos (sincronización en un sentido).
- **Storage Explorer**: interfaz gráfica sobre AzCopy.
- **Azure File Sync**: Windows Server ↔ Azure Files, con cloud tiering.
- **Azure Migrate**: hub para descubrir, evaluar y migrar.
- **Data Box**: transferencia física de grandes volúmenes, sin internet.
