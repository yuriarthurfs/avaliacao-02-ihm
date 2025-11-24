import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  admin: any | null;
  cliente: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Buscar dados do administrador no Supabase
        const { data: adminData } = await supabase
          .from('administradores')
          .select('*')
          .eq('firebase_uid', user.uid)
          .single();
        
        setAdmin(adminData);

        // Se não for admin, buscar dados do cliente
        if (!adminData) {
          const { data: clienteData } = await supabase
            .from('clientes')
            .select('*')
            .eq('firebase_uid', user.uid)
            .single();
          
          setCliente(clienteData);
        }
      } else {
        setAdmin(null);
        setCliente(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, admin, cliente, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};