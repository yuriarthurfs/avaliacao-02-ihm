import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Checkout } from './Checkout';

export const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  const shipping = 15.90;
  const totalWithShipping = getTotalPrice() + shipping;

  if (showCheckout) {
    return <Checkout onBack={() => setShowCheckout(false)} />;
  }

  return (
    <>
      {/* Cart Sidebar */}
      <div className={`fixed inset-0 z-50 ${isCartOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isCartOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsCartOpen(false)}
        />

        {/* Cart Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">
                  Carrinho ({cartItems.length})
                </h2>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCartOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Seu carrinho está vazio
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Adicione alguns produtos para começar suas compras
                  </p>
                  <Button onClick={() => setIsCartOpen(false)}>
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.nome}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.preco)}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          
                          <span className="font-medium w-8 text-center">
                            {item.quantidade}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                            disabled={item.quantidade >= item.estoque}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.preco * item.quantidade)}
                        </p>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeFromCart(item.id)}
                          className="mt-2"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(getTotalPrice())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Truck size={16} className="mr-1" />
                      Frete:
                    </span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalWithShipping)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full"
                  >
                    <CreditCard size={16} className="mr-2" />
                    Finalizar Compra
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full"
                  >
                    Continuar Comprando
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};