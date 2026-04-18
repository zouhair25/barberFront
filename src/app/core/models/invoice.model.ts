export interface Invoice {
  id: number;
  invoiceNumber: string;
  issuedAt: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  pdfUrl?: string;
  notes?: string;
  lines: InvoiceLine[];
  client: { id: number; firstName: string; lastName: string; email: string };
}

export interface InvoiceLine {
  id: number;
  lineType: 'SERVICE' | 'PRODUCT';
  label: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CheckoutRequest {
  appointmentId: number;
  products?: { productId: number; quantity: number }[];
  taxRate?: number;
  notes?: string;
  generatePdf: boolean;
}
