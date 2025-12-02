import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, School, Calendar, Trophy, UserCircle, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, getDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalAlunos: number;
  totalTurmas: number;
  totalEventos: number;
  mediaNotas: number | null;
}

interface Evento {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
}

interface FrequenciaData {
  dia: string;
  presencas: number;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const atividadesRecentes = [
  { id: 1, tipo: 'presenca', descricao: 'Ana Silva registrou presença para a turma 9B', tempo: '2 horas atrás' },
  { id: 2, tipo: 'nota', descricao: 'João registrou notas para Matemática do 7A', tempo: '3 horas atrás' },
  { id: 3, tipo: 'evento', descricao: 'Pedro adicionou um novo evento no calendário', tempo: '5 horas atrás' },
  { id: 4, tipo: 'aluno', descricao: 'Juliana editou informações do aluno Carlos Mendes', tempo: '6 horas atrás' },
];

export default function Painel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalTurmas: 0,
    totalEventos: 0,
    mediaNotas: null,
  });
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [frequenciaData, setFrequenciaData] = useState<FrequenciaData[]>([]);
  const [periodoFrequencia, setPeriodoFrequencia] = useState('mes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchFrequenciaData();
  }, [periodoFrequencia]);

  async function fetchData() {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const [alunosRes, turmasRes, eventosRes, proximosRes, notasRes] = await Promise.all([
        supabase.from('alunos').select('id', { count: 'exact', head: true }),
        supabase.from('turmas').select('id', { count: 'exact', head: true }),
        supabase.from('eventos').select('id', { count: 'exact', head: true }).gte('data', hoje),
        supabase.from('eventos').select('*').gte('data', hoje).order('data', { ascending: true }).limit(5),
        supabase.from('notas').select('media_anual'),
      ]);

      // Calcular média geral das notas
      let mediaNotas: number | null = null;
      if (notasRes.data && notasRes.data.length > 0) {
        const notasValidas = notasRes.data.filter(n => n.media_anual != null);
        if (notasValidas.length > 0) {
          const soma = notasValidas.reduce((acc, n) => acc + (n.media_anual || 0), 0);
          mediaNotas = Math.round((soma / notasValidas.length) * 10) / 10;
        }
      }

      setStats({
        totalAlunos: alunosRes.count || 0,
        totalTurmas: turmasRes.count || 0,
        totalEventos: eventosRes.count || 0,
        mediaNotas,
      });

      setProximosEventos(proximosRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFrequenciaData() {
    try {
      const hoje = new Date();
      let dataInicio: string;
      let dataFim: string;

      if (periodoFrequencia === 'mes') {
        dataInicio = format(startOfMonth(hoje), 'yyyy-MM-dd');
        dataFim = format(endOfMonth(hoje), 'yyyy-MM-dd');
      } else {
        // Última semana
        const umaSemanaAtras = new Date(hoje);
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        dataInicio = format(umaSemanaAtras, 'yyyy-MM-dd');
        dataFim = format(hoje, 'yyyy-MM-dd');
      }

      const { data: frequencias } = await supabase
        .from('frequencia')
        .select('data, status')
        .gte('data', dataInicio)
        .lte('data', dataFim);

      // Agrupar presenças por dia da semana
      const diasAgrupados: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      
      if (frequencias) {
        frequencias.forEach(f => {
          if (f.status === 'presente') {
            const diaSemana = getDay(parseISO(f.data));
            diasAgrupados[diaSemana]++;
          }
        });
      }

      // Formatar dados para o gráfico (apenas dias úteis: seg a sex)
      const dadosGrafico: FrequenciaData[] = [1, 2, 3, 4, 5].map(dia => ({
        dia: DIAS_SEMANA[dia],
        presencas: diasAgrupados[dia],
      }));

      setFrequenciaData(dadosGrafico);
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'reunião': return 'bg-blue-100 text-blue-600';
      case 'avaliação': return 'bg-amber-100 text-amber-600';
      case 'feriado': return 'bg-green-100 text-green-600';
      case 'festa': return 'bg-pink-100 text-pink-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  const getAtividadeIcon = (tipo: string) => {
    switch (tipo) {
      case 'presenca': return <UserCircle className="h-5 w-5" />;
      case 'nota': return <FileText className="h-5 w-5" />;
      case 'evento': return <Calendar className="h-5 w-5" />;
      case 'aluno': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground -mt-2">Bem-vindo à secretaria digital</p>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/alunos')}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                  <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalAlunos.toLocaleString()}</p>
                  <p className="text-xs text-success mt-1">+5,2% este mês</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/turmas')}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Turmas</p>
                  <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalTurmas}</p>
                  <p className="text-xs text-muted-foreground mt-1">ativas</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <School className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/calendario')}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eventos</p>
                  <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalEventos}</p>
                  <p className="text-xs text-success mt-1">+2,1% próximos 30 dias</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média de Notas</p>
                  <p className="text-2xl font-bold mt-1">
                    {loading ? '...' : stats.mediaNotas !== null ? stats.mediaNotas.toFixed(1) : '-'}
                  </p>
                  <p className="text-xs text-success mt-1">+0,8% último bimestre</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Events Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Estatísticas de Frequência */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Estatísticas de Frequência</CardTitle>
                <Select value={periodoFrequencia} onValueChange={setPeriodoFrequencia}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes">Este mês</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequenciaData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <XAxis 
                      dataKey="dia" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value} presenças`, 'Presenças']}
                    />
                    <Bar 
                      dataKey="presencas" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Eventos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : proximosEventos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum evento futuro
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {proximosEventos.map((evento) => (
                    <div key={evento.id} className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTipoIcon(evento.tipo)}`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{evento.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(evento.data), "d MMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
              <Button variant="link" className="text-primary p-0 h-auto">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atividadesRecentes.map((atividade) => (
                <div key={atividade.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    atividade.tipo === 'presenca' ? 'bg-blue-100 text-blue-600' :
                    atividade.tipo === 'nota' ? 'bg-purple-100 text-purple-600' :
                    atividade.tipo === 'evento' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getAtividadeIcon(atividade.tipo)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{atividade.descricao}</p>
                    <p className="text-xs text-muted-foreground">{atividade.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
