"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { changePassword } from "./actions";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const res = await changePassword({ currentPassword, newPassword });
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Şifre değiştirilemedi.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} style={{ marginTop: 18 }}>
      <label style={{ gridColumn: "1 / -1" }}>
        Mevcut Şifre
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <label>
        Yeni Şifre
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label>
        Yeni Şifre (Tekrar)
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {error && <p style={{ color: "#b42318", fontSize: 13, gridColumn: "1 / -1", margin: 0 }}>{error}</p>}
      {saved && (
        <p style={{ color: "#067647", fontSize: 13, gridColumn: "1 / -1", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Check size={14} /> Şifren güncellendi.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ gridColumn: "1 / -1" }}>
        {loading ? "Kaydediliyor..." : "Şifreyi Değiştir"}
      </button>
    </form>
  );
}
