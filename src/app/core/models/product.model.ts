export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  priceSell: number;
  priceCost?: number;
  stockQuantity: number;
  stockAlertMin: number;
  forSale: boolean;
  active: boolean;
  category?: string;
  photoUrl?: string;
}
