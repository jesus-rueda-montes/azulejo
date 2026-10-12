---
title: Modelos de nube y de servicio
minutes: 8
---

## Qué problema resuelve

No todas las empresas pueden (ni quieren) llevarlo todo a la nube pública, y no todas quieren gestionar lo mismo: unas necesitan controlar el sistema operativo y otras solo quieren desplegar su código. Los **modelos de nube** dicen **dónde** están los recursos y los **modelos de servicio** dicen **quién gestiona qué**.

## Analogía

Piensa en comer pizza:

- **On-premises**: la haces en casa con tu horno y tus ingredientes. Todo es cosa tuya.
- **IaaS**: alquilas una cocina equipada. Tú cocinas y limpias.
- **PaaS**: pides la pizza a domicilio. Tú pones la mesa y las bebidas.
- **SaaS**: cenas en la pizzería. Solo eliges del menú.

## Concepto

### Modelos de despliegue

| Modelo | Qué es | Cuándo encaja |
|---|---|---|
| **Pública** | Recursos de un proveedor (Azure) compartidos entre clientes y accesibles por internet. | Sin inversión inicial; escalar rápido. |
| **Privada** | Nube usada por **una sola organización**, en su centro de datos o en el de un tercero. | Control total o requisitos normativos estrictos. Requiere CapEx. |
| **Híbrida** | Combina pública y privada, conectadas entre sí. | Migraciones graduales, datos que deben quedarse en casa, picos que se llevan a la pública. |

En un entorno **multicloud** se usan varios proveedores públicos a la vez. **Azure Arc** permite gestionar desde Azure servidores, Kubernetes y bases de datos que están fuera de Azure (on-premises u otras nubes).

### Modelos de servicio

| | **IaaS** | **PaaS** | **SaaS** |
|---|---|---|---|
| Te dan | Infraestructura: VMs, red, discos | Plataforma lista para desplegar código | Aplicación terminada |
| Gestionas tú | SO, parches, middleware, apps y datos | Tu aplicación y tus datos | Tus datos, usuarios y configuración |
| Ejemplos en Azure | Azure Virtual Machines | Azure App Service, Azure SQL Database | Microsoft 365 |
| Caso típico | *Lift-and-shift* de servidores, control total del SO | Desarrollar sin gestionar servidores | Correo, ofimática, CRM |

**Serverless** es un modelo (dentro de PaaS) en el que **no gestionas servidores en absoluto**: el código se ejecuta en respuesta a eventos y pagas por ejecución. Ejemplo: **Azure Functions**.

### Modelo de responsabilidad compartida

La seguridad se reparte entre el proveedor y el cliente. Cuanto más «arriba» vas (IaaS → PaaS → SaaS), **más responsabilidad asume Microsoft**.

- **Siempre del cliente**: la **información y los datos**, los **dispositivos** (móviles y PCs) y las **cuentas e identidades**.
- **Siempre de Microsoft**: el **centro de datos físico**, la **red física** y los **hosts físicos**.
- **Varía según el modelo**: sistema operativo, controles de red, aplicaciones, identidad e infraestructura de directorio.

## Ejemplo

Una empresa migra tres cosas:

1. Un ERP antiguo que necesita una versión concreta de Windows Server → **IaaS** (VM). Ella aplica los parches del SO.
2. Su web en Node.js → **PaaS** (App Service). Microsoft parchea el SO; ella despliega el código.
3. El correo → **SaaS** (Microsoft 365). Solo gestiona usuarios y datos.

Los servidores con datos de pacientes, por normativa, se quedan en su centro de datos y se conectan a Azure: es una **nube híbrida**.

## Errores comunes

- **Pensar que en PaaS o SaaS los datos son responsabilidad de Microsoft.** Los datos, los dispositivos y las identidades son **siempre** tuyos.
- **Confundir nube privada con «on-premises».** Una nube privada puede estar alojada por un tercero; lo que la define es que la usa una sola organización.
- **Creer que serverless significa «sin servidores».** Los hay, pero no los gestionas ni los ves.

## Lo que debes saber

**¿Qué modelo de servicio da más control y cuál menos?**
IaaS da más control (y más responsabilidad); SaaS, el menor.

**En IaaS, ¿quién parchea el sistema operativo?**
El cliente. En PaaS lo hace el proveedor.

**¿Qué es siempre responsabilidad del cliente en el modelo compartido?**
La información y los datos, los dispositivos y las cuentas e identidades.

## Resumen

- **Pública** (compartida, sin CapEx), **privada** (una organización), **híbrida** (ambas conectadas).
- **IaaS** (VMs), **PaaS** (App Service, Azure SQL), **SaaS** (Microsoft 365); **serverless** = Azure Functions.
- **Responsabilidad compartida**: más SaaS = más responsabilidad de Microsoft; datos, dispositivos e identidades siempre del cliente.
- **Azure Arc** gestiona desde Azure recursos que están fuera de Azure.
