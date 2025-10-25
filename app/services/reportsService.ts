const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/reports`;

export const reportsService = {
  async getInventoryItems() {
    const res = await fetch(`${API_URL}/inventory-items`);
    if (!res.ok) throw new Error("Failed to fetch inventory items");
    return res.json();
  },

  async getAssetItems() {
    const res = await fetch(`${API_URL}/asset-items`);
    if (!res.ok) throw new Error("Failed to fetch asset items");
    return res.json();
  },

  async generateInventoryReport(data: {
    items: string[];
    type: string;
    format: string;
    startDate: Date;
    endDate: Date;
  }) {
    const payload = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    };

    const res = await fetch(`${API_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: getAcceptHeader(data.format),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to generate inventory report");
    return await res.blob();
  },

  async generateAssetReport(data: {
    items: string[];
    type: string;
    format: string;
    startDate: Date;
    endDate: Date;
  }) {
    const payload = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    };

    const res = await fetch(`${API_URL}/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: getAcceptHeader(data.format),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to generate asset report");
    return await res.blob();
  },
};

// Helper for Accept header
function getAcceptHeader(format: string): string {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
}
