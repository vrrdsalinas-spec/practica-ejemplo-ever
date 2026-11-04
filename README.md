# 🎓 Plantilla Práctica de Estudiantes - DevOps Release Hub

Bienvenido a la plantilla interactiva para el **Taller Práctico de CI/CD con Jenkins y AWS Amplify Hosting**.

Esta plantilla implementa una arquitectura **GitOps con Jenkins como Fuente de la Verdad Única**: la rama de producción (`main`) está completamente blindada por candados criptográficos y de Git Hooks, de modo que **ningún cambio llega a producción sin antes ser auditado y aprobado por el clúster de Jenkins**.

---

## 🎯 Flujo de Trabajo del Taller (Paso a Paso)

### Paso 1: Clonar e Instalar Dependencias
```bash
# 1. Instalar dependencias del proyecto (activa automáticamente los Git Hooks de seguridad)
npm install
```

### Paso 2: Vincular tu Repositorio Remoto de GitHub
Cada equipo debe tener un repositorio público en GitHub para alojar su código:
```bash
# Si ya tienes el remoto 'origin', actualízalo a la URL de tu equipo:
git remote set-url origin https://github.com/<tu-usuario-o-org>/<nombre-de-tu-repo>.git

# O si no existe 'origin', agrégalo:
git remote add origin https://github.com/<tu-usuario-o-org>/<nombre-de-tu-repo>.git
```

---

## 🛡️ Arquitectura: Jenkins como Fuente de la Verdad

En este taller se enseña el principio de **Single Source of Truth**:
1. **Sin validaciones locales sesgadas**: No dependemos de que cada desarrollador ejecute pruebas locales que podrían omitirse o alterarse.
2. **Auditoría centralizada en Jenkins**: Todo el código se envía a la rama de auditoría `develop`.
3. **Calificación objetiva en contenedor CI**: El clúster de Jenkins (`https://jenkins.comuni-red.com`) clona el repositorio del equipo, aísla el entorno en un contenedor Docker con Node.js 20 y ejecuta:
   * `npm ci` (Instalación limpia de dependencias)
   * `npm run lint` (Análisis estático de código con Next.js ESLint)
   * `Team Config Test` (Validación pedagógica de identidad de equipo)
   * `npm run build` (Compilación SSR para producción en AWS Amplify)
4. **Protección de Producción**: La rama `main` está protegida localmente por `.githooks/pre-push`. Solo si Jenkins emite veredicto `SUCCESS`, el candado se desbloquea (`JENKINS_GATEKEEPER_APPROVED='true'`) y promueve los cambios a `main`.

---

## 🧪 Práctica Didáctica: El Ciclo de Dos Intentos

### 🔴 Intento 1: Demostración de Bloqueo por Quality Gate
Sin modificar `app/team-config.ts` (manteniendo los valores por defecto de plantilla), ejecuta en tu terminal:

```bash
npm run jenkins
```

**¿Qué sucederá?**
1. El script registra el commit y envía los cambios a la rama de auditoría `develop` en tu GitHub.
2. Jenkins recibe la tarea, descarga tu repositorio y ejecuta la etapa `Team Config Test`.
3. Jenkins detecta que `teamName` sigue siendo `[CAMBIAR_POR_NOMBRE_DE_TU_EQUIPO]`.
4. ❌ **Resultado**: Jenkins reprueba la auditoría con estado `FAILURE`. Tu terminal te mostrará el rechazo y **la rama `main` queda 100% protegida**.

---

### 🟢 Intento 2: Personalización del Equipo y Acreditación
Abre el archivo `app/team-config.ts` (el único archivo que debes editar) y define los datos reales de tu equipo:

```typescript
export const teamConfig = {
  // 1. Asigna el nombre real de tu equipo (ej. "CyberDragons", "DevOps Elite"):
  teamName: "CyberDragons",

  // 2. Lema técnico del equipo:
  slogan: "Automatizando el futuro con CI/CD y Serverless Cloud",

  // 3. Paleta de colores visual en Tailwind CSS:
  primaryBg: "from-slate-900 via-indigo-950 to-slate-900",
  accentColor: "from-cyan-400 to-blue-500",
  badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",

  // 4. Registra a todos los integrantes del equipo:
  members: [
    "Nombre Completo Integrante 1",
    "Nombre Completo Integrante 2",
    "Nombre Completo Integrante 3",
    "Nombre Completo Integrante 4",
  ],

  // 5. Versión del release:
  releaseVersion: "v1.0.0",
};
```

Guarda el archivo y vuelve a ejecutar:

```bash
npm run jenkins
```

**¿Qué sucederá?**
1. El script detecta tus cambios, actualiza la rama `develop` y solicita una nueva auditoría en Jenkins.
2. Jenkins valida tu identidad de equipo $\rightarrow$ ✅ **Etapa Aprobada en Verde**.
3. Jenkins ejecuta la compilación Next.js SSR $\rightarrow$ ✅ **Compilación Exitosa**.
4. Jenkins emite estado **`SUCCESS`**.
5. 🎉 Tu terminal desbloquea el candado de seguridad y promueve el código automáticamente hacia la rama `main` en GitHub.

---

## ☁️ Conexión y Despliegue en AWS Amplify Hosting

Una vez que tu código esté aprobado en la rama `main`:

1. Ingresa a la **Consola de AWS** con el usuario IAM de tu equipo:
   * **URL**: [https://293626296338.signin.aws.amazon.com/console](https://293626296338.signin.aws.amazon.com/console)
   * **Cuenta**: `293626296338`
   * **Región**: `us-east-1` (N. Virginia)
2. Ve a **AWS Amplify** $\rightarrow$ Clic en **Create new app**.
3. Selecciona **GitHub** como proveedor y autoriza el acceso a tu repositorio.
4. Selecciona tu repositorio y la rama **`main`**.
5. ⚠️ **Ajustes Críticos**:
   * **Desmarca** la casilla *"Connecting a monorepo"* (el proyecto está en la raíz).
   * En *Advanced settings* $\rightarrow$ *Service role*, selecciona **`AmplifySSRServiceRole`**.
6. Clic en **Save and deploy**. En ~2.5 minutos tu aplicación Next.js SSR estará activa en su URL pública HTTPS con el diseño y miembros de tu equipo.

---

## 📁 Estructura del Repositorio

```text
├── app/
│   ├── layout.tsx          # Layout raíz con metadatos reactivos al equipo
│   ├── page.tsx            # Dashboard Glassmorphism interactivo
│   ├── globals.css         # Configuración de Tailwind CSS
│   └── team-config.ts      # ⭐️ ÚNICO ARCHIVO QUE DEBES EDITAR
├── test/
│   └── team-config.test.js # Suite de validación ejecutada por Jenkins
├── scripts/
│   └── publish-jenkins.mjs # Orquestador cliente del Quality Gatekeeper
├── .githooks/
│   └── pre-push            # Candado local de Git contra pushes directos a main
├── Jenkinsfile             # Pipeline declarativo CI ejecutado en contenedor Docker
├── amplify.yml             # Especificación de build y hosting SSR para AWS Amplify
└── package.json            # Scripts del proyecto (npm run jenkins, dev, build)
```
