---
title: Azure RBAC, Zero Trust y Defender for Cloud
minutes: 7
---

## Qué problema resuelve

Que alguien pueda iniciar sesión no significa que deba poder **borrar la base de datos de producción**. Hay que decidir **qué puede hacer cada identidad y dónde**, y protegerse asumiendo que algún día algo fallará. Azure combina **control de acceso por roles**, un **modelo de seguridad** y un servicio que vigila tu postura de seguridad.

## Analogía

Un **hospital**: el personal de limpieza entra en los pasillos; las enfermeras, en las habitaciones; solo los cirujanos, al quirófano (roles con permisos distintos). Hay seguridad en la entrada, en cada planta y en la farmacia (defensa en profundidad), y nadie entra en la farmacia sin identificarse, aunque lleve bata (Zero Trust).

## Concepto

### Azure RBAC

**Azure role-based access control (RBAC)** asigna **roles** (conjuntos de permisos) a **principals** (usuarios, grupos, service principals o managed identities) en un **scope**:

```
Management group → Suscripción → Resource group → Recurso
```

- Lo asignado en un scope **se hereda** hacia abajo.
- Es un **modelo de permisos**: el acceso efectivo es la suma de los roles asignados.
- Roles integrados fundamentales:

| Rol | Puede |
|---|---|
| **Owner** | Todo, incluido dar acceso a otros |
| **Contributor** | Crear y gestionar recursos, pero **no** dar acceso |
| **Reader** | Solo ver |
| **User Access Administrator** | Gestionar el acceso de otros |

Buena práctica: asignar a **grupos** y con **mínimo privilegio**.

### Zero Trust

**Zero Trust** parte de que **no hay que confiar en nada por estar «dentro» de la red**. Tres principios:

1. **Verificar explícitamente**: autenticar y autorizar con todas las señales disponibles.
2. **Usar el acceso con mínimo privilegio**: solo lo necesario y durante el tiempo necesario (*just-in-time*, *just-enough-access*).
3. **Asumir la brecha**: segmentar para limitar el alcance de un ataque, cifrar y vigilar.

### Defensa en profundidad

La **defensa en profundidad** pone **varias capas** de protección, para que si una falla las demás frenen al atacante:

1. **Seguridad física** (centros de datos).
2. **Identidad y acceso** (SSO, MFA).
3. **Perímetro** (protección DDoS, firewalls).
4. **Red** (segmentación, NSG).
5. **Cómputo** (VMs parcheadas, acceso restringido).
6. **Aplicación** (código sin vulnerabilidades, secretos fuera del código).
7. **Datos** (cifrado, control de acceso). Es lo que todas las capas protegen.

### Microsoft Defender for Cloud

**Defender for Cloud** es una herramienta de **supervisión de la postura de seguridad** y **protección frente a amenazas**:

- Vigila recursos de **Azure**, **on-premises** y **otras nubes** (AWS y Google Cloud).
- Evalúa la configuración, da una **puntuación de seguridad** (*secure score*) y **recomendaciones** para mejorarla.
- Detecta amenazas y genera **alertas** en VMs, bases de datos, almacenamiento, contenedores…

## Ejemplo

En la suscripción de producción:

- El grupo **Desarrolladores** tiene **Reader** en la suscripción y **Contributor** solo en `rg-tienda-dev`.
- El equipo de plataforma tiene **Owner** en la suscripción.
- Defender for Cloud avisa: «una storage account permite acceso público» y «hay VMs sin parches». La puntuación de seguridad sube al corregirlo.

## Errores comunes

- **Dar Owner «para que funcione».** Contributor ya permite gestionar recursos; Owner además da acceso a otros.
- **Asignar roles a personas sueltas** en lugar de a grupos.
- **Asignar en la suscripción** lo que solo hacía falta en un resource group: se hereda en todos.
- **Confundir Azure RBAC con los roles de Entra ID.** RBAC controla los recursos de Azure; los roles de Entra ID (como Global Administrator) controlan el directorio.

## Lo que debes saber

**¿Qué diferencia hay entre Owner y Contributor?**
Los dos gestionan recursos, pero solo Owner puede dar acceso a otros.

**¿Cuáles son los principios de Zero Trust?**
Verificar explícitamente, mínimo privilegio y asumir la brecha.

**¿Qué hace Defender for Cloud?**
Vigila la postura de seguridad (puntuación y recomendaciones) y detecta amenazas en Azure, on-premises y otras nubes.

## Resumen

- **RBAC**: rol + principal + scope; **se hereda**; roles **Owner**, **Contributor**, **Reader** y **User Access Administrator**.
- **Zero Trust**: verificar explícitamente, mínimo privilegio, asumir la brecha.
- **Defensa en profundidad**: siete capas, de la física a los datos.
- **Defender for Cloud**: postura de seguridad y protección frente a amenazas, también multicloud.
