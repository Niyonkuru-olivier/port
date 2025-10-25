export class ReportFilterDto {
    item: string;
    type: 'daily' | 'custom';
    format: 'pdf' | 'xlsx' | 'csv';
    startDate: Date;
    endDate: Date;
    selectedIds?: number[];  // Array of selected item IDs

    constructor() {
        this.item = '';
        this.type = 'daily';
        this.format = 'pdf';
        this.startDate = new Date();
        this.endDate = new Date();
        this.selectedIds = [];
    }
}
