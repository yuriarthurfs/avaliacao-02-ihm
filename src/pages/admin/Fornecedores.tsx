import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Building, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FornecedorForm } from '../../components/fornecedores/FornecedorForm';

interface Fornecedor {
  id: string;
  nome_razao_social: string;
  telefones: string[];
  email: string;
  cpf_cnpj: string;
  tipo_pessoa: 'fisica' | 'juridica';
  endereco: any;
  data_primeira_compra: string | null;
  data_ultima_compra: string | null;
  valor_maior_compra: number | null;
  created_at: string;
}

export const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);

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

  const handleEdit = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    try {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFornecedores();
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro ao excluir fornecedor');
    }
  };

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cpf_cnpj.includes(searchTerm) ||
    fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600">Gerencie os fornecedores cadastrados no sistema</p>
        </div>
        <Button onClick={() => { setSelectedFornecedor(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar fornecedores por nome, CPF/CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary">
              <Search size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Carregando fornecedores...</div>
          ) : filteredFornecedores.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredFornecedores.map((fornecedor) => (
                <Card key={fornecedor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Building className="w-5 h-5 text-purple-600" />
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          fornecedor.tipo_pessoa === 'fisica' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {fornecedor.tipo_pessoa === 'fisica' ? 'PF' : 'PJ'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(fornecedor)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(fornecedor.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {fornecedor.nome_razao_social}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">CPF/CNPJ:</span>
                        <span>{fornecedor.cpf_cnpj}</span>
                      </div>

                      {fornecedor.telefones.length > 0 && (
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
                            {fornecedor.endereco.rua}, {fornecedor.endereco.numero} - {fornecedor.endereco.bairro}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-xs">
                          <span>Primeira compra:</span>
                          <span>{fornecedor.data_primeira_compra ? new Date(fornecedor.data_primeira_compra).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Maior compra:</span>
                          <span>
                            {fornecedor.valor_maior_compra 
                              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fornecedor.valor_maior_compra)
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <FornecedorForm
          fornecedor={selectedFornecedor}
          onClose={() => { setShowModal(false); setSelectedFornecedor(null); }}
          onSave={() => {
            setShowModal(false);
            setSelectedFornecedor(null);
            fetchFornecedores();
          }}
        />
      )}
    </div>
  );
};