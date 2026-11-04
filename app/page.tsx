import ReleaseRegistry from "./components/ReleaseRegistry";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const ssrTimestamp = new Date().toISOString();
  const ssrRequestId = `req-${Math.random().toString(36).substring(2, 7)}`;

  const pipelineStages = [
    { id: "1", name: "Code Checkout & Git Tag", desc: "Clonación y verificación del tag de versión", badge: "bg-sky-50 text-sky-700 border-sky-200" },
    { id: "2", name: "Linting & Automated Tests", desc: "Verificación de ESLint y node:test", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "3", name: "Build Verification", desc: "Compilación optimizada Next.js App Router", badge: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "4", name: "CloudFront & Lambda Edge Deployment", desc: "Publicación global y cómputo SSR", badge: "bg-teal-50 text-teal-700 border-teal-200" },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col justify-between">
      {/* Barra superior sencilla */}
      <header className="bg-white/90 border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-900 tracking-tight text-sm sm:text-base">
              DevOps Release Hub
            </span>
            <span className="text-xs text-slate-400">/ Demo Instructor</span>
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Amplify SSR Live
          </span>
        </div>
      </header>

      {/* Contenido principal simplificado */}
      <div className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        {/* Hero & Badges */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            DevOps Release Hub - Demo Project
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Demostración del pipeline de CI/CD con Jenkins y despliegue serverless en AWS Amplify Hosting.
          </p>

          {/* Badges visuales de estado requeridos */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Pipeline Status: Verified by Jenkins CI</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium shadow-2xs">
              <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span>Hosting: AWS Amplify Hosting (SSR Compute)</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Release: v1.0.0 (Production)</span>
            </div>
          </div>
        </div>

        {/* Tarjeta con las 4 etapas del pipeline demostradas en clase */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>🚀</span>
              <span>Etapas del Pipeline en Jenkins</span>
            </h2>
            <span className="text-xs font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Tool: Node-20
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pipelineStages.map((stage) => (
              <div
                key={stage.id}
                className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded border mb-2 ${stage.badge}`}>
                    Fase {stage.id}
                  </span>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registro sencillo de releases con atributos SSR + localStorage */}
        <ReleaseRegistry ssrTimestamp={ssrTimestamp} ssrRequestId={ssrRequestId} />
      </div>
    </main>
  );
}
