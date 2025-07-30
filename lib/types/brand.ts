export interface Brand {
  id: string; // GUID as string
  name: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  // products: Product[]; // Omitting for now, fetch separately if needed
}