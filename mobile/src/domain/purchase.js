export const VAT_RATE = 0.12;

export const DELIVERY_FEES = {
  bulacan: 500,
  cavite: 650,
  laguna: 650,
  bataan: 800,
  pangasinan: 950,
  ilocos: 1200
};

export function computePurchaseTotals({ subtotal, serviceAreaId, discountAmount = 0 }) {
  const deliveryFee = DELIVERY_FEES[String(serviceAreaId || "bulacan").toLowerCase()] ?? 500;
  const taxableBase = Math.max(0, Number(subtotal || 0) - Number(discountAmount || 0));
  const vatAmount = Math.round(taxableBase * VAT_RATE * 100) / 100;
  const total = Math.round((taxableBase + vatAmount + deliveryFee) * 100) / 100;
  return { subtotal, vatAmount, deliveryFee, discountAmount, total };
}

const normalize = (value = "") => String(value).trim().toLowerCase();

export function resolvePreferredBranch(address = {}) {
  const keys = [
    normalize(address.city),
    normalize(address.province),
    normalize(address.region),
    normalize(address.barangay),
    normalize(address.street)
  ].filter(Boolean);

  if (keys.some((key) => ["manila", "quezon city"].includes(key))) return "Bulacan";
  if (keys.some((key) => ["laguna", "cavite", "batangas"].includes(key))) return "Laguna";
  if (keys.some((key) => ["pangasinan", "tarlac"].includes(key))) return "Pangasinan";

  const lookups = {
    bulacan: "Bulacan",
    plaridel: "Bulacan",
    malolos: "Bulacan",
    cavite: "Cavite",
    bacoor: "Cavite",
    dasmarinas: "Cavite",
    laguna: "Laguna",
    cabuyao: "Laguna",
    bataan: "Bataan",
    balanga: "Bataan",
    pangasinan: "Pangasinan",
    dagupan: "Pangasinan",
    ilocos: "Ilocos",
    "la union": "Ilocos",
    "san fernando": "Ilocos"
  };

  for (const key of keys) {
    if (lookups[key]) return lookups[key];
    const fuzzy = Object.keys(lookups).find((candidate) => key.includes(candidate));
    if (fuzzy) return lookups[fuzzy];
  }
  return "Bulacan";
}
