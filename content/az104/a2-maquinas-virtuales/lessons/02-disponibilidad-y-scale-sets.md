---
title: Zonas, availability sets y scale sets
minutes: 8
---

## Qué problema resuelve

Una sola VM es un punto único de fallo: un mantenimiento, un fallo de hardware o la caída de un centro de datos la dejan fuera de servicio. Además, la carga cambia a lo largo del día. Necesitas **repartir** las VMs para que no caigan todas a la vez y **ajustar** su número a la demanda.

## Analogía

- **Availability set**: repartir a los camareros por distintas zonas del **mismo restaurante** para que, si se va la luz en la cocina, sigan sirviendo los de la terraza.
- **Availability zones**: tener **varios restaurantes** en la ciudad.
- **Scale set**: contratar camareros **extra los sábados** y despedirlos el lunes, automáticamente.

## Concepto

### Availability zones

```bash
az vm create -n vm-web-01 -g rg-web --image Ubuntu2204 --zone 1 --generate-ssh-keys
az vm create -n vm-web-02 -g rg-web --image Ubuntu2204 --zone 2 --generate-ssh-keys
```

- Cada VM se fija a una zona (**zonal**). Repartiendo VMs entre zonas, la aplicación resiste la caída de un centro de datos.
- Los recursos que las acompañan deben ser compatibles con zonas: IPs públicas y load balancers **Standard** (zone-redundant) y discos en la zona de la VM o ZRS.
- La zona se elige **al crear** la VM.

### Availability sets

```bash
az vm availability-set create -n as-web -g rg-web --platform-fault-domain-count 2 --platform-update-domain-count 5
az vm create -n vm-web-01 -g rg-web --image Ubuntu2204 --availability-set as-web --generate-ssh-keys
```

- **Fault domains** (hasta 3, según la región): grupos con alimentación y red comunes.
- **Update domains** (hasta 20): se reinician de uno en uno en el mantenimiento planificado.
- La VM se añade al availability set **al crearla**; no se puede añadir después.
- Una VM no puede estar a la vez en una zona concreta y en un availability set.
- Para más resiliencia, Microsoft recomienda zonas o **scale sets Flexible**.

### Virtual Machine Scale Sets

```bash
az vmss create -n vmss-web -g rg-web --image Ubuntu2204 --instance-count 2 \
  --orchestration-mode Flexible --zones 1 2 3 --admin-username azureuser --generate-ssh-keys
az vmss scale -n vmss-web -g rg-web --new-capacity 5
```

- **Modos de orquestación**:
  - **Flexible** (recomendado): VMs normales gestionadas en grupo; admite mezclar tamaños y repartirlas entre zonas y fault domains.
  - **Uniform**: instancias idénticas, gestionadas como un conjunto.
- **Autoescalado**: reglas por **métricas** (por ejemplo, CPU > 70 % durante 10 minutos → +2 instancias) o por **horario**, con un mínimo, un máximo y un valor por defecto de instancias. Incluye periodos de enfriamiento (*cooldown*) para no oscilar.
- **Política de actualización** (`--upgrade-policy-mode`): **Manual**, **Automatic** o **Rolling** (por lotes).
- Normalmente detrás de un **load balancer** o un **Application Gateway**.

## Ejemplo

Una web con picos de tráfico:

1. Scale set **Flexible** en las zonas 1, 2 y 3, detrás de un load balancer **Standard**.
2. Autoescalado: mínimo 2, máximo 10; +2 instancias si la CPU media supera el 70 %; −1 si baja del 30 %.
3. Política de actualización **Rolling**: las imágenes nuevas se aplican por lotes sin cortar el servicio.

## Errores comunes

- **Intentar meter una VM existente en un availability set**: solo se puede al crearla.
- **Usar una IP pública Basic** con VMs zonales: hace falta **Standard**.
- **Autoescalado sin máximo razonable**: un pico o un bucle puede disparar el coste.
- **Reglas de escalado sin enfriamiento** o con umbrales demasiado próximos, que hacen subir y bajar sin parar.

## Lo que debes saber

**¿Cuándo eliges la zona o el availability set de una VM?**
Al crearla; no se puede cambiar después sin volver a crearla.

**¿Qué modo de orquestación de scale sets recomienda Microsoft?**
Flexible.

**¿Qué tipos de reglas de autoescalado hay?**
Por métricas (CPU, memoria, colas…) y por horario, con un número mínimo, máximo y por defecto de instancias.

## Resumen

- **Zonas**: VMs zonales repartidas entre centros de datos; recursos Standard compatibles con zonas.
- **Availability sets**: fault domains (hasta 3) y update domains (hasta 20); se eligen al crear la VM.
- **Scale sets**: **Flexible** (recomendado) o **Uniform**; autoescalado por métricas u horario; actualización Manual, Automatic o Rolling.
- `az vm availability-set create`, `az vmss create` y `az vmss scale`.
