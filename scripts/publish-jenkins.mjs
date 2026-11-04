#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

console.log('\n======================================================');
console.log('🛡️  JENKINS QUALITY GATEKEEPER (EQUIPOS ESTUDIANTILES)');
console.log('======================================================\n');

// 1. Activar Git Hooks de protección
try {
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
} catch (_) {}

// 2. Lectura Inteligente de Configuración del Equipo
let teamName = 'Equipo Estudiantil';
let members = [];
try {
  const configContent = readFileSync('app/team-config.ts', 'utf-8');
  const nameMatch = configContent.match(/teamName:\s*["']([^"']+)["']/);
  if (nameMatch && nameMatch[1]) {
    teamName = nameMatch[1].trim();
  }
  const membersMatch = configContent.match(/members:\s*\[([\s\S]*?)\]/);
  if (membersMatch && membersMatch[1]) {
    members = membersMatch[1]
      .split(',')
      .map(m => m.replace(/["'\n\r]/g, '').trim())
      .filter(Boolean);
  }
} catch (e) {
  console.warn('⚠️ No se pudo leer app/team-config.ts, usando valores predeterminados.');
}

console.log(`🏷️  Equipo detectado: "${teamName}"`);
if (members.length > 0) {
  console.log(`👥 Integrantes: ${members.join(', ')}`);
}
console.log('');

// 3. Auto-commit de cambios en Git
console.log('📦 [1/3] Verificando y registrando cambios locales en Git...');
let currentBranch = 'master';
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch (_) {
  try {
    currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim() || 'master';
  } catch (_) {}
}

try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  if (status) {
    console.log(`   Detectados archivos modificados, guardando commit para [${teamName}]...`);
    execSync('git add .');
    execSync(`git commit -m "feat(team): update config for ${teamName}"`);
    console.log('   ✅ Commit generado localmente.');
  } else {
    console.log('   ℹ️  No hay cambios pendientes de commit en Git.');
  }
} catch (err) {
  console.warn('   ⚠️  Nota sobre Git commit:', err.message);
}

// 4. Detección de Entorno y Envío a Rama de Auditoría (develop)
console.log('\n🌐 [2/3] Enviando cambios a rama de auditoría ("develop")...');

let remoteUrl = '';
try {
  remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
} catch (_) {}

if (remoteUrl.startsWith('git@github.com:')) {
  remoteUrl = remoteUrl.replace('git@github.com:', 'https://github.com/');
}

let hasLocalDocker = false;
try {
  const dockerCheck = execSync('docker ps --filter "name=jenkins-workshop" --format "{{.Names}}"', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  if (dockerCheck.includes('jenkins-workshop')) {
    hasLocalDocker = true;
  }
} catch (_) {}

let gitTargetRepo = remoteUrl;
const auditBranch = 'develop';

if (remoteUrl) {
  console.log(`   Repositorio destino: ${remoteUrl}`);
  try {
    execSync(`git push origin HEAD:refs/heads/${auditBranch}`, { stdio: 'inherit' });
    console.log(`   ✅ Rama "${auditBranch}" actualizada en GitHub. (main sigue protegido)`);
  } catch (pushErr) {
    console.error('\n❌ No se pudo subir el código a GitHub (rama develop):', pushErr.message);
    process.exit(1);
  }
} else if (hasLocalDocker) {
  console.log('   ℹ️  Modo Local Instructor detectado (Docker jenkins-workshop presente).');
  const bundleFile = 'jenkins-student-sync.bundle';
  try {
    execSync(`git bundle create ${bundleFile} HEAD ${currentBranch}`, { stdio: 'ignore' });
    execSync(`docker cp ${bundleFile} jenkins-workshop:/tmp/${bundleFile}`, { stdio: 'ignore' });
    execSync(`docker exec -u 0 jenkins-workshop chmod 666 /tmp/${bundleFile}`, { stdio: 'ignore' });
    execSync(`docker exec -u jenkins jenkins-workshop git -C /var/jenkins_home/repos/devops-student-template fetch /tmp/${bundleFile} ${currentBranch}:${auditBranch}`, { stdio: 'ignore' });
    execSync(`docker exec -u 0 jenkins-workshop rm -f /tmp/${bundleFile}`, { stdio: 'ignore' });
    if (existsSync(bundleFile)) unlinkSync(bundleFile);
    console.log(`   ⚡ Repositorio interno sincronizado en rama "${auditBranch}".`);
    gitTargetRepo = 'git://127.0.0.1/devops-student-template';
  } catch (bundleErr) {
    console.warn('   ⚠️  Fallo sincronización local:', bundleErr.message);
    gitTargetRepo = 'git://127.0.0.1/devops-student-template';
  }
} else {
  console.error('\n⚠️ ATENCIÓN: No se detectó un repositorio remoto de GitHub en tu Git local.');
  console.error('Para conectar tu proyecto:');
  console.error('  1. Crea un repo público en GitHub (ej: https://github.com/tu-usuario/mi-app-equipo)');
  console.error('  2. Conéctalo ejecutando:');
  console.error('     git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git');
  console.error('  3. Vuelve a ejecutar: npm run jenkins\n');
  process.exit(1);
}

// 5. Disparar Build en Jenkins y Esperar Veredicto (Jenkins como Fuente de la Verdad)
console.log('\n📡 [3/3] Delegando validación técnica a Jenkins (Fuente de la Verdad)...');

const CREDENTIALS = Buffer.from('francisco:11de4a71e27959163a7e1c20fc7444f0c5').toString('base64');
const queryParams = new URLSearchParams({
  TEAM_NAME: teamName,
  GIT_REPO_URL: gitTargetRepo,
  GIT_BRANCH: auditBranch
}).toString();

const LOCAL_TRIGGER_URL = `http://localhost:8080/job/devops-student-template/buildWithParameters?${queryParams}`;
const CLOUD_TRIGGER_URL = `https://jenkins.comuni-red.com/job/devops-student-template/buildWithParameters?${queryParams}`;

function normalizeUrl(targetUrl, baseUrl) {
  if (baseUrl.startsWith('https://jenkins.comuni-red.com') && targetUrl.startsWith('http://localhost:8080')) {
    return targetUrl.replace('http://localhost:8080', 'https://jenkins.comuni-red.com');
  }
  return targetUrl;
}

async function triggerAndGate() {
  let response;
  let usedBase = '';

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
      ? 'https://jenkins.comuni-red.com/job/devops-student-template/build'
      : 'http://localhost:8080/job/devops-student-template/build';
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

  console.log(`\n⚙️  Auditoría en curso: Build #${buildNumber} [${teamName}] (Rama: ${auditBranch})`);
  console.log(`🔗 Ver consola en vivo: ${buildUrl}console`);

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
    process.stdout.write(`   ⏳ Jenkins auditando equipo [${teamName}]... [${elapsed}s]\r`);
  }

  const durationSec = Math.round(buildData.duration / 1000) || Math.floor((Date.now() - startTime) / 1000);

  if (buildData.result === 'SUCCESS') {
    console.log(`\n\n========================================================================`);
    console.log(`🎉 ¡AUDITORÍA APROBADA POR JENKINS PARA [${teamName}]! (${durationSec}s)`);
    console.log(`========================================================================`);
    console.log('✅ Validación de Integrantes: APROBADA');
    console.log('✅ Next.js ESLint: APROBADO');
    console.log('✅ Compilación SSR para AWS Amplify: EXITOSA');
    console.log('');
    console.log('🚀 Desbloqueando candado de seguridad y promoviendo a producción ("main")...');

    if (remoteUrl) {
      try {
        execSync('git push origin HEAD:refs/heads/main', {
          stdio: 'inherit',
          env: {
            ...process.env,
            JENKINS_GATEKEEPER_APPROVED: 'true'
          }
        });
        console.log('\n========================================================================');
        console.log(`☁️  ¡CÓDIGO DEL EQUIPO "${teamName}" PUBLICADO EN GITHUB MAIN!`);
        console.log('🚀 AWS Amplify ha detectado la versión verificada y comenzó el despliegue.');
        console.log('========================================================================\n');
      } catch (pushMainErr) {
        console.error('\n❌ Error al promover cambios a main:', pushMainErr.message);
        process.exit(1);
      }
    } else if (hasLocalDocker) {
      try {
        const bundleFile = 'jenkins-student-main.bundle';
        execSync(`git bundle create ${bundleFile} HEAD ${currentBranch}`, { stdio: 'ignore' });
        execSync(`docker cp ${bundleFile} jenkins-workshop:/tmp/${bundleFile}`, { stdio: 'ignore' });
        execSync(`docker exec -u 0 jenkins-workshop chmod 666 /tmp/${bundleFile}`, { stdio: 'ignore' });
        execSync(`docker exec -u jenkins jenkins-workshop git -C /var/jenkins_home/repos/devops-student-template fetch /tmp/${bundleFile} ${currentBranch}:master`, { stdio: 'ignore' });
        execSync(`docker exec -u 0 jenkins-workshop rm -f /tmp/${bundleFile}`, { stdio: 'ignore' });
        if (existsSync(bundleFile)) unlinkSync(bundleFile);
        console.log('\n========================================================================');
        console.log(`⚡ Repositorio interno actualizado en rama "master".`);
        console.log('========================================================================\n');
      } catch (_) {}
    }
  } else {
    console.log(`\n\n========================================================================`);
    console.log(`❌ AUDITORÍA RECHAZADA POR JENKINS (Build #${buildNumber} - RESULTADO: ${buildData.result})`);
    console.log(`========================================================================`);
    console.log(`🛑 El pipeline detectó errores para el equipo [${teamName}].`);
    console.log('🛡️  LA RAMA "main" NO FUE MODIFICADA. Producción sigue a salvo.');
    console.log('☁️  AWS Amplify NO desplegó esta versión con errores.');
    console.log('');
    console.log('👉 Revisa los errores exactos en:');
    console.log(`   ${buildUrl}console`);
    console.log('========================================================================\n');
    process.exit(1);
  }
}

await triggerAndGate();
