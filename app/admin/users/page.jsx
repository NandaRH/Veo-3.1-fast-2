"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { usePathname } from "next/navigation";

const PLANS = [
  "free",
  "veo_lifetime",
  "veo_sora_unlimited",
  "monthly",
  "admin",
];

export default function AdminUsersPage() {
  const [items, setItems] = useState([]);
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      document.title = "Manage Users | Fokus AI";
    } catch (_) {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = "/login";
          return;
        }
      } catch (_) {}
    })();
    (async () => {
      try {
        const s = localStorage.getItem("adminSecret") || "";
        if (s) {
          setSecret(s);
          await loadUsers(s);
        }
      } catch (_) {}
    })();
  }, []);

  const loadUsers = async (sec) => {
    try {
      setStatus("Memuat...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = String(session?.access_token || "");
      const resp = await fetch("/api/admin/users", {
        headers: {
          "x-admin-secret": sec || secret,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) {
        setStatus(String(data?.error || "Gagal memuat"));
        return;
      }
      setItems(Array.isArray(data?.users) ? data.users : []);
      setStatus("");
    } catch (e) {
      setStatus(String(e?.message || e));
    }
  };

  const updatePlan = async (id, plan) => {
    try {
      setStatus("Menyimpan...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = String(session?.access_token || "");
      const resp = await fetch(`/api/admin/users/${id}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setStatus(String(data?.error || "Gagal menyimpan"));
        return;
      }
      setItems((prev) => prev.map((x) => (x.id === id ? data.user : x)));
      setStatus("Berhasil.");
    } catch (e) {
      setStatus(String(e?.message || e));
    }
  };

  return (
    <div
      className="app-shell prompt-shell"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header className="page-header" style={{ position: "relative" }}>
        <div className="page-brand">
          <img src="/images/fokusAI.png" alt="FokusAI" className="brand-logo" />
          <div className="brand-text">
            <span className="page-badge">FokusAI Studio</span>
            <h1 className="page-title">Admin Users</h1>
            <p className="page-subtitle">Kelola paket user.</p>
          </div>
        </div>
        <div
          style={{ display: "flex", gap: 8, alignItems: "center" }}
          ref={userMenuRef}
        >
          <a
            href="/prompt-tunggal"
            className="settings-btn"
            title="Video Generator"
          >
            <span aria-hidden="true">🎬</span>
            <span className="sr-only">Video Generator</span>
          </a>
          <a
            href="/image-generator"
            className="settings-btn"
            title="Image Generator"
          >
            <span aria-hidden="true">🖼️</span>
            <span className="sr-only">Image Generator</span>
          </a>
          <a href="/sora2" className="settings-btn" title="Sora 2">
            <span aria-hidden="true">🎞️</span>
            <span className="sr-only">Sora 2</span>
          </a>
          <div className="user-menu">
            <button
              className="settings-btn user-btn"
              aria-haspopup="true"
              aria-expanded={showUserMenu ? "true" : "false"}
              title="Admin menu"
              onClick={(e) => {
                e.preventDefault();
                setShowUserMenu((v) => !v);
              }}
            >
              <span aria-hidden="true">👤</span>
              <span className="sr-only">Admin menu</span>
            </button>
            <div
              className={`user-menu-dropdown ${showUserMenu ? "show" : ""}`}
              hidden={!showUserMenu}
            >
              {pathname !== "/admin/dashboard" ? (
                <button
                  className="user-menu-item"
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin/dashboard";
                    setShowUserMenu(false);
                  }}
                >
                  <span aria-hidden="true">🏛️</span>
                  <span>Admin Dashboard</span>
                </button>
              ) : null}
              {pathname !== "/admin/users" ? (
                <button
                  className="user-menu-item"
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin/users";
                    setShowUserMenu(false);
                  }}
                >
                  <span aria-hidden="true">👥</span>
                  <span>Manage Users</span>
                </button>
              ) : null}
              <div className="user-menu-divider"></div>
              <button
                className="user-menu-item"
                type="button"
                onClick={() => {
                  setShowLogoutModal(true);
                  setShowUserMenu(false);
                }}
              >
                <span aria-hidden="true">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, padding: 24 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            className="dropdown"
            type="password"
            placeholder="Admin Secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            style={{ maxWidth: 300 }}
          />
          <button
            className="btn primary"
            type="button"
            onClick={async () => {
              localStorage.setItem("adminSecret", secret);
              await loadUsers(secret);
            }}
          >
            Load Users
          </button>
          {status ? (
            <div className="feature-sub" style={{ marginLeft: 8 }}>
              {status}
            </div>
          ) : null}
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 8px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ textAlign: "left", color: "#f4d03f", fontWeight: 700 }}
              >
                Email
              </th>
              <th
                style={{ textAlign: "left", color: "#f4d03f", fontWeight: 700 }}
              >
                Nama
              </th>
              <th
                style={{ textAlign: "left", color: "#f4d03f", fontWeight: 700 }}
              >
                Plan
              </th>
              <th
                style={{ textAlign: "left", color: "#f4d03f", fontWeight: 700 }}
              >
                Veo
              </th>
              <th
                style={{ textAlign: "left", color: "#f4d03f", fontWeight: 700 }}
              >
                Sora 2
              </th>
              <th
                style={{ textAlign: "left", color: "#f4d03f", fontWeight: 700 }}
              >
                Image
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td style={{ color: "#f5e6d3" }}>{u.email}</td>
                <td style={{ color: "#f5e6d3" }}>{u.full_name || "-"}</td>
                <td>
                  <select
                    className="dropdown"
                    value={u.plan || "free"}
                    onChange={(e) => updatePlan(u.id, e.target.value)}
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ color: "#f5e6d3" }}>{Number(u.veo_count || 0)}</td>
                <td style={{ color: "#f5e6d3" }}>
                  {Number(u.sora2_count || 0)}
                </td>
                <td style={{ color: "#f5e6d3" }}>
                  {Number(u.image_count || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      {showLogoutModal && (
        <div
          className="modal show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
          style={{ backdropFilter: "blur(10px)" }}
        >
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: "#f4d03f" }}>
                Konfirmasi Logout
              </div>
              <button
                className="btn ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Tutup
              </button>
            </div>
            <div
              className="modal-body"
              style={{ flexDirection: "column", gap: 10 }}
            >
              <div style={{ color: "#e2e8f0", fontWeight: 600 }}>
                Apakah Anda yakin ingin logout?
              </div>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>
                Sesi Anda akan diakhiri dan Anda akan kembali ke halaman login.
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ justifyContent: "flex-end", gap: 10 }}
            >
              <button
                className="btn ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  (async () => {
                    try {
                      if (supabase) await supabase.auth.signOut();
                    } catch {}
                    try {
                      await fetch("/api/session/logout", { method: "POST" });
                    } catch (_) {}
                    try {
                      document.cookie = "plan=; path=/; max-age=0";
                      document.cookie = "uid=; path=/; max-age=0";
                      document.cookie = "email=; path=/; max-age=0";
                      document.cookie = "name=; path=/; max-age=0";
                      document.cookie = "username=; path=/; max-age=0";
                    } catch (_) {}
                    window.location.href = "/login";
                  })();
                }}
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
