---
title: Costes en Azure y etiquetas
minutes: 7
---

## Qué problema resuelve

En la nube, cualquiera con permisos puede crear recursos en minutos… y la factura llega a final de mes. Sin control, aparecen VMs olvidadas, discos huérfanos y transferencias de datos inesperadas. Hay que **saber qué influye en el coste**, **estimarlo antes** de desplegar y **vigilarlo después**.

## Analogía

Es como la **factura de la luz**: depende de cuántos aparatos tienes, cuánto tiempo están encendidos, la tarifa de tu zona y si te dejas la calefacción puesta al irte de vacaciones. Las **etiquetas** son las pegatinas que pones en cada enchufe para saber qué habitación gasta más.

## Concepto

### Factores que influyen en el coste

| Factor | Ejemplo |
|---|---|
| **Tipo de recurso** | Una VM grande cuesta más que una pequeña; cada servicio tiene sus medidores. |
| **Consumo** | Pagas por uso; con **reservas** de 1 o 3 años obtienes descuento. |
| **Mantenimiento** | Recursos que nadie borra (discos, IPs públicas de VMs ya eliminadas). |
| **Región** | El mismo servicio puede costar distinto según la región. |
| **Tráfico de red** | La salida de datos de Azure (*egress*) y entre regiones se paga; la entrada suele ser gratuita. |
| **Tipo de suscripción** | Algunas incluyen créditos o cuotas gratuitas. |
| **Azure Marketplace** | Soluciones de terceros con su propio precio, además del de los recursos que usan. |

### Herramientas

- **Calculadora de precios** (*pricing calculator*): estima el coste **antes** de desplegar. Eliges servicios, región, tamaño y horas, y obtienes una estimación. No crea nada.
- **Calculadora TCO** (*total cost of ownership*): compara el coste de seguir on-premises (servidores, energía, personal…) con el de moverte a Azure.
- **Microsoft Cost Management**: ve **lo que ya gastas**:
  - **Cost analysis**: explora costes por servicio, resource group, etiqueta, región…
  - **Budgets**: un presupuesto con **alertas** al llegar a un porcentaje (por ejemplo, 80 %). Una alerta avisa, **no apaga** recursos por sí sola.
  - **Recomendaciones** de ahorro (vienen de Azure Advisor).

### Etiquetas (tags)

Una **tag** es un par **nombre-valor** (`entorno=produccion`, `centro-coste=marketing`) que añades a recursos, resource groups o suscripciones. Sirven para:

- **Costes**: agrupar la factura por proyecto, departamento o entorno.
- **Gestión**: localizar recursos de una carga de trabajo.
- **Operaciones**: indicar la criticidad o el SLA.
- **Seguridad y cumplimiento**: marcar la clasificación de los datos.
- **Automatización**: por ejemplo, apagar por la noche lo que tenga `apagado-nocturno=si`.

Las tags **no se heredan por defecto**: una tag en el resource group no aparece en sus recursos. Con **Azure Policy** puedes exigirlas o hacer que se hereden.

## Ejemplo

Antes de lanzar una tienda, el equipo estima con la **calculadora de precios** 2 VMs, una base de datos y 1 TB de salida de datos en West Europe. Una vez desplegado:

- Etiqueta todo con `proyecto=tienda` y `entorno=pro` o `entorno=dev`.
- Crea un **budget** mensual de 1000 € con alertas al 80 % y al 100 %.
- En **Cost analysis**, agrupando por la tag `entorno`, descubre que *dev* gasta casi como *pro*: hay VMs de pruebas encendidas los fines de semana.

## Errores comunes

- **Pensar que un budget detiene el gasto.** Solo avisa; para actuar hay que automatizarlo (por ejemplo, con un action group).
- **Olvidar el tráfico de salida** y la región al estimar.
- **Suponer que las tags del resource group se aplican a sus recursos.** No se heredan sin una política.
- **Confundir la calculadora de precios con la TCO.** Una estima el coste en Azure; la otra lo compara con on-premises.

## Lo que debes saber

**¿Qué herramienta usas para estimar el coste antes de desplegar?**
La calculadora de precios.

**¿Qué hace un budget en Cost Management?**
Fija un límite de gasto y envía alertas al alcanzar umbrales; no apaga recursos por sí mismo.

**¿Para qué sirven las tags?**
Para organizar recursos con pares nombre-valor: costes, gestión, operaciones, cumplimiento y automatización.

## Resumen

- El coste depende del **tipo de recurso**, el **consumo**, el **mantenimiento**, la **región**, el **tráfico de red**, la **suscripción** y el **Marketplace**.
- **Calculadora de precios** (antes de desplegar) y **TCO** (on-premises frente a Azure).
- **Cost Management**: análisis, **budgets** con alertas y recomendaciones.
- **Tags**: pares nombre-valor; no se heredan por defecto.
