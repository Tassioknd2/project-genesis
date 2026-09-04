import { User, UserRole, UserStatus } from "../domain/auth.types";
import { NotFoundError } from "../domain/errors";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(data: Omit<User, "id" | "criadoEm" | "atualizadoEm"> & { id?: string }): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  list(filter?: { role?: UserRole; status?: UserStatus; search?: string }): Promise<User[]>;
  delete(id: string): Promise<void>;
}

// Usuários iniciais para desenvolvimento/produção inicial
// Senha padrão inicial para contas de teste: Cardio@2026
// Gerado via scrypt: salt:derivedKeyHex
const initialUsers: User[] = [
  {
    id: "usr_admin_1",
    nome: "Dr. Carlos Mendes",
    email: "carlos.mendes@cardioagenda.com.br",
    // Senha padrão inicial: Cardio@2026
    passwordHash:
      "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4:b779e694960c8ca7cbd57eeb48df947707989ad728c87c090cacc5ad4067b206e93806826199157dd3158483e4d1d82b250840e2f3cb518e96fbef31349e6ec0",
    role: "medico",
    status: "ativo",
    provider: "local",
    crm: "SP-123456",
    telefone: "(11) 98765-4321",
    emailVerificado: true,
    avatarUrl: "",
    criadoEm: "2026-01-01T08:00:00.000Z",
    atualizadoEm: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "usr_recep_1",
    nome: "Ana Beatriz Ramos",
    email: "ana.recepcao@cardioagenda.com.br",
    // Senha padrão inicial: Cardio@2026
    passwordHash:
      "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4:b779e694960c8ca7cbd57eeb48df947707989ad728c87c090cacc5ad4067b206e93806826199157dd3158483e4d1d82b250840e2f3cb518e96fbef31349e6ec0",
    role: "recepcionista",
    status: "ativo",
    provider: "local",
    telefone: "(11) 97654-3210",
    emailVerificado: true,
    avatarUrl: "",
    criadoEm: "2026-01-01T08:30:00.000Z",
    atualizadoEm: "2026-01-01T08:30:00.000Z",
  },
];

export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    for (const u of initialUsers) {
      this.users.set(u.id, { ...u });
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase().trim() === cleanEmail) {
        return { ...user };
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return { ...user };
      }
    }
    return null;
  }

  async create(
    data: Omit<User, "id" | "criadoEm" | "atualizadoEm"> & { id?: string },
  ): Promise<User> {
    const now = new Date().toISOString();
    const id = data.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const user: User = {
      ...data,
      id,
      email: data.email.toLowerCase().trim(),
      criadoEm: now,
      atualizadoEm: now,
    };

    this.users.set(id, user);
    return { ...user };
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new NotFoundError("Usuário", id);
    }

    const updated: User = {
      ...existing,
      ...updates,
      id, // Imutável
      email: updates.email ? updates.email.toLowerCase().trim() : existing.email,
      atualizadoEm: new Date().toISOString(),
    };

    this.users.set(id, updated);
    return { ...updated };
  }

  async updateLastLogin(id: string): Promise<void> {
    const existing = this.users.get(id);
    if (existing) {
      existing.ultimoLoginEm = new Date().toISOString();
      this.users.set(id, existing);
    }
  }

  async list(filter?: { role?: UserRole; status?: UserStatus; search?: string }): Promise<User[]> {
    let list = Array.from(this.users.values());

    if (filter?.role) {
      list = list.filter((u) => u.role === filter.role);
    }

    if (filter?.status) {
      list = list.filter((u) => u.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (u) => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

export const userRepository = new UserRepository();
