import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Users, FileText, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
}

interface Nota {
  id?: number;
  aluno_id: number;
  turma_id: number;
  disciplina: string;
  bimestre_1: number | null;
  bimestre_2: number | null;
  bimestre_3: number | null;
  bimestre_4: number | null;
  media_anual?: number | null;
  situacao?: string | null;
}

interface Turma {
  id: number;
  nome: string;
}

export default function Notas() {
  const navigate = useNavigate();
  const { turmaId } = useParams();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [notas, setNotas] = useState<Record<number, Nota>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [disciplina, setDisciplina] = useState('Todas as matérias');

  useEffect(() => {
    if (turmaId) {
      loadData();
    }
  }, [turmaId]);

  async function loadData() {
    setLoading(true);

    // Load turma
    const { data: turmaData } = await supabase
      .from('turmas')
      .select('id, nome')
      .eq('id', parseInt(turmaId!))
      .maybeSingle();

    if (turmaData) {
      setTurma(turmaData);
    }

    // Load alunos da turma
    const { data: alunosData } = await supabase
      .from('alunos')
      .select('id, nome, matricula')
      .eq('turma_id', parseInt(turmaId!))
      .eq('status', 'Ativo')
      .order('nome');

    if (alunosData) {
      setAlunos(alunosData);

      // Load notas
      const { data: notasData } = await supabase
        .from('notas')
        .select('*')
        .eq('turma_id', parseInt(turmaId!));

      const notasMap: Record<number, Nota> = {};
      alunosData.forEach(aluno => {
        const existingNota = notasData?.find(n => n.aluno_id === aluno.id);
        notasMap[aluno.id] = existingNota || {
          aluno_id: aluno.id,
          turma_id: parseInt(turmaId!),
          disciplina: 'Geral',
          bimestre_1: null,
          bimestre_2: null,
          bimestre_3: null,
          bimestre_4: null,
        };
      });
      setNotas(notasMap);
    }

    setLoading(false);
  }

  function updateNota(alunoId: number, field: keyof Nota, value: number | null) {
    setNotas(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [field]: value
      }
    }));
  }

  function calcularMedia(nota: Nota | undefined): number | null {
    if (!nota) return null;
    const { bimestre_1, bimestre_2, bimestre_3, bimestre_4 } = nota;
    if (bimestre_1 != null && bimestre_2 != null && bimestre_3 != null && bimestre_4 != null) {
      return Math.round(((bimestre_1 + bimestre_2 + bimestre_3 + bimestre_4) / 4) * 10) / 10;
    }
    return null;
  }

  function calcularSituacao(media: number | null): string {
    if (media === null) return 'Em andamento';
    return media >= 6 ? 'Aprovado' : 'Reprovado';
  }

  function getMediaColor(media: number | null): string {
    if (media === null) return 'bg-muted';
    if (media >= 7) return 'bg-green-100 text-green-800';
    if (media >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  function getSituacaoColor(situacao: string): string {
    switch (situacao) {
      case 'Aprovado': return 'text-green-600';
      case 'Reprovado': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const alunoId of Object.keys(notas)) {
        const nota = notas[parseInt(alunoId)];
        if (nota.id) {
          await supabase.from('notas').update({
            bimestre_1: nota.bimestre_1,
            bimestre_2: nota.bimestre_2,
            bimestre_3: nota.bimestre_3,
            bimestre_4: nota.bimestre_4,
          }).eq('id', nota.id);
        } else {
          await supabase.from('notas').insert({
            aluno_id: nota.aluno_id,
            turma_id: nota.turma_id,
            disciplina: nota.disciplina,
            bimestre_1: nota.bimestre_1,
            bimestre_2: nota.bimestre_2,
            bimestre_3: nota.bimestre_3,
            bimestre_4: nota.bimestre_4,
          });
        }
      }
      toast.success('Notas salvas com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar notas');
    } finally {
      setSaving(false);
    }
  }

  const filteredAlunos = alunos.filter(a => 
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const totalAlunos = filteredAlunos.length;
  const mediaTurma = filteredAlunos.length > 0
    ? filteredAlunos.reduce((acc, aluno) => {
        const media = calcularMedia(notas[aluno.id]);
        return acc + (media || 0);
      }, 0) / filteredAlunos.filter(a => calcularMedia(notas[a.id]) !== null).length || 0
    : 0;

  return (
    <AppLayout title={`Notas - ${turma?.nome || ''}`}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-muted-foreground">Lançamento e gerenciamento de notas bimestrais</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/turmas')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Turmas
          </Button>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar alunos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={disciplina} onValueChange={setDisciplina}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas as matérias">Todas as matérias</SelectItem>
              <SelectItem value="Português">Português</SelectItem>
              <SelectItem value="Matemática">Matemática</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Professores
          </Button>

          <div className="flex-1" />

          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Gerar Boletins
          </Button>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Nome do Aluno</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">1º Bimestre</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">2º Bimestre</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">3º Bimestre</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">4º Bimestre</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">Média Anual</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.map((aluno) => {
                    const nota = notas[aluno.id];
                    const media = calcularMedia(nota);
                    const situacao = calcularSituacao(media);
                    return (
                      <tr key={aluno.id} className="border-t">
                        <td className="p-4 font-medium">{aluno.nome}</td>
                        <td className="p-4">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={nota?.bimestre_1 ?? ''}
                            onChange={(e) => updateNota(aluno.id, 'bimestre_1', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-20 text-center mx-auto"
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={nota?.bimestre_2 ?? ''}
                            onChange={(e) => updateNota(aluno.id, 'bimestre_2', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-20 text-center mx-auto"
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={nota?.bimestre_3 ?? ''}
                            onChange={(e) => updateNota(aluno.id, 'bimestre_3', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-20 text-center mx-auto"
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={nota?.bimestre_4 ?? ''}
                            onChange={(e) => updateNota(aluno.id, 'bimestre_4', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-20 text-center mx-auto"
                          />
                        </td>
                        <td className="p-4">
                          <div className={`w-20 py-2 rounded text-center mx-auto font-semibold ${getMediaColor(media)}`}>
                            {media !== null ? media.toFixed(1) : '-'}
                          </div>
                        </td>
                        <td className={`p-4 text-center font-medium ${getSituacaoColor(situacao)}`}>
                          {situacao}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t p-4 bg-muted/30 flex justify-end gap-8 text-sm">
              <span>Total de alunos: {totalAlunos}</span>
              <span>Média da turma: {mediaTurma.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}