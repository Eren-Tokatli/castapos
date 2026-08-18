// T.C. Kimlik No doğrulama — resmi checksum algoritması.
// Rastgele/uydurma 11 haneli sayıların geçmesini engeller.
// Kural: 11 hane, ilk hane 0 olamaz, 10. ve 11. haneler diğer
// hanelerden hesaplanan checksum'a eşit olmalı.
export function isValidTcKimlikNo(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) return false;

  const d = value.split("").map(Number);
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];

  const digit10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (digit10 !== d[9]) return false;

  const digit11 = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  if (digit11 !== d[10]) return false;

  return true;
}
