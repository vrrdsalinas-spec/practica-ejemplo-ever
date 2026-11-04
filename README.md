# DevOps Release Hub - Instructor Demo Project 🚀

Proyecto de demostración para el instructor en el taller práctico de **CI/CD con Jenkins y AWS Amplify Hosting**.

Diseñado para ser ultra-ligero, compilar en menos de 30 segundos, demostrar las etapas de un pipeline declarativo profesional y desplegarse en AWS Amplify con soporte SSR nativo.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (Dark Mode: Slate-950 / Esmeralda / Cyan)
- **Pruebas:** Node.js Native Test Runner (`node:test`)
- **CI Server:** Jenkins Declarative Pipeline (Node-20 Tooling)
- **Cloud Hosting:** AWS Amplify Hosting (SSR Compute + Amazon CloudFront)

---

## 📋 Requisitos Previos

- **Node.js:** Versión 18 o 20+ recomendada
- **npm:** Versión 9+

---

## 🚀 Scripts Disponibles

```bash
# Instalar dependencias limpias (rápido en CI)
npm ci

# Modo desarrollo local
npm run dev

# Ejecutar linter de Next.js
npm run lint

# Ejecutar pruebas unitarias nativas
npm test

# Compilación optimizada para producción
npm run build

# Iniciar servidor local de producción
npm start
```

---

## 🔄 Pipeline de Jenkins (`Jenkinsfile`)

El pipeline declarativo incluido está configurado con las siguientes etapas:

1. **Checkout:** Clona el código y verifica el commit/tag.
2. **Install Dependencies:** Ejecuta `npm ci` aprovechando caché de módulos.
3. **Lint & Unit Tests:** Valida consistencia con `npm run lint` y corre `npm test`.
4. **Build Verification:** Compila con `npm run build` para certificar que el bundle no tiene errores.
5. **Post actions:** Emite notificaciones claras de éxito o fallo del build.

---

## ☁️ Despliegue en AWS Amplify (`amplify.yml`)

Configurado para Next.js App Router SSR:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - .npm/**/*
```

---

## 📊 Métricas de Build

- **Tiempo de `npm ci`:** ~6-10 segundos
- **Tiempo de `npm run build`:** ~5-10 segundos
- **Tiempo total en CI:** &lt; 30 segundos
