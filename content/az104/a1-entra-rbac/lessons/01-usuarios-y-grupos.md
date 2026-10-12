---
title: Usuarios, grupos, licencias e invitados
minutes: 8
---

## Qué problema resuelve

Entra un empleado nuevo: necesita una cuenta, licencias de Microsoft 365, acceso a los recursos de su equipo y poder recuperar su contraseña sin llamar a soporte. Llega un consultor externo durante tres meses. Gestionar esto persona a persona no escala: hay que trabajar con **grupos**, **asignación automática** y **autoservicio**.

## Analogía

Los **grupos** son los **departamentos** de una empresa: cuando alguien entra en Ventas, hereda automáticamente las llaves, el portátil y los programas de Ventas. Un **invitado** es un **visitante con pase de día**: se identifica con el DNI de su propia empresa.

## Concepto

### Usuarios

| Tipo | Origen |
|---|---|
| **Miembro** creado en la nube | Directamente en Entra ID |
| **Miembro** sincronizado | Desde el Active Directory on-premises (Entra Connect); se gestiona allí |
| **Invitado** (*guest*) | Usuario externo (**B2B**) que entra con su propia identidad |

```bash
az ad user create --display-name "Ana Ruiz" --user-principal-name ana@tienda.com \
  --password "<contraseña-inicial>" --force-change-password-next-sign-in true
az ad user update --id ana@tienda.com --account-enabled false   # bloquear el inicio de sesión
```

El **UPN** (*user principal name*) es el nombre de inicio de sesión: `usuario@dominio`.

### Grupos

**Tipos de grupo:**

- **Security**: para dar acceso a recursos (roles de Azure, aplicaciones). Pueden contener usuarios, dispositivos, otros grupos y service principals.
- **Microsoft 365**: colaboración (buzón, calendario y SharePoint compartidos). Solo contienen usuarios.

**Tipos de pertenencia:**

- **Assigned**: añades y quitas miembros a mano.
- **Dynamic user** / **Dynamic device**: una **regla** decide quién está dentro (por ejemplo, `user.department -eq "Ventas"`). Los miembros entran y salen solos y **no se pueden añadir a mano**. Requiere **Microsoft Entra ID P1**.

```bash
az ad group create --display-name "Ventas" --mail-nickname ventas
az ad group member add --group Ventas --member-id <id-objeto-usuario>
```

### Licencias

- Antes de asignar una licencia, el usuario necesita una **ubicación de uso** (*usage location*), porque no todos los servicios están en todos los países.
- Con la **asignación de licencias por grupo**, todos los miembros reciben la licencia del grupo y la pierden al salir.
- Si cambias a alguien de un grupo con licencia a otro, **añádelo primero al nuevo** y quítalo después del antiguo, para que no se quede sin servicio mientras se procesa.

### Usuarios externos (B2B)

Con **B2B collaboration** invitas a personas de fuera: reciben una invitación, la aceptan y entran con **su propia cuenta** (corporativa, Microsoft…). Aparecen en tu directorio con tipo **Guest**, y les das acceso como a cualquier otro usuario (grupos, roles). Cuando su empresa les da de baja, dejan de poder entrar.

### Self-service password reset (SSPR)

**SSPR** permite al usuario restablecer su contraseña o desbloquear su cuenta sin ayuda:

- Se activa para **None**, **Selected** (un grupo) o **All**.
- Se exige **uno o dos** métodos de autenticación: notificación de Microsoft Authenticator, códigos OATH, SMS, llamada, correo…
- Puedes **obligar a registrarse** al iniciar sesión.
- Las cuentas con **roles de administrador** tienen una política más estricta, siempre de dos métodos.
- Con usuarios sincronizados, hace falta **password writeback** para que la nueva contraseña llegue al AD on-premises.

## Ejemplo

La empresa crea el grupo **dinámico** «Ventas» con la regla `user.department -eq "Ventas"` y le asigna la licencia de Microsoft 365 y el rol de Azure que necesita el equipo. Cuando RR. HH. pone «Ventas» como departamento de un empleado nuevo, entra solo en el grupo y recibe licencia y permisos. Un consultor se invita como **B2B** y se añade a un grupo asignado «Consultores». SSPR está activado para **All** con **dos** métodos.

## Errores comunes

- **Intentar añadir a mano un miembro a un grupo dinámico.** La pertenencia la decide la regla.
- **Asignar licencias sin ubicación de uso**: la asignación falla.
- **Crear cuentas internas para externos** en lugar de invitarlos con B2B.
- **Activar SSPR con un solo método** en organizaciones grandes: si el usuario pierde el móvil, no puede recuperarse.

## Lo que debes saber

**¿Qué diferencia hay entre pertenencia assigned y dynamic?**
Assigned: miembros a mano. Dynamic: una regla sobre atributos los añade y quita automáticamente (requiere Entra ID P1).

**¿Qué necesita un usuario antes de recibir una licencia?**
Una ubicación de uso (usage location).

**¿Cómo entra un usuario B2B?**
Con su propia identidad; en tu directorio aparece como Guest.

## Resumen

- Usuarios: miembros (nube o sincronizados) e **invitados B2B**; UPN `usuario@dominio`.
- Grupos **Security** o **Microsoft 365**; pertenencia **assigned** o **dynamic** (P1).
- Licencias por grupo; requieren **ubicación de uso**.
- **SSPR**: None/Selected/All, uno o dos métodos; writeback para usuarios sincronizados.
