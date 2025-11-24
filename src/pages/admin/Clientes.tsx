import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, User, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ClienteForm } from '../../components/clientes/ClienteForm';

interface Cliente {
  id: string;
  nome_razao_social: string;
  telefones: string[];
  emails: string[];
  cpf_cnpj: string;
  tipo_pessoa: 'fisica' | 'juridica';
  endereco_correspondencia: any;
  endereco_entrega: any;
  data_primeira_compra: string | null;
  data_ultima_compra: string | null;
  valor_maior_compra: number | null;
  created_at: string;
}

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome_razao_social');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf_cnpj.includes(searchTerm) ||
    cliente.emails.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes cadastrados no sistema</p>
        </div>
        <Button onClick={() => { setSelectedCliente(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar clientes por nome, CPF/CNPJ ou email..."
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
            <div className="p-6 text-center text-gray-500">Carregando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredClientes.map((cliente) => (
                <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          cliente.tipo_pessoa === 'fisica' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {cliente.tipo_pessoa === 'fisica' ? 'PF' : 'PJ'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(cliente)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(cliente.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {cliente.nome_razao_social}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">CPF/CNPJ:</span>
                        <span>{cliente.cpf_cnpj}</span>
                      </div>

                      {cliente.telefones.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{cliente.telefones[0]}</span>
                        </div>
                      )}

                      {cliente.emails.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{cliente.emails[0]}</span>
                        </div>
                      )}

                      {cliente.endereco_correspondencia && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span className="text-xs line-clamp-2">
                            {cliente.endereco_correspondencia.rua}, {cliente.endereco_correspondencia.numero} - {cliente.endereco_correspondencia.bairro}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-xs">
                          <span>Primeira compra:</span>
                          <span>{cliente.data_primeira_compra ? new Date(cliente.data_primeira_compra).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Maior compra:</span>
                          <span>
                            {cliente.valor_maior_compra 
                              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.valor_maior_compra)
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
        <ClienteForm
          cliente={selectedCliente}
          onClose={() => { setShowModal(false); setSelectedCliente(null); }}
          onSave={() => {
            setShowModal(false);
            setSelectedCliente(null);
            fetchClientes();
          }}
        />
      )}
    </div>
  );
};