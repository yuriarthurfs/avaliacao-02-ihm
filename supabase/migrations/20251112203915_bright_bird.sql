/*
  # Sistema de E-commerce - Schema Inicial

  1. Novas Tabelas
     - `administradores` - Gerenciamento de usuários administrativos
     - `clientes` - Cadastro de clientes do sistema  
     - `fornecedores` - Cadastro de fornecedores
     - `produtos` - Catálogo de produtos
     - `formas_pagamento` - Formas de pagamento disponíveis
     - `vendas` - Histórico de vendas realizadas

  2. Recursos
     - Campos JSON para dados complexos (endereços, pagamentos)
     - Arrays para múltiplos valores (telefones, emails, imagens)
     - Timestamps automáticos
     - UUIDs como chaves primárias
     - Relacionamentos entre tabelas

  3. Segurança
     - RLS habilitado em todas as tabelas
     - Políticas básicas para usuários autenticados
*/

-- Administradores
CREATE TABLE IF NOT EXISTS administradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email_empresa text UNIQUE NOT NULL,
  email_pessoal text,
  cargo text NOT NULL,
  telefone_empresa text,
  telefones_celular text[] DEFAULT '{}',
  endereco jsonb,
  nivel_permissao text CHECK (nivel_permissao IN ('consulta', 'edicao')) DEFAULT 'consulta',
  firebase_uid text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_razao_social text NOT NULL,
  telefones text[] DEFAULT '{}',
  emails text[] DEFAULT '{}',
  cpf_cnpj text UNIQUE NOT NULL,
  tipo_pessoa text CHECK (tipo_pessoa IN ('fisica', 'juridica')) NOT NULL,
  endereco_correspondencia jsonb,
  endereco_entrega jsonb,
  horario_recebimento text,
  observacoes_entrega text,
  dados_pagamento jsonb,
  data_primeira_compra timestamptz,
  data_ultima_compra timestamptz,
  valor_maior_compra decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fornecedores  
CREATE TABLE IF NOT EXISTS fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_razao_social text NOT NULL,
  telefones text[] DEFAULT '{}',
  email text NOT NULL,
  cpf_cnpj text UNIQUE NOT NULL,
  tipo_pessoa text CHECK (tipo_pessoa IN ('fisica', 'juridica')) NOT NULL,
  endereco jsonb,
  data_primeira_compra timestamptz,
  data_ultima_compra timestamptz,
  valor_maior_compra decimal(10,2),
  dados_pagamento jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_fornecedor text NOT NULL,
  codigo_empresa text UNIQUE NOT NULL,
  descricao_fornecedor text NOT NULL,
  descricao_abreviada text NOT NULL,
  descricao_detalhada text,
  peso_kg decimal(8,3) DEFAULT 0,
  altura_m decimal(6,3) DEFAULT 0,
  largura_m decimal(6,3) DEFAULT 0,
  comprimento_m decimal(6,3) DEFAULT 0,
  orientacoes_armazenamento text,
  preco_ultima_compra decimal(10,2) DEFAULT 0,
  preco_ultima_venda decimal(10,2) DEFAULT 0,
  quantidade_estoque integer DEFAULT 0,
  quantidade_vendida_ano integer DEFAULT 0,
  imagens text[] DEFAULT '{}',
  fornecedor_id uuid REFERENCES fornecedores(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Formas de Pagamento
CREATE TABLE IF NOT EXISTS formas_pagamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text CHECK (tipo IN ('cartao_credito', 'cartao_debito', 'pix', 'boleto')) NOT NULL,
  detalhes jsonb,
  prazos_parcelas integer[] DEFAULT '{}',
  descontos_acrescimos decimal(5,2) DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendas
CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) NOT NULL,
  administrador_id uuid REFERENCES administradores(id) NOT NULL,
  items jsonb NOT NULL,
  valor_total decimal(10,2) NOT NULL,
  valor_impostos_frete decimal(10,2) DEFAULT 0,
  forma_pagamento_id uuid REFERENCES formas_pagamento(id),
  dados_entrega jsonb,
  status text CHECK (status IN ('pendente', 'confirmada', 'enviada', 'entregue', 'cancelada')) DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuários autenticados podem acessar)
CREATE POLICY "Administradores podem gerenciar dados"
  ON administradores
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar clientes"
  ON clientes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar fornecedores"
  ON fornecedores
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar produtos"
  ON produtos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar formas de pagamento"
  ON formas_pagamento
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar vendas"
  ON vendas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_empresa ON produtos(codigo_empresa);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor ON produtos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(created_at);
CREATE INDEX IF NOT EXISTS idx_administradores_firebase_uid ON administradores(firebase_uid);

-- Funções para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps automaticamente
CREATE TRIGGER update_administradores_updated_at BEFORE UPDATE ON administradores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_formas_pagamento_updated_at BEFORE UPDATE ON formas_pagamento FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();