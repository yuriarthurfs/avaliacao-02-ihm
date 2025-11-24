import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ClienteFormProps {
  cliente?: any;
  onClose: () => void;
  onSave: () => void;
}

export const ClienteForm = ({ cliente, onClose, onSave }: ClienteFormProps) => {
  const [formData, setFormData] = useState({
    nome_razao_social: '',
    telefones: [''],
    emails: [''],
    cpf_cnpj: '',
    tipo_pessoa: 'fisica' as 'fisica' | 'juridica',
    endereco_correspondencia: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    endereco_entrega: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    horario_recebimento: '',
    observacoes_entrega: '',
    dados_pagamento: {
      banco: '',
      conta: '',
      agencia: '',
      forma_pagamento: ''
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome_razao_social: cliente.nome_razao_social || '',
        telefones: cliente.telefones?.length > 0 ? cliente.telefones : [''],
        emails: cliente.emails?.length > 0 ? cliente.emails : [''],
        cpf_cnpj: cliente.cpf_cnpj || '',
        tipo_pessoa: cliente.tipo_pessoa || 'fisica',
        endereco_correspondencia: cliente.endereco_correspondencia || {
          rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        },
        endereco_entrega: cliente.endereco_entrega || {
          rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        },
        horario_recebimento: cliente.horario_recebimento || '',
        observacoes_entrega: cliente.observacoes_entrega || '',
        dados_pagamento: cliente.dados_pagamento || {
          banco: '', conta: '', agencia: '', forma_pagamento: ''
        }
      });
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        telefones: formData.telefones.filter(t => t.trim() !== ''),
        emails: formData.emails.filter(e => e.trim() !== '')
      };

      if (cliente) {
        const { error } = await supabase
          .from('clientes')
          .update(data)
          .eq('id', cliente.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert(data);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const addField = (field: 'telefones' | 'emails') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeField = (field: 'telefones' | 'emails', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateField = (field: 'telefones' | 'emails', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const copyAddress = () => {
    setFormData(prev => ({
      ...prev,
      endereco_entrega: { ...prev.endereco_correspondencia }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
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

              {/* Telefones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Telefones</label>
                  <Button type="button" size="sm" onClick={() => addField('telefones')}>
                    <Plus size={14} className="mr-1" />
                    Adicionar
                  </Button>
                </div>
                {formData.telefones.map((telefone, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={telefone}
                      onChange={(e) => updateField('telefones', index, e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                    {formData.telefones.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeField('telefones', index)}
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Emails */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Emails</label>
                  <Button type="button" size="sm" onClick={() => addField('emails')}>
                    <Plus size={14} className="mr-1" />
                    Adicionar
                  </Button>
                </div>
                {formData.emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateField('emails', index, e.target.value)}
                      placeholder="cliente@email.com"
                    />
                    {formData.emails.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeField('emails', index)}
                      >
                        <Minus size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Correspondência */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Endereço de Correspondência</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    value={formData.endereco_correspondencia.rua}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endereco_correspondencia: { ...prev.endereco_correspondencia, rua: e.target.value }
                    }))}
                  />
                </div>
                <Input
                  label="Número"
                  value={formData.endereco_correspondencia.numero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_correspondencia: { ...prev.endereco_correspondencia, numero: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Complemento"
                  value={formData.endereco_correspondencia.complemento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_correspondencia: { ...prev.endereco_correspondencia, complemento: e.target.value }
                  }))}
                />
                <Input
                  label="Bairro"
                  value={formData.endereco_correspondencia.bairro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_correspondencia: { ...prev.endereco_correspondencia, bairro: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Cidade"
                  value={formData.endereco_correspondencia.cidade}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_correspondencia: { ...prev.endereco_correspondencia, cidade: e.target.value }
                  }))}
                />
                <Input
                  label="Estado"
                  value={formData.endereco_correspondencia.estado}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_correspondencia: { ...prev.endereco_correspondencia, estado: e.target.value }
                  }))}
                />
                <Input
                  label="CEP"
                  value={formData.endereco_correspondencia.cep}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_correspondencia: { ...prev.endereco_correspondencia, cep: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Entrega */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Endereço de Entrega</h3>
                <Button type="button" size="sm" variant="secondary" onClick={copyAddress}>
                  Copiar do endereço de correspondência
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    value={formData.endereco_entrega.rua}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endereco_entrega: { ...prev.endereco_entrega, rua: e.target.value }
                    }))}
                  />
                </div>
                <Input
                  label="Número"
                  value={formData.endereco_entrega.numero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_entrega: { ...prev.endereco_entrega, numero: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Complemento"
                  value={formData.endereco_entrega.complemento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_entrega: { ...prev.endereco_entrega, complemento: e.target.value }
                  }))}
                />
                <Input
                  label="Bairro"
                  value={formData.endereco_entrega.bairro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_entrega: { ...prev.endereco_entrega, bairro: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Cidade"
                  value={formData.endereco_entrega.cidade}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_entrega: { ...prev.endereco_entrega, cidade: e.target.value }
                  }))}
                />
                <Input
                  label="Estado"
                  value={formData.endereco_entrega.estado}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_entrega: { ...prev.endereco_entrega, estado: e.target.value }
                  }))}
                />
                <Input
                  label="CEP"
                  value={formData.endereco_entrega.cep}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco_entrega: { ...prev.endereco_entrega, cep: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Horário de Recebimento"
                  value={formData.horario_recebimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_recebimento: e.target.value }))}
                  placeholder="Ex: 8h às 18h"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações para Entrega
                  </label>
                  <textarea
                    value={formData.observacoes_entrega}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes_entrega: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Instruções especiais para entrega..."
                  />
                </div>
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
                  label="Forma de Pagamento Preferida"
                  value={formData.dados_pagamento.forma_pagamento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_pagamento: { ...prev.dados_pagamento, forma_pagamento: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};