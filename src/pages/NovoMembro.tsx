import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Formacao {
  id: string;
  curso: string;
  nivel: string;
  ano_conclusao: string;
}

const CARGOS = ['Diretor', 'Vice-Diretor', 'Coordenador Pedagógico', 'Secretário', 'Orientador Educacional', 'Supervisor'];

export default function NovoMembro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    foto_url: '',
    nome: '',
    matricula: '',
    rg: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    status: 'Lotado',
    data_lotacao: '',
    arquivo_url: '',
    biografia: '',
  });

  const [formacoes, setFormacoes] = useState<Formacao[]>([
    { id: '1', curso: '', nivel: '', ano_conclusao: '' }
  ]);

  useEffect(() => {
    if (isEditing) {
      loadMembro();
    }
  }, [id]);

  async function loadMembro() {
    const { data, error } = await supabase
      .from('equipe_gestora')
      .select('*')
      .eq('id', parseInt(id!))
      .maybeSingle();

    if (error || !data) {
      toast.error('Erro ao carregar membro');
      navigate('/equipe-gestora');
      return;
    }

    setFormData({
      foto_url: data.foto_url || '',
      nome: data.nome,
      matricula: data.matricula,
      rg: data.rg || '',
      cpf: data.cpf || '',
      email: data.email,
      telefone: data.telefone || '',
      cargo: data.cargo,
      status: data.status || 'Lotado',
      data_lotacao: data.data_lotacao || '',
      arquivo_url: data.arquivo_url || '',
      biografia: data.biografia || '',
    });

    if (data.formacoes && Array.isArray(data.formacoes)) {
      setFormacoes(data.formacoes as unknown as Formacao[]);
    }
  }

  function addFormacao() {
    setFormacoes([...formacoes, { id: Date.now().toString(), curso: '', nivel: '', ano_conclusao: '' }]);
  }

  function removeFormacao(id: string) {
    if (formacoes.length > 1) {
      setFormacoes(formacoes.filter(f => f.id !== id));
    }
  }

  function updateFormacao(id: string, field: keyof Formacao, value: string) {
    setFormacoes(formacoes.map(f => f.id === id ? { ...f, [field]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nome: formData.nome,
      matricula: formData.matricula,
      rg: formData.rg || null,
      cpf: formData.cpf || null,
      email: formData.email,
      telefone: formData.telefone || null,
      cargo: formData.cargo,
      status: formData.status,
      data_lotacao: formData.data_lotacao || null,
      arquivo_url: formData.arquivo_url || null,
      biografia: formData.biografia || null,
      formacoes: JSON.parse(JSON.stringify(formacoes.filter(f => f.curso))),
      foto_url: formData.foto_url || null,
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from('equipe_gestora').update(payload).eq('id', parseInt(id!));
        if (error) throw error;
        toast.success('Membro atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('equipe_gestora').insert(payload);
        if (error) {
          if (error.code === '23505') {
            toast.error('Matrícula ou email já cadastrados');
            setLoading(false);
            return;
          }
          throw error;
        }
        toast.success('Membro cadastrado com sucesso!');
      }
      navigate('/equipe-gestora');
    } catch (error) {
      toast.error('Erro ao salvar membro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Equipe Gestora">
      <div className="space-y-6 animate-fade-in max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/equipe-gestora')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Adicionar novo membro
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  {formData.foto_url ? (
                    <img src={formData.foto_url} alt="Foto" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Escolher Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Recomendado: 400x400px, formato JPG ou PNG</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo*</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula*</Label>
                  <Input
                    id="matricula"
                    placeholder="Número de matrícula"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rg">RG*</Label>
                  <Input
                    id="rg"
                    placeholder="Número do RG"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF*</Label>
                  <Input
                    id="cpf"
                    placeholder="Número do CPF"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email institucional"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone*</Label>
                  <Input
                    id="telefone"
                    placeholder="Número de telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo*</Label>
                <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGOS.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Situação Funcional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Situação Funcional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status*</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  className="flex flex-wrap gap-4"
                >
                  {['Lotado', 'Temporário', 'Afastado', 'Aposentado', 'Transferido'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <RadioGroupItem value={status} id={status} />
                      <Label htmlFor={status} className="font-normal">{status}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_lotacao">Data de Lotação na Escola</Label>
                <Input
                  id="data_lotacao"
                  type="date"
                  value={formData.data_lotacao}
                  onChange={(e) => setFormData({ ...formData, data_lotacao: e.target.value })}
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload de Memorando/Ofício</Label>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Escolher Arquivo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Informações Profissionais</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addFormacao} className="gap-1">
                <Plus className="h-4 w-4" />
                Adicionar Formação
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {formacoes.map((formacao, index) => (
                <div key={formacao.id} className="space-y-4 p-4 border rounded-lg relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Formação {index + 1}</span>
                    {formacoes.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFormacao(formacao.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Formação*</Label>
                      <Input
                        placeholder="Nome do curso"
                        value={formacao.curso}
                        onChange={(e) => updateFormacao(formacao.id, 'curso', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nível*</Label>
                      <Select
                        value={formacao.nivel}
                        onValueChange={(value) => updateFormacao(formacao.id, 'nivel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Graduação">Graduação</SelectItem>
                          <SelectItem value="Especialização">Especialização</SelectItem>
                          <SelectItem value="Mestrado">Mestrado</SelectItem>
                          <SelectItem value="Doutorado">Doutorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ano de Conclusão*</Label>
                      <Select
                        value={formacao.ano_conclusao}
                        onValueChange={(value) => updateFormacao(formacao.id, 'ano_conclusao', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
                            <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="biografia">Biografia</Label>
                <Textarea
                  id="biografia"
                  placeholder="Breve biografia profissional"
                  rows={4}
                  value={formData.biografia}
                  onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/equipe-gestora')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}