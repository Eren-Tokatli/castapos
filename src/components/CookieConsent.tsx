"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "castapos-cookie-preferences";
const CONSENT_UPDATE_EVENT = "castapos:cookie-consent-updated";

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function readPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<CookiePreferences>;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };
  } catch {
    return null;
  }
}

function savePreferences(preferences: CookiePreferences) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...preferences,
      savedAt: new Date().toISOString(),
      version: 1,
    })
  );
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATE_EVENT, { detail: { preferences } }));
}

function shouldReloadAfterRevocation(previous: CookiePreferences | null, next: CookiePreferences) {
  return !!previous && ((previous.analytics && !next.analytics) || (previous.marketing && !next.marketing));
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [hasConsent, setHasConsent] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readPreferences();
      setMounted(true);
      setHasConsent(!!saved);
      if (saved) {
        setPreferences(saved);
      }
    }, 0);

    const openPreferences = () => {
      setShowPreferences(true);
      setHasConsent(true);
    };

    window.addEventListener("castapos:open-cookie-preferences", openPreferences);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("castapos:open-cookie-preferences", openPreferences);
    };
  }, []);

  const acceptNecessary = () => {
    const next = { ...defaultPreferences };
    const previous = readPreferences();
    savePreferences(next);
    setPreferences(next);
    setHasConsent(true);
    setShowPreferences(false);
    if (shouldReloadAfterRevocation(previous, next)) {
      window.location.reload();
    }
  };

  const acceptAll = () => {
    const next: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(next);
    setPreferences(next);
    setHasConsent(true);
    setShowPreferences(false);
  };

  const saveSelected = () => {
    const previous = readPreferences();
    savePreferences(preferences);
    setHasConsent(true);
    setShowPreferences(false);
    if (shouldReloadAfterRevocation(previous, preferences)) {
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <>
      {!hasConsent && (
        <div className="cookie-consent-banner" role="region" aria-label="Çerez bilgilendirmesi">
          <div className="cookie-consent-icon" aria-hidden="true">
            <Cookie size={22} />
          </div>
          <div className="cookie-consent-copy">
            <b>Castapos deneyimini iyileştirmek için çerezler kullanıyoruz.</b>
            <p>
              Zorunlu çerezler platformun çalışması için gereklidir. Analitik ve pazarlama çerezleri yalnızca
              izin vermen halinde aktif edilir.
            </p>
            <Link href="/sozlesmeler/cerez-politikasi">Çerez Politikasını incele</Link>
          </div>
          <div className="cookie-consent-actions">
            <button type="button" className="btn btn-soft" onClick={acceptNecessary}>
              Zorunlu çerezler
            </button>
            <button type="button" className="btn btn-soft" onClick={() => setShowPreferences(true)}>
              Tercihleri yönet
            </button>
            <button type="button" className="btn btn-primary" onClick={acceptAll}>
              Tümünü kabul et
            </button>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="cookie-preferences-backdrop" onClick={() => setShowPreferences(false)}>
          <section className="cookie-preferences-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cookie-preferences-head">
              <div>
                <span>
                  <Settings2 size={15} />
                  Çerez tercihleri
                </span>
                <h2>Hangi çerezleri kullanabileceğimizi seç.</h2>
              </div>
              <button type="button" aria-label="Kapat" onClick={() => setShowPreferences(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="cookie-preference-list">
              <article>
                <div>
                  <ShieldCheck size={18} />
                  <span>
                    <b>Zorunlu çerezler</b>
                    <small>Oturum, güvenlik, sepet ve temel site işlevleri için gereklidir.</small>
                  </span>
                </div>
                <strong>Her zaman aktif</strong>
              </article>

              <label>
                <span>
                  <b>Analitik çerezleri</b>
                  <small>Google Analytics 4, Yandex Metrica ve Webvisor ölçümlerini destekler.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, analytics: event.target.checked }))}
                />
              </label>

              <label>
                <span>
                  <b>Pazarlama çerezleri</b>
                  <small>Google Ads, Meta Pixel ve TikTok Pixel dönüşüm ölçümlerini destekler.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, marketing: event.target.checked }))}
                />
              </label>
            </div>

            <div className="cookie-preferences-actions">
              <button type="button" className="btn btn-soft" onClick={acceptNecessary}>
                Zorunlu ile devam et
              </button>
              <button type="button" className="btn btn-soft" onClick={saveSelected}>
                Seçimi kaydet
              </button>
              <button type="button" className="btn btn-primary" onClick={acceptAll}>
                Tümünü kabul et
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
