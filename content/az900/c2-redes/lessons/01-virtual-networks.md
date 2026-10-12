---
title: Virtual networks, subnets, peering y endpoints
minutes: 7
---

## Qué problema resuelve

Tus VMs, bases de datos y aplicaciones tienen que hablar **entre ellas**, con **internet** (solo lo imprescindible) y con tu **oficina**, sin que cualquiera pueda entrar. Las **virtual networks** te dan una red privada en Azure en la que decides qué está aislado y qué se expone.

## Analogía

Una VNet es la **red interna de un edificio de oficinas**: cada planta es una **subnet**, la recepción decide quién entra (las reglas de seguridad), y un **pasillo cubierto** (peering) une tu edificio con el de al lado sin salir a la calle.

## Concepto

### Azure Virtual Network (VNet)

Una **VNet** es una red privada y aislada en Azure, dentro de **una región** y **una suscripción**. Defines su **espacio de direcciones** (por ejemplo, `10.0.0.0/16`) y lo divides en **subnets** (`10.0.1.0/24`, `10.0.2.0/24`…). Permite:

- **Aislamiento y segmentación**: separar capas (web, datos) en subnets distintas.
- **Comunicación con internet**: los recursos con IP pública o detrás de un balanceador público pueden recibir conexiones. Para **salir** a internet, las VNets nuevas usan **subnets privadas** por defecto: la VM necesita un método de salida explícito (un NAT gateway, una IP pública o un balanceador con reglas de salida).
- **Comunicación entre recursos de Azure** dentro de la VNet.
- **Comunicación con on-premises**: con VPN Gateway o ExpressRoute.
- **Filtrado del tráfico**: con **network security groups (NSG)**, que tienen reglas de entrada y salida, o con appliances virtuales como un firewall.
- **Enrutamiento**: Azure enruta entre subnets automáticamente; puedes cambiarlo con route tables.

### Virtual network peering

El **peering** conecta dos VNets para que sus recursos se comuniquen con **IPs privadas**:

- El tráfico va por la **red troncal de Microsoft**, nunca por internet.
- Puede ser entre VNets de la **misma región** o de **regiones distintas** (*global peering*).
- **No es transitivo**: si A está conectada con B y B con C, A no llega a C sin su propio peering.

### Endpoints públicos y privados

Muchos servicios PaaS (Azure Storage, Azure SQL…) tienen por defecto un **endpoint público**: una dirección accesible desde internet (con autenticación, pero expuesta).

Un **private endpoint** le da al servicio una **IP privada dentro de tu VNet** (tecnología **Private Link**). El tráfico no sale a internet y puedes **desactivar el acceso público**.

## Ejemplo

```
VNet vnet-tienda (10.0.0.0/16) en West Europe
├── snet-web   10.0.1.0/24  → VMs web (NSG: solo 443 desde internet)
├── snet-datos 10.0.2.0/24  → private endpoint de Azure SQL (sin acceso público)
└── peering ↔ vnet-compartida (10.1.0.0/16), con el servidor de logs
```

La base de datos no tiene ningún endpoint público: solo se llega a ella desde dentro de la VNet.

## Errores comunes

- **Solapar espacios de direcciones.** Dos VNets con `10.0.0.0/16` no se pueden conectar por peering. Planifica las IPs desde el principio.
- **Suponer que el peering es transitivo.** Cada par de VNets que deba hablar necesita su peering (o un diseño hub-spoke con enrutamiento).
- **Creer que una VNet abarca varias regiones.** Una VNet está en una sola región; para unir regiones se usa global peering.
- **Dejar el endpoint público abierto** tras crear un private endpoint: hay que desactivar el acceso público.

## Lo que debes saber

**¿Qué es una VNet?**
Una red privada y aislada en Azure, en una región, dividida en subnets.

**¿El tráfico de un peering pasa por internet?**
No: va por la red troncal de Microsoft, con IPs privadas. También entre regiones.

**¿Qué diferencia hay entre un endpoint público y uno privado?**
El público es accesible desde internet; el privado da al servicio una IP privada dentro de tu VNet.

## Resumen

- **VNet**: red privada en una región; se divide en **subnets**.
- Aísla, conecta con internet, con otros recursos y con on-premises, y filtra tráfico con **NSG**.
- **Peering**: une VNets por la red troncal de Microsoft; también entre regiones; **no transitivo**.
- **Private endpoint**: IP privada para un servicio PaaS, sin exposición a internet.
