const test = require('node:test');
const assert = require('node:assert');

test('CI/CD Quality Gatekeeper - Instructor Demo Tests', async (t) => {
  await t.test('1. Node environment check', () => {
    assert.ok(process.version, 'Node runtime must be active');
  });

  await t.test('2. Package metadata check', () => {
    const pkg = require('../package.json');
    assert.strictEqual(pkg.name, 'devops-instructor-demo');
    assert.strictEqual(pkg.version, '1.0.0');
    assert.ok(pkg.scripts.build, 'Build script must be defined');
  });

  await t.test('3. Quality Gate: Auditoría de Aprobación de Release', () => {
    // ⚠️ CONFIGURACIÓN DE PRUEBA UNITARIA (CALIDAD DE SOFTWARE):
    // Para demostrar el flujo de bloqueo en Local y en Jenkins:
    // - ESTADO FALLIDO (Actual): 'UNDER_REVIEW' -> Provoca fallo y activa el Gatekeeper.
    // - ESTADO APROBADO (Solución): Cambiar a 'READY_FOR_RELEASE' para superar la auditoría.
    const releaseApproval = {
      status: 'UNDER_REVIEW', // <-- Cambiar a 'READY_FOR_RELEASE' para aprobar
      securityAuditPassed: true,
      buildTarget: 'production'
    };

    assert.strictEqual(
      releaseApproval.status,
      'READY_FOR_RELEASE',
      '\n❌ QUALITY GATEKEEPER BLOQUEADO:\n' +
      '   El estado de aprobación es "UNDER_REVIEW".\n' +
      '   Para autorizar el release a producción (main), debes cambiar status a "READY_FOR_RELEASE".'
    );
  });
});
