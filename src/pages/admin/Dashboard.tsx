import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Package, Users, Truck, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    produtos: 0,
    clientes: 0,
    fornecedores: 0,
    vendas: 0,
    vendasMes: 0,
    faturamentoMes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [produtos, clientes, fornecedores, vendas] = await Promise.all([
          supabase.from('produtos').select('id', { count: 'exact' }),
          supabase.from('clientes').select('id', { count: 'exact' }),
          supabase.from('fornecedores').select('id', { count: 'exact' }),
          supabase.from('vendas').select('id, valor_total, created_at', { count: 'exact' })
        ]);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const vendasMes = vendas.data?.filter(v => {
          const date = new Date(v.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }) || [];

        const faturamentoMes = vendasMes.reduce((sum, v) => sum + v.valor_total, 0);

        setStats({
          produtos: produtos.count || 0,
          clientes: clientes.count || 0,
          fornecedores: fornecedores.count || 0,
          vendas: vendas.count || 0,
          vendasMes: vendasMes.length,
          faturamentoMes
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: Package,
      label: 'Produtos',
      value: stats.produtos,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      label: 'Clientes',
      value: stats.clientes,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Truck,
      label: 'Fornecedores',
      value: stats.fornecedores,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: ShoppingCart,
      label: 'Vendas Totais',
      value: stats.vendas,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: TrendingUp,
      label: 'Vendas Este Mês',
      value: stats.vendasMes,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: DollarSign,
      label: 'Faturamento Mensal',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(stats.faturamentoMes),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Sistema operacional</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Última atualização</span>
                <span className="text-sm text-gray-900">Hoje às 14:30</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Backup automático</span>
                <span className="text-sm text-green-600">Ativo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Próximas Tarefas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Revisar estoque de produtos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Atualizar dados de fornecedores</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Gerar relatório mensal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};