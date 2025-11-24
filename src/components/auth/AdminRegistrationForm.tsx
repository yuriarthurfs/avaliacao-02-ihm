import { useState } from 'react';
import { X, Shield, Mail, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { auth } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AdminRegistrationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminRegistrationForm = ({ onClose, onSuccess }: AdminRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email_empresa: '',
    email_pessoal: '',
    cargo: '',
    telefone_empresa: '',
    telefones_celular: [''],
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    nivel_permissao: 'consulta' as 'consulta' | 'edicao',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email_empresa, 
        formData.password
      );

      // Criar registro no Supabase
      const { error: supabaseError } = await supabase
        .from('administradores')
        .insert({
          nome: formData.nome,
          email_empresa: formData.email_empresa,
          email_pessoal: formData.email_pessoal,
          cargo: formData.cargo,
          telefone_empresa: formData.telefone_empresa,
          telefones_celular: formData.telefones_celular.filter(t => t.trim() !== ''),
          endereco: formData.endereco,
          nivel_permissao: formData.nivel_permissao,
          firebase_uid: userCredential.user.uid
        });

      if (supabaseError) throw supabaseError;

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar administrador:', error);
      setError(error.message || 'Erro ao criar conta de administrador');
    } finally {
      setLoading(false);
    }
  };

  const addTelefone = () => {
    setFormData(prev => ({
      ...prev,
      telefones_celular: [...prev.telefones_celular, '']
    }));
  };

  const removeTelefone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      telefones_celular: prev.telefones_celular.filter((_, i) => i !== index)
    }));
  };

  const updateTelefone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      telefones_celular: prev.telefones_celular.map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Criar Conta de Administrador</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Dados Básicos
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
                  label="Cargo *"
                  value={formData.cargo}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                  required
                  placeholder="Ex: Gerente de Vendas"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Empresarial *"
                  type="email"
                  value={formData.email_empresa}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_empresa: e.target.value }))}
                  required
                  placeholder="admin@empresa.com"
                />
                <Input
                  label="Email Pessoal"
                  type="email"
                  value={formData.email_pessoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_pessoal: e.target.value }))}
                  placeholder="pessoal@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Senha *"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
                <Input
                  label="Confirmar Senha *"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Permissão *
                </label>
                <select
                  value={formData.nivel_permissao}
                  onChange={(e) => setFormData(prev => ({ ...prev, nivel_permissao: e.target.value as 'consulta' | 'edicao' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="consulta">Apenas Consulta</option>
                  <option value="edicao">Consulta e Edição</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contato
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Telefone Empresa"
                value={formData.telefone_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone_empresa: e.target.value }))}
                placeholder="(11) 3333-4444"
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Telefones Celular</label>
                  <Button type="button" size="sm" onClick={addTelefone}>
                    Adicionar
                  </Button>
                </div>
                {formData.telefones_celular.map((telefone, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={telefone}
                      onChange={(e) => updateTelefone(index, e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                    {formData.telefones_celular.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeTelefone(index)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    value={formData.endereco.rua}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, rua: e.target.value }
                    }))}
                  />
                </div>
                <Input
                  label="Número"
                  value={formData.endereco.numero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, numero: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Complemento"
                  value={formData.endereco.complemento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, complemento: e.target.value }
                  }))}
                />
                <Input
                  label="Bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, bairro: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cidade: e.target.value }
                  }))}
                />
                <Input
                  label="Estado"
                  value={formData.endereco.estado}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, estado: e.target.value }
                  }))}
                />
                <Input
                  label="CEP"
                  value={formData.endereco.cep}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cep: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Administrador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};