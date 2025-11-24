import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, FileText, MapPin, User, Mail, Phone } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface CheckoutProps {
  onBack: () => void;
}

interface FormaPagamento {
  id: string;
  tipo: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
  detalhes: any;
  prazos_parcelas: number[];
  descontos_acrescimos: number;
}

export const Checkout = ({ onBack }: CheckoutProps) => {
  const { cartItems, getTotalPrice, clearCart, setIsCartOpen } = useCart();
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const { cliente, user } = useAuth();
  
  const [formData, setFormData] = useState({
    // Dados do Cliente
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    
    // Endereço de Entrega
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Pagamento
    formaPagamentoId: '',
    parcelas: 1,
    
    // Cartão (se aplicável)
    numeroCartao: '',
    nomeCartao: '',
    validadeCartao: '',
    cvvCartao: ''
  });

  useEffect(() => {
    fetchFormasPagamento();
  }, []);

  const fetchFormasPagamento = async () => {
    try {
      const { data } = await supabase
        .from('formas_pagamento')
        .select('*')
        .eq('ativo', true)
        .order('tipo');
      
      setFormasPagamento(data || []);
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
    }
  };

  const shipping = 15.90;
  const subtotal = getTotalPrice();
  const selectedPayment = formasPagamento.find(fp => fp.id === formData.formaPagamentoId);
  const discount = selectedPayment ? (subtotal * selectedPayment.descontos_acrescimos / 100) : 0;
  const total = subtotal + shipping - discount;

  const getPaymentIcon = (tipo: string) => {
    switch (tipo) {
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard size={20} />;
      case 'pix':
        return <Smartphone size={20} />;
      case 'boleto':
        return <FileText size={20} />;
      default:
        return <CreditCard size={20} />;
    }
  };

  const getPaymentLabel = (tipo: string) => {
    const labels = {
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const navigate = useNavigate();

    try {
      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpar carrinho
      clearCart();
      setIsCartOpen(false);
      
      alert('Pedido realizado com sucesso! Você receberá um email de confirmação.');
      navigate('/');
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const buscarCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="secondary" onClick={onBack} className="mr-4">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="mr-2" size={20} />
                  Dados Pessoais
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo *"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                  <Input
                    label="CPF *"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Input
                    label="Telefone *"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Endereço de Entrega
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="CEP *"
                    value={formData.cep}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, cep }));
                      if (cep.length === 8) {
                        buscarCEP(cep);
                      }
                    }}
                    placeholder="00000-000"
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Rua *"
                      value={formData.rua}
                      onChange={(e) => setFormData(prev => ({ ...prev, rua: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Número *"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    required
                  />
                  <Input
                    label="Complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                  />
                  <Input
                    label="Bairro *"
                    value={formData.bairro}
                    onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Cidade *"
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    required
                  />
                  <Input
                    label="Estado *"
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Forma de Pagamento
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formasPagamento.map((forma) => (
                    <label
                      key={forma.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.formaPagamentoId === forma.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="formaPagamento"
                        value={forma.id}
                        checked={formData.formaPagamentoId === forma.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, formaPagamentoId: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        {getPaymentIcon(forma.tipo)}
                        <div>
                          <p className="font-medium">{getPaymentLabel(forma.tipo)}</p>
                          {forma.descontos_acrescimos !== 0 && (
                            <p className={`text-sm ${forma.descontos_acrescimos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {forma.descontos_acrescimos > 0 ? '+' : ''}{forma.descontos_acrescimos}%
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Parcelas para Cartão de Crédito */}
                {selectedPayment?.tipo === 'cartao_credito' && selectedPayment.prazos_parcelas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Parcelas
                    </label>
                    <select
                      value={formData.parcelas}
                      onChange={(e) => setFormData(prev => ({ ...prev, parcelas: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {selectedPayment.prazos_parcelas.map((parcela) => (
                        <option key={parcela} value={parcela}>
                          {parcela}x de {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(total / parcela)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dados do Cartão */}
                {(selectedPayment?.tipo === 'cartao_credito' || selectedPayment?.tipo === 'cartao_debito') && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900">Dados do Cartão</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Número do Cartão *"
                        value={formData.numeroCartao}
                        onChange={(e) => setFormData(prev => ({ ...prev, numeroCartao: e.target.value }))}
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                      <Input
                        label="Nome no Cartão *"
                        value={formData.nomeCartao}
                        onChange={(e) => setFormData(prev => ({ ...prev, nomeCartao: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Validade *"
                        value={formData.validadeCartao}
                        onChange={(e) => setFormData(prev => ({ ...prev, validadeCartao: e.target.value }))}
                        placeholder="MM/AA"
                        required
                      />
                      <Input
                        label="CVV *"
                        value={formData.cvvCartao}
                        onChange={(e) => setFormData(prev => ({ ...prev, cvvCartao: e.target.value }))}
                        placeholder="000"
                        required
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Resumo do Pedido</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Produtos */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qtd: {item.quantidade}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.preco * item.quantidade)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shipping)}</span>
                  </div>
                  {discount !== 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto:</span>
                      <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !formData.formaPagamentoId}
                >
                  {loading ? 'Processando...' : 'Finalizar Pedido'}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Ao finalizar o pedido, você concorda com nossos termos de uso e política de privacidade.
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};