export const peso = (value = 0) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const shortDate = (value) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
};

export const normalizeProduct = (product = {}) => {
  const stock = Math.max(0, Number(product.stock || 0));
  return {
    id: product.id || product._id,
    name: product.name || "Unnamed product",
    sku: product.sku || product.model || "",
    model: product.sku || product.model || "",
    brand: product.brand || "Generic",
    category: product.category || "split",
    specs: product.specs || "",
    features: Array.isArray(product.features) ? product.features : [],
    description: product.description || (product.features || []).join(", "),
    image: product.image || product.imageUrl || "",
    price: Number(product.price || 0),
    stock,
    stockLabel: stock <= 0 ? "Out of stock" : stock <= 5 ? "Low stock" : "In stock"
  };
};

export const normalizeAddress = (address = {}) => ({
  id: String(address.id || address._id || ""),
  label: String(address.label || ""),
  type: String(address.type || "home"),
  name: String(address.name || ""),
  phone: String(address.phone || ""),
  region: String(address.region || ""),
  province: String(address.province || ""),
  barangay: String(address.barangay || ""),
  street: String(address.street || ""),
  city: String(address.city || ""),
  postalCode: String(address.postalCode || ""),
  isDefault: Boolean(address.isDefault)
});

export const orderStatusLabel = (status) => {
  const map = {
    to_pay: "To Pay",
    to_deliver: "To Deliver",
    to_install: "To Install",
    complete: "Complete",
    cancelled: "Cancelled"
  };
  return map[status] || status || "Pending";
};
