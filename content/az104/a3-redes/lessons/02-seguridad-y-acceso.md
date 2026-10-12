---
title: NSG, Bastion, endpoints, DNS y balanceo
minutes: 10
---

## Qué problema resuelve

Con la red montada falta lo importante: decidir qué tráfico entra y sale, administrar las VMs sin abrir RDP o SSH a internet, llegar a los servicios PaaS por IP privada, resolver nombres y repartir la carga. Y cuando algo no conecta, averiguar por qué.

## Analogía

- **NSG**: el **portero** con una lista de reglas numeradas; aplica la primera que encaja.
- **Bastion**: la **recepción** del edificio: entras por ella y te acompañan al despacho; no hay puerta trasera.
- **Private endpoint**: un **buzón privado** del servicio dentro de tu casa.
- **Network Watcher**: el **técnico** que traza el recorrido de un paquete.

## Concepto

### Network security groups (NSG)

```bash
az network nsg create -n nsg-app -g rg-red
az network nsg rule create -n permitir-https -g rg-red --nsg-name nsg-app --priority 100 \
  --direction Inbound --access Allow --protocol Tcp --destination-port-ranges 443
```

- Reglas con **prioridad** de 100 a 4096: se evalúan de **menor a mayor número** y se aplica la primera que coincide.
- **Reglas por defecto** (prioridades 65000 y superiores): permiten el tráfico dentro de la VNet y desde el Azure Load Balancer y deniegan el resto de la entrada.
- Se asocian a una **subnet**, a una **NIC** o a ambas; si hay dos NSG, el tráfico debe pasar los dos.
- **Application security groups** (ASG): agrupan NICs por función (`asg-web`, `asg-datos`) para usarlas como origen o destino en las reglas, sin IPs.
- Para ver las reglas que se aplican de verdad a una NIC: `az network nic list-effective-nsg`.

### Azure Bastion

- RDP y SSH desde el portal o la CLI **sin IP pública en la VM**.
- Requisitos: subnet llamada **AzureBastionSubnet** de tamaño **/26 o mayor** y una IP pública **Standard estática**.

```bash
az network bastion create -n bas-hub -g rg-red --vnet-name vnet-hub --public-ip-address pip-bastion --sku Standard
```

### Service endpoints y private endpoints

| | Service endpoint | Private endpoint |
|---|---|---|
| Qué hace | Extiende la identidad de la subnet al servicio | Pone una **IP privada** del servicio en tu subnet |
| IP del servicio | Sigue siendo pública | Privada |
| Acceso desde on-premises | No | Sí (por VPN o ExpressRoute) |
| Coste | Gratis | Por hora y por GB |

```bash
az network private-endpoint create -n pe-stdatos -g rg-red --vnet-name vnet-hub --subnet snet-datos \
  --private-connection-resource-id <id-storage-account> --group-id blob --connection-name con-stdatos
```

Con un private endpoint, el nombre del servicio debe resolver a la IP privada: se usa una **private DNS zone** (por ejemplo, `privatelink.blob.core.windows.net`) vinculada a la VNet.

### Azure DNS

```bash
az network dns zone create -n tienda.com -g rg-red
az network dns record-set a add-record -g rg-red -z tienda.com -n www -a 20.50.1.10
```

- **Zonas públicas**: tu dominio en internet (luego delegas en los name servers de Azure en tu registrador).
- **Private DNS zones**: nombres solo dentro de las VNets vinculadas.

### Balanceo de carga

- **Azure Load Balancer** (capa 4, TCP/UDP): frontend IP, **backend pool**, **health probe** y reglas. Usa la SKU **Standard**.
- **Application Gateway** (capa 7, HTTP/HTTPS): enrutado por ruta o host, terminación TLS y **WAF**.

```bash
az network lb create -n lb-web -g rg-red --sku Standard --public-ip-address pip-web \
  --frontend-ip-name fe-web --backend-pool-name bp-web
```

### Network Watcher

- **IP flow verify** (`az network watcher test-ip-flow`): ¿qué regla de NSG permite o deniega este paquete?
- **Next hop** (`az network watcher show-next-hop`): ¿por dónde sale el tráfico? Detecta UDRs mal puestas.
- **Connection troubleshoot** y **flow logs** para registrar el tráfico.

## Ejemplo

Una VM web no responde por HTTPS:

1. `test-ip-flow` con dirección Inbound, TCP, puerto 443: lo deniega `DenyAllInBound`.
2. Se añade la regla `permitir-https` con prioridad 100 al NSG de la subnet.
3. Sigue sin responder: `list-effective-nsg` muestra otro NSG en la **NIC** que también deniega. Se corrige.
4. La administración se hace por **Bastion**; la VM no tiene IP pública.

## Errores comunes

- **Prioridad equivocada**: una regla Deny con número menor gana a tu Allow.
- **Olvidar el NSG de la NIC** cuando ya revisaste el de la subnet.
- **Bastion en una subnet con otro nombre** o menor que /26.
- **Private endpoint sin private DNS zone**: el nombre sigue resolviendo a la IP pública.
- **Usar Load Balancer** cuando necesitas enrutar por URL o un WAF: eso es Application Gateway.

## Lo que debes saber

**¿En qué orden se evalúan las reglas de un NSG?**
Por prioridad, del número más bajo al más alto; se aplica la primera que coincide.

**¿Qué diferencia hay entre service endpoint y private endpoint?**
El service endpoint mantiene la IP pública del servicio y restringe por subnet; el private endpoint le da una IP privada en tu VNet, accesible también desde on-premises.

**¿Qué herramienta te dice qué regla bloquea un paquete?**
IP flow verify de Network Watcher.

## Resumen

- **NSG**: prioridades 100-4096 (menor gana), reglas por defecto, en subnet y/o NIC; **ASG** para agrupar NICs.
- **Bastion**: `AzureBastionSubnet` /26 o mayor + IP pública Standard; VMs sin IP pública.
- **Service endpoint** (IP pública, gratis) frente a **private endpoint** (IP privada + private DNS zone).
- **Azure DNS**: zonas públicas y privadas.
- **Load Balancer** (capa 4) y **Application Gateway** (capa 7, WAF).
- **Network Watcher**: IP flow verify, next hop, connection troubleshoot, flow logs.
