import { Patient } from "../domain/types";
import { NotFoundError } from "../domain/errors";

const initialPatients: Patient[] = [
  {
    id: "p1",
    nome: "Marta Nogueira",
    idade: 62,
    telefone: "(11) 98812-4450",
    convenio: "Unimed",
    ultimaVisita: "03/01/2026",
    observacoes: "Hipertensa; traz último exame de sangue.",
    criadoEm: "2025-10-12T08:00:00.000Z",
  },
  {
    id: "p2",
    nome: "Roberto Lima",
    idade: 58,
    telefone: "(11) 97123-8801",
    convenio: "Particular",
    ultimaVisita: "18/12/2025",
    criadoEm: "2025-11-05T09:30:00.000Z",
  },
  {
    id: "p3",
    nome: "Cláudia Ferraz",
    idade: 71,
    telefone: "(11) 96540-2213",
    convenio: "SulAmérica",
    ultimaVisita: "22/12/2025",
    observacoes: "Mobilidade reduzida; preferir sala térrea.",
    criadoEm: "2025-08-20T14:15:00.000Z",
  },
  {
    id: "p4",
    nome: "Henrique Prado",
    idade: 66,
    telefone: "(11) 98777-5540",
    convenio: "Bradesco Saúde",
    ultimaVisita: "10/01/2026",
    criadoEm: "2025-09-14T11:00:00.000Z",
  },
  {
    id: "p5",
    nome: "Solange Ribeiro",
    idade: 74,
    telefone: "(11) 99901-3345",
    convenio: "Porto Seguro",
    ultimaVisita: "05/01/2026",
    criadoEm: "2025-07-30T16:45:00.000Z",
  },
  {
    id: "p6",
    nome: "Eduardo Sanches",
    idade: 59,
    telefone: "(11) 91234-7789",
    convenio: "Amil",
    ultimaVisita: "15/01/2026",
    criadoEm: "2025-12-01T10:20:00.000Z",
  },
  {
    id: "p7",
    nome: "Tereza Campos",
    idade: 80,
    telefone: "(11) 98321-0012",
    convenio: "SulAmérica",
    ultimaVisita: "28/11/2025",
    observacoes: "Acompanhada pela filha.",
    criadoEm: "2025-06-18T13:10:00.000Z",
  },
  {
    id: "p8",
    nome: "Fernando Alcântara",
    idade: 64,
    telefone: "(11) 97456-1188",
    convenio: "Particular",
    ultimaVisita: "09/01/2026",
    criadoEm: "2025-10-25T08:50:00.000Z",
  },
  {
    id: "p9",
    nome: "Beatriz Hoffmann",
    idade: 53,
    telefone: "(11) 96610-9034",
    convenio: "Bradesco Saúde",
    ultimaVisita: "20/01/2026",
    criadoEm: "2025-11-19T15:30:00.000Z",
  },
  {
    id: "p10",
    nome: "Amélia Corrêa",
    idade: 69,
    telefone: "(11) 98877-6621",
    convenio: "Amil",
    ultimaVisita: "12/01/2026",
    criadoEm: "2025-05-11T17:00:00.000Z",
  },
];

export class PatientRepository {
  private patients: Map<string, Patient> = new Map();

  constructor() {
    for (const p of initialPatients) {
      this.patients.set(p.id, { ...p });
    }
  }

  async findAll(query?: { search?: string; convenio?: string }): Promise<Patient[]> {
    let list = Array.from(this.patients.values());

    if (query?.convenio && query.convenio !== "todos") {
      const conv = query.convenio.toLowerCase();
      list = list.filter((p) => p.convenio.toLowerCase().includes(conv));
    }

    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(s) ||
          p.telefone.includes(s) ||
          p.convenio.toLowerCase().includes(s) ||
          (p.observacoes && p.observacoes.toLowerCase().includes(s)),
      );
    }

    return list.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async findById(id: string): Promise<Patient | null> {
    const patient = this.patients.get(id);
    return patient ? { ...patient } : null;
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    const cleanPhone = phone.replace(/\D/g, "");
    for (const p of this.patients.values()) {
      if (p.telefone.replace(/\D/g, "") === cleanPhone) {
        return { ...p };
      }
    }
    return null;
  }

  async create(data: Omit<Patient, "id"> & { id?: string }): Promise<Patient> {
    const id = data.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const patient: Patient = {
      ...data,
      id,
      criadoEm: data.criadoEm || now,
    };
    this.patients.set(id, patient);
    return { ...patient };
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const existing = this.patients.get(id);
    if (!existing) {
      throw new NotFoundError("Paciente", id);
    }
    const updated: Patient = {
      ...existing,
      ...updates,
      id, // imutável
    };
    this.patients.set(id, updated);
    return { ...updated };
  }

  async exists(id: string): Promise<boolean> {
    return this.patients.has(id);
  }
}

// Singleton de repositório de pacientes
export const patientRepository = new PatientRepository();
