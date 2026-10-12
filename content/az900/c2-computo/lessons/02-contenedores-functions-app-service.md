---
title: Contenedores, Functions y App Service
minutes: 8
---

## Qué problema resuelve

Una VM arranca un sistema operativo completo, tarda minutos y hay que mantenerla. Muchas aplicaciones no necesitan tanto: una web solo quiere un sitio donde ejecutarse, un proceso que redimensiona imágenes solo debe correr cuando llega una foto. Azure ofrece opciones **más ligeras y más gestionadas** que una VM.

## Analogía

- **VM**: alquilar un piso entero.
- **Contenedor**: alquilar una habitación amueblada en un piso compartido. Arranca rápido y ocupa poco.
- **App Service**: un hotel. Llegas con tu maleta (tu código) y el resto está hecho.
- **Azure Functions**: un taxi. Solo lo usas, y lo pagas, durante el trayecto.

## Concepto

### Contenedores

Un **contenedor** empaqueta la aplicación con sus dependencias y comparte el kernel del SO anfitrión: es más ligero que una VM y arranca en segundos.

| Servicio | Qué es | Cuándo |
|---|---|---|
| **Azure Container Instances (ACI)** | Ejecutar un contenedor sin gestionar servidores. Lo más simple y rápido. | Tareas puntuales, pruebas, procesos sencillos. |
| **Azure Container Apps** | Plataforma serverless de contenedores, con balanceo, escalado automático (incluso a cero) y HTTPS. | Microservicios y APIs sin gestionar Kubernetes. |
| **Azure Kubernetes Service (AKS)** | Kubernetes gestionado: Azure se ocupa del plano de control. | Orquestación compleja de muchos contenedores y control fino. |

Las imágenes se guardan en **Azure Container Registry (ACR)**.

### Azure Functions

**Azure Functions** es el servicio **serverless** de cómputo: escribes una función que se ejecuta en respuesta a un **evento** (una petición HTTP, un mensaje en una cola, un fichero nuevo, un temporizador…).

- Escala automáticamente según el número de eventos.
- En el plan de consumo pagas por **ejecución** y **tiempo de CPU**: si no hay eventos, no pagas cómputo.
- Las funciones son normalmente **sin estado** (*stateless*); con **Durable Functions** pueden guardar estado.

### Azure App Service

**App Service** es la plataforma **PaaS** para alojar aplicaciones web por HTTP:

- **Web apps**, **API apps**, **WebJobs** (tareas en segundo plano) y back ends para **apps móviles**.
- Windows o Linux, con .NET, Java, Node.js, Python o PHP, o con un contenedor.
- Incluye escalado, balanceo, HTTPS, despliegue continuo y *deployment slots*.

### ¿Qué elijo?

| Necesitas… | Opción |
|---|---|
| Control total del SO | **VM** |
| Una web o API sin gestionar servidores | **App Service** |
| Código que reacciona a eventos y paga por uso | **Functions** |
| Ejecutar un contenedor rápido y simple | **ACI** |
| Microservicios en contenedores con autoescalado, sin Kubernetes | **Container Apps** |
| Kubernetes completo | **AKS** |

## Ejemplo

Una tienda online:

- La **web** y su **API** van en **App Service** (PaaS: nadie parchea servidores).
- Cuando un cliente sube una foto de producto, una **Function** se dispara por el evento del nuevo blob y genera las miniaturas. A las 3 de la mañana no hay fotos, y no se paga cómputo.
- Un proceso nocturno de informes empaquetado en contenedor corre en **ACI** y se para al terminar.

## Errores comunes

- **Usar AKS para un solo contenedor sencillo.** ACI o Container Apps son mucho más simples.
- **Pensar que serverless no tiene límites.** Las funciones tienen límites de tiempo de ejecución según el plan, y no son buenas para procesos muy largos sin Durable Functions.
- **Creer que App Service solo sirve para .NET o Windows.** Admite varios lenguajes, Linux y contenedores.

## Lo que debes saber

**¿Qué diferencia hay entre una VM y un contenedor?**
La VM virtualiza el hardware y lleva su propio SO; el contenedor comparte el kernel del anfitrión, por eso es más ligero y arranca antes.

**¿Qué servicio de Azure es serverless y se dispara por eventos?**
Azure Functions.

**¿Cuál es la forma más sencilla de ejecutar un contenedor en Azure?**
Azure Container Instances.

## Resumen

- Contenedores: **ACI** (lo más simple), **Container Apps** (serverless, autoescalado) y **AKS** (Kubernetes gestionado). Imágenes en **ACR**.
- **Functions**: serverless por eventos; pagas por ejecución en el plan de consumo.
- **App Service**: PaaS para webs, APIs, WebJobs y back ends móviles.
- Elige por **cuánto control necesitas** y **cuánto quieres gestionar**.
