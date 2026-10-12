---
title: Herramientas de gestión e infraestructura como código
minutes: 8
---

## Qué problema resuelve

Crear un recurso con clics está bien una vez. Pero si hay que crear el mismo entorno en desarrollo, pruebas y producción, o repetirlo cada semana, los clics son lentos y cada vez sale un poco distinto. Azure ofrece varias **herramientas** según la tarea, y la **infraestructura como código** para que el entorno se describa en un fichero y se despliegue siempre igual.

## Analogía

El **portal** es cocinar a ojo; la **CLI** es seguir una receta paso a paso; una **plantilla ARM o Bicep** es la **receta escrita** que cualquier cocinero ejecuta y siempre sale el mismo plato.

## Concepto

### Herramientas

| Herramienta | Qué es | Cuándo |
|---|---|---|
| **Azure portal** | Interfaz web para crear, configurar y ver recursos, con paneles personalizables. | Explorar, tareas puntuales, ver el estado. |
| **Azure Cloud Shell** | Terminal en el navegador, ya **autenticada**, con **Bash** o **PowerShell** y la CLI preinstalada. | Lanzar comandos sin instalar nada. |
| **Azure CLI** | Comandos `az` (por ejemplo, `az vm create`). Funciona en Windows, macOS y Linux. | Scripts y automatización, con sintaxis de tipo Bash. |
| **Azure PowerShell** | Cmdlets con forma *verbo-sustantivo* (`New-AzVM`). | Scripts para quien ya usa PowerShell. |

Todas pasan por **Azure Resource Manager**, así que dan el mismo resultado.

### Azure Arc

**Azure Arc** extiende la gestión de Azure a recursos **fuera de Azure**: servidores, clústeres de Kubernetes y bases de datos on-premises o en otras nubes aparecen en Azure y se gestionan con las mismas herramientas (Azure Policy, RBAC, tags, Azure Monitor…).

### Infraestructura como código (IaC)

**IaC** es describir la infraestructura en **ficheros de código** en lugar de crearla a mano:

- Se versiona en Git y se revisa como cualquier código.
- Se despliega igual en todos los entornos.
- Se puede repetir y recrear en minutos.

### Plantillas ARM y Bicep

Una **plantilla ARM** es un fichero **JSON declarativo**: describes **qué** quieres, no **cómo** crearlo, y Resource Manager se encarga del orden y las dependencias. Ventajas:

- **Declarativa** e **idempotente**: desplegar la misma plantilla dos veces deja el mismo resultado.
- **Orquestación**: ARM despliega los recursos en el orden correcto y en paralelo cuando puede.
- **Modular**: se pueden dividir en plantillas reutilizables.
- **Validación** antes de desplegar.

**Bicep** es un lenguaje con la **misma capacidad** que las plantillas ARM pero con una sintaxis **más concisa y legible**. Se compila a JSON de ARM.

```bicep
resource cuenta 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'tiendafotos2026'
  location: 'westeurope'
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}
```

## Ejemplo

Un equipo describe su entorno (VNet, App Service, Azure SQL) en un fichero **Bicep** guardado en Git. Para crear el entorno de pruebas ejecuta el despliegue con un parámetro `entorno=test`; para producción, con `entorno=pro`. Las dos quedan idénticas salvo en lo que cambia el parámetro. Para comprobar algo puntual, el administrador abre **Cloud Shell** desde el portal y lanza `az group list` sin instalar nada. Los servidores que siguen en la oficina se conectan con **Azure Arc** y reciben las mismas políticas que las VMs de Azure.

## Errores comunes

- **Pensar que la CLI y PowerShell hacen cosas distintas.** Ambas usan Resource Manager; cambia la sintaxis.
- **Creer que Bicep es un servicio distinto de ARM.** Bicep se compila a una plantilla ARM.
- **Confundir declarativo con imperativo.** En una plantilla describes el estado final; en un script describes los pasos.
- **Pensar que Azure Arc mueve los servidores a Azure.** Siguen donde están; solo se gestionan desde Azure.

## Lo que debes saber

**¿Qué es Azure Cloud Shell?**
Una terminal en el navegador, ya autenticada, con Bash o PowerShell y las herramientas de Azure instaladas.

**¿Qué ventaja tienen las plantillas ARM frente a un script?**
Son declarativas e idempotentes: describes el estado final y ARM se encarga del orden y las dependencias.

**¿Qué es Azure Arc?**
La forma de gestionar desde Azure servidores, Kubernetes y bases de datos que están fuera de Azure.

## Resumen

- **Portal** (web), **Cloud Shell** (terminal en el navegador), **CLI** (`az`) y **PowerShell** (`New-AzVM`), todas sobre ARM.
- **Azure Arc**: gestiona desde Azure recursos on-premises y de otras nubes.
- **IaC**: infraestructura en ficheros versionados y repetibles.
- **Plantillas ARM** (JSON declarativo) y **Bicep** (sintaxis concisa, compila a ARM).
