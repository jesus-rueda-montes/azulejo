---
title: Storage accounts, niveles y redundancia
minutes: 8
---

## Qué problema resuelve

Las aplicaciones guardan cosas muy distintas: fotos y vídeos, carpetas compartidas, mensajes entre procesos, discos de VMs. Y no todos los datos valen lo mismo: unos se leen cada segundo y otros se guardan años «por si acaso». **Azure Storage** ofrece un servicio para cada tipo de dato, con **niveles** para pagar menos por lo que apenas se usa y **redundancia** para no perder nada.

## Analogía

Un **trastero con estanterías**: lo que usas a diario, a mano (*hot*); la ropa de la otra temporada, más arriba (*cool*); los papeles de hace años, en cajas al fondo (*archive*), que tardas en sacar. Y si guardas copias en el trastero de un familiar en otra ciudad, un incendio no te deja sin nada (redundancia geográfica).

## Concepto

### Servicios de Azure Storage

| Servicio | Para qué |
|---|---|
| **Blob Storage** | Objetos no estructurados: imágenes, vídeos, copias de seguridad, logs |
| **Azure Files** | File shares gestionados, accesibles por **SMB** o **NFS** |
| **Queue Storage** | Mensajes entre componentes de una aplicación |
| **Table Storage** | Datos NoSQL de clave-atributo |
| **Disks** | Discos gestionados para VMs |

### Storage account

Blobs, files, queues y tables viven dentro de una **storage account**:

- Su nombre es **único en todo Azure**: de 3 a 24 caracteres, solo minúsculas y números.
- Ese nombre forma los endpoints: `https://<cuenta>.blob.core.windows.net`, `https://<cuenta>.file.core.windows.net`…
- Tipo recomendado para casi todo: **Standard general-purpose v2**. Para baja latencia hay cuentas **Premium** (block blobs, file shares, page blobs).
- La redundancia se configura **por cuenta**: todo lo que contiene la comparte.

### Niveles de acceso de blobs

| Nivel | Uso | Retención mínima recomendada |
|---|---|---|
| **Hot** | Datos de uso frecuente. Almacenar es lo más caro y acceder, lo más barato. | — |
| **Cool** | Acceso poco frecuente | 30 días |
| **Cold** | Acceso raro, pero inmediato | 90 días |
| **Archive** | Casi nunca se accede. **Offline**: rehidratarlo puede tardar **hasta 15 horas** | 180 días |

Hot, cool y cold están **online** (acceso en milisegundos). Si borras o mueves un blob antes de su mínimo, pagas una **penalización por borrado anticipado**. El nivel por defecto de una cuenta puede ser hot, cool o cold, **nunca archive**.

### Redundancia

| Opción | Dónde se copian los datos | Durabilidad anual |
|---|---|---|
| **LRS** (*locally redundant*) | Un solo centro de datos de la región | 11 nueves |
| **ZRS** (*zone-redundant*) | Tres o más availability zones de la región | 12 nueves |
| **GRS** (*geo-redundant*) | LRS en la región principal + copia asíncrona a la región secundaria (con LRS allí) | 16 nueves |
| **GZRS** (*geo-zone-redundant*) | ZRS en la principal + copia asíncrona a la secundaria | 16 nueves |

Con GRS y GZRS, la secundaria **no se puede leer** salvo que haya un failover. Las variantes **RA-GRS** y **RA-GZRS** (*read-access*) permiten **leer** siempre de la secundaria.

## Ejemplo

Una plataforma de vídeo:

- Los vídeos recién subidos están en **hot**; a los 30 días sin visitas, una regla los pasa a **cool**; las grabaciones originales que hay que guardar 7 años van a **archive**.
- La cuenta usa **RA-GZRS**: resiste la caída de una zona y de toda la región, y la web puede seguir **leyendo** vídeos de la región secundaria durante una caída.

## Errores comunes

- **Esperar leer un blob de archive al instante.** Antes hay que rehidratarlo a un nivel online, y puede tardar horas.
- **Mover datos a cool o archive y borrarlos a los pocos días.** Se paga la penalización por borrado anticipado.
- **Creer que GRS permite leer de la secundaria.** Solo RA-GRS y RA-GZRS dan lectura sin failover.
- **Usar mayúsculas o guiones en el nombre de la cuenta.** Solo minúsculas y números.

## Lo que debes saber

**¿Qué nivel de acceso es offline?**
Archive: hay que rehidratar el blob (hasta 15 horas) antes de leerlo.

**¿Qué diferencia hay entre ZRS y GRS?**
ZRS copia entre zonas de una región; GRS copia a otra región (con LRS en cada una).

**¿Qué opción permite leer de la región secundaria sin failover?**
RA-GRS o RA-GZRS.

## Resumen

- Servicios: **Blob**, **Files**, **Queue**, **Table** y **Disks**.
- **Storage account**: nombre único global (3-24, minúsculas y números); Standard general-purpose v2 por defecto.
- Niveles: **hot**, **cool** (30 d), **cold** (90 d) y **archive** (180 d, offline).
- Redundancia: **LRS**, **ZRS**, **GRS**, **GZRS**; con **RA-** se lee la secundaria.
