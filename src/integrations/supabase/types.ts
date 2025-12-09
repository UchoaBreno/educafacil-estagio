export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          altura_farda: string | null
          aluno_aee: boolean | null
          aluno_pcd: boolean | null
          ano: number
          bairro: string | null
          bolsa_familia: boolean | null
          cartao_sus: string | null
          censo_escola: boolean | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string | null
          data_movimentacao: string | null
          data_nascimento: string | null
          de_onde_veio: string | null
          dieta_restritiva: boolean | null
          endereco: string | null
          endereco_numero: string | null
          estado: string | null
          foto_url: string | null
          id: number
          largura_farda: string | null
          mae_contato: string | null
          mae_cpf: string | null
          mae_email: string | null
          mae_nome: string | null
          mae_rg: string | null
          matricula: string
          nacionalidade: string | null
          naturalidade: string | null
          nome: string
          pai_contato: string | null
          pai_cpf: string | null
          pai_email: string | null
          pai_nome: string | null
          pai_rg: string | null
          para_onde_vai: string | null
          pasta: string | null
          prateleira: string | null
          raca_cor: string | null
          rg: string | null
          sexo: string | null
          status: string | null
          tipo_movimentacao: string | null
          transporte_escolar: boolean | null
          turma_id: number | null
          uf: string | null
          vacinado_covid: string | null
        }
        Insert: {
          altura_farda?: string | null
          aluno_aee?: boolean | null
          aluno_pcd?: boolean | null
          ano: number
          bairro?: string | null
          bolsa_familia?: boolean | null
          cartao_sus?: string | null
          censo_escola?: boolean | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          data_movimentacao?: string | null
          data_nascimento?: string | null
          de_onde_veio?: string | null
          dieta_restritiva?: boolean | null
          endereco?: string | null
          endereco_numero?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: number
          largura_farda?: string | null
          mae_contato?: string | null
          mae_cpf?: string | null
          mae_email?: string | null
          mae_nome?: string | null
          mae_rg?: string | null
          matricula: string
          nacionalidade?: string | null
          naturalidade?: string | null
          nome: string
          pai_contato?: string | null
          pai_cpf?: string | null
          pai_email?: string | null
          pai_nome?: string | null
          pai_rg?: string | null
          para_onde_vai?: string | null
          pasta?: string | null
          prateleira?: string | null
          raca_cor?: string | null
          rg?: string | null
          sexo?: string | null
          status?: string | null
          tipo_movimentacao?: string | null
          transporte_escolar?: boolean | null
          turma_id?: number | null
          uf?: string | null
          vacinado_covid?: string | null
        }
        Update: {
          altura_farda?: string | null
          aluno_aee?: boolean | null
          aluno_pcd?: boolean | null
          ano?: number
          bairro?: string | null
          bolsa_familia?: boolean | null
          cartao_sus?: string | null
          censo_escola?: boolean | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          data_movimentacao?: string | null
          data_nascimento?: string | null
          de_onde_veio?: string | null
          dieta_restritiva?: boolean | null
          endereco?: string | null
          endereco_numero?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: number
          largura_farda?: string | null
          mae_contato?: string | null
          mae_cpf?: string | null
          mae_email?: string | null
          mae_nome?: string | null
          mae_rg?: string | null
          matricula?: string
          nacionalidade?: string | null
          naturalidade?: string | null
          nome?: string
          pai_contato?: string | null
          pai_cpf?: string | null
          pai_email?: string | null
          pai_nome?: string | null
          pai_rg?: string | null
          para_onde_vai?: string | null
          pasta?: string | null
          prateleira?: string | null
          raca_cor?: string | null
          rg?: string | null
          sexo?: string | null
          status?: string | null
          tipo_movimentacao?: string | null
          transporte_escolar?: boolean | null
          turma_id?: number | null
          uf?: string | null
          vacinado_covid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      anotacoes: {
        Row: {
          conteudo: string
          created_at: string | null
          data: string
          id: number
          tipo: string
          titulo: string
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          data: string
          id?: number
          tipo?: string
          titulo: string
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          data?: string
          id?: number
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      equipe_gestora: {
        Row: {
          arquivo_url: string | null
          biografia: string | null
          cargo: string
          cpf: string | null
          created_at: string | null
          data_lotacao: string | null
          email: string
          formacoes: Json | null
          foto_url: string | null
          id: number
          matricula: string
          nome: string
          rg: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          arquivo_url?: string | null
          biografia?: string | null
          cargo: string
          cpf?: string | null
          created_at?: string | null
          data_lotacao?: string | null
          email: string
          formacoes?: Json | null
          foto_url?: string | null
          id?: number
          matricula: string
          nome: string
          rg?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          arquivo_url?: string | null
          biografia?: string | null
          cargo?: string
          cpf?: string | null
          created_at?: string | null
          data_lotacao?: string | null
          email?: string
          formacoes?: Json | null
          foto_url?: string | null
          id?: number
          matricula?: string
          nome?: string
          rg?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string | null
          data: string
          descricao: string | null
          hora_fim: string | null
          hora_inicio: string | null
          id: number
          local: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          local?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          local?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      frequencia: {
        Row: {
          aluno_id: number
          created_at: string | null
          data: string
          id: number
          justificativa: string | null
          status: string
          turma_id: number
        }
        Insert: {
          aluno_id: number
          created_at?: string | null
          data: string
          id?: number
          justificativa?: string | null
          status?: string
          turma_id: number
        }
        Update: {
          aluno_id?: number
          created_at?: string | null
          data?: string
          id?: number
          justificativa?: string | null
          status?: string
          turma_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "frequencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frequencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios: {
        Row: {
          dia: string
          disciplina: string
          fim: string
          id: number
          inicio: string
          turma_id: number
        }
        Insert: {
          dia: string
          disciplina: string
          fim: string
          id?: number
          inicio: string
          turma_id: number
        }
        Update: {
          dia?: string
          disciplina?: string
          fim?: string
          id?: number
          inicio?: string
          turma_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "horarios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          aluno_id: number
          ano: number
          bimestre_1: number | null
          bimestre_2: number | null
          bimestre_3: number | null
          bimestre_4: number | null
          created_at: string | null
          disciplina: string
          id: number
          media_anual: number | null
          situacao: string | null
          turma_id: number
        }
        Insert: {
          aluno_id: number
          ano?: number
          bimestre_1?: number | null
          bimestre_2?: number | null
          bimestre_3?: number | null
          bimestre_4?: number | null
          created_at?: string | null
          disciplina: string
          id?: number
          media_anual?: number | null
          situacao?: string | null
          turma_id: number
        }
        Update: {
          aluno_id?: number
          ano?: number
          bimestre_1?: number | null
          bimestre_2?: number | null
          bimestre_3?: number | null
          bimestre_4?: number | null
          created_at?: string | null
          disciplina?: string
          id?: number
          media_anual?: number | null
          situacao?: string | null
          turma_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          arquivo_url: string | null
          ativo: boolean | null
          biografia: string | null
          cpf: string | null
          created_at: string | null
          data_lotacao: string | null
          disciplina: string
          disciplinas: string[] | null
          email: string
          formacoes: Json | null
          foto_url: string | null
          id: number
          link_lattes: string | null
          matricula: string
          nome: string
          rg: string | null
          series: string[] | null
          status_funcional: string | null
          telefone: string | null
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean | null
          biografia?: string | null
          cpf?: string | null
          created_at?: string | null
          data_lotacao?: string | null
          disciplina: string
          disciplinas?: string[] | null
          email: string
          formacoes?: Json | null
          foto_url?: string | null
          id?: number
          link_lattes?: string | null
          matricula: string
          nome: string
          rg?: string | null
          series?: string[] | null
          status_funcional?: string | null
          telefone?: string | null
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean | null
          biografia?: string | null
          cpf?: string | null
          created_at?: string | null
          data_lotacao?: string | null
          disciplina?: string
          disciplinas?: string[] | null
          email?: string
          formacoes?: Json | null
          foto_url?: string | null
          id?: number
          link_lattes?: string | null
          matricula?: string
          nome?: string
          rg?: string | null
          series?: string[] | null
          status_funcional?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          ano: number
          capacidade: number | null
          created_at: string | null
          id: number
          nome: string
          professor_id: number | null
          professor_id_2: number | null
          serie: string
          turno: string
        }
        Insert: {
          ano: number
          capacidade?: number | null
          created_at?: string | null
          id?: number
          nome: string
          professor_id?: number | null
          professor_id_2?: number | null
          serie: string
          turno: string
        }
        Update: {
          ano?: number
          capacidade?: number | null
          created_at?: string | null
          id?: number
          nome?: string
          professor_id?: number | null
          professor_id_2?: number | null
          serie?: string
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_2_fkey"
            columns: ["professor_id_2"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: number
          nome: string
          papel: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: number
          nome: string
          papel?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: number
          nome?: string
          papel?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "professor" | "aluno"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gestor", "professor", "aluno"],
    },
  },
} as const
