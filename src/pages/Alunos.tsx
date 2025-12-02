import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  ano: number;
  status: string;
  turma_id: number | null;
  turma_nome?: string;
}

export default function Alunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState<Aluno | null>(null);

  useEffect(() => {
    fetchAlunos();
  }, [search]);

  async function fetchAlunos() {
    setLoading(true);
    let query = supabase.from('alunos').select('*, turmas(nome)');
    
    if (search) {
      query = query.or(`nome.ilike.%${search}%,matricula.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order('nome');
    
    if (error) {
      toast.error('Erro ao carregar alunos');
      console.error(error);
    } else {
      setAlunos(data?.map(a => ({
        ...a,
        turma_nome: a.turmas?.nome
      })) || []);
    }
    setLoading(false);
  }

  function openDeleteDialog(aluno: Aluno) {
    setAlunoToDelete(aluno);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!alunoToDelete) return;
    
    const { error } = await supabase.from('alunos').delete().eq('id', alunoToDelete.id);
    if (error) {
      toast.error('Erro ao excluir aluno');
      return;
    }
    toast.success('Aluno excluído com sucesso!');
    setDeleteDialogOpen(false);
    setAlunoToDelete(null);
    fetchAlunos();
  }

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'matricula', header: 'Matrícula' },
    { key: 'ano', header: 'Ano' },
    { key: 'turma_nome', header: 'Turma', render: (aluno: Aluno) => aluno.turma_nome || '-' },
    { 
      key: 'status', 
      header: 'Status',
      render: (aluno: Aluno) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          aluno.status === 'Ativo' || aluno.status === 'Frequentando' ? 'bg-success/10 text-success' :
          aluno.status === 'Inativo' || aluno.status === 'Desistente' ? 'bg-muted text-muted-foreground' :
          'bg-warning/10 text-warning'
        }`}>
          {aluno.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (aluno: Aluno) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/alunos/${aluno.id}`); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/alunos/${aluno.id}/editar`); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDeleteDialog(aluno); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Alunos">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou matrícula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button onClick={() => navigate('/alunos/novo')}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Aluno
          </Button>
        </div>

        <DataTable columns={columns} data={alunos} loading={loading} emptyMessage="Nenhum aluno encontrado" />

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o aluno "{alunoToDelete?.nome}"? 
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