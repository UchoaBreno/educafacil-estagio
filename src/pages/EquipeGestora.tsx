import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Membro {
  id: number;
  nome: string;
  cargo: string;
  matricula: string;
  email: string;
  telefone: string | null;
  status: string;
}

export default function EquipeGestora() {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [membroToDelete, setMembroToDelete] = useState<Membro | null>(null);

  useEffect(() => {
    fetchMembros();
  }, [search]);

  async function fetchMembros() {
    setLoading(true);
    let query = supabase.from('equipe_gestora').select('*');
    
    if (search) {
      query = query.or(`nome.ilike.%${search}%,cargo.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order('nome');
    
    if (error) {
      toast.error('Erro ao carregar equipe gestora');
    } else {
      setMembros(data || []);
    }
    setLoading(false);
  }

  function openDeleteDialog(membro: Membro) {
    setMembroToDelete(membro);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!membroToDelete) return;
    
    const { error } = await supabase.from('equipe_gestora').delete().eq('id', membroToDelete.id);
    if (error) {
      toast.error('Erro ao excluir membro');
      return;
    }
    toast.success('Membro excluído com sucesso!');
    setDeleteDialogOpen(false);
    setMembroToDelete(null);
    fetchMembros();
  }

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'Diretor': return 'bg-primary text-primary-foreground';
      case 'Coordenador Pedagógico': return 'bg-success text-success-foreground';
      case 'Secretário': return 'bg-info text-info-foreground';
      case 'Vice-Diretor': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lotado': return 'bg-success text-success-foreground';
      case 'Ativo': return 'bg-success text-success-foreground';
      case 'Transferido': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const columns = [
    { 
      key: 'nome', 
      header: 'Nome',
      render: (m: Membro) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(m.nome)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{m.nome}</span>
        </div>
      )
    },
    { 
      key: 'cargo', 
      header: 'Cargo',
      render: (m: Membro) => (
        <Badge className={getCargoColor(m.cargo)}>{m.cargo}</Badge>
      )
    },
    { key: 'matricula', header: 'Matrícula' },
    { 
      key: 'email', 
      header: 'Email',
      render: (m: Membro) => (
        <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>
      )
    },
    { key: 'telefone', header: 'Telefone', render: (m: Membro) => m.telefone || '-' },
    { 
      key: 'status', 
      header: 'Status',
      render: (m: Membro) => (
        <Badge className={getStatusColor(m.status)}>{m.status}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (m: Membro) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/equipe-gestora/${m.id}`); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/equipe-gestora/${m.id}/editar`); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDeleteDialog(m); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Equipe Gestora">
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground -mt-2">Gerencie os membros da equipe gestora da instituição</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar membro por nome, cargo ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button onClick={() => navigate('/equipe-gestora/novo')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        </div>

        <DataTable columns={columns} data={membros} loading={loading} emptyMessage="Nenhum membro encontrado" />

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o membro "{membroToDelete?.nome}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}