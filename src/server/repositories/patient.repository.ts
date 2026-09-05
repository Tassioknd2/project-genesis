import { Patient } from "../domain/types";
import { NotFoundError } from "../domain/errors";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Tables } from "@/integrations/supabase/types";

type PatientRow = Tables<"patients">;

function rowToPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    nome: row.nome,
    idade: row.idade,
    telefone: row.telefone,
    convenio: row.convenio,
    ...(row.cpf != null ? { cpf: row.cpf } : {}),
    ...(row.email != null ? { email: row.email } : {}),
    ...(row.ultima_visita != null ? { ultimaVisita: row.ultima_visita } : {}),
    ...(row.observacoes != null ? { observacoes: row.observacoes } : {}),
    ...(row.criado_em != null ? { criadoEm: row.criado_em } : {}),
  };
}

export class PatientRepository {
  async findAll(query?: { search?: string; convenio?: string }): Promise<Patient[]> {
    let q = supabaseAdmin.from("patients").select("*");

    if (query?.convenio && query.convenio !== "todos") {
      q = q.ilike("convenio", `%${query.convenio}%`);
    }

    if (query?.search) {
      const s = query.search.trim();
      q = q.or(
        `nome.ilike.%${s}%,telefone.ilike.%${s}%,convenio.ilike.%${s}%,observacoes.ilike.%${s}%`,
      );
    }

    const { data, error } = await q.order("nome", { ascending: true });
    if (error) throw error;
    return (data || []).map(rowToPatient);
  }

  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await supabaseAdmin
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToPatient(data) : null;
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    const cleanPhone = phone.replace(/\D/g, "");
    const { data, error } = await supabaseAdmin.from("patients").select("*");
    if (error) throw error;
    const found = (data || []).find((p) => p.telefone.replace(/\D/g, "") === cleanPhone);
    return found ? rowToPatient(found) : null;
  }

  async create(data: Omit<Patient, "id"> & { id?: string }): Promise<Patient> {
    const id = data.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin
      .from("patients")
      .insert({
        id,
        nome: data.nome,
        idade: data.idade,
        telefone: data.telefone,
        convenio: data.convenio,
        cpf: data.cpf ?? null,
        email: data.email ?? null,
        ultima_visita: data.ultimaVisita ?? null,
        observacoes: data.observacoes ?? null,
        criado_em: data.criadoEm || now,
      })
      .select("*")
      .single();
    if (error) throw error;
    return rowToPatient(row);
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const patch: Record<string, unknown> = {};
    if (updates.nome !== undefined) patch["nome"] = updates.nome;
    if (updates.idade !== undefined) patch["idade"] = updates.idade;
    if (updates.telefone !== undefined) patch["telefone"] = updates.telefone;
    if (updates.convenio !== undefined) patch["convenio"] = updates.convenio;
    if ("cpf" in updates) patch["cpf"] = updates.cpf ?? null;
    if ("email" in updates) patch["email"] = updates.email ?? null;
    if ("ultimaVisita" in updates) patch["ultima_visita"] = updates.ultimaVisita ?? null;
    if ("observacoes" in updates) patch["observacoes"] = updates.observacoes ?? null;

    const { data: row, error } = await supabaseAdmin
      .from("patients")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new NotFoundError("Paciente", id);
    return rowToPatient(row);
  }

  async exists(id: string): Promise<boolean> {
    const { count, error } = await supabaseAdmin
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
}

// Repositório de pacientes persistido no Supabase
export const patientRepository = new PatientRepository();
