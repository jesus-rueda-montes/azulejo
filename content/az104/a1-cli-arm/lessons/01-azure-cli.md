---
title: Trabajar con la Azure CLI
minutes: 8
---

## Qué problema resuelve

Un administrador repite cada semana las mismas tareas: crear resource groups, revisar qué hay en una suscripción, cambiar etiquetas. Con el portal son muchos clics y no queda registro de lo que se hizo. La **Azure CLI** permite hacerlo con comandos que se pueden **repetir, guardar en scripts y revisar**.

## Analogía

El portal es el **mando a distancia** con botones; la CLI es **hablar directamente con la tele** con frases exactas. Al principio cuesta más, pero puedes grabar las frases y repetirlas.

## Concepto

### Estructura de un comando

```
az <grupo> [<subgrupo>] <comando> [--flags]
az group create --name rg-tienda --location westeurope
```

Muchos flags tienen forma corta: `--name`/`-n`, `--resource-group`/`-g`, `--location`/`-l`. En `az group`, el nombre del grupo se puede indicar con `--name`, `--resource-group`, `-n` o `-g`.

### Sesión y suscripciones

```bash
az login                                  # inicia sesión (abre el navegador)
az login --use-device-code                # sin navegador: código en otro dispositivo
az account list --output table            # suscripciones disponibles
az account set --subscription "Tienda-Pro"   # cambia la suscripción activa
az account show                           # cuál está activa
```

Todo lo que ejecutes después va contra la **suscripción activa**. Para un solo comando puedes usar el flag global `--subscription`.

### Resource groups y recursos

```bash
az group create -n rg-tienda -l westeurope --tags entorno=pro proyecto=tienda
az group list --tag entorno=pro --output table
az resource list --resource-group rg-tienda --output table
az group update -n rg-tienda --tags entorno=pro proyecto=tienda centro-coste=ventas
az group delete -n rg-pruebas --yes --no-wait
```

- `--tags` en `group update` **sustituye** todas las tags del grupo por las indicadas.
- `group delete` pide confirmación; `--yes` la omite y `--no-wait` no espera a que termine.

### Mover recursos

```bash
az resource move --destination-group rg-nuevo --ids <id-recurso-1> <id-recurso-2>
```

Durante el traslado, el grupo de origen y el de destino quedan **bloqueados** para escrituras y borrados, pero los recursos siguen funcionando. Con `--destination-subscription-id` se mueven a otra suscripción.

### Salida y consultas

Flags globales disponibles en todos los comandos:

| Flag | Para qué |
|---|---|
| `--output` / `-o` | `json` (por defecto), `jsonc`, `table`, `tsv`, `yaml`, `yamlc`, `none` |
| `--query` | Filtrar la salida con **JMESPath** |
| `--subscription` | Ejecutar contra otra suscripción |
| `--only-show-errors` | Ocultar avisos |
| `--debug` | Ver el detalle de las peticiones |

```bash
# Solo nombre y región de cada grupo, en tabla
az group list --query "[].{nombre:name, region:location}" --output table

# El ID de un grupo, sin comillas, para usarlo en un script
az group show -n rg-tienda --query id --output tsv
```

## Ejemplo

Script para preparar un entorno nuevo:

```bash
az account set --subscription "Tienda-Dev"
az group create -n rg-tienda-dev -l westeurope --tags entorno=dev proyecto=tienda
RG_ID=$(az group show -n rg-tienda-dev --query id -o tsv)
echo "Creado $RG_ID"
```

`-o tsv` devuelve el valor tal cual, sin comillas ni JSON, que es lo que necesita una variable de Bash.

## Errores comunes

- **Ejecutar comandos en la suscripción equivocada.** Comprueba antes con `az account show`.
- **Usar `group update --tags` para «añadir» una tag**: sustituye todas las existentes.
- **Copiar un valor con `-o json`** en un script: lleva comillas. Usa `-o tsv`.
- **Olvidar que `group delete` borra todo** el contenido del grupo.

## Lo que debes saber

**¿Cómo cambias la suscripción activa?**
`az account set --subscription <nombre-o-id>`.

**¿Para qué sirve `--query`?**
Para filtrar y dar forma a la salida con JMESPath, por ejemplo `--query "[].name"`.

**¿Qué ocurre al mover un recurso a otro resource group?**
Ambos grupos se bloquean para escrituras durante el traslado, pero el recurso sigue en servicio; su ID cambia porque incluye el nombre del grupo.

## Resumen

- `az <grupo> <comando> --flags`; formas cortas `-n`, `-g`, `-l`.
- Sesión: `az login`, `az account list/set/show`.
- Grupos: `az group create/list/show/update/delete`; recursos: `az resource list/move`.
- Flags globales: `--output`, `--query` (JMESPath), `--subscription`.
