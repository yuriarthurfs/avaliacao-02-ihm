import { useState, useEffect } from 'react';
import { Building, MapPin, Phone, Mail, Package, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCart } from '../../hooks/useCart';

interface Fornecedor {
  id: string;
  nome_razao_social: string;
  telefones: string[];
  email: string;
  endereco: any;
  cpf_cnpj: string;
}

interface Produto {
  id: string;
  codigo_empresa: string;
  descricao_abreviada: string;
  descricao_detalhada: string;
  preco_ultima_venda: number;
  quantidade_estoque: number;
  imagens: string[];
  peso_kg: number;
}

interface FornecedoresListProps {
  onBack: () => void;
}

export const FornecedoresList = ({ onBack }: FornecedoresListProps) => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('nome_razao_social');

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutosFornecedor = async (fornecedorId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('fornecedor_id', fornecedorId)
        .gt('quantidade_estoque', 0)
        .order('descricao_abreviada');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos do fornecedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFornecedorClick = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    fetchProdutosFornecedor(fornecedor.id);
  };

  const handleAddToCart = (produto: Produto) => {
    addToCart({
      id: produto.id,
      nome: produto.descricao_abreviada,
      preco: produto.preco_ultima_venda,
      imagem: produto.imagens[0] || 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
      estoque: produto.quantidade_estoque
    });
  };

  const getProductImage = (produto: Produto) => {
    if (produto.imagens && produto.imagens.length > 0) {
      return produto.imagens[0];
    }
    return 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFornecedor) {
    return (
      <div className="space-y-6">
        {/* Header do Fornecedor */}
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={() => setSelectedFornecedor(null)}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedFornecedor.nome_razao_social}</h2>
            <p className="text-gray-600">Produtos disponíveis</p>
          </div>
        </div>

        {/* Informações do Fornecedor */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {selectedFornecedor.telefones && selectedFornecedor.telefones.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{selectedFornecedor.telefones[0]}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{selectedFornecedor.email}</span>
              </div>
              {selectedFornecedor.endereco && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{selectedFornecedor.endereco.cidade}/{selectedFornecedor.endereco.estado}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Produtos do Fornecedor */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto disponível
            </h3>
            <p className="text-gray-500">
              Este fornecedor não possui produtos em estoque no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <Card key={produto.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={getProductImage(produto)}
                    alt={produto.descricao_abreviada}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {produto.quantidade_estoque < 10 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                        Últimas unidades
                      </span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {produto.descricao_abreviada}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {produto.descricao_detalhada}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(produto.preco_ultima_venda)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Em estoque: {produto.quantidade_estoque}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(produto)}
                    className="w-full"
                    disabled={produto.quantidade_estoque === 0}
                  >
                    <Package size={16} className="mr-2" />
                    {produto.quantidade_estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nossos Fornecedores</h2>
          <p className="text-gray-600">Conheça nossos parceiros e seus produtos</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar fornecedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando fornecedores...</p>
        </div>
      ) : filteredFornecedores.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum fornecedor encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os termos de busca
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFornecedores.map((fornecedor) => (
            <Card 
              key={fornecedor.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleFornecedorClick(fornecedor)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {fornecedor.nome_razao_social}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {fornecedor.telefones && fornecedor.telefones.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{fornecedor.telefones[0]}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{fornecedor.email}</span>
                      </div>

                      {fornecedor.endereco && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span className="text-xs line-clamp-2">
                            {fornecedor.endereco.cidade}, {fornecedor.endereco.estado}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <Button size="sm" className="w-full">
                        Ver Produtos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};