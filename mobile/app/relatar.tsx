import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { APP_VERSION } from '../src/lib/constants';
import { errorLog } from '../src/lib/errorLog';
import { issueUrl, openExternal } from '../src/lib/links';
import { deviceInfo, formatDiagnostics, reportIssueUrl, reportText, type ReportDraft } from '../src/lib/report';
import { shareText } from '../src/lib/share';
import { useTheme } from '../src/theme/ThemeProvider';
import { AppText } from '../src/ui/AppText';
import { Button } from '../src/ui/Button';
import { Callout } from '../src/ui/Callout';
import { Card } from '../src/ui/Card';
import { CheckboxRow } from '../src/ui/Checkbox';
import { Segmented } from '../src/ui/Chips';
import { Screen } from '../src/ui/Screen';
import { Section } from '../src/ui/Section';
import { TextField } from '../src/ui/TextField';

type Kind = ReportDraft['kind'] | 'divergencia';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'problema', label: 'Problema' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'divergencia', label: 'Divergência' },
];

/**
 * Relato de problema ou sugestão. O app não envia nada: monta o texto aqui,
 * à vista do profissional, e abre o GitHub (ou a folha de compartilhamento).
 */
export default function ReportScreen() {
  const params = useLocalSearchParams<{ tipo?: string }>();
  const initial = KINDS.some((kind) => kind.value === params.tipo) ? (params.tipo as Kind) : 'problema';
  const [kind, setKind] = useState<Kind>(initial);

  return (
    <Screen back title="Relatar um problema" subtitle="Ou sugerir uma melhoria. Você revisa tudo antes de enviar">
      <Segmented options={KINDS} value={kind} onChange={setKind} />
      {kind === 'divergencia' ? <DivergenceInfo /> : <ReportForm key={kind} kind={kind} />}
    </Screen>
  );
}

function ReportForm({ kind }: { kind: ReportDraft['kind'] }) {
  const { dark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [errors, setErrors] = useState(errorLog.list());
  const [includeErrors, setIncludeErrors] = useState(errors.length > 0);
  const [showAttempt, setShowAttempt] = useState(false);

  const isProblem = kind === 'problema';
  const draft: ReportDraft = { kind, title, description, steps };
  const diagnostics = formatDiagnostics(deviceInfo(dark ? 'escuro' : 'claro'), includeErrors ? errors : []);
  const missing = !title.trim() ? 'Escreva um resumo em uma linha.' : !description.trim() ? 'Descreva o que aconteceu.' : null;

  const submit = (action: () => void) => {
    setShowAttempt(true);
    if (!missing) action();
  };

  return (
    <View style={{ gap: 16 }}>
      <Callout tone="warning" title="Não inclua dados de pacientes">
        Nada de nomes, CPF, datas de nascimento ou resultados de um paciente: relatos no GitHub são públicos. Descreva o problema com dados
        inventados.
      </Callout>

      <TextField
        label="Resumo em uma linha *"
        value={title}
        onChangeText={setTitle}
        placeholder={isProblem ? 'Ex.: o PDF da ficha sai em branco' : 'Ex.: exportar o plano em planilha'}
        maxLength={120}
        error={showAttempt && !title.trim() ? 'Escreva um resumo em uma linha.' : null}
      />
      <TextField
        label={isProblem ? 'O que aconteceu? *' : 'O que você sugere e por quê? *'}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder={isProblem ? 'O que você esperava e o que aconteceu de fato' : 'Que problema a sugestão resolve no seu dia a dia'}
        error={showAttempt && !description.trim() ? 'Descreva o que aconteceu.' : null}
      />
      {isProblem && (
        <TextField
          label="Passos para reproduzir"
          value={steps}
          onChangeText={setSteps}
          multiline
          placeholder={'1. Abrir a ficha de um paciente\n2. Tocar em “Exportar PDF”'}
        />
      )}

      {isProblem && (
        <Section title="Informações técnicas que serão incluídas" description="Ajudam a encontrar o problema. Não identificam você nem os pacientes.">
          <Card style={{ gap: 8 }}>
            <AppText variant="small" tone="muted" selectable accessibilityLabel={`Informações técnicas: ${diagnostics}`}>
              {diagnostics}
            </AppText>
          </Card>
          {errors.length > 0 && (
            <View style={{ gap: 4 }}>
              <CheckboxRow
                checked={includeErrors}
                onToggle={() => setIncludeErrors((value) => !value)}
                label={`Incluir os erros registrados neste aparelho (${errors.length})`}
              />
              <Button
                label="Apagar os registros de erro"
                icon="trash-outline"
                variant="ghost"
                size="sm"
                onPress={() => {
                  errorLog.clear();
                  setErrors([]);
                  setIncludeErrors(false);
                }}
              />
            </View>
          )}
        </Section>
      )}

      <View style={{ gap: 10 }}>
        <Button label="Abrir no GitHub" icon="logo-github" fullWidth onPress={() => submit(() => void openExternal(reportIssueUrl(draft, diagnostics)))} />
        <Button
          label="Copiar ou compartilhar o texto"
          icon="share-outline"
          variant="secondary"
          fullWidth
          onPress={() => submit(() => void shareText(reportText(draft, diagnostics)))}
        />
        <AppText variant="small" tone="subtle" align="center">
          O GitHub abre com o relato preenchido; é preciso uma conta gratuita para publicar. Sem conta, compartilhe o texto com quem
          mantém o app.
        </AppText>
      </View>
    </View>
  );
}

function DivergenceInfo() {
  const router = useRouter();
  return (
    <View style={{ gap: 16 }}>
      <Callout tone="info" title="Um cálculo não bate com a fonte?">
        Use o modelo de divergência científica: informe o método, o que o app faz, o que a fonte diz (com página, tabela ou equação) e um
        exemplo com entradas e resultados. Cada apontamento é conferido na fonte antes de qualquer mudança.
      </Callout>
      <Button
        label="Abrir o modelo de divergência"
        icon="logo-github"
        fullWidth
        onPress={() => void openExternal(issueUrl('divergencia-cientifica.yml', '[Divergência] ', { versao: APP_VERSION }))}
      />
      <Button label="Ver referências e auditoria" icon="library-outline" variant="secondary" fullWidth onPress={() => router.push('/referencias')} />
    </View>
  );
}
