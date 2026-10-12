---
title: Plantillas ARM y Bicep
minutes: 9
---

## Qué problema resuelve

Tu entorno de producción tiene una VNet, una storage account y una web. Necesitas un entorno de pruebas **idéntico**, y dentro de un mes otro. Hacerlo a mano garantiza diferencias. Con una **plantilla ARM** o un fichero **Bicep** describes el entorno una vez y lo despliegas tantas veces como quieras, siempre igual.

## Analogía

Una plantilla es el **plano de una casa**: con el mismo plano se construyen casas iguales en parcelas distintas (resource groups), cambiando solo detalles como el color de la fachada (parámetros).

## Concepto

### Estructura de una plantilla ARM

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "nombreCuenta": { "type": "string" },
    "sku": { "type": "string", "defaultValue": "Standard_LRS", "allowedValues": ["Standard_LRS", "Standard_ZRS"] }
  },
  "variables": {},
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2023-05-01",
      "name": "[parameters('nombreCuenta')]",
      "location": "[resourceGroup().location]",
      "sku": { "name": "[parameters('sku')]" },
      "kind": "StorageV2"
    }
  ],
  "outputs": {}
}
```

| Sección | Para qué |
|---|---|
| `$schema` y `contentVersion` | Versión del formato y de tu plantilla |
| `parameters` | Valores que se pasan al desplegar (con `defaultValue` y `allowedValues` opcionales) |
| `variables` | Valores calculados que se reutilizan |
| `resources` | Los recursos: `type`, `apiVersion`, `name`, `location` y sus propiedades |
| `outputs` | Valores que devuelve el despliegue |

Las expresiones van entre corchetes: `[parameters('sku')]`, `[resourceGroup().location]`. Si un recurso depende de otro, se indica con `dependsOn`.

### Bicep

El mismo recurso en Bicep:

```bicep
param nombreCuenta string
@allowed(['Standard_LRS', 'Standard_ZRS'])
param sku string = 'Standard_LRS'

resource cuenta 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: nombreCuenta
  location: resourceGroup().location
  sku: { name: sku }
  kind: 'StorageV2'
}
```

Más corto, sin corchetes ni comillas por todas partes, y las dependencias se deducen solas cuando un recurso usa otro.

### Desplegar

```bash
# Ver qué cambiaría, sin aplicar nada
az deployment group what-if -g rg-tienda --template-file main.bicep --parameters nombreCuenta=tiendafotos2026

# Desplegar (vale .json o .bicep)
az deployment group create -g rg-tienda --template-file main.bicep --parameters nombreCuenta=tiendafotos2026
```

Modos de despliegue (`--mode`):

- **Incremental** (por defecto): crea o actualiza lo que hay en la plantilla y **deja** el resto del resource group.
- **Complete**: además **borra** del resource group lo que no esté en la plantilla. Úsalo con cuidado.

### Exportar y convertir

```bash
az group export -n rg-tienda > plantilla.json      # exporta el grupo como plantilla ARM
az bicep decompile --file plantilla.json           # convierte ARM JSON a Bicep
az bicep build --file main.bicep                   # compila Bicep a ARM JSON
```

La plantilla exportada es un buen punto de partida, pero suele necesitar limpieza (valores fijos que conviene convertir en parámetros).

## Ejemplo

Un administrador recibe `main.bicep` con una storage account en `Standard_LRS`. Le piden que en producción sea `Standard_ZRS`:

1. No toca el fichero: el SKU es un **parámetro**.
2. Ejecuta `what-if` con `--parameters sku=Standard_ZRS` y ve que cambiaría un solo recurso.
3. Despliega con `az deployment group create`. Como el modo es **incremental**, el resto del grupo no se toca.

## Errores comunes

- **Desplegar en modo Complete por error**: borra lo que no está en la plantilla.
- **Fijar valores en la plantilla** (nombres, SKUs, regiones) en lugar de usar parámetros.
- **Olvidar `apiVersion`** o usar un `type` mal escrito: el despliegue falla en la validación.
- **No revisar con `what-if`** antes de desplegar en producción.

## Lo que debes saber

**¿Qué secciones tiene una plantilla ARM?**
`$schema`, `contentVersion`, `parameters`, `variables`, `resources` y `outputs` (además de `functions`, opcional).

**¿Qué diferencia hay entre los modos Incremental y Complete?**
Incremental deja los recursos que no están en la plantilla; Complete los borra.

**¿Cómo conviertes una plantilla ARM a Bicep?**
Con `az bicep decompile --file plantilla.json`.

## Resumen

- Plantilla ARM: JSON con **parameters**, **variables**, **resources** y **outputs**; expresiones entre `[ ]`.
- **Bicep**: misma capacidad y sintaxis concisa; compila a ARM.
- `az deployment group what-if` y `create`; modo **Incremental** (por defecto) o **Complete**.
- `az group export`, `az bicep decompile` y `az bicep build`.
