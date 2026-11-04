"use client";

import { useState, useEffect } from "react";
import { TEAM_CONFIG } from "../team-config";

export interface SimpleTask {
  id: string;
  title: string;
  assignedMember: string;
  completed: boolean;
  serverTime: string;
}

interface TeamTaskRegistryProps {
  ssrTimestamp: string;
  ssrRequestId: string;
}

const STORAGE_KEY = "devops_student_simple_tasks_v1";

function getInitialSeeds(members: string[]): SimpleTask[] {
  return [
    {
      id: "1",
      title: "Configurar variables del equipo en app/team-config.ts",
      assignedMember: members[0] || "Integrante 1",
      completed: true,
      serverTime: "22:10:00 UTC",
    },
    {
      id: "2",
      title: "Validar Quality Gate en Jenkins CI con 'npm test'",
      assignedMember: members[1] || members[0] || "Integrante 2",
      completed: false,
      serverTime: "22:15:00 UTC",
    },
  ];
}

export default function TeamTaskRegistry({
  ssrTimestamp,
  ssrRequestId,
}: TeamTaskRegistryProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [title, setTitle] = useState("");
  const [assignedMember, setAssignedMember] = useState(TEAM_CONFIG.members[0] || "");

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        const seeds = getInitialSeeds(TEAM_CONFIG.members);
        setTasks(seeds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
      }
    } catch {
      const seeds = getInitialSeeds(TEAM_CONFIG.members);
      setTasks(seeds);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedMember) return;

    const newTask: SimpleTask = {
      id: Date.now().toString(),
      title: title.trim(),
      assignedMember,
      completed: false,
      serverTime: `${ssrTimestamp.slice(11, 19)} UTC`,
    };

    setTasks([newTask, ...tasks]);
    setTitle("");
  };

  const handleToggle = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="backdrop-blur-md bg-white/80 border border-white/80 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>📝</span>
            <span>Tareas del Equipo (SSR + localStorage)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organiza las entregas de tu equipo estampadas con la hora del servidor SSR.
          </p>
        </div>

        <div className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200/60 self-start sm:self-auto">
          SSR Render: {ssrTimestamp.slice(11, 19)} UTC ({ssrRequestId})
        </div>
      </div>

      {/* Formulario sencillo para agregar tarea */}
      <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-4">
        <select
          value={assignedMember}
          onChange={(e) => setAssignedMember(e.target.value)}
          className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 shrink-0"
        >
          {TEAM_CONFIG.members.map((member, i) => (
            <option key={i} value={member}>
              {member}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Escribe una tarea o pendiente del equipo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-2xs"
        >
          Agregar
        </button>
      </form>

      {/* Lista simple de tareas */}
      {!isMounted ? (
        <div className="py-4 text-center text-xs text-slate-400">Cargando...</div>
      ) : tasks.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No hay tareas pendientes. Agrega la primera arriba.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-white/70 hover:bg-white border border-slate-200/70 rounded-xl text-xs transition-colors"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                    task.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {task.completed ? "✓" : ""}
                </button>

                <span
                  className={`font-medium truncate ${
                    task.completed ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {task.title}
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 shrink-0 hidden sm:inline">
                  {task.assignedMember.split(" ")[0]}
                </span>

                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  ({task.serverTime})
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(task.id)}
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
