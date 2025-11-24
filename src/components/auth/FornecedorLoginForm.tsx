import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Building, Mail, Lock, UserPlus } from 'lucide-react';

export const FornecedorLoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefone: '',
    cnpj: '',
    responsavel: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Simular login do fornecedor
        console.log('Login fornecedor:', formData.email);
        // Aqui você implementaria a lógica de login do fornecedor
        // Por enquanto, redireciona para uma área específica do fornecedor
        navigate('/fornecedor/dashboard');
      } else {
        // Simular registro do fornecedor
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          return;
        }
        console.log('Registro fornecedor:', formData);
        // Aqui você implementaria a lógica de registro do fornecedor
        alert('Solicitação de cadastro enviada! Aguarde aprovação do administrador.');
        setIsLogin(true);
      }
    } catch (error) {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Área do Fornecedor' : 'Cadastro de Fornecedor'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Acesse sua conta para gerenciar produtos' 
              : 'Solicite cadastro como fornecedor'
            }
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <Input
                    label="Nome da Empresa"
                    type="text"
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                    required
                    placeholder="Razão social da empresa"
                  />

                  <Input
                    label="Responsável"
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                    required
                    placeholder="Nome do responsável"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      required
                      placeholder="(11) 99999-9999"
                    />
                    <Input
                      label="CNPJ"
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                      required
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                </>
              )}

              <Input
                label="Email Corporativo"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="contato@empresa.com"
              />

              <Input
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="••••••••"
              />

              {!isLogin && (
                <Input
                  label="Confirmar Senha"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  placeholder="••••••••"
                />
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading 
                  ? (isLogin ? 'Entrando...' : 'Enviando solicitação...') 
                  : (isLogin ? 'Entrar' : 'Solicitar Cadastro')
                }
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  {isLogin 
                    ? 'Não é fornecedor? Solicitar cadastro' 
                    : 'Já tem uma conta? Fazer login'
                  }
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>Nota:</strong> Solicitações de cadastro passam por aprovação do administrador. 
                  Você receberá um email quando sua conta for aprovada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
};