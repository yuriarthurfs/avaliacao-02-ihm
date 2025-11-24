import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface FornecedorFormProps {
  fornecedor?: any;
  onClose: () => void;
  onSave: () => void;
}

export const FornecedorForm = ({ fornecedor, onClose, onSave }: FornecedorFormProps) => {
  const [formData, setFormData] = useState({
    nome_razao_social: '',
    telefones: [''],
    email: '',
    cpf_cnpj: '',
    tipo_pessoa: 'juridica' as 'fisica' | 'juridica',
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    dados_pagamento: {
      banco: '',
      conta: '',
      agencia: '',
      forma_pagamento: '',
      prazos_pagamento: ''
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        nome_razao_social: fornecedor.nome_razao_social || '',
        telefones: fornecedor.telefones?.length > 0 ? fornecedor.telefones : [''],
        email: fornecedor.email || '',
        cpf_cnpj: fornecedor.cpf_cnpj || '',
        tipo_pessoa: fornecedor.tipo_pessoa || 'juridica',
        endereco: fornecedor.endereco || {
          rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        },
        dados_pagamento: fornecedor.dados_pagamento || {
          banco: '', conta: '', agencia: '', forma_pagamento: '', prazos_pagamento: ''
        }
      });
    }
  }, [fornecedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        telefones: formData.telefones.filter(t => t.trim() !== '')
      };

      if (fornecedor) {
        const { error } = await supabase
          .from('fornecedores')
          .update(data)
          .eq('id', fornecedor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fornecedores')
          .insert(data);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  const addTelefone = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, '']
    }));
  };

  const removeTelefone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.filter((_, i) => i !== index)
    }));
  };

  const updateTelefone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h2>
          <Button variant="secondary" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome / Razão Social *"
                value={formData.nome_razao_social}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_razao_social: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CPF / CNPJ *"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pessoa *
                  </label>
                  <select
                    value={formData.tipo_pessoa}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_pessoa: e.target.value as 'fisica' | 'juridica' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>

              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />

              {/* Telefones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Telefones</label>
                  <Button type="button" size="sm" onClick={addTelefone}>
                    <Plus size={14} className="mr-1" />
                    Adicionar
                  </Button>
                </div>
                {formData.telefones.map((telefone, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={telefone}
                      onChange={(e) => updateTelefone(index, e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                    {formData.telefones.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeTelefone(index)}
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Endereço</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    value={formData.endereco.rua}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, rua: e.target.value }
                    }))}
                  />
                </div>
                <Input
                  label="Número"
                  value={formData.endereco.numero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, numero: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Complemento"
                  value={formData.endereco.complemento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, complemento: e.target.value }
                  }))}
                />
                <Input
                  label="Bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, bairro: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cidade: e.target.value }
                  }))}
                />
                <Input
                  label="Estado"
                  value={formData.endereco.estado}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, estado: e.target.value }
                  }))}
                />
                <Input
                  label="CEP"
                  value={formData.endereco.cep}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cep: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados de Pagamento */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Dados de Pagamento</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Banco"
                  value={formData.dados_pagamento.banco}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_pagamento: { ...prev.dados_pagamento, banco: e.target.value }
                  }))}
                />
                <Input
                  label="Agência"
                  value={formData.dados_pagamento.agencia}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_pagamento: { ...prev.dados_pagamento, agencia: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Conta"
                  value={formData.dados_pagamento.conta}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_pagamento: { ...prev.dados_pagamento, conta: e.target.value }
                  }))}
                />
                <Input
                  label="Forma de Pagamento"
                  value={formData.dados_pagamento.forma_pagamento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_pagamento: { ...prev.dados_pagamento, forma_pagamento: e.target.value }
                  }))}
                />
              </div>

              <Input
                label="Prazos de Pagamento"
                value={formData.dados_pagamento.prazos_pagamento}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dados_pagamento: { ...prev.dados_pagamento, prazos_pagamento: e.target.value }
                }))}
                placeholder="Ex: 30/60/90 dias"
              />
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Fornecedor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};