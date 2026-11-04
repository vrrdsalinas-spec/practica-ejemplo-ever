#!/usr/bin/env node

import { execSync } from 'node:child_process';

console.log('\n======================================================');
console.log('🛡️  JENKINS QUALITY GATEKEEPER (DEMO INSTRUCTOR)');
console.log('======================================================\n');

// 1. Activar Git Hooks de protección
try {
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
} catch (_) {}

// 2. Auto-commit de cambios en Git
console.log('📦 [1/3] Verificando y registrando cambios locales en Git...');
let currentBranch = 'main';
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch (_) {
  try {
    currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim() || 'main';
  } catch (_) {}
}

try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  if (status) {
    console.log('   Detectados archivos modificados, guardando commit...');
    execSync('git add .');
    execSync('git commit -m "chore(release): update demo release via npm run jenkins"');
    console.log('   ✅ Commit generado localmente.');
  } else {
    console.log('   ℹ️  No hay cambios pendientes de commit en Git.');
  }
} catch (err) {
  console.warn('   ⚠️  Nota sobre Git commit:', err.message);
}

// 3. Subir a la rama de auditoría (develop) en GitHub
console.log('\n🌐 [2/3] Enviando código a rama de auditoría ("develop") en GitHub...');
let remoteUrl = '';
try {
  remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
} catch (_) {}

if (!remoteUrl) {
  console.error('❌ No se detectó un repositorio remoto (origin) configurado en Git.');
  process.exit(1);
}

try {
  execSync('git push origin HEAD:refs/heads/develop', { stdio: 'inherit' });
  console.log('   ✅ Rama "develop" actualizada en GitHub.');
} catch (pushErr) {
  console.error('\n❌ Error al enviar cambios a GitHub (rama develop):', pushErr.message);
  process.exit(1);
}

// 4. Disparar Pipeline en Jenkins y esperar veredicto (Jenkins como Fuente de la Verdad)
console.log('\n📡 [3/3] Delegando validación técnica a Jenkins (Fuente de la Verdad)...');

const CREDENTIALS = Buffer.from('francisco:11de4a71e27959163a7e1c20fc7444f0c5').toString('base64');
const queryParams = new URLSearchParams({
  GIT_REPO_URL: remoteUrl,
  GIT_BRANCH: 'develop'
}).toString();
const LOCAL_TRIGGER_URL = `http://localhost:8080/job/devops-instructor-demo/buildWithParameters?${queryParams}`;
const CLOUD_TRIGGER_URL = `https://jenkins.comuni-red.com/job/devops-instructor-demo/buildWithParameters?${queryParams}`;

function normalizeUrl(targetUrl, baseUrl) {
  if (baseUrl.startsWith('https://jenkins.comuni-red.com') && targetUrl.startsWith('http://localhost:8080')) {
    return targetUrl.replace('http://localhost:8080', 'https://jenkins.comuni-red.com');
  }
  return targetUrl;
}

