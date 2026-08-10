import { RotateCcw, PackageX, Truck, Shirt, FileText, Headset, type LucideIcon } from "lucide-react";

export type TicketReason = {
  code: string;
  label: string;
  icon: LucideIcon;
  /** If set, selecting this reason redirects here instead of opening a ticket form. */
  redirectTo?: string;
};

export const TICKET_REASONS: TicketReason[] = [
  { code: "KOLAY_IADE", label: "Kolay iade talebi açmak istiyorum", icon: RotateCcw },
  { code: "KUSURLU_YANLIS", label: "Kusurlu / Yanlış ürünüm var", icon: PackageX },
  { code: "EKSIK_TESLIM", label: "Eksik / Teslim edilmeyen siparişim var", icon: Truck },
  { code: "BEDEN_RENK", label: "Beden / Renk değişimi yapmak istiyorum", icon: Shirt },
  { code: "FATURA", label: "Fatura talebi oluşturmak istiyorum", icon: FileText },
  { code: "MUSTERI_HIZMETLERI", label: "Müşteri Hizmetleri'ne Sorun", icon: Headset, redirectTo: "/hesap/musteri-hizmetleri" },
];
