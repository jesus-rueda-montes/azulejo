---
title: VNets, peering, IPs públicas y rutas
minutes: 9
---

## Qué problema resuelve

Las VMs, las bases de datos privadas y los endpoints necesitan una red: con rangos que no choquen, subredes separadas por función, conexión entre redes de distintos equipos y, a veces, todo el tráfico obligado a pasar por un firewall. Diseñar mal las direcciones al principio obliga a rehacerlo todo después.

## Analogía

Una **VNet** es una **urbanización** con su rango de números de calle; las **subnets** son sus **manzanas**. El **peering** es un **puente directo** entre dos urbanizaciones, pero no te deja cruzar a una tercera. Una **UDR** es un **desvío obligatorio**: «todo el que salga, que pase por el control».

## Concepto

### VNets y subnets

```bash
az network vnet create -n vnet-hub -g rg-red --address-prefixes 10.0.0.0/16 \
  --subnet-name snet-app --subnet-prefixes 10.0.1.0/24
az network vnet subnet create -n snet-datos -g rg-red --vnet-name vnet-hub --address-prefixes 10.0.2.0/24
```

- Una VNet vive en **una región** y una suscripción; las subnets reparten su espacio de direcciones.
- Azure **reserva 5 IPs** en cada subnet (la primera, las tres siguientes y la última).
- Planifica rangos privados que **no se solapen** con otras VNets ni con la red de la oficina: si se solapan, no podrás conectarlas.
- Algunos servicios piden una subnet con **nombre propio**: `AzureBastionSubnet`, `GatewaySubnet`, `AzureFirewallSubnet`.

### Peering

```bash
az network vnet peering create -n hub-a-spoke1 -g rg-red --vnet-name vnet-hub \
  --remote-vnet vnet-spoke1 --allow-vnet-access
```

- Conecta dos VNets por la red troncal de Microsoft, en la misma región o en regiones distintas (**global peering**).
- Hay que crearlo en **los dos sentidos**.
- **No es transitivo**: si A↔B y B↔C, A no llega a C sin un peering propio o un equipo que enrute en B.
- **Gateway transit** (`--allow-gateway-transit` en el hub, `--use-remote-gateways` en el spoke): los spokes usan la VPN gateway del hub.

### IPs públicas

```bash
az network public-ip create -n pip-web -g rg-red --sku Standard --allocation-method Static --zone 1 2 3
```

- SKU **Standard**: siempre **estática**, compatible con zonas y **cerrada por defecto** (el tráfico de entrada necesita un NSG que lo permita).
- La SKU **Basic** de IP pública se retiró en septiembre de 2025.

### Rutas definidas por el usuario (UDR)

Azure ya enruta entre subnets, VNets conectadas e internet (**rutas del sistema**). Una **route table** asociada a una subnet las sobrescribe:

```bash
az network route-table create -n rt-app -g rg-red
az network route-table route create -n a-internet -g rg-red --route-table-name rt-app \
  --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.0.4
```

| Next hop | Uso |
|---|---|
| `VirtualAppliance` | Un firewall o NVA (indicas su IP) |
| `VirtualNetworkGateway` | La VPN gateway |
| `VnetLocal` | Dentro de la VNet |
| `Internet` | Salida a internet |
| `None` | Descartar el tráfico |

## Ejemplo

Topología **hub and spoke**:

1. `vnet-hub` (10.0.0.0/16) con el firewall en 10.0.0.4 y la VPN gateway.
2. `vnet-spoke1` (10.1.0.0/16) y `vnet-spoke2` (10.2.0.0/16), cada una con peering al hub en ambos sentidos y `--use-remote-gateways`.
3. En las subnets de los spokes, una UDR `0.0.0.0/0 → VirtualAppliance 10.0.0.4`: todo sale por el firewall.
4. El firewall enruta también entre spoke1 y spoke2, porque el peering no es transitivo.

## Errores comunes

- **Rangos solapados**: dos VNets con 10.0.0.0/16 no se pueden conectar.
- **Crear el peering en un solo sentido**: queda en estado *Initiated* y no hay tráfico.
- **Esperar que el peering sea transitivo**.
- **UDR hacia un appliance que no reenvía** (IP forwarding desactivado en su NIC): el tráfico se pierde.
- **Subnet demasiado pequeña**: recuerda las 5 IPs reservadas.

## Lo que debes saber

**¿Es transitivo el peering?**
No. Hace falta un peering directo o un dispositivo que enrute en el hub.

**¿Cuántas IPs reserva Azure en cada subnet?**
Cinco.

**¿Para qué sirve una UDR con next hop `VirtualAppliance`?**
Para forzar que el tráfico pase por un firewall o NVA.

## Resumen

- VNet por región; subnets dentro; 5 IPs reservadas; rangos sin solapes.
- **Peering** local o global, en los dos sentidos, **no transitivo**; gateway transit para compartir la VPN.
- IP pública **Standard**: estática, zonal y cerrada por defecto.
- **UDR** en route tables asociadas a subnets: VirtualAppliance, VirtualNetworkGateway, VnetLocal, Internet, None.
