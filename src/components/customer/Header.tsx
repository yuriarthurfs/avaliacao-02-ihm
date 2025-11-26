import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, UserCheck, Settings, LogOut, CircleUser as UserCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Cart } from './Cart';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, cliente, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">E-Commerce</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Início
              </Link>
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Produtos
              </Link>
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Categorias
              </Link>
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Ofertas
              </Link>
              <Link to="/contato" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contato
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Icon (Mobile) */}
              <Button variant="secondary" size="sm" className="md:hidden">
                <Search size={18} />
              </Button>

              {/* Wishlist */}
              <Button variant="secondary" size="sm" className="relative">
                <Heart size={18} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* Cart */}
              <Button 
                variant="secondary" 
                size="sm" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={18} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>

              {/* Login Dropdown */}
              {user && cliente ? (
                // Menu do usuário logado
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {cliente.nome_razao_social?.split(' ')[0] || 'Cliente'}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cliente.nome_razao_social}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          <User className="mr-3" size={16} />
                          Ver Perfil
                        </button>
                        
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <LogOut className="mr-3" size={16} />
                          Sair da Conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Menu de login para usuários não logados
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">Login</span>
                  </Button>

                  {isLoginMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Área de Login</p>
                        <p className="text-xs text-gray-500">Escolha seu tipo de acesso</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/login/cliente"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsLoginMenuOpen(false)}
                        >
                          <User className="mr-3" size={16} />
                          <div>
                            <p className="font-medium">Login Cliente</p>
                            <p className="text-xs text-gray-500">Acesse sua conta e faça pedidos</p>
                          </div>
                        </Link>
                        
                        <Link
                          to="/login/fornecedor"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsLoginMenuOpen(false)}
                        >
                          <UserCheck className="mr-3" size={16} />
                          <div>
                            <p className="font-medium">Login Fornecedor</p>
                            <p className="text-xs text-gray-500">Gerencie seus produtos</p>
                          </div>
                        </Link>
                        
                        <Link
                          to="/login"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsLoginMenuOpen(false)}
                        >
                          <Settings className="mr-3" size={16} />
                          <div>
                            <p className="font-medium">Login Administrador</p>
                            <p className="text-xs text-gray-500">Painel administrativo</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="secondary"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Início
                </Link>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Produtos
                </Link>
                <Link
                  to="/categorias"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categorias
                </Link>
                <Link
                  to="/ofertas"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ofertas
                </Link>
                <Link
                  to="/contato"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Click outside to close login menu */}
      {(isLoginMenuOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsLoginMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
        />
      )}

      <Cart />
    </>
  );
};