import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Filter, Star, Heart, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../hooks/useCart';
import { ProductModal } from '../../components/customer/ProductModal';
import { FornecedoresList } from '../../components/customer/FornecedoresList';

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

export const Home = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const { addToCart, cartItems } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [showFornecedores, setShowFornecedores] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
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

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.descricao_abreviada.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo_empresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = produto.preco_ultima_venda >= priceRange.min && 
                        produto.preco_ultima_venda <= priceRange.max;
    return matchesSearch && matchesPrice;
  });

  const handleAddToCart = (produto: Produto) => {
    addToCart({
      id: produto.id,
      nome: produto.descricao_abreviada,
      preco: produto.preco_ultima_venda,
      imagem: produto.imagens[0] || '/placeholder-product.jpg',
      estoque: produto.quantidade_estoque
    });
  };

  const getProductImage = (produto: Produto) => {
    if (produto.imagens && produto.imagens.length > 0) {
      return produto.imagens[0];
    }
    return `https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400`;
  };

  if (showFornecedores) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FornecedoresList onBack={() => setShowFornecedores(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encontre os Melhores Produtos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Qualidade garantida com os melhores preços do mercado
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            {/* Botão Fornecedores */}
            <div className="mt-6">
              <Button 
                variant="secondary" 
                onClick={() => setShowFornecedores(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Ver Nossos Fornecedores
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter className="mr-2" size={20} />
                  Filtros
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faixa de Preço
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Preço mínimo"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      />
                      <Input
                        type="number"
                        placeholder="Preço máximo"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos os Produtos</option>
                      <option value="eletronicos">Eletrônicos</option>
                      <option value="casa">Casa e Jardim</option>
                      <option value="esportes">Esportes</option>
                      <option value="moda">Moda</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Categories */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Categorias em Destaque</h3>
                <div className="space-y-2">
                  {['Eletrônicos', 'Casa e Jardim', 'Esportes', 'Moda', 'Livros'].map((categoria) => (
                    <button
                      key={categoria}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setSelectedCategory(categoria.toLowerCase())}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Produtos ({filteredProdutos.length})
              </h2>
              
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Ordenar por</option>
                  <option>Menor preço</option>
                  <option>Maior preço</option>
                  <option>Mais vendidos</option>
                  <option>Avaliação</option>
                </select>
              </div>
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
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProdutos.map((produto) => (
                  <Card key={produto.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={getProductImage(produto)}
                        alt={produto.descricao_abreviada}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => setSelectedProduct(produto)}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="p-2 block"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(produto);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button size="sm" variant="secondary" className="p-2 block">
                          <Heart size={16} />
                        </Button>
                      </div>
                      {produto.quantidade_estoque < 10 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                            Últimas unidades
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4" onClick={() => setSelectedProduct(produto)}>
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">
                          {produto.fornecedores?.nome_razao_social}
                        </p>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                          {produto.descricao_abreviada}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {produto.descricao_detalhada}
                        </p>
                      </div>

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
                        className="w-full"
                        disabled={produto.quantidade_estoque === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(produto);
                        }}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {produto.quantidade_estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal do Produto */}
      {selectedProduct && (
        <ProductModal
          produto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};