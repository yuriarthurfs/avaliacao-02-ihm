import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { AdminLayout } from './components/layout/AdminLayout';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { LoginForm } from './components/auth/LoginForm';
import { ClienteLoginForm } from './components/auth/ClienteLoginForm';
import { FornecedorLoginForm } from './components/auth/FornecedorLoginForm';
import { Home } from './pages/customer/Home';
import { SupplierProducts } from './pages/customer/SupplierProducts';
import { Dashboard } from './pages/admin/Dashboard';
import { Produtos } from './pages/admin/Produtos';
import { Vendas } from './pages/admin/Vendas';
import { Clientes } from './pages/admin/Clientes';
import { Fornecedores } from './pages/admin/Fornecedores';
import { Pagamentos } from './pages/admin/Pagamentos';
import { Relatorios } from './pages/admin/Relatorios';
import { Dashboard as FornecedorDashboard } from './pages/fornecedor/Dashboard';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <Home />
          </CustomerLayout>
        }
      />
      <Route
        path="/supplier/:supplierId"
        element={
          <CustomerLayout>
            <SupplierProducts />
          </CustomerLayout>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/login/cliente" element={<ClienteLoginForm />} />
      <Route path="/login/fornecedor" element={<FornecedorLoginForm />} />
      
      {/* Fornecedor Routes */}
      <Route path="/fornecedor/dashboard" element={<FornecedorDashboard />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/produtos" element={<Produtos />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/fornecedores" element={<Fornecedores />} />
                <Route path="/pagamentos" element={<Pagamentos />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;