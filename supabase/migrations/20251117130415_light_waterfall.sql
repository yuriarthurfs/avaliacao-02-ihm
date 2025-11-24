/*
  # Adicionar campo firebase_uid à tabela clientes

  1. Alterações
     - Adicionar coluna firebase_uid à tabela clientes
     - Criar índice para performance
     - Permitir valores nulos temporariamente para dados existentes

  2. Segurança
     - Manter políticas RLS existentes
*/

-- Adicionar coluna firebase_uid à tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS firebase_uid text;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_clientes_firebase_uid ON clientes(firebase_uid);

-- Comentário para documentação
COMMENT ON COLUMN clientes.firebase_uid IS 'UID do usuário no Firebase Auth para autenticação';