import { apiRequest } from "./api";

export function listPublicProducts() {
  return apiRequest<{ products: any[] }>("/products/public");
}

export function getProductImageUrl(productId: string | number) {
  return `/products/${productId}/image`;
}
