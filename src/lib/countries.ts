/**
 * Países soportados (Centroamérica) con su divisa.
 * El país determina qué vacantes ve cada usuario y la moneda del salario.
 */
export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string; // ISO 4217
  symbol: string;
}

export const CENTRAL_AMERICA: Country[] = [
  { code: "GT", name: "Guatemala", flag: "🇬🇹", currency: "GTQ", symbol: "Q" },
  { code: "BZ", name: "Belice", flag: "🇧🇿", currency: "BZD", symbol: "BZ$" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", currency: "USD", symbol: "$" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", currency: "HNL", symbol: "L" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", currency: "NIO", symbol: "C$" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", currency: "CRC", symbol: "₡" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", currency: "USD", symbol: "$" },
];

export function getCountry(code?: string | null): Country | undefined {
  return CENTRAL_AMERICA.find((c) => c.code === code);
}

export function currencyOf(code?: string | null): string {
  return getCountry(code)?.currency ?? "USD";
}

export function countryName(code?: string | null): string {
  return getCountry(code)?.name ?? "—";
}
