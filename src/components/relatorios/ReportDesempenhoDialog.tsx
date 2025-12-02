import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Turma {
  id: number;
  nome: string;
  serie: string;
}

interface ReportDesempenhoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDesempenhoDialog({ open, onOpenChange }: ReportDesempenhoDialogProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const [selectedAno, setSelectedAno] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    const { data } = await supabase.from('turmas').select('id, nome, serie').order('nome');
    if (data) setTurmas(data);
  };

  const generatePDF = async () => {
    if (!selectedTurma || !selectedAno) {
      toast.error('Selecione a turma e o ano');
      return;
    }

    setLoading(true);
    try {
      const turma = turmas.find(t => t.id === parseInt(selectedTurma));
      
      const { data: alunos } = await supabase
        .from('alunos')
        .select('id, nome, matricula')
        .eq('turma_id', parseInt(selectedTurma))
        .order('nome');

      const { data: notas } = await supabase
        .from('notas')
        .select('*')
        .eq('turma_id', parseInt(selectedTurma))
        .eq('ano', parseInt(selectedAno));

      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Relatório de Desempenho', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Turma: ${turma?.nome || ''} - ${turma?.serie || ''}`, 20, 35);
      doc.text(`Ano Letivo: ${selectedAno}`, 20, 42);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 49);

      // Calcular médias por bimestre
      const mediaBim1 = notas?.length ? (notas.reduce((acc, n) => acc + (n.bimestre_1 || 0), 0) / notas.length).toFixed(1) : '-';
      const mediaBim2 = notas?.length ? (notas.reduce((acc, n) => acc + (n.bimestre_2 || 0), 0) / notas.length).toFixed(1) : '-';
      const mediaBim3 = notas?.length ? (notas.reduce((acc, n) => acc + (n.bimestre_3 || 0), 0) / notas.length).toFixed(1) : '-';
      const mediaBim4 = notas?.length ? (notas.reduce((acc, n) => acc + (n.bimestre_4 || 0), 0) / notas.length).toFixed(1) : '-';

      doc.setFontSize(14);
      doc.text('Evolução das Médias por Bimestre:', 20, 65);
      
      doc.setFontSize(11);
      doc.text(`1º Bimestre: ${mediaBim1}`, 30, 75);
      doc.text(`2º Bimestre: ${mediaBim2}`, 30, 82);
      doc.text(`3º Bimestre: ${mediaBim3}`, 30, 89);
      doc.text(`4º Bimestre: ${mediaBim4}`, 30, 96);

      if (alunos && alunos.length > 0) {
        const tableData = alunos.map(aluno => {
          const alunoNotas = notas?.filter(n => n.aluno_id === aluno.id) || [];
          const b1 = alunoNotas.length ? (alunoNotas.reduce((acc, n) => acc + (n.bimestre_1 || 0), 0) / alunoNotas.length).toFixed(1) : '-';
          const b2 = alunoNotas.length ? (alunoNotas.reduce((acc, n) => acc + (n.bimestre_2 || 0), 0) / alunoNotas.length).toFixed(1) : '-';
          const b3 = alunoNotas.length ? (alunoNotas.reduce((acc, n) => acc + (n.bimestre_3 || 0), 0) / alunoNotas.length).toFixed(1) : '-';
          const b4 = alunoNotas.length ? (alunoNotas.reduce((acc, n) => acc + (n.bimestre_4 || 0), 0) / alunoNotas.length).toFixed(1) : '-';
          const media = alunoNotas.length ? (alunoNotas.reduce((acc, n) => acc + (n.media_anual || 0), 0) / alunoNotas.length).toFixed(1) : '-';
          
          return [aluno.nome, b1, b2, b3, b4, media];
        });

        autoTable(doc, {
          startY: 110,
          head: [['Aluno', '1º Bim', '2º Bim', '3º Bim', '4º Bim', 'Média']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      doc.save(`relatorio-desempenho-${turma?.nome}-${selectedAno}.pdf`);
      toast.success('Relatório gerado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Relatório de Desempenho</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Label className="w-16">Turma</Label>
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Sele..." />
              </SelectTrigger>
              <SelectContent>
                {turmas.map(turma => (
                  <SelectItem key={turma.id} value={turma.id.toString()}>
                    {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Label className="w-10">Ano</Label>
            <Select value={selectedAno} onValueChange={setSelectedAno}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Sele..." />
              </SelectTrigger>
              <SelectContent>
                {anos.map(ano => (
                  <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            O relatório incluirá um gráfico de linhas mostrando o desempenho dos alunos por bimestre.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={generatePDF} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
