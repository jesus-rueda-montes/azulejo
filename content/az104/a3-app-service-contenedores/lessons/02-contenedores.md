---
title: ACR, Container Instances y Container Apps
minutes: 8
---

## Qué problema resuelve

Tienes la aplicación empaquetada en una imagen de contenedor. Necesitas un sitio privado donde guardar las imágenes y una forma de ejecutarlas sin montar un clúster: a veces un contenedor suelto que corre una tarea, a veces una API que escala sola con el tráfico.

## Analogía

- **Azure Container Registry**: el **almacén** de la fábrica, donde se guardan las cajas (imágenes) etiquetadas.
- **Container Instances**: un **taxi**: lo pides, te lleva y lo pagas por el tiempo de uso.
- **Container Apps**: una **flota de autobuses** con horario automático: más vehículos en hora punta y ninguno de madrugada.

## Concepto

### Azure Container Registry (ACR)

```bash
az acr create -n acrtienda -g rg-web --sku Standard
az acr build -r acrtienda -t tienda/api:v1 .
az acr login -n acrtienda
```

- SKUs: **Basic**, **Standard** y **Premium**. Premium añade, entre otras cosas, **geo-replicación** y **private endpoints**.
- `az acr build` construye la imagen **en Azure** (ACR Tasks) y la sube al registro: no necesitas Docker en tu equipo.
- El **admin user** está desactivado por defecto; para que otros servicios descarguen imágenes, mejor una **managed identity** con el rol **AcrPull**.

### Azure Container Instances (ACI)

```bash
az container create -n ci-informe -g rg-web --image acrtienda.azurecr.io/tienda/informe:v1 \
  --cpu 1 --memory 1.5 --restart-policy OnFailure --os-type Linux
az container logs -n ci-informe -g rg-web
```

- Ejecuta contenedores **sin servidores ni orquestador**; se paga por CPU y memoria por segundo.
- La unidad es el **container group**: uno o varios contenedores que comparten red, almacenamiento y ciclo de vida.
- **Restart policy**: `Always` (servicios), `OnFailure` o `Never` (tareas que terminan).
- Puede tener IP pública con `--dns-name-label` o desplegarse en una VNet.
- No escala solo: para eso, Container Apps.

### Azure Container Apps

```bash
az containerapp env create -n env-tienda -g rg-web -l westeurope
az containerapp create -n api-tienda -g rg-web --environment env-tienda \
  --image acrtienda.azurecr.io/tienda/api:v1 --target-port 8080 --ingress external \
  --min-replicas 0 --max-replicas 10
```

- Las apps viven en un **environment**, que comparte red y logs.
- **Ingress** `external` (desde internet) o `internal` (solo dentro del environment / VNet).
- **Escalado** por peticiones HTTP, CPU, colas… (basado en KEDA), entre `--min-replicas` y `--max-replicas`. Con mínimo **0** escala a cero y no se paga cómputo en reposo.
- Cada cambio de la plantilla (por ejemplo, una imagen nueva con `az containerapp update`) crea una **revision**.

### ¿Cuál elijo?

| Necesidad | Servicio |
|---|---|
| Una web o API clásica con slots, dominios y backup | App Service |
| Una tarea puntual o un contenedor simple | Container Instances |
| Microservicios o APIs que escalan (incluso a cero) | Container Apps |

## Ejemplo

La tienda:

1. `az acr build` construye `tienda/api:v1` en `acrtienda`.
2. La API va en **Container Apps** con ingress external, de 0 a 10 réplicas.
3. El informe nocturno corre en **ACI** con `--restart-policy Never`.
4. Ambos descargan de ACR con una managed identity con **AcrPull**.

## Errores comunes

- **Activar el admin user** de ACR para producción en lugar de usar identidades y RBAC.
- **Usar `Always` en una tarea** de ACI que termina: se relanza en bucle.
- **Esperar autoescalado en ACI**: no lo tiene.
- **`--ingress internal`** y pretender llegar desde internet.

## Lo que debes saber

**¿Qué SKU de ACR necesitas para geo-replicación?**
Premium.

**¿Qué es un container group en ACI?**
Uno o varios contenedores que se despliegan juntos y comparten red, almacenamiento y ciclo de vida.

**¿Cómo consigues que una Container App no cueste nada sin tráfico?**
Con `--min-replicas 0`: escala a cero.

## Resumen

- **ACR**: registro privado (Basic, Standard, Premium); `az acr build` construye en Azure; mejor identidades con AcrPull que admin user.
- **ACI**: contenedores sueltos sin orquestador, por segundos; container groups y restart policy.
- **Container Apps**: environment, ingress, escalado KEDA (también a cero) y revisions.
