"use client";

import { useState, useEffect } from "react";

export interface SimpleRelease {
  id: string;
  name: string;
  serverTime: string;
}

interface ReleaseRegistryProps {
  ssrTimestamp: string;
  ssrRequestId: string;
}

const STORAGE_KEY = "devops_instructor_simple_releases_v1";

const DEFAULT_ITEMS: SimpleRelease[] = [];

export default function ReleaseRegistry({
  ssrTimestamp,
  ssrRequestId,
}: ReleaseRegistryProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [releases, setReleases] = useState<SimpleRelease[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReleases(JSON.parse(saved));
      } else {
        setReleases(DEFAULT_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
      }
    } catch {
      setReleases(DEFAULT_ITEMS);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
    }
  }, [releases, isMounted]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newRelease: SimpleRelease = {
      id: Date.now().toString(),
      name: text.trim(),
      serverTime: `${ssrTimestamp.slice(11, 19)} UTC`,
    };

    setReleases([newRelease, ...releases]);
    setText("");
  };

  const handleDelete = (id: string) => {
    setReleases(releases.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>📋</span>
            <span>Registro de Releases (SSR + localStorage)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Los releases se sellan con la hora del servidor SSR y se guardan en el navegador.
          </p>
        </div>

        <div className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 self-start sm:self-auto">
          SSR Render: {ssrTimestamp.slice(11, 19)} UTC ({ssrRequestId})
        </div>
      </div>

      {/* Formulario simple de 1 línea */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre del release (ej. v1.0.2 - Parche de seguridad)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-2xs"
        >
          Registrar
        </button>
      </form>

      {/* Lista simple de releases */}
      {!isMounted ? (
        <div className="py-4 text-center text-xs text-slate-400">Cargando...</div>
      ) : releases.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No hay releases registrados. Agrega uno arriba.
        </div>
      ) : (
        <div className="space-y-2">
          {releases.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-xl text-xs transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{item.name}</span>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  ({item.serverTime})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="text-slate-400 hover:text-rose-600 px-1 py-0.5 rounded transition-colors shrink-0"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
