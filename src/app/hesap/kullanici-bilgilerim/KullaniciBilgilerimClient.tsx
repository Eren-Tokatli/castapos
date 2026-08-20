"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { updateProfile } from "./actions";
import { AddressesClient } from "../adreslerim/AddressesClient";
import { PasswordChangeForm } from "./PasswordChangeForm";

interface Address {
  label?: string | null;
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode: string;
  province?: string | null;
  country: string;
  deliveryPhone?: string | null;
  directions?: string | null;
  isDefault: boolean;
}

export function KullaniciBilgilerimClient({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialPhone,
  initialAddresses,
}: {
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  initialPhone: string;
  initialAddresses: Address[];
}) {
  const { update: updateSession } = useSession();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await updateProfile({ firstName, lastName, phone });

    if (res.success) {
      // Refresh the JWT session client-side so the header name/avatar
      // update immediately, without needing to log out and back in.
      await updateSession({ name: `${firstName} ${lastName}`.trim() });
    }

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Bilgiler kaydedilemedi.");
      return;
    }
    setSaved(true);
  };

  return (
    <>
      <div className="account-panel-hero">
        <h1>Kullanıcı Bilgilerim</h1>
        <p>Ad, soyad ve telefon bilgilerini güncel tutarak teslimat ve destek süreçlerinin sorunsuz ilerlemesini sağla.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Ad
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>

        <label>
          Soyad
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>

        <label>
          E-posta
          <input type="email" value={initialEmail} disabled />
        </label>

        <label>
          Telefon
          <div className="phone-input-wrapper">
            <span className="phone-prefix">+90</span>
            <input
              type="text"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="5xxxxxxxxx"
              autoComplete="tel"
              className="phone-input-field"
            />
          </div>
        </label>

        {error && <p style={{ color: "#b42318", fontSize: 13, gridColumn: "1 / -1", margin: 0 }}>{error}</p>}
        {saved && (
          <p style={{ color: "#067647", fontSize: 13, gridColumn: "1 / -1", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={14} /> Bilgilerin kaydedildi.
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ gridColumn: "1 / -1" }}>
          {loading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
        </button>
      </form>

      <div style={{ marginTop: 34 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>Adreslerim</h2>
        <p style={{ color: "#667085", fontSize: 14, margin: "0 0 16px" }}>
          Teslimat işlemlerinde kullanmak üzere kayıtlı adreslerini buradan yönet.
        </p>
        <AddressesClient initialAddresses={initialAddresses} />
      </div>

      <div style={{ marginTop: 34, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
        <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>Şifre Değişikliği</h2>
        <p style={{ color: "#667085", fontSize: 14, margin: 0 }}>
          Hesabının güvenliği için düzenli olarak şifreni güncelle.
        </p>
        <PasswordChangeForm />
      </div>
    </>
  );
}
