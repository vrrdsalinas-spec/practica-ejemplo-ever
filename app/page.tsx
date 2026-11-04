import { TEAM_CONFIG } from "./team-config";
import TeamTaskRegistry from "./components/TeamTaskRegistry";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  const clean = name.replace(/\(.*?\)/g, "").trim();
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (clean.slice(0, 2) || "DEV").toUpperCase();
}

const PASTEL_COLORS = [
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
];

export default function StudentHomePage() {
  const ssrTimestamp = new Date().toISOString();
  const ssrRequestId = `req-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <main
      className={`min-h-screen text-slate-800 flex flex-col justify-between ${TEAM_CONFIG.primaryBg}`}
    >
      {/* Barra superior ligera */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-white/80">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
              {TEAM_CONFIG.teamName}
            </span>
            <span className="text-xs text-slate-400">/ CI-CD Student Team</span>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md border ${TEAM_CONFIG.badgeColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
            {TEAM_CONFIG.releaseVersion}
          </span>
        </div>
      </header>

      {/* Contenido principal simplificado */}
      <div className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        {/* Hero & Badges */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            {TEAM_CONFIG.teamName}
          </h1>

          <p className="text-sm text-slate-600 mb-6">
            {TEAM_CONFIG.slogan}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/80 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Pipeline: Verificado por Jenkins CI</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/80 border border-sky-200 text-sky-800 text-xs font-medium shadow-2xs">
              <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span>AWS Amplify SSR Compute</span>
            </div>

            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-mono font-semibold shadow-2xs ${TEAM_CONFIG.badgeColor}`}
            >
              <span>Release: {TEAM_CONFIG.releaseVersion}</span>
            </div>
          </div>
        </div>

        {/* Lista sencilla de Integrantes del Equipo */}
        <div className="backdrop-blur-md bg-white/80 border border-white/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>👥</span>
              <span>Integrantes del Equipo</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Total: {TEAM_CONFIG.members.length} alumnos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEAM_CONFIG.members.map((member, idx) => {
              const initials = getInitials(member);
              const color = PASTEL_COLORS[idx % PASTEL_COLORS.length];

              return (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-3 bg-white/70 border border-slate-200/70 rounded-xl"
                >
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${color}`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {member}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Alumno #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gestor sencillo de Tareas con SSR y localStorage */}
        <TeamTaskRegistry
          ssrTimestamp={ssrTimestamp}
          ssrRequestId={ssrRequestId}
        />
      </div>

      {/* Footer requerido */}
      <footer className="backdrop-blur-md bg-white/70 border-t border-slate-200/80 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-xs text-slate-600">
          <p className="font-medium">
            Proyecto desplegado por <span className="font-semibold text-slate-900">{TEAM_CONFIG.teamName}</span> mediante Jenkins Release + AWS Amplify
          </p>
        </div>
      </footer>
    </main>
  );
}
