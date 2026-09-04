import { Profile } from "../domain/subscription.types";

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile[]>;
  findById(id: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  countByUserId(userId: string): Promise<{ total: number; usuarios: number; crm: number }>;
  create(profile: Profile): Promise<Profile>;
  update(id: string, updates: Partial<Profile>): Promise<Profile>;
  delete(id: string): Promise<void>;
}

const initialProfiles: Profile[] = [
  // Perfis da conta Dr. Carlos Mendes (Plano Avançado: 1 Médico + 1 Atendente + 1 CRM)
  {
    id: "prf_carlos",
    userId: "usr_admin_1",
    nome: "Dr. Carlos Mendes",
    email: "carlos.mendes@cardioagenda.com.br",
    role: "medico",
    tipo: "usuario",
    crm: "SP-123456",
    avatarColor: "#2563EB", // Azul Clínico
    avatarIcon: "stethoscope",
    isPrimary: true,
    criadoEm: "2026-01-01T08:00:00.000Z",
    atualizadoEm: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "prf_ana",
    userId: "usr_admin_1",
    nome: "Ana Beatriz (Atendente)",
    email: "ana.recepcao@cardioagenda.com.br",
    role: "recepcionista",
    tipo: "usuario",
    avatarColor: "#10B981", // Verde Esmeralda
    avatarIcon: "user",
    isPrimary: false,
    criadoEm: "2026-01-01T08:30:00.000Z",
    atualizadoEm: "2026-01-01T08:30:00.000Z",
  },
  {
    id: "prf_crm_comercial",
    userId: "usr_admin_1",
    nome: "Gestão Comercial & CRM",
    email: "carlos.mendes@cardioagenda.com.br",
    role: "crm_admin",
    tipo: "crm",
    avatarColor: "#8B5CF6", // Roxo Executivo
    avatarIcon: "shield",
    isPrimary: false,
    criadoEm: "2026-01-02T11:00:00.000Z",
    atualizadoEm: "2026-01-02T11:00:00.000Z",
  },
  // Perfil da conta individual (Plano Essencial: 1 Médico + 1 Atendente)
  {
    id: "prf_recep_solo",
    userId: "usr_recep_1",
    nome: "Ana Beatriz Ramos",
    email: "ana.recepcao@cardioagenda.com.br",
    role: "recepcionista",
    tipo: "usuario",
    avatarColor: "#10B981",
    avatarIcon: "user",
    isPrimary: true,
    criadoEm: "2026-01-01T08:30:00.000Z",
    atualizadoEm: "2026-01-01T08:30:00.000Z",
  },
];

export class ProfileRepository implements IProfileRepository {
  private profiles: Map<string, Profile> = new Map();

  constructor() {
    for (const p of initialProfiles) {
      this.profiles.set(p.id, { ...p });
    }
  }

  async findByUserId(userId: string): Promise<Profile[]> {
    const list: Profile[] = [];
    for (const p of this.profiles.values()) {
      if (p.userId === userId) {
        list.push({ ...p });
      }
    }
    // Retorna ordenado com o perfil primário primeiro
    return list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  }

  async findById(id: string): Promise<Profile | null> {
    const p = this.profiles.get(id);
    return p ? { ...p } : null;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const normalized = email.trim().toLowerCase();
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase() === normalized) {
        return { ...p };
      }
    }
    return null;
  }

  async countByUserId(userId: string): Promise<{ total: number; usuarios: number; crm: number }> {
    let usuarios = 0;
    let crm = 0;

    for (const p of this.profiles.values()) {
      if (p.userId === userId) {
        if (p.tipo === "crm") {
          crm++;
        } else {
          usuarios++;
        }
      }
    }

    return { total: usuarios + crm, usuarios, crm };
  }

  async create(profile: Profile): Promise<Profile> {
    this.profiles.set(profile.id, { ...profile });
    return { ...profile };
  }

  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const existing = this.profiles.get(id);
    if (!existing) {
      throw new Error(`Perfil com ID ${id} não encontrado.`);
    }

    const updated: Profile = {
      ...existing,
      ...updates,
      atualizadoEm: new Date().toISOString(),
    };
    this.profiles.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    this.profiles.delete(id);
  }
}

export const profileRepository = new ProfileRepository();
