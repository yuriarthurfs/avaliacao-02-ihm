import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';

interface Produto {
  id: string;
  codigo_empresa: string;
  descricao_abreviada: string;
  descricao_detalhada: string;
  preco_ultima_venda: number;
  quantidade_estoque: number;
  imagens: string[];
  peso_kg: number;
  altura_m: number;
  largura_m: number;
  comprimento_m: number;
  fornecedores: {
    nome_razao_social: string;
  };
}

interface ProductModalProps {
  produto: Produto;
  onClose: () => void;
}

export const ProductModal = ({ produto, onClose }: ProductModalProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const getProductImage = (index: number) => {
    if (produto.imagens && produto.imagens.length > index) {
      return produto.imagens[index];
    }
    return `https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=800`;
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: produto.id,
        nome: produto.descricao_abreviada,
        preco: produto.preco_ultima_venda,
        imagem: getProductImage(0),
        estoque: produto.quantidade_estoque
      });
    }
    onClose();
  };

  const images = produto.imagens?.length > 0 ? produto.imagens : [getProductImage(0)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Detalhes do Produto</h2>
          <Button variant="secondary" onClick={onClose} className="rounded-full p-2">
            <X size={20} />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={getProductImage(selectedImage)}
                  alt={produto.descricao_abreviada}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getProductImage(index)}
                        alt={`${produto.descricao_abreviada} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  {produto.fornecedores?.nome_razao_social} • Código: {produto.codigo_empresa}
                </p>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {produto.descricao_abreviada}
                </h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">(4.0) • 127 avaliações</span>
                </div>

                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-3xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(produto.preco_ultima_venda)}
                  </span>
                  <span className="text-sm text-gray-500">à vista</span>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {produto.descricao_detalhada || 'Produto de alta qualidade com excelente custo-benefício.'}
                </p>
              </div>

              {/* Especificações */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Especificações</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Peso:</span>
                    <span className="ml-2 font-medium">{produto.peso_kg}kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Estoque:</span>
                    <span className="ml-2 font-medium">{produto.quantidade_estoque} unidades</span>
                  </div>
                  {produto.altura_m > 0 && (
                    <div>
                      <span className="text-gray-500">Dimensões:</span>
                      <span className="ml-2 font-medium">
                        {produto.altura_m}×{produto.largura_m}×{produto.comprimento_m}m
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantidade e Compra */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="font-semibold text-lg w-12 text-center">{quantity}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setQuantity(Math.min(produto.quantidade_estoque, quantity + 1))}
                      disabled={quantity >= produto.quantidade_estoque}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1"
                    disabled={produto.quantidade_estoque === 0}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {produto.quantidade_estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                  </Button>
                  <Button variant="secondary" className="p-3">
                    <Heart size={16} />
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    Total: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(produto.preco_ultima_venda * quantity)}
                  </p>
                </div>
              </div>

              {/* Garantias */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="w-4 h-4 mr-2 text-green-600" />
                  <span>Frete grátis para compras acima de R$ 199</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Garantia de 12 meses</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RotateCcw className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Troca grátis em até 30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};