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
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    setLoading(true);
    setUser(firebaseUser);
    setAdmin(null);
    setCliente(null);

    if (firebaseUser) {
      const email = firebaseUser.email;

      /** ----------------------------
       * 1) BUSCAR ADMIN POR UID
       * ---------------------------- */
      const { data: adminData } = await supabase
        .from('administradores')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (adminData) {
        setAdmin(adminData);
        setLoading(false);
        return;
      }

      /** ----------------------------
       * 2) BUSCAR CLIENTE PELO EMAIL
       *    clientes.emails é text[]
       * ---------------------------- */
      const { data: clienteData, error } = await supabase
        .from('clientes')
        .select('*')
        .contains('emails', [email]);  // <<--- AQUI ESTÁ A MÁGICA

      if (error) {
        console.error('Erro ao buscar cliente:', error);
      }

      if (clienteData && clienteData.length > 0) {
        setCliente(clienteData[0]);
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