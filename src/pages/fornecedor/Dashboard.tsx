import { useState, useEffect } from 'react';
import { Package, User, Plus, Eye, Link, Unlink, CreditCard as Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProdutoFornecedorForm } from '../../components/fornecedor/ProdutoFornecedorForm';

interface Produto {
  id: string;
  codigo_fornecedor: string;
  codigo_empresa: string;
  descricao_abreviada: string;
  quantidade_estoque: number;
  preco_ultima_compra: number;
  fornecedor_id: string;
}

interface Fornecedor {
  id: string;
  nome_razao_social: string;
  email: string;
  telefones: string[];
  cpf_cnpj: string;
  endereco: any;
}

export const Dashboard = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFornecedorData();
  }, []);

  const fetchFornecedorData = async () => {
    try {
      // Simular fornecedor logado (em produção, viria do contexto de auth)
      const { data: fornecedorData } = await supabase
        .from('fornecedores')
        .select('*')
        .limit(1)
        .single();

      if (fornecedorData) {
        setFornecedor(fornecedorData);
        
        // Buscar produtos do fornecedor
        const { data: produtosData } = await supabase
          .from('produtos')
          .select('*')
          .eq('fornecedor_id', fornecedorData.id)
          .order('descricao_abreviada');

        setProdutos(produtosData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do fornecedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (produto: Produto) => {
    setSelectedProduto(produto);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFornecedorData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.descricao_abreviada.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo_fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo_empresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard do Fornecedor</h1>
              <p className="text-gray-600">Gerencie seus produtos e informações</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{fornecedor?.nome_razao_social}</p>
                <p className="text-sm text-gray-500">{fornecedor?.email}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dados do Fornecedor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="mr-2" size={20} />
                  Dados do Fornecedor
                </h3>
                <Button variant="secondary" size="sm">
                  <Edit size={16} className="mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome/Razão Social
                  </label>
                  <p className="text-gray-900">{fornecedor?.nome_razao_social}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ
                  </label>
                  <p className="text-gray-900">{fornecedor?.cpf_cnpj}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{fornecedor?.email}</p>
                </div>
                {fornecedor?.telefones && fornecedor.telefones.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefones
                    </label>
                    <p className="text-gray-900">{fornecedor.telefones.join(', ')}</p>
                  </div>
                )}
                {fornecedor?.endereco && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <p className="text-gray-900">
                      {fornecedor.endereco.rua}, {fornecedor.endereco.numero} - {fornecedor.endereco.bairro}, {fornecedor.endereco.cidade}/{fornecedor.endereco.estado}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Package className="mr-2" size={20} />
                  Meus Produtos ({produtos.length})
                </h3>
                <Button onClick={() => { setSelectedProduto(null); setShowModal(true); }}>
                  <Plus size={16} className="mr-2" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar produtos por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredProdutos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece cadastrando seu primeiro produto'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => { setSelectedProduto(null); setShowModal(true); }}>
                      <Plus size={16} className="mr-2" />
                      Cadastrar Produto
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código Fornecedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código Empresa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome Fantasia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estoque
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço Última Compra
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProdutos.map((produto) => (
                        <tr key={produto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {produto.codigo_fornecedor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {produto.codigo_empresa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {produto.descricao_abreviada}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              produto.quantidade_estoque > 10
                                ? 'bg-green-100 text-green-800'
                                : produto.quantidade_estoque > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {produto.quantidade_estoque}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(produto.preco_ultima_compra)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="secondary" onClick={() => handleEdit(produto)}>
                                <Edit size={14} />
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleDelete(produto.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal && (
        <ProdutoFornecedorForm
          produto={selectedProduto}
          fornecedorId={fornecedor?.id || ''}
          onClose={() => { setShowModal(false); setSelectedProduto(null); }}
          onSave={() => {
            setShowModal(false);
            setSelectedProduto(null);
            fetchFornecedorData();
          }}
        />
      )}
    </div>
  );
};