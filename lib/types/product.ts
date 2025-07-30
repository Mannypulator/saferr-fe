// types/product.ts
export interface Product {
  id: string; // GUID as string
  name: string;
  description: string | null;
  identifier: string | null; // E.g., SKU, GTIN
  brandId: string; // GUID as string
  // brand?: Brand; // Omitting for now, might be included by backend
}