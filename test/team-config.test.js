const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Helper para extraer TEAM_CONFIG de app/team-config.ts sin requerir
 * dependencias externas de compilación de TypeScript en CI.
 */
function loadTeamConfig() {
  const configPath = path.join(__dirname, '..', 'app', 'team-config.ts');
  assert.ok(fs.existsSync(configPath), `No se encontró el archivo de configuración en: ${configPath}`);

  const source = fs.readFileSync(configPath, 'utf8');

  // Extraer valores mediante regex tolerante a formato
  const teamNameMatch = source.match(/teamName:\s*["'`\x27](.*?)["'`\x27]/);
  const sloganMatch = source.match(/slogan:\s*["'`\x27](.*?)["'`\x27]/);
  const releaseVersionMatch = source.match(/releaseVersion:\s*["'`\x27](.*?)["'`\x27]/);

  const membersBlockMatch = source.match(/members:\s*\[([\s\S]*?)\]/);
  const members = membersBlockMatch && membersBlockMatch[1]
    ? membersBlockMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('//'))
        .map(line => line.replace(/^[,"'`\x27\s]+|[,"'`\x27\s]+$/g, ''))
        .filter(m => m.length > 0)
    : [];

  return {
    teamName: teamNameMatch ? teamNameMatch[1].trim() : '',
    slogan: sloganMatch ? sloganMatch[1].trim() : '',
    releaseVersion: releaseVersionMatch ? releaseVersionMatch[1].trim() : '',
    members,
  };
}

const DEFAULT_FORBIDDEN_NAMES = [
  '',
  '[CAMBIAR_POR_NOMBRE_DE_TU_EQUIPO]',
  '[TU_EQUIPO_AQUI]',
  'DEFAULT_TEAM',
  'REPLACE_ME',
  'NOMBRE_DEL_EQUIPO',
];

test('Validación de Configuración del Equipo Estudiantil (Jenkins CI Check)', async (t) => {
  const config = loadTeamConfig();

  await t.test('Verifica que teamName esté configurado y no sea el valor por defecto', () => {
    assert.ok(
      config.teamName.length > 0,
      '\n❌ ERROR PEDAGÓGICO CI/CD:\n' +
      '   El campo "teamName" en "app/team-config.ts" está vacío.\n' +
      '   Debes ingresar un nombre representativo para tu equipo antes de desplegar en producción.'
    );

    const isForbidden = DEFAULT_FORBIDDEN_NAMES.some(
      forbidden => config.teamName.toLowerCase() === forbidden.toLowerCase()
    );

    assert.strictEqual(
      isForbidden,
      false,
      `\n❌ ERROR PEDAGÓGICO CI/CD:\n` +
      `   El campo "teamName" tiene el valor de plantilla por defecto "${config.teamName}".\n` +
      `   Por favor edita "app/team-config.ts" y personaliza el nombre de tu equipo para superar el release.`
    );

    console.log(`\n  ✅ Nombre de equipo válido: "${config.teamName}"`);
  });

  await t.test('Verifica que la lista de integrantes contenga al menos 1 miembro registrado', () => {
    assert.ok(
      config.members.length >= 1,
      '\n❌ ERROR PEDAGÓGICO CI/CD:\n' +
      '   La lista "members" en "app/team-config.ts" no contiene integrantes.\n' +
      '   Cada equipo debe registrar al menos un alumno participante antes del release.'
    );

    const hasPlaceholderMember = config.members.some(m =>
      m.toLowerCase().includes('[nombre') || m.toLowerCase().includes('integrante_aqui')
    );

    assert.strictEqual(
      hasPlaceholderMember,
      false,
      '\n❌ ERROR PEDAGÓGICO CI/CD:\n' +
      '   Uno o más integrantes en "members" aún contienen texto de plantilla por defecto.\n' +
      '   Por favor escribe los nombres reales de los estudiantes del equipo.'
    );

    console.log(`  ✅ Integrantes registrados (${config.members.length}): ${config.members.join(', ')}`);
  });

  await t.test('Verifica que releaseVersion sea válida', () => {
    assert.ok(
      config.releaseVersion.length > 0,
      'releaseVersion debe estar definida (ej. "v1.0.0")'
    );
    console.log(`  ✅ Versión de release: ${config.releaseVersion}\n`);
  });
});
