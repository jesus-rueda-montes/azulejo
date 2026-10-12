---
title: Microsoft Entra ID y autenticación
minutes: 8
---

## Qué problema resuelve

Tus empleados usan decenas de aplicaciones: Azure, Microsoft 365, el CRM, la intranet. Si cada una tiene su propio usuario y contraseña, la gente reutiliza contraseñas débiles, y dar de baja a alguien obliga a tocar veinte sistemas. Hace falta **un directorio central de identidades** que verifique **quién eres** (autenticación) y decida **a qué puedes entrar**.

## Analogía

Microsoft Entra ID es la **recepción de un edificio de oficinas** con un único pase para todo: te identificas una vez en la entrada (SSO). En las zonas sensibles te piden además la huella (MFA) y, si llegas a las 3 de la madrugada desde otro país, el vigilante llama a tu jefe antes de dejarte pasar (Conditional Access).

## Concepto

### Microsoft Entra ID

**Microsoft Entra ID** es el servicio de identidad y acceso en la nube de Microsoft. Lo usan Azure, Microsoft 365 y miles de aplicaciones. Ofrece:

- **Autenticación**: verificar la identidad para acceder a aplicaciones y recursos.
- **Single sign-on (SSO)**: una sola identidad para muchas aplicaciones.
- **Gestión de aplicaciones** y de **dispositivos**.
- Sincronización con el **Active Directory on-premises** mediante **Microsoft Entra Connect**, para que los usuarios tengan la misma identidad dentro y fuera.

Cada organización tiene su **tenant** de Entra ID: su instancia del directorio.

### Microsoft Entra Domain Services

Aplicaciones antiguas necesitan funciones clásicas de dominio: **unión a dominio**, **directivas de grupo (GPO)**, **LDAP** o autenticación **Kerberos/NTLM**. **Microsoft Entra Domain Services** las ofrece como **servicio gestionado**, sin desplegar ni parchear controladores de dominio.

### Métodos de autenticación

**Autenticación** = demostrar quién eres. **Autorización** = qué puedes hacer una vez dentro.

- **SSO**: inicias sesión una vez y accedes a varias aplicaciones. Menos contraseñas y bajas más sencillas.
- **MFA** (*multifactor authentication*): pedir dos o más factores de tipos distintos:
  - Algo que **sabes** (contraseña, PIN).
  - Algo que **tienes** (el móvil, una llave de seguridad).
  - Algo que **eres** (huella, rostro).
- **Passwordless**: sin contraseña, con un dispositivo de confianza y un gesto biométrico o un PIN. Opciones: **Windows Hello for Business**, la app **Microsoft Authenticator** y **llaves de seguridad FIDO2** (*passkeys*).

### Identidades externas

**Microsoft Entra External ID** permite que personas **de fuera** de la organización accedan a tus aplicaciones con **su propia identidad** (su cuenta de empresa, de Google, de Microsoft…):

- **B2B collaboration**: invitas a socios o proveedores como **invitados** (*guests*) a tu tenant.
- Aplicaciones para **clientes**: tus clientes se registran e inician sesión en tus apps de consumo.

### Conditional Access

**Conditional Access** decide el acceso según **señales**:

```
Señales                          →  Decisión            →  Aplicación
usuario o grupo, ubicación,         permitir,              acceso concedido,
dispositivo, aplicación, riesgo     exigir MFA, bloquear   con o sin pasos extra
```

Ejemplo: «desde la oficina, solo contraseña; desde fuera, exigir MFA; desde ciertos países, bloquear».

## Ejemplo

Una empresa sincroniza su Active Directory con **Entra ID** usando **Entra Connect**. Sus empleados entran con **SSO** a Microsoft 365 y al CRM. Activa **MFA** para todos con Microsoft Authenticator y una política de **Conditional Access** que bloquea los inicios de sesión de riesgo alto. Los auditores externos entran como **invitados B2B** con su cuenta corporativa. Una aplicación antigua que exige Kerberos se apoya en **Entra Domain Services**.

## Errores comunes

- **Confundir autenticación con autorización.** Entra ID autentica; qué puedes hacer en Azure lo decide Azure RBAC.
- **Pensar que MFA es «dos contraseñas».** Los factores deben ser de tipos distintos.
- **Creer que Entra ID es el Active Directory de siempre en la nube.** Para dominio clásico (GPO, LDAP, Kerberos) está Entra Domain Services.
- **Crear cuentas internas para colaboradores externos** en lugar de invitarlos como B2B.

## Lo que debes saber

**¿Qué es Microsoft Entra ID?**
El servicio de identidad y acceso en la nube de Microsoft: autenticación, SSO y gestión de aplicaciones y dispositivos.

**¿Qué tres tipos de factor combina MFA?**
Algo que sabes, algo que tienes y algo que eres.

**¿Qué hace Conditional Access?**
Usa señales (usuario, ubicación, dispositivo, aplicación, riesgo) para permitir, exigir MFA o bloquear el acceso.

## Resumen

- **Entra ID**: identidad en la nube con SSO; **Entra Connect** sincroniza con el AD on-premises.
- **Entra Domain Services**: unión a dominio, GPO, LDAP y Kerberos gestionados.
- **MFA** (sabes / tienes / eres) y **passwordless** (Windows Hello, Authenticator, FIDO2).
- **External ID**: invitados B2B y cuentas de clientes.
- **Conditional Access**: señales → permitir, exigir MFA o bloquear.
