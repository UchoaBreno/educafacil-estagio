import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, ClipboardList, Calendar, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Turma {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  ano: number;
  professor_id: number | null;
  professor_id_2: number | null;
  capacidade: number;
  professor_nome?: string;
  professor_nome_2?: string;
  alunos_count?: number;
}

interface Professor {
  id: number;
  nome: string;
}

export default function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear().toString());
  const [isOpen, setIsOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    turno: 'Manhã',
    ano: new Date().getFullYear(),
    professor_id: '',
    professor_id_2: '',
    capacidade: 30,
  });

  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
  }, [search, anoFiltro]);

  async function fetchTurmas() {
    setLoading(true);
    let query = supabase
      .from('turmas')
      .select('*')
      .eq('ano', parseInt(anoFiltro))
      .order('turno')
      .order('nome');
    
    if (search) {
      query = query.ilike('nome', `%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      toast.error('Erro ao carregar turmas');
    } else {
      // Fetch professor names and alunos count separately
      const turmasWithInfo = await Promise.all((data || []).map(async (t) => {
        let professorNome = undefined;
        let professorNome2 = undefined;
        
        if (t.professor_id) {
          const { data: prof } = await supabase.from('professores').select('nome').eq('id', t.professor_id).maybeSingle();
          professorNome = prof?.nome;
        }
        if (t.professor_id_2) {
          const { data: prof2 } = await supabase.from('professores').select('nome').eq('id', t.professor_id_2).maybeSingle();
          professorNome2 = prof2?.nome;
        }
        
        const { count } = await supabase.from('alunos').select('id', { count: 'exact', head: true }).eq('turma_id', t.id).eq('status', 'Ativo');
        
        return {
          ...t,
          professor_nome: professorNome,
          professor_nome_2: professorNome2,
          alunos_count: count || 0,
        };
      }));
      
      setTurmas(turmasWithInfo);
    }
    setLoading(false);
  }

  async function fetchProfessores() {
    const { data } = await supabase.from('professores').select('id, nome').eq('ativo', true).order('nome');
    setProfessores(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      nome: formData.nome,
      serie: formData.serie,
      turno: formData.turno,
      ano: formData.ano,
      professor_id: formData.professor_id ? parseInt(formData.professor_id) : null,
      professor_id_2: formData.professor_id_2 ? parseInt(formData.professor_id_2) : null,
      capacidade: formData.capacidade,
    };

    if (editingTurma) {
      const { error } = await supabase.from('turmas').update(payload).eq('id', editingTurma.id);
      if (error) {
        toast.error('Erro ao atualizar turma');
        return;
      }
      toast.success('Turma atualizada com sucesso!');
    } else {
      const { error } = await supabase.from('turmas').insert(payload);
      if (error) {
        toast.error('Erro ao cadastrar turma');
        return;
      }
      toast.success('Turma cadastrada com sucesso!');
    }

    setIsOpen(false);
    resetForm();
    fetchTurmas();
  }

  function resetForm() {
    setFormData({
      nome: '',
      serie: '',
      turno: 'Manhã',
      ano: new Date().getFullYear(),
      professor_id: '',
      professor_id_2: '',
      capacidade: 30,
    });
    setEditingTurma(null);
  }

  function openEdit(turma: Turma) {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      serie: turma.serie,
      turno: turma.turno,
      ano: turma.ano,
      professor_id: turma.professor_id?.toString() || '',
      professor_id_2: turma.professor_id_2?.toString() || '',
      capacidade: turma.capacidade || 30,
    });
    setIsOpen(true);
  }

  function openDeleteDialog(turma: Turma) {
    setTurmaToDelete(turma);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!turmaToDelete) return;
    
    const { error } = await supabase.from('turmas').delete().eq('id', turmaToDelete.id);
    if (error) {
      toast.error('Erro ao excluir turma');
      return;
    }
    toast.success('Turma excluída com sucesso!');
    setDeleteDialogOpen(false);
    setTurmaToDelete(null);
    fetchTurmas();
  }

  return (
    <AppLayout title="Turmas">
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground -mt-2">Gerencie todas as turmas da escola</p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ano Letivo:</span>
            <Select value={anoFiltro} onValueChange={setAnoFiltro}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar turmas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1" />

          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTurma ? 'Editar Turma' : 'Adicionar Nova Turma'}</DialogTitle>
                <p className="text-sm text-muted-foreground">Preencha os campos abaixo para criar uma nova turma.</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Turma</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: 7A, 8B, etc."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serie">Ano/Série</Label>
                  <Select value={formData.serie} onValueChange={(value) => setFormData({ ...formData, serie: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar ano/série" />
                    </SelectTrigger>
                    <SelectContent>
                      {['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professor1">Professor Responsável 1</Label>
                  <Select value={formData.professor_id} onValueChange={(value) => setFormData({ ...formData, professor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id.toString()}>{prof.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professor2">Professor Responsável 2</Label>
                  <Select value={formData.professor_id_2} onValueChange={(value) => setFormData({ ...formData, professor_id_2: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id.toString()}>{prof.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade da Sala</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={formData.capacidade}
                    onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Select value={formData.turno} onValueChange={(value) => setFormData({ ...formData, turno: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTurma ? 'Salvar' : 'Criar Turma'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Turma</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Professor 1</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Professor 2</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Período</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Capacidade</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Alunos</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Ano</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((turma) => (
                  <tr key={turma.id} className="border-t hover:bg-muted/30">
                    <td className="p-4 font-medium">{turma.nome}</td>
                    <td className="p-4">{turma.professor_nome || '-'}</td>
                    <td className="p-4">{turma.professor_nome_2 || '-'}</td>
                    <td className="p-4">{turma.turno}</td>
                    <td className="p-4">{turma.capacidade}</td>
                    <td className="p-4">{turma.alunos_count}</td>
                    <td className="p-4">{turma.ano}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(turma)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/turmas/${turma.id}/notas`)}>
                          <ClipboardList className="h-4 w-4 mr-1" />
                          Notas
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/turmas/${turma.id}/frequencia`)}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Frequência
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/turmas/${turma.id}/ata-final`)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Ata Final
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(turma)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Apagar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a turma "{turmaToDelete?.nome}"? 
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
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