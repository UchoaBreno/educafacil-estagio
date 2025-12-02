import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Evento {
  id: number;
  titulo: string;
  descricao: string | null;
  data: string;
  tipo: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  local: string | null;
}

export default function Calendario() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    titulo: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '08:00',
    hora_fim: '09:00',
    local: '',
  });

  useEffect(() => {
    fetchEventos();
  }, []);

  async function fetchEventos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('data', { ascending: true });
    
    if (error) {
      toast.error('Erro ao carregar eventos');
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      titulo: formData.titulo,
      data: formData.data,
      tipo: 'Evento',
      hora_inicio: formData.hora_inicio,
      hora_fim: formData.hora_fim,
      local: formData.local || null,
    };

    const { error } = await supabase.from('eventos').insert(payload);
    if (error) {
      toast.error('Erro ao cadastrar evento');
      return;
    }
    toast.success('Evento adicionado com sucesso!');

    setIsOpen(false);
    resetForm();
    fetchEventos();
  }

  function resetForm() {
    setFormData({
      titulo: '',
      data: format(selectedDate, 'yyyy-MM-dd'),
      hora_inicio: '08:00',
      hora_fim: '09:00',
      local: '',
    });
  }

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, data: format(date, 'yyyy-MM-dd') }));
    }
  }

  function openAddDialog() {
    setFormData({
      titulo: '',
      data: format(selectedDate, 'yyyy-MM-dd'),
      hora_inicio: '08:00',
      hora_fim: '09:00',
      local: '',
    });
    setIsOpen(true);
  }

  const eventosNaDataSelecionada = eventos.filter(e => 
    isSameDay(parseISO(e.data), selectedDate)
  );

  const eventDates = eventos.map(e => parseISO(e.data));

  return (
    <AppLayout title="Calendário">
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground -mt-2">Gerencie eventos e datas importantes</p>
        
        <div className="flex justify-end">
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Evento
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Calendário */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  className="rounded-md pointer-events-auto"
                  modifiers={{
                    hasEvent: eventDates,
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: 'bold',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Eventos do dia */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Eventos - {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventosNaDataSelecionada.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Não há eventos para esta data.</p>
                  <Button variant="outline" onClick={openAddDialog}>
                    Adicionar um evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventosNaDataSelecionada.map((evento) => (
                    <div 
                      key={evento.id} 
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <h4 className="font-medium text-foreground">{evento.titulo}</h4>
                      {(evento.hora_inicio || evento.hora_fim) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {evento.hora_inicio && evento.hora_fim 
                              ? `${evento.hora_inicio} - ${evento.hora_fim}`
                              : evento.hora_inicio || evento.hora_fim}
                          </span>
                        </div>
                      )}
                      {evento.local && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{evento.local}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para adicionar evento */}
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do evento para adicioná-lo ao calendário.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Nome do Evento</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Reunião de pais"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="data"
                    type="date"
                    className="pl-10"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio" className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Hora de Início
                  </Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim" className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Hora de Término
                  </Label>
                  <Input
                    id="hora_fim"
                    type="time"
                    value={formData.hora_fim}
                    onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="local" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Local
                </Label>
                <Input
                  id="local"
                  placeholder="Ex: Auditório da escola"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar Evento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