async function triggerAndGate() {
  let response;
  let usedBase = '';

  // Probar Cloudflare primero (para alumnos/remoto) y luego localhost (para laptop local)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    response = await fetch(CLOUD_TRIGGER_URL, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${CREDENTIALS}` },
      signal: controller.signal
    });
    clearTimeout(timeout);
    usedBase = 'https://jenkins.comuni-red.com';
  } catch (_) {
    try {
      response = await fetch(LOCAL_TRIGGER_URL, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${CREDENTIALS}` }
      });
      usedBase = 'http://localhost:8080';
    } catch (netErr) {
      console.error('❌ No se pudo conectar con el servidor de Jenkins:', netErr.message);
      process.exit(1);
    }
  }

  if (response && response.status === 400) {
    // Si Jenkins aún no indexó parámetros, reintentar con /build estándar
    const fallbackUrl = usedBase === 'https://jenkins.comuni-red.com'
      ? 'https://jenkins.comuni-red.com/job/devops-instructor-demo/build'
      : 'http://localhost:8080/job/devops-instructor-demo/build';
    try {
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${CREDENTIALS}` }
      });
    } catch (_) {}
  }

  if (!response || (response.status !== 201 && response.status !== 200)) {
    console.error(`❌ Respuesta inesperada de Jenkins (HTTP ${response?.status}):`, await response?.text());
    process.exit(1);
  }

  const rawQueueUrl = response.headers.get('location');
  if (!rawQueueUrl) {
    console.error('❌ Jenkins no devolvió la ubicación de la tarea en cola.');
    process.exit(1);
  }

  const queueUrl = normalizeUrl(rawQueueUrl, usedBase);
  console.log('   📬 Tarea recibida en cola de Jenkins. Esperando asignación de ejecutor...');

  // Esperar a que se asigne un ejecutor y empiece a compilar
  let buildUrl = null;
  let buildNumber = null;

  while (!buildUrl) {
    await new Promise(r => setTimeout(r, 1500));
    try {
      const qRes = await fetch(`${queueUrl}api/json`, {
        headers: { 'Authorization': `Basic ${CREDENTIALS}` }
      });
      if (qRes.ok) {
        const qData = await qRes.json();
        if (qData.executable && qData.executable.url) {
          buildUrl = normalizeUrl(qData.executable.url, usedBase);
          buildNumber = qData.executable.number;
          break;
        }
        if (qData.cancelled) {
          console.error('❌ La tarea fue cancelada en la cola de Jenkins.');
          process.exit(1);
        }
      }
    } catch (_) {}
    process.stdout.write('   ⏳ Esperando ejecutor disponible...\r');
  }

  console.log(`\n⚙️  Auditoría en curso: Build #${buildNumber} (Rama: develop)`);
  console.log(`🔗 Ver consola en vivo: ${buildUrl}console`);

  // Esperar a que termine la compilación
  const startTime = Date.now();
  let buildData = null;

  while (true) {
    await new Promise(r => setTimeout(r, 2500));
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    try {
      const bRes = await fetch(`${buildUrl}api/json`, {
        headers: { 'Authorization': `Basic ${CREDENTIALS}` }
      });
      if (bRes.ok) {
        buildData = await bRes.json();
        if (!buildData.building) {
          break;
        }
      }
    } catch (_) {}
    process.stdout.write(`   ⏳ Jenkins auditando código (Linter, Tests y Build)... [${elapsed}s]\r`);
  }

  const durationSec = Math.round(buildData.duration / 1000) || Math.floor((Date.now() - startTime) / 1000);

  // Veredicto del Quality Gate
  if (buildData.result === 'SUCCESS') {
    console.log(`\n\n========================================================================`);
    console.log(`🎉 ¡AUDITORÍA APROBADA POR JENKINS (Build #${buildNumber} en ${durationSec}s)!`);
    console.log(`========================================================================`);
    console.log('✅ Next.js ESLint: APROBADO');
    console.log('✅ Pruebas Unitarias: APROBADAS');
    console.log('✅ Compilación SSR para AWS Amplify: EXITOSA');
    console.log('');
    console.log('🚀 Desbloqueando candado de seguridad y promoviendo a producción ("main")...');

    try {
      execSync('git push origin HEAD:refs/heads/main', {
        stdio: 'inherit',
        env: {
          ...process.env,
          JENKINS_GATEKEEPER_APPROVED: 'true'
        }
      });
      console.log('\n========================================================================');
      console.log('☁️  ¡CÓDIGO PUBLICADO EXITOSAMENTE EN GITHUB MAIN!');
      console.log('🚀 AWS Amplify ha detectado la versión verificada y comenzó el despliegue.');
      console.log('========================================================================\n');
    } catch (pushMainErr) {
      console.error('\n❌ Error al promover cambios a main:', pushMainErr.message);
      process.exit(1);
    }
  } else {
    console.log(`\n\n========================================================================`);
    console.log(`❌ AUDITORÍA RECHAZADA POR JENKINS (Build #${buildNumber} - RESULTADO: ${buildData.result})`);
    console.log(`========================================================================`);
    console.log('🛑 El pipeline detectó errores en las pruebas o en la compilación.');
    console.log('🛡️  LA RAMA "main" NO FUE MODIFICADA. Producción sigue a salvo.');
    console.log('☁️  AWS Amplify NO desplegó esta versión rota.');
    console.log('');
    console.log('👉 Revisa los errores exactos en:');
    console.log(`   ${buildUrl}console`);
    console.log('========================================================================\n');
    process.exit(1);
  }
}

await triggerAndGate();
