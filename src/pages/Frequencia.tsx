import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, CheckCircle, XCircle, FileText, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
}

interface FrequenciaRecord {
  id?: number;
  aluno_id: number;
  turma_id: number;
  data: string;
  status: 'presente' | 'faltou' | 'justificado';
  justificativa?: string;
}

interface Turma {
  id: number;
  nome: string;
  ano: number;
}

const DIAS_SEMANA = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];

export default function Frequencia() {
  const navigate = useNavigate();
  const { turmaId } = useParams();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [frequencias, setFrequencias] = useState<Record<string, FrequenciaRecord>>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Estado para o modal de justificativa
  const [justificativaDialogOpen, setJustificativaDialogOpen] = useState(false);
  const [justificativaText, setJustificativaText] = useState('');
  const [selectedFrequencia, setSelectedFrequencia] = useState<{ alunoId: number; data: Date; alunoNome: string } | null>(null);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(new Date(currentYear, currentMonth)),
    end: endOfMonth(new Date(currentYear, currentMonth))
  }).filter(day => {
    const dayOfWeek = getDay(day);
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Excluir finais de semana
  });

  useEffect(() => {
    if (turmaId) {
      loadData();
    }
  }, [turmaId, currentMonth, currentYear]);

  async function loadData() {
    setLoading(true);

    const { data: turmaData } = await supabase
      .from('turmas')
      .select('id, nome, ano')
      .eq('id', parseInt(turmaId!))
      .maybeSingle();

    if (turmaData) {
      setTurma(turmaData);
    }

    const { data: alunosData } = await supabase
      .from('alunos')
      .select('id, nome, matricula')
      .eq('turma_id', parseInt(turmaId!))
      .eq('status', 'Ativo')
      .order('nome');

    if (alunosData) {
      setAlunos(alunosData);

      const startDate = format(startOfMonth(new Date(currentYear, currentMonth)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(currentYear, currentMonth)), 'yyyy-MM-dd');

      const { data: frequenciaData } = await supabase
        .from('frequencia')
        .select('*')
        .eq('turma_id', parseInt(turmaId!))
        .gte('data', startDate)
        .lte('data', endDate);

      const freqMap: Record<string, FrequenciaRecord> = {};
      frequenciaData?.forEach(f => {
        freqMap[`${f.aluno_id}-${f.data}`] = f as FrequenciaRecord;
      });
      setFrequencias(freqMap);
    }

    setLoading(false);
  }

  async function toggleFrequencia(alunoId: number, data: Date) {
    const dateStr = format(data, 'yyyy-MM-dd');
    const key = `${alunoId}-${dateStr}`;
    const current = frequencias[key];

    let newStatus: 'presente' | 'faltou' | 'justificado' = 'presente';
    if (current) {
      if (current.status === 'presente') newStatus = 'faltou';
      else if (current.status === 'faltou') newStatus = 'justificado';
      else newStatus = 'presente';
    }

    const newFreq: FrequenciaRecord = {
      ...current,
      aluno_id: alunoId,
      turma_id: parseInt(turmaId!),
      data: dateStr,
      status: newStatus,
    };

    setFrequencias(prev => ({
      ...prev,
      [key]: newFreq
    }));

    try {
      if (current?.id) {
        await supabase.from('frequencia').update({ status: newStatus }).eq('id', current.id);
      } else {
        const { data: insertedData } = await supabase.from('frequencia').insert({
          aluno_id: alunoId,
          turma_id: parseInt(turmaId!),
          data: dateStr,
          status: newStatus,
        }).select().single();
        
        if (insertedData) {
          setFrequencias(prev => ({
            ...prev,
            [key]: insertedData as FrequenciaRecord
          }));
        }
      }
    } catch (error) {
      toast.error('Erro ao atualizar frequência');
    }
  }

  function openJustificativaDialog(alunoId: number, data: Date, alunoNome: string) {
    const dateStr = format(data, 'yyyy-MM-dd');
    const key = `${alunoId}-${dateStr}`;
    const current = frequencias[key];
    setSelectedFrequencia({ alunoId, data, alunoNome });
    setJustificativaText(current?.justificativa || '');
    setJustificativaDialogOpen(true);
  }

  async function handleSaveJustificativa() {
    if (!selectedFrequencia) return;
    
    const { alunoId, data } = selectedFrequencia;
    const dateStr = format(data, 'yyyy-MM-dd');
    const key = `${alunoId}-${dateStr}`;
    const current = frequencias[key];

    try {
      if (current?.id) {
        await supabase.from('frequencia').update({ 
          status: 'justificado',
          justificativa: justificativaText 
        }).eq('id', current.id);
        
        setFrequencias(prev => ({
          ...prev,
          [key]: { ...current, status: 'justificado', justificativa: justificativaText }
        }));
      } else {
        const { data: insertedData } = await supabase.from('frequencia').insert({
          aluno_id: alunoId,
          turma_id: parseInt(turmaId!),
          data: dateStr,
          status: 'justificado',
          justificativa: justificativaText,
        }).select().single();
        
        if (insertedData) {
          setFrequencias(prev => ({
            ...prev,
            [key]: insertedData as FrequenciaRecord
          }));
        }
      }
      toast.success('Justificativa salva com sucesso!');
      setJustificativaDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar justificativa');
    }
  }

  function getStatusIcon(status: string | undefined) {
    switch (status) {
      case 'presente':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'faltou':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'justificado':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  }

  const MESES = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  return (
    <AppLayout title={`Frequência - ${turma?.nome || ''}`}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <p className="text-muted-foreground">Controle de frequência dos alunos - Ano {turma?.ano || currentYear}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/turmas')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Turmas
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mês:</span>
            <Select value={currentMonth.toString()} onValueChange={(v) => setCurrentMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes, index) => (
                  <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ano:</span>
            <Select value={currentYear.toString()} onValueChange={(v) => setCurrentYear(parseInt(v))}>
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
        </div>

        <div className="border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Frequência - {MESES[currentMonth]} de {currentYear}</h3>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Presente</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Faltou</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-yellow-500" />
              <span>Justificado</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 min-w-[200px]">Aluno</th>
                    {monthDays.map((day) => (
                      <th key={day.toISOString()} className="p-2 text-center min-w-[50px]">
                        <div className="text-xs text-muted-foreground">{DIAS_SEMANA[getDay(day)]}</div>
                        <div>{format(day, 'd')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr key={aluno.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{aluno.nome}</div>
                            <div className="text-xs text-muted-foreground">{aluno.matricula}</div>
                          </div>
                        </div>
                      </td>
                      {monthDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const key = `${aluno.id}-${dateStr}`;
                        const freq = frequencias[key];
                        return (
                          <td key={day.toISOString()} className="p-2 text-center">
                            <div className="flex flex-col items-center">
                              <button
                                onClick={() => toggleFrequencia(aluno.id, day)}
                                className="hover:scale-110 transition-transform cursor-pointer"
                              >
                                {getStatusIcon(freq?.status || 'presente')}
                              </button>
                              {freq?.status === 'faltou' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); openJustificativaDialog(aluno.id, day, aluno.nome); }}
                                  className="text-xs text-red-500 cursor-pointer hover:underline"
                                >
                                  Justificar
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Justificativa */}
        <Dialog open={justificativaDialogOpen} onOpenChange={setJustificativaDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Justificar Falta</DialogTitle>
              <DialogDescription>
                Adicione uma justificativa para a falta do aluno.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Digite a justificativa da falta..."
                value={justificativaText}
                onChange={(e) => setJustificativaText(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setJustificativaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveJustificativa}>
                  Salvar Justificativa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}