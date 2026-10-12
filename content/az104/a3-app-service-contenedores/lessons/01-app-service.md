---
title: App Service en la práctica
minutes: 9
---

## Qué problema resuelve

Quieres publicar una web o una API sin administrar servidores: sin parches del sistema operativo, sin balanceadores a mano y con despliegues sin cortes. App Service es el PaaS web de Azure, y administrarlo bien es elegir el plan correcto, escalarlo, desplegar con slots, poner un dominio con TLS y tener backups.

## Analogía

El **App Service plan** es el **local** que alquilas (tamaño y número de mesas); las **web apps** son los **negocios** que montas dentro y comparten ese local. Un **deployment slot** es la **trastienda**: preparas el escaparate nuevo detrás y, cuando está listo, lo intercambias con el de la calle en un segundo.

## Concepto

### App Service plan

El plan define la región, el sistema operativo y la potencia (el **pricing tier**). Todas las apps del plan comparten sus instancias.

```bash
az appservice plan create -n plan-web -g rg-web --sku S1 --is-linux
az webapp create -n tienda-web -g rg-web -p plan-web --runtime "NODE:20-lts" --https-only true
```

| Tier | Para qué |
|---|---|
| **Free / Shared** (F1, D1) | Pruebas; cómputo compartido con otros clientes |
| **Basic** (B1-B3) | Desarrollo y cargas pequeñas; escalado manual |
| **Standard** (S1-S3) | Producción: autoescalado y deployment slots |
| **Premium** (P1v3…) | Más rendimiento, más instancias y más slots |
| **Isolated** (I1v2…) | App Service Environment: red dedicada y aislada |

### Escalar

- **Scale up**: cambiar de tier (`az appservice plan update --sku P1V3`). Más CPU, memoria y funciones.
- **Scale out**: más instancias (`--number-of-workers 3`) o autoescalado por métricas u horario (Standard o superior).
- Se escala el **plan**, no la app: todas sus apps se benefician (y compiten por los recursos).

### Deployment slots

Disponibles en **Standard, Premium e Isolated**. Cada slot es una app con su propio nombre de host (`tienda-web-staging.azurewebsites.net`).

```bash
az webapp deployment slot create -n tienda-web -g rg-web --slot staging
az webapp deployment slot swap -n tienda-web -g rg-web --slot staging --target-slot production
```

- El **swap** calienta las instancias del slot antes de cambiar el tráfico: despliegue **sin cortes**, y si algo falla, otro swap lo deshace.
- Algunos ajustes viajan con el código y otros se quedan en el slot: marca como **deployment slot setting** los que no deben moverse (por ejemplo, la cadena de conexión de la base de datos de pruebas).

### Dominio personalizado y TLS

```bash
az webapp config hostname add --webapp-name tienda-web -g rg-web --hostname www.tienda.com
```

- En el DNS: un registro **CNAME** (o **A**) que apunta a la app y un registro **TXT** `asuid` para demostrar que el dominio es tuyo.
- El tier Free no admite dominios personalizados.
- Certificado: el **App Service managed certificate** es gratuito y se renueva solo; también puedes subir uno propio o traerlo de Key Vault.
- **HTTPS Only** redirige todo el HTTP a HTTPS.

### Backup

- Disponible desde **Basic**. Copias automáticas y copias manuales del contenido y la configuración de la app.
- Las copias personalizadas se guardan en una **storage account**.

### Redes

- **Access restrictions**: reglas de IP o de subred para el tráfico de **entrada**.
- **Private endpoint**: la app recibe una IP privada de tu VNet (entrada privada).
- **VNet integration**: la app sale hacia recursos de tu VNet (tráfico de **salida**).

## Ejemplo

La tienda online pasa a producción:

1. Plan **S1** Linux con 2 instancias y autoescalado hasta 5 por CPU.
2. Slot `staging`: el pipeline despliega ahí, se prueba y se hace **swap** a producción.
3. `www.tienda.com` con CNAME + TXT `asuid`, managed certificate y HTTPS Only.
4. Backup diario y VNet integration para llegar a la base de datos privada.

## Errores comunes

- **Buscar slots o autoescalado en Basic**: hacen falta Standard o superior.
- **Escalar la app** en lugar del plan: el escalado es del plan.
- **Olvidar el registro TXT `asuid`**: la validación del dominio falla.
- **Confundir VNet integration con private endpoint**: la primera es salida; el segundo, entrada.
- **No marcar como slot setting** la configuración de pruebas: el swap la lleva a producción.

## Lo que debes saber

**¿Qué tier mínimo necesitas para deployment slots y autoescalado?**
Standard.

**¿Qué diferencia hay entre scale up y scale out?**
Scale up cambia el tier del plan (más potencia por instancia); scale out añade instancias.

**¿Qué registros DNS necesitas para un dominio personalizado?**
Un CNAME (o un A) hacia la app y un TXT `asuid` de verificación.

## Resumen

- El **plan** define región, SO, tier e instancias; las apps lo comparten.
- Tiers: Free/Shared, Basic, **Standard** (slots y autoescalado), Premium, Isolated.
- **Scale up** = tier; **scale out** = instancias.
- **Slots** + **swap**: despliegues sin cortes y vuelta atrás rápida.
- Dominio: CNAME/A + TXT `asuid`; managed certificate gratuito; HTTPS Only.
- Backup desde Basic; access restrictions y private endpoint (entrada), VNet integration (salida).
