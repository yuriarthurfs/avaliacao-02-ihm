import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, CreditCard, Smartphone, FileText, Banknote } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PagamentoForm } from '../../components/pagamentos/PagamentoForm';

interface FormaPagamento {
  id: string;
  tipo: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
  detalhes: any;
  prazos_parcelas: number[];
  descontos_acrescimos: number;
  ativo: boolean;
  created_at: string;
}

export const Pagamentos = () => {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<FormaPagamento | null>(null);

  useEffect(() => {
    fetchFormasPagamento();
  }, []);

  const fetchFormasPagamento = async () => {
    try {
      const { data, error } = await supabase
        .from('formas_pagamento')
        .select('*')
        .order('tipo');

      if (error) throw error;
      setFormasPagamento(data || []);
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pagamento: FormaPagamento) => {
    setSelectedPagamento(pagamento);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta forma de pagamento?')) return;

    try {
      const { error } = await supabase
        .from('formas_pagamento')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFormasPagamento();
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      alert('Erro ao excluir forma de pagamento');
    }
  };

  const toggleStatus = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('formas_pagamento')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;
      fetchFormasPagamento();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'cartao_credito':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'cartao_debito':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'pix':
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case 'boleto':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <Banknote className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const filteredPagamentos = formasPagamento.filter(pagamento =>
    getTipoLabel(pagamento.tipo).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formas de Pagamento</h1>
          <p className="text-gray-600">Gerencie as formas de pagamento disponíveis</p>
        </div>
        <Button onClick={() => { setSelectedPagamento(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" />
          Nova Forma de Pagamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar formas de pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary">
              <Search size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Carregando formas de pagamento...</div>
          ) : filteredPagamentos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'Nenhuma forma de pagamento encontrada' : 'Nenhuma forma de pagamento cadastrada'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredPagamentos.map((pagamento) => (
                <Card key={pagamento.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getIcon(pagamento.tipo)}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          pagamento.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pagamento.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(pagamento)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(pagamento.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">
                      {getTipoLabel(pagamento.tipo)}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      {pagamento.prazos_parcelas.length > 0 && (
                        <div>
                          <span className="font-medium">Parcelas:</span>
                          <span className="ml-2">
                            {pagamento.prazos_parcelas.join('x, ')}x
                          </span>
                        </div>
                      )}

                      {pagamento.descontos_acrescimos !== 0 && (
                        <div>
                          <span className="font-medium">
                            {pagamento.descontos_acrescimos > 0 ? 'Acréscimo:' : 'Desconto:'}
                          </span>
                          <span className={`ml-2 ${
                            pagamento.descontos_acrescimos > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {Math.abs(pagamento.descontos_acrescimos)}%
                          </span>
                        </div>
                      )}

                      {pagamento.detalhes && Object.keys(pagamento.detalhes).length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <span className="font-medium">Detalhes:</span>
                          <div className="text-xs mt-1">
                            {Object.entries(pagamento.detalhes).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace('_', ' ')}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant={pagamento.ativo ? "danger" : "secondary"}
                          onClick={() => toggleStatus(pagamento.id, pagamento.ativo)}
                          className="w-full"
                        >
                          {pagamento.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <PagamentoForm
          pagamento={selectedPagamento}
          onClose={() => { setShowModal(false); setSelectedPagamento(null); }}
          onSave={() => {
            setShowModal(false);
            setSelectedPagamento(null);
            fetchFormasPagamento();
          }}
        />
      )}
    </div>
  );
};