const DISPOSABLE_DOMAINS = [
  "yopmail.com",
  "tempmail.com",
  "dispostable.com",
  "disposable.com",
  "mailinator.com",
  "getairmail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "10minutemail.com",
  "trashmail.com",
  "fakeinbox.com",
  "generator.email",
  "temp-mail.org",
  "moakt.com",
  "fakemailgenerator.com",
  "crazymailing.com",
  "tempmailaddress.com",
  "tempmail.net",
  "guerrillamailblock.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "pokemail.net",
  "grr.la",
  "block.com",
  "disposablemail.com",
  "mailnesia.com",
  "dismail.de",
  "mailcatch.com",
  "maildrop.cc",
  "getnada.com",
  "tempmailo.com",
];

const LETTERS_ONLY = /^[a-zA-ZçğıöşüÇĞİÖŞÜ\s'-]+$/;
const CONSONANT_RUN = /[bcçdfgğhjklmnprsştvyzBCÇDFGĞHJKLMNPRSŞTVYZ]{5,}/;
const MIXED_CASE_NOISE = /[a-zçğıöşü]{2,}[A-ZÇĞİÖŞÜ]{2,}|[A-ZÇĞİÖŞÜ]{2,}[a-zçğıöşü]{2,}/;
const COMMON_PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "yahoo.com",
  "yandex.com",
]);

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function isDisposableEmail(email: string): boolean {
  const parts = normalizeEmail(email).split("@");
  if (parts.length !== 2) return true;
  const domain = parts[1];
  return DISPOSABLE_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`));
}

export function isSuspiciousEmail(email: string): boolean {
  const cleanEmail = normalizeEmail(email);
  const [localPart, domain] = cleanEmail.split("@");

  if (!localPart || !domain || localPart.length < 3 || localPart.length > 64) return true;

  const dotParts = localPart.split(".").filter(Boolean);
  const singleLetterParts = dotParts.filter((part) => /^[a-z]$/.test(part)).length;
  const hasTooManyDots = dotParts.length >= 4 || singleLetterParts >= 2;
  const alphaLocal = localPart.replace(/[^a-z]/g, "");
  const consonantCount = (alphaLocal.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const consonantRatio = alphaLocal.length ? consonantCount / alphaLocal.length : 0;

  if (COMMON_PUBLIC_EMAIL_DOMAINS.has(domain) && hasTooManyDots) return true;
  if (alphaLocal.length >= 13 && consonantRatio > 0.78) return true;

  return false;
}

export function isSuspiciousNamePart(value: string): boolean {
  const name = value.trim();
  const letters = name.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, "");

  if (letters.length < 2 || letters.length > 28) return true;
  if (!LETTERS_ONLY.test(name)) return true;
  if (CONSONANT_RUN.test(letters)) return true;
  if (MIXED_CASE_NOISE.test(letters)) return true;

  const lowercaseCount = (letters.match(/[a-zçğıöşü]/g) || []).length;
  const uppercaseCount = (letters.match(/[A-ZÇĞİÖŞÜ]/g) || []).length;
  if (letters.length >= 8 && lowercaseCount > 0 && uppercaseCount >= 3) return true;

  return false;
}

export function validateCustomerIdentity(input: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const email = normalizeEmail(input.email);

  if (!email || !email.includes("@")) {
    return "Geçersiz e-posta adresi.";
  }

  if (isDisposableEmail(email) || isSuspiciousEmail(email)) {
    return "Bu e-posta adresiyle işlem yapılamaz. Lütfen gerçek ve kişisel e-posta adresinizi kullanın.";
  }

  if (input.firstName !== undefined && isSuspiciousNamePart(input.firstName || "")) {
    return "Lütfen gerçek adınızı kullanın.";
  }

  if (input.lastName !== undefined && isSuspiciousNamePart(input.lastName || "")) {
    return "Lütfen gerçek soyadınızı kullanın.";
  }

  return null;
}
