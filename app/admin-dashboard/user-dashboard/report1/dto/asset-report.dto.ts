export class AssetReportDto {
    id: number;
    name: string;
    description: string;
    sku: string;
    qty_in: number;
    qty_out: number;
    balance_qty: number;
    unit_price: number;
    total_price: number;
  
    constructor(data: Partial<AssetReportDto> = {}) {
      this.id = data.id ?? 0;
      this.name = data.name ?? '';
      this.description = data.description ?? '';
      this.sku = data.sku ?? '';
      this.qty_in = data.qty_in ?? 0;
      this.qty_out = data.qty_out ?? 0;
      this.balance_qty = data.balance_qty ?? 0;
      this.unit_price = data.unit_price ?? 0;
      this.total_price = data.total_price ?? 0;
    }
  }
  