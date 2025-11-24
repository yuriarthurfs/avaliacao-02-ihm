import { useState, useEffect } from 'react';
import { X, Plus, Minus, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface VendaFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface Cliente {
  id: string;
  nome_razao_social: string;
  cpf_cnpj: string;
  endereco_entrega: any;
}

interface Produto {
  id: string;
  codigo_empresa: string;
  descricao_abreviada: string;
  preco_ultima_venda: number;
  quantidade_estoque: number;
}

interface ItemVenda {
  produto_id: string;
  produto: Produto;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export const VendaForm = ({ onClose, onSave }: VendaFormProps) => {
  const { admin } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [items, setItems] = useState<ItemVenda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .gt('quantidade_estoque', 0)
        .order('descricao_abreviada');
      
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const buscarCliente = async () => {
    if (!cpfCnpj) return;

    try {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('cpf_cnpj', cpfCnpj)
        .single();
      
      setCliente(data);
    } catch (error) {
      alert('Cliente não encontrado');
    }
  };

  const adicionarItem = (produto: Produto) => {
    const itemExistente = items.find(item => item.produto_id === produto.id);
    
    if (itemExistente) {
      setItems(items.map(item =>
        item.produto_id === produto.id
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco_unitario }
          : item
      ));
    } else {
      const novoItem: ItemVenda = {
        produto_id: produto.id,
        produto,
        quantidade: 1,
        preco_unitario: produto.preco_ultima_venda,
        subtotal: produto.preco_ultima_venda
      };
      setItems([...items, novoItem]);
    }
    setSearchProduto('');
  };

  const alterarQuantidade = (produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setItems(items.filter(item => item.produto_id !== produtoId));
    } else {
      setItems(items.map(item =>
        item.produto_id === produtoId
          ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * item.preco_unitario }
          : item
      ));
    }
  };

  const valorTotal = items.reduce((total, item) => total + item.subtotal, 0);

  const finalizarVenda = async () => {
    if (!cliente || items.length === 0) {
      alert('Selecione um cliente e adicione produtos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('vendas')
        .insert({
          cliente_id: cliente.id,
          administrador_id: admin.id,
          items: items.map(item => ({
            produto_id: item.produto_id,
            codigo_empresa: item.produto.codigo_empresa,
            descricao: item.produto.descricao_abreviada,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            subtotal: item.subtotal
          })),
          valor_total: valorTotal,
          valor_impostos_frete: 0,
          forma_pagamento_id: null,
          dados_entrega: cliente.endereco_entrega,
          status: 'pendente'
        });

      if (error) throw error;

      // Atualizar estoque
      for (const item of items) {
        await supabase
          .from('produtos')
          .update({
            quantidade_estoque: item.produto.quantidade_estoque - item.quantidade
          })
          .eq('id', item.produto_id);
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda');
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.descricao_abreviada.toLowerCase().includes(searchProduto.toLowerCase()) ||
    p.codigo_empresa.toLowerCase().includes(searchProduto.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Nova Venda</h2>
          <Button variant="secondary" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Cliente</h3>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    label="CPF/CNPJ do Cliente"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={buscarCliente}>
                    <Search size={16} className="mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
              
              {cliente && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold">{cliente.nome_razao_social}</p>
                  <p className="text-sm text-gray-600">{cliente.cpf_cnpj}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Produtos</h3>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar produtos por nome ou código..."
                  value={searchProduto}
                  onChange={(e) => setSearchProduto(e.target.value)}
                />
                
                {searchProduto && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                    {produtosFiltrados.map(produto => (
                      <div
                        key={produto.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => adicionarItem(produto)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{produto.descricao_abreviada}</p>
                            <p className="text-sm text-gray-500">Código: {produto.codigo_empresa}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(produto.preco_ultima_venda)}
                            </p>
                            <p className="text-sm text-gray-500">Estoque: {produto.quantidade_estoque}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Carrinho */}
              {items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Carrinho de Compras</h4>
                  {items.map(item => (
                    <div key={item.produto_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.produto.descricao_abreviada}</p>
                        <p className="text-sm text-gray-500">Código: {item.produto.codigo_empresa}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => alterarQuantidade(item.produto_id, item.quantidade - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        
                        <span className="font-medium w-8 text-center">{item.quantidade}</span>
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => alterarQuantidade(item.produto_id, item.quantidade + 1)}
                          disabled={item.quantidade >= item.produto.quantidade_estoque}
                        >
                          <Plus size={14} />
                        </Button>
                        
                        <div className="text-right ml-6">
                          <p className="font-semibold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(valorTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={finalizarVenda}
              disabled={loading || !cliente || items.length === 0}
            >
              {loading ? 'Processando...' : 'Finalizar Venda'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};