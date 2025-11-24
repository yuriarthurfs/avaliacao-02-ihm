import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PagamentoFormProps {
  pagamento?: any;
  onClose: () => void;
  onSave: () => void;
}

export const PagamentoForm = ({ pagamento, onClose, onSave }: PagamentoFormProps) => {
  const [formData, setFormData] = useState({
    tipo: 'cartao_credito' as 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto',
    detalhes: {} as any,
    prazos_parcelas: [1],
    descontos_acrescimos: 0,
    ativo: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pagamento) {
      setFormData({
        tipo: pagamento.tipo || 'cartao_credito',
        detalhes: pagamento.detalhes || {},
        prazos_parcelas: pagamento.prazos_parcelas?.length > 0 ? pagamento.prazos_parcelas : [1],
        descontos_acrescimos: pagamento.descontos_acrescimos || 0,
        ativo: pagamento.ativo !== undefined ? pagamento.ativo : true
      });
    }
  }, [pagamento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pagamento) {
        const { error } = await supabase
          .from('formas_pagamento')
          .update(formData)
          .eq('id', pagamento.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('formas_pagamento')
          .insert(formData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
      alert('Erro ao salvar forma de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const addParcela = () => {
    setFormData(prev => ({
      ...prev,
      prazos_parcelas: [...prev.prazos_parcelas, 1]
    }));
  };

  const removeParcela = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prazos_parcelas: prev.prazos_parcelas.filter((_, i) => i !== index)
    }));
  };

  const updateParcela = (index: number, value: number) => {
    setFormData(prev => ({
      ...prev,
      prazos_parcelas: prev.prazos_parcelas.map((item, i) => i === index ? value : item)
    }));
  };

  const updateDetalhes = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      detalhes: { ...prev.detalhes, [key]: value }
    }));
  };

  const renderDetalhesFields = () => {
    switch (formData.tipo) {
      case 'cartao_credito':
      case 'cartao_debito':
        return (
          <div className="space-y-4">
            <Input
              label="Bandeira/Banco"
              value={formData.detalhes.bandeira || ''}
              onChange={(e) => updateDetalhes('bandeira', e.target.value)}
              placeholder="Ex: Visa, Mastercard, Nubank"
            />
            <Input
              label="Taxa de Processamento (%)"
              type="number"
              step="0.01"
              value={formData.detalhes.taxa_processamento || ''}
              onChange={(e) => updateDetalhes('taxa_processamento', e.target.value)}
              placeholder="Ex: 2.5"
            />
          </div>
        );
      case 'pix':
        return (
          <div className="space-y-4">
            <Input
              label="Chave PIX"
              value={formData.detalhes.chave_pix || ''}
              onChange={(e) => updateDetalhes('chave_pix', e.target.value)}
              placeholder="Ex: empresa@email.com"
            />
            <Input
              label="Banco"
              value={formData.detalhes.banco || ''}
              onChange={(e) => updateDetalhes('banco', e.target.value)}
              placeholder="Ex: Banco do Brasil"
            />
          </div>
        );
      case 'boleto':
        return (
          <div className="space-y-4">
            <Input
              label="Banco Emissor"
              value={formData.detalhes.banco_emissor || ''}
              onChange={(e) => updateDetalhes('banco_emissor', e.target.value)}
              placeholder="Ex: Itaú"
            />
            <Input
              label="Dias para Vencimento"
              type="number"
              value={formData.detalhes.dias_vencimento || ''}
              onChange={(e) => updateDetalhes('dias_vencimento', e.target.value)}
              placeholder="Ex: 7"
            />
            <Input
              label="Taxa de Emissão (R$)"
              type="number"
              step="0.01"
              value={formData.detalhes.taxa_emissao || ''}
              onChange={(e) => updateDetalhes('taxa_emissao', e.target.value)}
              placeholder="Ex: 2.50"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {pagamento ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </h2>
          <Button variant="secondary" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Configurações Básicas */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Configurações Básicas</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pagamento *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tipo: e.target.value as any,
                    detalhes: {} // Reset detalhes quando mudar o tipo
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Desconto/Acréscimo (%)"
                  type="number"
                  step="0.01"
                  value={formData.descontos_acrescimos}
                  onChange={(e) => setFormData(prev => ({ ...prev, descontos_acrescimos: parseFloat(e.target.value) || 0 }))}
                  placeholder="Ex: -5 (desconto) ou 2 (acréscimo)"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.ativo ? 'ativo' : 'inativo'}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.value === 'ativo' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes Específicos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Detalhes Específicos</h3>
            </CardHeader>
            <CardContent>
              {renderDetalhesFields()}
            </CardContent>
          </Card>

          {/* Prazos de Parcelas */}
          {(formData.tipo === 'cartao_credito' || formData.tipo === 'boleto') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Prazos de Parcelas</h3>
                  <Button type="button" size="sm" onClick={addParcela}>
                    <Plus size={14} className="mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.prazos_parcelas.map((parcela, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={parcela}
                        onChange={(e) => updateParcela(index, parseInt(e.target.value) || 1)}
                        placeholder="Parcelas"
                      />
                      {formData.prazos_parcelas.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => removeParcela(index)}
                        >
                          <Minus size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Forma de Pagamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};