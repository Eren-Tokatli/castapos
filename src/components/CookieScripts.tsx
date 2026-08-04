"use client";

import { useEffect } from "react";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "castapos-cookie-preferences";
const CONSENT_UPDATE_EVENT = "castapos:cookie-consent-updated";
const loadedScriptIds = new Set<string>();

const env = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  yandexMetricaId: process.env.NEXT_PUBLIC_YANDEX_METRICA_ID,
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

function injectExternalScript(id: string, src: string) {
  if (loadedScriptIds.has(id) || document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
  loadedScriptIds.add(id);
}

function injectInlineScript(id: string, code: string) {
  if (loadedScriptIds.has(id) || document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.text = code;
  document.head.appendChild(script);
  loadedScriptIds.add(id);
}

function loadGoogleTagBase(tagId: string) {
  injectExternalScript("castapos-google-tag-base", `https://www.googletagmanager.com/gtag/js?id=${tagId}`);
  injectInlineScript(
    "castapos-google-tag-init",
    `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = window.gtag || gtag;
      gtag('js', new Date());
    `
  );
}

function updateGoogleConsent(preferences: CookiePreferences) {
  injectInlineScript(
    "castapos-google-consent-default",
    `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = window.gtag || gtag;
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
    `
  );

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

  window.gtag("consent", "update", {
    ad_storage: preferences.marketing ? "granted" : "denied",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
  });
}

function loadGtm(preferences: CookiePreferences) {
  if (!env.gtmId || (!preferences.analytics && !preferences.marketing)) return;

  updateGoogleConsent(preferences);
  injectInlineScript(
    "castapos-gtm-init",
    `
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      (function(w,d,s,l,i){var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer',${JSON.stringify(env.gtmId)});
    `
  );
}

function loadAnalytics(preferences: CookiePreferences) {
  if (!preferences.analytics) return;

  if (env.ga4Id) {
    loadGoogleTagBase(env.ga4Id);
    updateGoogleConsent(preferences);
    injectInlineScript(
      "castapos-ga4-config",
      `window.gtag && window.gtag('config', ${JSON.stringify(env.ga4Id)}, { anonymize_ip: true });`
    );
  }

  if (env.yandexMetricaId) {
    injectInlineScript(
      "castapos-yandex-metrica",
      `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${env.yandexMetricaId}", "ym");
        ym(${JSON.stringify(env.yandexMetricaId)}, "init", {
          ssr: true,
          webvisor: true,
          clickmap: true,
          ecommerce: "dataLayer",
          referrer: document.referrer,
          url: location.href,
          trackLinks: true,
          accurateTrackBounce: true
        });
      `
    );
  }
}

function loadMarketing(preferences: CookiePreferences) {
  if (!preferences.marketing) return;

  const googleTagId = env.googleAdsId || env.ga4Id;
  if (googleTagId) {
    loadGoogleTagBase(googleTagId);
    updateGoogleConsent(preferences);
  }

  if (env.googleAdsId) {
    injectInlineScript(
      "castapos-google-ads-config",
      `window.gtag && window.gtag('config', ${JSON.stringify(env.googleAdsId)});`
    );
  }

  if (env.metaPixelId) {
    injectInlineScript(
      "castapos-meta-pixel",
      `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', ${JSON.stringify(env.metaPixelId)});
        fbq('track', 'PageView');
      `
    );
  }

  if (env.tiktokPixelId) {
    injectInlineScript(
      "castapos-tiktok-pixel",
      `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,
          ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");
          o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
          var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load(${JSON.stringify(env.tiktokPixelId)});
          ttq.page();
        }(window, document, 'ttq');
      `
    );
  }
}

function applyPreferences(preferences: CookiePreferences | null) {
  if (!preferences) return;

  loadGtm(preferences);
  loadAnalytics(preferences);
  loadMarketing(preferences);
}

export function CookieScripts() {
  useEffect(() => {
    const timer = window.setTimeout(() => applyPreferences(readPreferences()), 0);
    const handleConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ preferences?: CookiePreferences }>).detail;
      applyPreferences(detail?.preferences ?? readPreferences());
    };

    window.addEventListener(CONSENT_UPDATE_EVENT, handleConsentUpdate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_UPDATE_EVENT, handleConsentUpdate);
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      page?: () => void;
      track?: (...args: unknown[]) => void;
      load?: (...args: unknown[]) => void;
      [key: string]: unknown;
    };
    TiktokAnalyticsObject?: string;
  }
}
