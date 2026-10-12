---
title: Máquinas virtuales y sus opciones
minutes: 7
---

## Qué problema resuelve

Muchas aplicaciones necesitan **control total** sobre el sistema operativo: una versión concreta de Windows Server, un agente que hay que instalar a mano o software que no está preparado para PaaS. Las **Azure Virtual Machines** te dan un servidor virtual en minutos, sin comprar hardware, y Azure añade opciones para tener **varias** VMs con alta disponibilidad y escalado.

## Analogía

Una VM es como **alquilar un piso amueblado**: el edificio, la luz y el agua son del casero (Microsoft), pero dentro decides tú qué instalas, y también te toca mantenerlo (parches, antivirus, copias).

## Concepto

### Azure Virtual Machines

Las VMs son **IaaS**: tú gestionas el sistema operativo, sus parches y el software. Encajan en:

- **Lift-and-shift**: mover servidores on-premises a Azure sin rehacer la aplicación.
- **Control total** del SO o software que no existe como servicio PaaS.
- **Pruebas y desarrollo**: crear y borrar entornos rápidamente.

Al crear una VM eliges, como mínimo:

| Recurso | Para qué |
|---|---|
| **Tamaño** (*size*) | CPU y memoria (p. ej. `Standard_B2s`) |
| **Imagen** | Sistema operativo (Ubuntu, Windows Server…) |
| **Discos** | Disco del SO y, opcionalmente, discos de datos |
| **Virtual network** y **subnet** | Red privada a la que se conecta |
| **NIC** (interfaz de red) | Conecta la VM a la subnet |
| **IP pública** (opcional) | Acceso desde internet |
| **NSG** (opcional) | Reglas de firewall de red |

### Virtual Machine Scale Sets

Un **scale set** es un grupo de **VMs idénticas** que se gestionan juntas y que **escalan automáticamente**: el número de instancias sube o baja según la demanda o un horario. Se combina con un balanceador de carga y puede repartir las VMs entre availability zones. Microsoft lo recomienda (con orquestación *Flexible*) como opción preferente de alta disponibilidad.

### Availability sets

Un **availability set** reparte tus VMs dentro de un centro de datos para que un fallo o un mantenimiento no las afecte a todas a la vez:

- **Fault domains** (hasta **3**): grupos de hardware que comparten alimentación y switch de red. Protegen frente a fallos físicos.
- **Update domains** (hasta **20**): grupos que se reinician juntos en el mantenimiento planificado; solo se reinicia uno a la vez.
- **No tiene coste adicional**: pagas solo las VMs.

Protege menos que las availability zones, porque todas las VMs están en el mismo centro de datos.

### Azure Virtual Desktop

**Azure Virtual Desktop (AVD)** ofrece **escritorios y aplicaciones Windows** que se ejecutan en Azure y a los que el usuario se conecta desde cualquier dispositivo. Los datos no se guardan en el equipo del usuario, y admite Windows 10/11 Enterprise **multisesión** (varios usuarios en la misma VM).

## Ejemplo

Una empresa migra su aplicación de facturación, que exige Windows Server y un componente instalado a mano:

1. Crea **dos VMs** en un **availability set** (o, mejor, en dos availability zones).
2. Pone un **balanceador de carga** delante.
3. Para la web de la campaña de verano, que tiene picos, usa un **scale set** que pasa de 2 a 10 instancias según la CPU.
4. Los empleados que teletrabajan usan **Azure Virtual Desktop** para abrir la aplicación desde casa.

## Errores comunes

- **Pensar que Azure parchea el SO de tus VMs.** En IaaS los parches son tuyos (aunque Azure ofrece herramientas para automatizarlos).
- **Crear una sola VM y esperar alta disponibilidad.** Hacen falta al menos dos VMs, en un availability set o en varias zonas.
- **Confundir fault domain con update domain.** Fault = fallo de hardware; update = mantenimiento planificado.
- **Dejar VMs encendidas sin uso.** Las VMs se pagan mientras están asignadas, aunque no hagan nada.

## Lo que debes saber

**¿Qué modelo de servicio son las VMs?**
IaaS: máximo control y máxima responsabilidad.

**¿Qué hace un scale set?**
Gestiona un grupo de VMs idénticas que escala automáticamente según la demanda o un horario.

**¿Qué son los fault domains y los update domains?**
Fault domain: hardware que comparte alimentación y red (hasta 3). Update domain: grupo que se reinicia junto en el mantenimiento (hasta 20).

## Resumen

- **VMs** = IaaS; necesitan tamaño, imagen, discos, VNet/subnet, NIC y, si hace falta, IP pública y NSG.
- **Scale sets**: VMs idénticas con **autoescalado**.
- **Availability sets**: hasta **3 fault domains** y **20 update domains**, sin coste extra.
- **Azure Virtual Desktop**: escritorios Windows en la nube, con multisesión.
