import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function checkUserAccess() {
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      try {
        // Check if user has any role assigned
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking user roles:', error);
          setHasAccess(false);
        } else {
          // User has access if they have at least one role
          setHasAccess(roles && roles.length > 0);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    }

    checkUserAccess();
  }, [user]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-warning" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Pendente</h1>
          <p className="text-muted-foreground mb-6">
            Seu cadastro foi realizado com sucesso, mas você ainda não tem permissão para acessar o sistema. 
            Entre em contato com o administrador para solicitar acesso.
          </p>
          <Button variant="outline" onClick={signOut}>
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
