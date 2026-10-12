---
title: VPN Gateway, ExpressRoute y Azure DNS
minutes: 6
---

## Qué problema resuelve

Tu oficina tiene servidores que deben hablar con los de Azure, y tus teletrabajadores necesitan entrar a la red privada desde casa. Además, tus usuarios escriben `tienda.com`, no una IP. Necesitas **conectar** redes de forma segura y **resolver nombres**.

## Analogía

- **VPN Gateway**: un **túnel cifrado** bajo una carretera pública (internet). Va por la misma carretera que todos, pero nadie ve lo que pasa dentro.
- **ExpressRoute**: una **carretera privada** que solo usas tú, de tu oficina a Azure.
- **Azure DNS**: la **guía telefónica** que traduce nombres a números.

## Concepto

### Azure VPN Gateway

Un **VPN gateway** envía tráfico **cifrado por internet** entre una VNet y otra red. Tipos de conexión:

| Tipo | Conecta |
|---|---|
| **Site-to-site** | Tu red on-premises completa con la VNet |
| **Point-to-site** | Un equipo concreto (un teletrabajador) con la VNet |
| **Network-to-network** | Una VNet con otra VNet |

Hay VPN **basadas en políticas** y **basadas en rutas** (las más habituales y flexibles). Por defecto el gateway funciona en modo **activo/en espera**; también puede configurarse **activo/activo** para más disponibilidad.

### Azure ExpressRoute

**ExpressRoute** extiende tu red on-premises a Azure con una **conexión privada** a través de un **proveedor de conectividad**. El tráfico **no va por internet**, así que ofrece más fiabilidad, más velocidad, latencia más estable y más seguridad que una VPN.

- Da acceso a los servicios de Azure y también a **Microsoft 365**.
- **ExpressRoute Global Reach** conecta entre sí tus sedes on-premises a través de la red de Microsoft.
- Modelos de conexión: ubicación en un **CloudExchange**, **Ethernet punto a punto**, conexión **any-to-any** (IP VPN) o **ExpressRoute Direct** (conexión directa a la red de Microsoft).

Una VPN site-to-site puede servir de **respaldo** de ExpressRoute.

### Azure DNS

**Azure DNS** aloja tus **zonas DNS** con la infraestructura de Microsoft (red global de servidores de nombres, alta disponibilidad):

- Gestionas los registros con las mismas credenciales, RBAC y facturación que el resto de Azure.
- **Zonas privadas**: resolución de nombres dentro de tus VNets.
- **Alias records**: un registro que apunta a un recurso de Azure (por ejemplo, una IP pública) y se actualiza si cambia.
- **No sirve para comprar dominios**: el dominio lo compras en un registrador y delegas la zona en Azure DNS.

## Ejemplo

Una empresa con oficina en Madrid:

1. Conecta la oficina con la VNet por **VPN site-to-site** mientras contrata **ExpressRoute** con un operador.
2. Cuando ExpressRoute está listo, el tráfico pasa por él y la VPN queda como **respaldo**.
3. Los comerciales que viajan usan **point-to-site**.
4. El dominio `tienda.com`, comprado en un registrador, se delega en **Azure DNS**, que también tiene una zona privada `interno.tienda` para las VMs.

## Errores comunes

- **Decir que ExpressRoute va cifrado por internet.** No va por internet: es una conexión privada a través de un proveedor.
- **Confundir site-to-site con point-to-site.** Site = toda una red; point = un solo equipo.
- **Pensar que Azure DNS registra dominios.** Solo los aloja; el dominio se compra fuera.

## Lo que debes saber

**¿Qué diferencia hay entre VPN Gateway y ExpressRoute?**
La VPN cifra el tráfico por internet; ExpressRoute es una conexión privada que no pasa por internet, más fiable y con latencia más estable.

**¿Qué tipo de VPN usa un teletrabajador?**
Point-to-site.

**¿Puedes comprar un dominio con Azure DNS?**
No. Azure DNS aloja zonas; el dominio se registra en otro sitio.

## Resumen

- **VPN Gateway**: túnel cifrado por internet; site-to-site, point-to-site y network-to-network.
- **ExpressRoute**: conexión privada vía proveedor, sin internet; **Global Reach** une sedes.
- **Azure DNS**: aloja zonas públicas y privadas; no registra dominios.
