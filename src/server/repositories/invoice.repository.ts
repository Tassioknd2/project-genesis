import { Invoice } from "../domain/subscription.types";

export interface IInvoiceRepository {
  findByUserId(userId: string): Promise<Invoice[]>;
  findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
  findById(id: string): Promise<Invoice | null>;
  findByGatewayInvoiceId(gatewayInvoiceId: string): Promise<Invoice | null>;
  create(invoice: Invoice): Promise<Invoice>;
  update(id: string, updates: Partial<Invoice>): Promise<Invoice>;
}

const initialInvoices: Invoice[] = [
  {
    id: "inv_2026_09_01",
    subscriptionId: "sub_admin_1",
    userId: "usr_admin_1",
    numeroFatura: "FAT-2026-09",
    valor: 89.9,
    status: "paga",
    metodoPagamento: "cartao",
    dataEmissao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dataPagamento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cartaoUltimosDigitos: "4242",
    gatewayInvoiceId: "inv_sbx_09",
  },
  {
    id: "inv_2026_08_01",
    subscriptionId: "sub_admin_1",
    userId: "usr_admin_1",
    numeroFatura: "FAT-2026-08",
    valor: 89.9,
    status: "paga",
    metodoPagamento: "cartao",
    dataEmissao: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    dataVencimento: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    dataPagamento: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    cartaoUltimosDigitos: "4242",
    gatewayInvoiceId: "inv_sbx_08",
  },
];

export class InvoiceRepository implements IInvoiceRepository {
  private invoices: Map<string, Invoice> = new Map();

  constructor() {
    for (const inv of initialInvoices) {
      this.invoices.set(inv.id, { ...inv });
    }
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    const list: Invoice[] = [];
    for (const inv of this.invoices.values()) {
      if (inv.userId === userId) {
        list.push({ ...inv });
      }
    }
    // Ordena da mais recente para a mais antiga
    return list.sort(
      (a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime(),
    );
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    const list: Invoice[] = [];
    for (const inv of this.invoices.values()) {
      if (inv.subscriptionId === subscriptionId) {
        list.push({ ...inv });
      }
    }
    return list.sort(
      (a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime(),
    );
  }

  async findById(id: string): Promise<Invoice | null> {
    const inv = this.invoices.get(id);
    return inv ? { ...inv } : null;
  }

  async findByGatewayInvoiceId(gatewayInvoiceId: string): Promise<Invoice | null> {
    for (const inv of this.invoices.values()) {
      if (inv.gatewayInvoiceId === gatewayInvoiceId) {
        return { ...inv };
      }
    }
    return null;
  }

  async create(invoice: Invoice): Promise<Invoice> {
    this.invoices.set(invoice.id, { ...invoice });
    return { ...invoice };
  }

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const existing = this.invoices.get(id);
    if (!existing) {
      throw new Error(`Fatura ${id} não encontrada.`);
    }
    const updated = { ...existing, ...updates };
    this.invoices.set(id, updated);
    return { ...updated };
  }
}

export const invoiceRepository = new InvoiceRepository();
