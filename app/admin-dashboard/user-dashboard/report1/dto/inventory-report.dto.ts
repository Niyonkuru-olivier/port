export class InventoryReportDto {
    id: number;
    name: string;
    description: string;
    sku: string;
    qtyIn: number;
    qtyOut: number;
    balanceQty: number;
    unitPrice: number;
    totalPrice: number;
  
    constructor(data: Partial<InventoryReportDto> = {}) {
      this.id = data.id ?? 0;
      this.name = data.name ?? '';
      this.description = data.description ?? '';
      this.sku = data.sku ?? '';
      this.qtyIn = data.qtyIn ?? 0;
      this.qtyOut = data.qtyOut ?? 0;
      this.balanceQty = data.balanceQty ?? 0;
      this.unitPrice = data.unitPrice ?? 0;
      this.totalPrice = data.totalPrice ?? 0;
    }
  }
  