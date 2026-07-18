"use client";

/**
 * Tabla de usuarios del panel de admin, con filtros y acciones:
 * verificar/revocar empleadores, dar de baja/reactivar, cambiar rol,
 * y abrir la vista de inspección.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminGet, adminPost } from "@/lib/adminClient";

interface AdminUserRow {
  uid: string;
  email: string;
  displayName: string;
  role: "candidate" | "employer" | "admin";
  verified: boolean | null;
  disabled: boolean;
  createdAt: string | null;
}

type Filter = "all" | "candidate" | "employer" | "pending";

export function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGet<{ users: AdminUserRow[] }>("/api/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(
    uid: string,
    action: "setVerified" | "setDisabled" | "setRole",
    value: boolean | string
  ) {
    setBusyUid(uid);
    setError(null);
    try {
      await adminPost("/api/admin/actions", { action, uid, value });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar la acción.");
    } finally {
      setBusyUid(null);
    }
  }

  const filtered = users.filter((u) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pending"
          ? u.role === "employer" && u.verified === false
          : u.role === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
          {(["all", "candidate", "employer", "pending"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                filter === f ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f === "all"
                ? "Todos"
                : f === "candidate"
                  ? "Candidatos"
                  : f === "employer"
                    ? "Empleadores"
                    : "Por verificar"}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          onClick={load}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refrescar
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando usuarios…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No hay usuarios que coincidan.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.uid} className={u.disabled ? "bg-red-50/40" : ""}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${u.uid}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {u.displayName || "(sin nombre)"}
                    </Link>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.disabled && <Badge color="red">Dado de baja</Badge>}
                      {u.role === "employer" && u.verified === true && (
                        <Badge color="green">Verificado</Badge>
                      )}
                      {u.role === "employer" && u.verified === false && (
                        <Badge color="amber">Por verificar</Badge>
                      )}
                      {!u.disabled && u.role !== "employer" && (
                        <Badge color="gray">Activo</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {u.role === "employer" && (
                        <ActionButton
                          disabled={busyUid === u.uid}
                          onClick={() => runAction(u.uid, "setVerified", !u.verified)}
                        >
                          {u.verified ? "Revocar" : "Verificar"}
                        </ActionButton>
                      )}
                      <ActionButton
                        disabled={busyUid === u.uid}
                        danger={!u.disabled}
                        onClick={() => runAction(u.uid, "setDisabled", !u.disabled)}
                      >
                        {u.disabled ? "Reactivar" : "Dar de baja"}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "red" | "green" | "amber" | "gray";
}) {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        danger
          ? "border-red-300 text-red-700 hover:bg-red-50"
          : "border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
