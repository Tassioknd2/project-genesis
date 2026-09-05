import { AuditLog } from "../domain/types";

export class AuditLogRepository {
  private logs: AuditLog[] = [];

  async log(entry: Omit<AuditLog, "id" | "criadoEm">): Promise<AuditLog> {
    const log: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      criadoEm: new Date().toISOString(),
    };
    this.logs.unshift(log); // mais recentes primeiro
    return { ...log };
  }

  async findByEntity(entidade: AuditLog["entidade"], entidadeId?: string): Promise<AuditLog[]> {
    let result = this.logs.filter((l) => l.entidade === entidade);
    if (entidadeId) {
      result = result.filter((l) => l.entidadeId === entidadeId);
    }
    return result.map((l) => ({ ...l }));
  }

  async findRecent(limit = 50): Promise<AuditLog[]> {
    return this.logs.slice(0, limit).map((l) => ({ ...l }));
  }
}

export const auditLogRepository = new AuditLogRepository();
