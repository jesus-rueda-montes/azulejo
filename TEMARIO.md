# Temario de Azulejo

Dos itinerarios de módulos concisos (2 lecciones cada uno). Todos los módulos están escritos (✅).

Fuentes: los «skills measured» oficiales de AZ-900 y AZ-104 en learn.microsoft.com. AZ-104 no incluye AKS (decisión 64).

## AZ-900: Fundamentos de Azure

Conceptos para el examen AZ-900, sin práctica de CLI salvo lo mínimo.

| Nivel | Módulo | Contenido | Lecciones · ejercicios · flashcards |
|---|---|---|---|
| 1 | ✅ `c1-conceptos-cloud` — Qué es la nube | Cloud computing, modelo de consumo, ventajas de la nube, modelos público/privado/híbrido, IaaS/PaaS/SaaS, serverless y responsabilidad compartida. | 2 · 8 · 6 |
| 1 | ✅ `c1-arquitectura` — Arquitectura de Azure | Regions, region pairs, sovereign regions, availability zones y la jerarquía management groups → suscripciones → resource groups → recursos. | 2 · 9 · 7 |
| 2 | ✅ `c2-computo` — Cómputo y hosting de aplicaciones | Virtual Machines, scale sets, availability sets, Azure Virtual Desktop, contenedores, Functions y App Service: cuándo usar cada uno. | 2 · 8 · 7 |
| 2 | ✅ `c2-redes` — Redes en Azure | Virtual networks, subnets, peering, Azure DNS, VPN Gateway, ExpressRoute y endpoints públicos y privados. | 2 · 8 · 6 |
| 2 | ✅ `c2-almacenamiento` — Almacenamiento | Servicios de Azure Storage, storage accounts, niveles de acceso, redundancia y herramientas para mover y migrar datos. | 2 · 8 · 7 |
| 2 | ✅ `c2-identidad-seguridad` — Identidad, acceso y seguridad | Microsoft Entra ID, SSO, MFA y passwordless, identidades externas, Conditional Access, Azure RBAC, Zero Trust, defensa en profundidad y Defender for Cloud. | 2 · 8 · 8 |
| 3 | ✅ `c3-costes-gobernanza` — Costes y gobernanza | Factores de coste, calculadora de precios, Cost Management, tags, Microsoft Purview, Azure Policy y resource locks. | 2 · 9 · 7 |
| 3 | ✅ `c3-gestion-monitorizacion` — Gestión y monitorización | Portal, Cloud Shell, Azure CLI y PowerShell, Azure Arc, IaC con ARM y Bicep, Advisor, Service Health y Azure Monitor. | 2 · 10 · 7 |

## AZ-104: Administración de Azure

Administración práctica con la Azure CLI. `a1-cli-arm` exige aprobar `az900/c1-arquitectura`.

| Nivel | Módulo | Contenido | Lecciones · ejercicios · flashcards |
|---|---|---|---|
| 1 | ✅ `a1-cli-arm` — Azure CLI, ARM y Bicep | Trabajar con la Azure CLI (sesión, suscripciones, resource groups, salida y consultas) y desplegar con plantillas ARM y Bicep. | 2 · 10 · 7 |
| 1 | ✅ `a1-entra-rbac` — Entra ID y Azure RBAC | Usuarios, grupos, licencias, invitados y SSPR en Microsoft Entra ID; roles de Azure, scopes e interpretación de asignaciones. | 2 · 10 · 7 |
| 2 | ✅ `a2-gobernanza` — Suscripciones y gobernanza | Azure Policy, resource locks, tags, mover recursos, management groups, budgets y Azure Advisor en la práctica. | 2 · 10 · 7 |
| 2 | ✅ `a2-almacenamiento` — Storage en la práctica | Crear y proteger storage accounts: redundancia, cifrado, firewall, SAS y claves; blobs, file shares, niveles, lifecycle, soft delete y versioning. | 2 · 11 · 7 |
| 2 | ✅ `a2-maquinas-virtuales` — Máquinas virtuales en la práctica | Crear y operar VMs con la CLI: tamaños, discos, cifrado en el host, zonas y availability sets, mover VMs y scale sets. | 2 · 12 · 8 |
| 3 | ✅ `a3-app-service-contenedores` — App Service y contenedores | App Service plans, escalado, deployment slots, dominios, TLS y backup; Azure Container Registry, Container Instances y Container Apps. | 2 · 12 · 8 |
| 3 | ✅ `a3-redes` — Redes en la práctica | VNets, subnets, peering, IPs públicas, rutas, NSG y ASG, Bastion, service y private endpoints, Azure DNS y load balancers. | 2 · 11 · 8 |
| 4 | ✅ `a4-monitorizacion-backup` — Monitorización y backup | Métricas, diagnostic settings, KQL, alertas y action groups, Network Watcher; Recovery Services vault, políticas de backup y Site Recovery. | 2 · 12 · 8 |

## Ideas para más adelante
- Más módulos (máximo 10 por itinerario, decisión 63): por ejemplo, un repaso final por itinerario o identidades híbridas.
