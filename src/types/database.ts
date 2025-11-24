export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string;
          nome_razao_social: string;
          telefones: string[];
          emails: string[];
          cpf_cnpj: string;
          tipo_pessoa: 'fisica' | 'juridica';
          endereco_correspondencia: any;
          endereco_entrega: any;
          horario_recebimento: string;
          observacoes_entrega: string;
          dados_pagamento: any;
          data_primeira_compra: string | null;
          data_ultima_compra: string | null;
          valor_maior_compra: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
      };
      administradores: {
        Row: {
          id: string;
          nome: string;
          email_empresa: string;
          email_pessoal: string;
          cargo: string;
          telefone_empresa: string;
          telefones_celular: string[];
          endereco: any;
          nivel_permissao: 'consulta' | 'edicao';
          firebase_uid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['administradores']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['administradores']['Insert']>;
      };
      fornecedores: {
        Row: {
          id: string;
          nome_razao_social: string;
          telefones: string[];
          email: string;
          cpf_cnpj: string;
          tipo_pessoa: 'fisica' | 'juridica';
          endereco: any;
          data_primeira_compra: string | null;
          data_ultima_compra: string | null;
          valor_maior_compra: number | null;
          dados_pagamento: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fornecedores']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['fornecedores']['Insert']>;
      };
      produtos: {
        Row: {
          id: string;
          codigo_fornecedor: string;
          codigo_empresa: string;
          descricao_fornecedor: string;
          descricao_abreviada: string;
          descricao_detalhada: string;
          peso_kg: number;
          altura_m: number;
          largura_m: number;
          comprimento_m: number;
          orientacoes_armazenamento: string;
          preco_ultima_compra: number;
          preco_ultima_venda: number;
          quantidade_estoque: number;
          quantidade_vendida_ano: number;
          imagens: string[];
          fornecedor_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['produtos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['produtos']['Insert']>;
      };
      formas_pagamento: {
        Row: {
          id: string;
          tipo: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
          detalhes: any;
          prazos_parcelas: number[];
          descontos_acrescimos: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['formas_pagamento']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['formas_pagamento']['Insert']>;
      };
      vendas: {
        Row: {
          id: string;
          cliente_id: string;
          administrador_id: string;
          items: any[];
          valor_total: number;
          valor_impostos_frete: number;
          forma_pagamento_id: string;
          dados_entrega: any;
          status: 'pendente' | 'confirmada' | 'enviada' | 'entregue' | 'cancelada';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vendas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vendas']['Insert']>;
      };
    };
  };
}