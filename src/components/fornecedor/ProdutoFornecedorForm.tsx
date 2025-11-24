import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProdutoFornecedorFormProps {
  produto?: any;
  fornecedorId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ProdutoFornecedorForm = ({ produto, fornecedorId, onClose, onSave }: ProdutoFornecedorFormProps) => {
  const [formData, setFormData] = useState({
    codigo_fornecedor: '',
    codigo_empresa: '',
    descricao_fornecedor: '',
    descricao_abreviada: '',
    descricao_detalhada: '',
    peso_kg: 0,
    altura_m: 0,
    largura_m: 0,
    comprimento_m: 0,
    orientacoes_armazenamento: '',
    preco_ultima_compra: 0,
    preco_ultima_venda: 0,
    quantidade_estoque: 0,
    quantidade_vendida_ano: 0,
    imagens: [] as string[]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (produto) {
      setFormData({
        codigo_fornecedor: produto.codigo_fornecedor || '',
        codigo_empresa: produto.codigo_empresa || '',
        descricao_fornecedor: produto.descricao_fornecedor || '',
        descricao_abreviada: produto.descricao_abreviada || '',
        descricao_detalhada: produto.descricao_detalhada || '',
        peso_kg: produto.peso_kg || 0,
        altura_m: produto.altura_m || 0,
        largura_m: produto.largura_m || 0,
        comprimento_m: produto.comprimento_m || 0,
        orientacoes_armazenamento: produto.orientacoes_armazenamento || '',
        preco_ultima_compra: produto.preco_ultima_compra || 0,
        preco_ultima_venda: produto.preco_ultima_venda || 0,
        quantidade_estoque: produto.quantidade_estoque || 0,
        quantidade_vendida_ano: produto.quantidade_vendida_ano || 0,
        imagens: produto.imagens || []
      });
    }
  }, [produto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        fornecedor_id: fornecedorId
      };

      if (produto) {
        const { error } = await supabase
          .from('produtos')
          .update(data)
          .eq('id', produto.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert(data);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      setFormData(prev => ({
        ...prev,
        imagens: [...prev.imagens, url]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <Button variant="secondary" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Códigos e Identificação */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Identificação do Produto</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Código no Fornecedor *"
                  value={formData.codigo_fornecedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo_fornecedor: e.target.value }))}
                  required
                  placeholder="Ex: ABC123"
                />
                <Input
                  label="Código na Empresa *"
                  value={formData.codigo_empresa}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo_empresa: e.target.value }))}
                  required
                  placeholder="Ex: PROD001"
                />
              </div>

              <Input
                label="Descrição Original do Fornecedor *"
                value={formData.descricao_fornecedor}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_fornecedor: e.target.value }))}
                required
                placeholder="Descrição como fornecida pelo fornecedor"
              />

              <Input
                label="Nome Fantasia (Descrição Abreviada) *"
                value={formData.descricao_abreviada}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_abreviada: e.target.value }))}
                required
                placeholder="Nome para exibição aos clientes"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  value={formData.descricao_detalhada}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao_detalhada: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Especificações técnicas e detalhes do produto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensões e Peso */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Dimensões e Peso</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.001"
                  value={formData.peso_kg}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_kg: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.000"
                />
                <Input
                  label="Altura (m)"
                  type="number"
                  step="0.001"
                  value={formData.altura_m}
                  onChange={(e) => setFormData(prev => ({ ...prev, altura_m: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.000"
                />
                <Input
                  label="Largura (m)"
                  type="number"
                  step="0.001"
                  value={formData.largura_m}
                  onChange={(e) => setFormData(prev => ({ ...prev, largura_m: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.000"
                />
                <Input
                  label="Comprimento (m)"
                  type="number"
                  step="0.001"
                  value={formData.comprimento_m}
                  onChange={(e) => setFormData(prev => ({ ...prev, comprimento_m: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientações de Armazenamento
                </label>
                <textarea
                  value={formData.orientacoes_armazenamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, orientacoes_armazenamento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Instruções especiais para armazenamento"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preços e Estoque */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Preços e Estoque</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Preço da Última Compra (R$)"
                  type="number"
                  step="0.01"
                  value={formData.preco_ultima_compra}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_ultima_compra: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
                <Input
                  label="Preço de Venda (R$)"
                  type="number"
                  step="0.01"
                  value={formData.preco_ultima_venda}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_ultima_venda: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quantidade em Estoque"
                  type="number"
                  value={formData.quantidade_estoque}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade_estoque: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
                <Input
                  label="Quantidade Vendida no Ano"
                  type="number"
                  value={formData.quantidade_vendida_ano}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade_vendida_ano: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Galeria de Imagens</h3>
                <Button type="button" size="sm" onClick={addImageUrl}>
                  <Upload size={14} className="mr-1" />
                  Adicionar URL
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.imagens.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.imagens.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Produto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="mx-auto mb-2" size={32} />
                  <p>Nenhuma imagem adicionada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};