import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../hooks/useCart';
import { ProductModal } from '../../components/customer/ProductModal';

interface Produto {
  id: string;
  codigo_empresa: string;
  descricao_abreviada: string;
  descricao_detalhada: string;
  preco_ultima_venda: number;
  quantidade_estoque: number;
  imagens: string[];
  peso_kg: number;
  fornecedores: {
    nome_razao_social: string;
  };
}

interface Fornecedor {
  id: string;
  nome_razao_social: string;
  telefones: string[];
  email: string;
  endereco: any;
}

export const SupplierProducts = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (supplierId) {
      fetchFornecedor();
      fetchProdutos();
    }
  }, [supplierId]);

  const fetchFornecedor = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('id', supplierId)
        .maybeSingle();

      if (error) throw error;
      setFornecedor(data);
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
    }
  };

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          id,
          codigo_empresa,
          descricao_abreviada,
          descricao_detalhada,
          preco_ultima_venda,
          quantidade_estoque,
          imagens,
          peso_kg,
          fornecedores (
            nome_razao_social
          )
        `)
        .eq('fornecedor_id', supplierId)
        .gt('quantidade_estoque', 0)
        .order('descricao_abreviada');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
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

  if (!fornecedor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <div className="mt-12 text-center">
            <p className="text-gray-600">Fornecedor não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fornecedor.nome_razao_social}</h1>
              <p className="text-gray-600 mt-1">Produtos disponíveis</p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {fornecedor.telefones && fornecedor.telefones.length > 0 && (
                <div>
                  <p className="text-gray-600 font-medium mb-1">Telefone</p>
                  <p className="text-gray-900">{fornecedor.telefones[0]}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 font-medium mb-1">Email</p>
                <p className="text-gray-900">{fornecedor.email}</p>
              </div>
              {fornecedor.endereco && (
                <div>
                  <p className="text-gray-600 font-medium mb-1">Localização</p>
                  <p className="text-gray-900">
                    {fornecedor.endereco.cidade}, {fornecedor.endereco.estado}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Produtos ({produtos.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
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
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedProduct(produto)}
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

                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">(4.0)</span>
                  </div>

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
                    <ShoppingCart size={16} className="mr-2" />
                    {produto.quantidade_estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};
