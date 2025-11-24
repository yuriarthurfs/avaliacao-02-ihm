import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Package, ShoppingCart, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

interface RelatorioData {
  vendas: {
    total: number;
    mes_atual: number;
    mes_anterior: number;
    crescimento: number;
  };
  faturamento: {
    total: number;
    mes_atual: number;
    mes_anterior: number;
    crescimento: number;
  };
  produtos: {
    total: number;
    baixo_estoque: number;
    mais_vendidos: Array<{
      id: string;
      descricao_abreviada: string;
      quantidade_vendida: number;
      faturamento: number;
    }>;
  };
  clientes: {
    total: number;
    novos_mes: number;
    top_clientes: Array<{
      id: string;
      nome_razao_social: string;
      total_compras: number;
      valor_total: number;
    }>;
  };
}

export const Relatorios = () => {
  const [data, setData] = useState<RelatorioData>({
    vendas: { total: 0, mes_atual: 0, mes_anterior: 0, crescimento: 0 },
    faturamento: { total: 0, mes_atual: 0, mes_anterior: 0, crescimento: 0 },
    produtos: { total: 0, baixo_estoque: 0, mais_vendidos: [] },
    clientes: { total: 0, novos_mes: 0, top_clientes: [] }
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState({
    inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fim: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchRelatorioData();
  }, [periodo]);

  const fetchRelatorioData = async () => {
    setLoading(true);
    try {
      // Buscar dados de vendas
      const { data: vendas } = await supabase
        .from('vendas')
        .select('id, valor_total, created_at, cliente_id, items')
        .gte('created_at', periodo.inicio)
        .lte('created_at', periodo.fim + 'T23:59:59');

      // Buscar dados do mês anterior para comparação
      const mesAnteriorInicio = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
      const mesAnteriorFim = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
      
      const { data: vendasMesAnterior } = await supabase
        .from('vendas')
        .select('id, valor_total')
        .gte('created_at', mesAnteriorInicio)
        .lte('created_at', mesAnteriorFim + 'T23:59:59');

      // Buscar produtos
      const { data: produtos } = await supabase
        .from('produtos')
        .select('id, descricao_abreviada, quantidade_estoque, quantidade_vendida_ano');

      // Buscar clientes
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id, nome_razao_social, created_at');

      // Processar dados de vendas
      const totalVendas = vendas?.length || 0;
      const faturamentoTotal = vendas?.reduce((sum, v) => sum + v.valor_total, 0) || 0;
      
      const totalVendasAnterior = vendasMesAnterior?.length || 0;
      const faturamentoAnterior = vendasMesAnterior?.reduce((sum, v) => sum + v.valor_total, 0) || 0;

      const crescimentoVendas = totalVendasAnterior > 0 
        ? ((totalVendas - totalVendasAnterior) / totalVendasAnterior) * 100 
        : 0;
      
      const crescimentoFaturamento = faturamentoAnterior > 0 
        ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior) * 100 
        : 0;

      // Processar produtos mais vendidos
      const produtosMaisVendidos = produtos
        ?.sort((a, b) => b.quantidade_vendida_ano - a.quantidade_vendida_ano)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          descricao_abreviada: p.descricao_abreviada,
          quantidade_vendida: p.quantidade_vendida_ano,
          faturamento: 0 // Seria calculado com base nas vendas
        })) || [];

      // Processar clientes
      const clientesNovos = clientes?.filter(c => 
        parseISO(c.created_at) >= parseISO(periodo.inicio)
      ).length || 0;

      // Calcular top clientes (simulado)
      const topClientes = clientes?.slice(0, 5).map(c => ({
        id: c.id,
        nome_razao_social: c.nome_razao_social,
        total_compras: Math.floor(Math.random() * 10) + 1,
        valor_total: Math.random() * 10000 + 1000
      })) || [];

      setData({
        vendas: {
          total: totalVendas,
          mes_atual: totalVendas,
          mes_anterior: totalVendasAnterior,
          crescimento: crescimentoVendas
        },
        faturamento: {
          total: faturamentoTotal,
          mes_atual: faturamentoTotal,
          mes_anterior: faturamentoAnterior,
          crescimento: crescimentoFaturamento
        },
        produtos: {
          total: produtos?.length || 0,
          baixo_estoque: produtos?.filter(p => p.quantidade_estoque < 10).length || 0,
          mais_vendidos: produtosMaisVendidos
        },
        clientes: {
          total: clientes?.length || 0,
          novos_mes: clientesNovos,
          top_clientes: topClientes
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    // Implementar exportação para CSV/PDF
    alert('Funcionalidade de exportação em desenvolvimento');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho e estatísticas do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={exportarRelatorio}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button variant="secondary">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Período de Análise
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data Início"
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo(prev => ({ ...prev, inicio: e.target.value }))}
            />
            <Input
              label="Data Fim"
              type="date"
              value={periodo.fim}
              onChange={(e) => setPeriodo(prev => ({ ...prev, fim: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-50">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vendas</p>
                    <p className="text-2xl font-bold text-gray-900">{data.vendas.mes_atual}</p>
                    <p className={`text-sm ${data.vendas.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.vendas.crescimento >= 0 ? '+' : ''}{data.vendas.crescimento.toFixed(1)}% vs mês anterior
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-50">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Faturamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0
                      }).format(data.faturamento.mes_atual)}
                    </p>
                    <p className={`text-sm ${data.faturamento.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.faturamento.crescimento >= 0 ? '+' : ''}{data.faturamento.crescimento.toFixed(1)}% vs mês anterior
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-50">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Produtos</p>
                    <p className="text-2xl font-bold text-gray-900">{data.produtos.total}</p>
                    <p className="text-sm text-orange-600">
                      {data.produtos.baixo_estoque} com baixo estoque
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-50">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{data.clientes.total}</p>
                    <p className="text-sm text-green-600">
                      +{data.clientes.novos_mes} novos este mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos e Tabelas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Produtos Mais Vendidos */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Produtos Mais Vendidos
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.produtos.mais_vendidos.map((produto, index) => (
                    <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{produto.descricao_abreviada}</p>
                          <p className="text-sm text-gray-500">{produto.quantidade_vendida} vendidos</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Clientes */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Top Clientes
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.clientes.top_clientes.map((cliente, index) => (
                    <div key={cliente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{cliente.nome_razao_social}</p>
                          <p className="text-sm text-gray-500">{cliente.total_compras} compras</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(cliente.valor_total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Vendas (Placeholder) */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Evolução de Vendas
              </h3>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Gráfico de vendas em desenvolvimento</p>
                  <p className="text-sm text-gray-400">Integração com biblioteca de gráficos será implementada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};