import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useData } from '../../src/data/DataProvider';
import { useSettings } from '../../src/data/hooks';
import type { MealPlanItem } from '../../src/data/models';
import { useLiveQuery } from '../../src/data/useLiveQuery';
import { macroDistribution, proteinPerKg, TRACKED_NUTRIENTS } from '../../src/domain/nutrition';
import { exportPdf } from '../../src/features/files/printService';
import { FoodPickerSheet, parseGrams } from '../../src/features/mealPlans/FoodPickerSheet';
import { buildMealPlanHtml } from '../../src/features/mealPlans/mealPlanReport';
import { itemKcal, itemsByMeal, parseKcal, planTotals } from '../../src/features/mealPlans/planTotals';
import { formatDate, formatNumber } from '../../src/lib/format';
import { useDebouncedCallback } from '../../src/lib/useDebouncedCallback';
import { useTheme } from '../../src/theme/ThemeProvider';
import { AppText } from '../../src/ui/AppText';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { confirm } from '../../src/ui/dialogs';
import { EmptyState } from '../../src/ui/EmptyState';
import { IconTile } from '../../src/ui/IconTile';
import { ListItem } from '../../src/ui/ListItem';
import { Screen } from '../../src/ui/Screen';
import { Section } from '../../src/ui/Section';
import { Sheet } from '../../src/ui/Sheet';
import { TextField } from '../../src/ui/TextField';
import { toast } from '../../src/ui/Toast';

/** Editor do plano alimentar / recordatório 24 h: refeições, alimentos da TACO e totais em tempo real. */
export default function MealPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { mealPlans, consultations, calculations } = useData();
  const { data: settings } = useSettings();

  const { data: plan, loading } = useLiveQuery(['meal_plans', 'patients'], () => mealPlans.get(id), [id]);
  const { data: items = [] } = useLiveQuery(['meal_plan_items'], () => mealPlans.items(id), [id]);
  const { data: context } = useLiveQuery(
    ['consultations', 'calculations'],
    async () => {
      if (!plan?.patient_id) return { weight: undefined, savedKcal: null as number | null };
      const [measures, saved] = await Promise.all([consultations.latestMeasurements(plan.patient_id), calculations.listByPatient(plan.patient_id)]);
      // Meta sugerida: último VCT ou gasto energético salvo na ficha.
      const energy = saved.find((c) => c.values.vct_kcal ?? c.values.get_kcal);
      return { weight: measures.weight_kg, savedKcal: energy ? (energy.values.vct_kcal ?? energy.values.get_kcal) : null };
    },
    [plan?.patient_id],
  );

  const [pickerMeal, setPickerMeal] = useState<{ key: string; label: string } | null>(null);
  const [editing, setEditing] = useState<MealPlanItem | null>(null);
  const [editGrams, setEditGrams] = useState('');
  const [editHousehold, setEditHousehold] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [microOpen, setMicroOpen] = useState(false);
  // null = ainda não editado nesta tela: mostra o valor salvo no plano.
  const [targetDraft, setTarget] = useState<string | null>(null);
  const [notesDraft, setNotes] = useState<string | null>(null);

  // Salva enquanto digita (e ao sair da tela): não depende de o campo perder o foco.
  const targetSave = useDebouncedCallback((value: string) => void mealPlans.update(id, { target_kcal: parseKcal(value) }));
  const notesSave = useDebouncedCallback((value: string) => void mealPlans.update(id, { notes: value.trim() || null }));

  if (!plan) {
    return <Screen back title="Plano alimentar">{!loading && <EmptyState icon="restaurant-outline" title="Plano não encontrado" />}</Screen>;
  }

  const target = targetDraft ?? (plan.target_kcal ? String(plan.target_kcal).replace('.', ',') : '');
  const notes = notesDraft ?? plan.notes ?? '';
  const totals = planTotals(items);
  const split = macroDistribution(totals.values);
  const kcal = totals.values.energy_kcal;
  const perKg = proteinPerKg(totals.values.protein_g, context?.weight);
  const isPlan = plan.kind === 'plano';
  const progress = plan.target_kcal ? Math.min(kcal / plan.target_kcal, 1.5) : null;

  const openItem = (item: MealPlanItem) => {
    setEditing(item);
    setEditGrams(String(item.quantity_g).replace('.', ','));
    setEditHousehold(item.household_measure ?? '');
  };

  const saveItem = async () => {
    const grams = parseGrams(editGrams);
    if (!editing || !grams) return;
    await mealPlans.updateItem(editing.id, { quantity_g: grams, household_measure: editHousehold.trim() || null });
    setEditing(null);
  };

  const exportPlan = async () => {
    setMenuOpen(false);
    await exportPdf(buildMealPlanHtml({ plan, items, patientName: plan.patient_name, profile: settings!.profile }));
  };

  const duplicate = async () => {
    setMenuOpen(false);
    const copyId = await mealPlans.duplicate(plan.id, `${plan.title} (cópia)`);
    toast.success('Plano duplicado');
    router.replace(`/plano/${copyId}`);
  };

  const remove = async () => {
    setMenuOpen(false);
    if (!(await confirm('Excluir', `“${plan.title}” será apagado com todos os alimentos.`, 'Excluir', true))) return;
    await mealPlans.remove(plan.id);
    toast.success('Excluído');
    router.back();
  };

  return (
    <Screen
      back
      title={plan.title}
      subtitle={[
        // O tipo só aparece quando o título não já o diz (ex.: título "Plano alimentar").
        plan.title !== (isPlan ? 'Plano alimentar' : 'Recordatório 24 h') && (isPlan ? 'Plano alimentar' : 'Recordatório 24 h'),
        plan.patient_name,
        plan.reference_date && formatDate(plan.reference_date),
      ]
        .filter(Boolean)
        .join(' · ')}
      right={
        <Pressable accessibilityLabel="Mais opções" onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Ionicons name="ellipsis-horizontal-circle" size={28} color={colors.text} />
        </Pressable>
      }
    >
      <Card tone="primary" style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <AppText variant="overline" tone="onPrimary" style={{ opacity: 0.85 }}>
              {isPlan ? 'Total do plano' : 'Total consumido'}
            </AppText>
            <AppText variant="display" tone="onPrimary" accessibilityLabel={`${Math.round(kcal)} quilocalorias`}>
              {formatNumber(Math.round(kcal))} kcal
            </AppText>
          </View>
          {plan.target_kcal ? (
            <AppText variant="caption" tone="onPrimary">
              meta {formatNumber(Math.round(plan.target_kcal))} kcal ({formatNumber(Math.round((kcal / plan.target_kcal) * 100))}%)
            </AppText>
          ) : null}
        </View>
        {progress !== null && (
          <View style={{ height: 6, borderRadius: 3, backgroundColor: `${colors.onPrimary}33` }}>
            <View style={{ width: `${Math.min(progress, 1) * 100}%`, height: 6, borderRadius: 3, backgroundColor: colors.onPrimary }} />
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Macro label="Proteína" grams={totals.values.protein_g} percent={split.protein} />
          <Macro label="Carboidrato" grams={totals.values.carbohydrate_g} percent={split.carbohydrate} />
          <Macro label="Lipídios" grams={totals.values.lipid_g} percent={split.lipid} />
        </View>
        <AppText variant="caption" tone="onPrimary" style={{ opacity: 0.9 }}>
          Fibras {formatNumber(Math.round(totals.values.fiber_g))} g · Sódio {formatNumber(Math.round(totals.values.sodium_mg))} mg
          {perKg !== null ? ` · Proteína ${formatNumber(Math.round(perKg * 10) / 10)} g/kg` : ''}
        </AppText>
        {(['energy_kcal', 'protein_g', 'carbohydrate_g', 'lipid_g'] as const).some((k) => totals.incomplete.has(k)) && (
          <AppText variant="small" tone="onPrimary" style={{ opacity: 0.9 }}>
            ⚠ Algum alimento tem valor em reavaliação na TACO: o total é um mínimo.
          </AppText>
        )}
      </Card>

      <Card style={{ gap: 10 }}>
        <TextField
          label={isPlan ? 'Meta de energia (kcal/dia)' : 'Necessidade estimada (kcal/dia) — para comparar'}
          value={target}
          onChangeText={(value) => {
            setTarget(value);
            targetSave.schedule(value);
          }}
          onBlur={targetSave.flush}
          onSubmitEditing={targetSave.flush}
          keyboardType="decimal-pad"
          unit="kcal"
          placeholder="Opcional"
        />
        {context?.savedKcal ? (
          <Button
            label={`Usar o VCT salvo na ficha (${formatNumber(Math.round(context.savedKcal))} kcal)`}
            size="sm"
            variant="secondary"
            onPress={() => {
              setTarget(String(Math.round(context.savedKcal!)));
              targetSave.schedule(String(Math.round(context.savedKcal!)));
              targetSave.flush();
            }}
          />
        ) : null}
      </Card>

      {itemsByMeal(items).map((meal) => (
        <Section key={meal.key} title={`${meal.label}${meal.items.length ? ` · ${formatNumber(Math.round(meal.kcal))} kcal` : ''}`}>
          <Card padded={false} style={{ overflow: 'hidden' }}>
            {meal.items.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.food_name}
                onPress={() => openItem(item)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyStrong" numberOfLines={2}>
                    {item.food_name}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {formatNumber(item.quantity_g)} g{item.household_measure ? ` · ${item.household_measure}` : ''}
                  </AppText>
                </View>
                <AppText variant="caption" tone="primary">
                  {formatNumber(Math.round(itemKcal(item)))} kcal
                </AppText>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Adicionar alimento: ${meal.label}`}
              onPress={() => setPickerMeal({ key: meal.key, label: meal.label })}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <AppText variant="caption" tone="primary">
                Adicionar alimento
              </AppText>
            </Pressable>
          </Card>
        </Section>
      ))}

      <Card padded={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: microOpen }}
          aria-expanded={microOpen}
          onPress={() => setMicroOpen((open) => !open)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}
        >
          <IconTile name="list-outline" size={32} />
          <AppText variant="bodyStrong" style={{ flex: 1 }}>
            Todos os nutrientes
          </AppText>
          <Ionicons name={microOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSubtle} />
        </Pressable>
        {microOpen &&
          TRACKED_NUTRIENTS.map((nutrient) => (
            <View
              key={nutrient.key}
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.border }}
            >
              <AppText tone="muted">
                {nutrient.label} ({nutrient.unit})
              </AppText>
              <AppText variant="bodyStrong">
                {totals.incomplete.has(nutrient.key) ? '≥ ' : ''}
                {formatNumber(Math.round(totals.values[nutrient.key] * 10 ** nutrient.decimals) / 10 ** nutrient.decimals)}
              </AppText>
            </View>
          ))}
        {microOpen && totals.incomplete.size > 0 && (
          <AppText variant="small" tone="subtle" style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            “≥” = algum alimento não tem esse nutriente analisado na TACO; o total é um mínimo.
          </AppText>
        )}
      </Card>

      <TextField
        label={isPlan ? 'Orientações ao paciente' : 'Observações'}
        value={notes}
        onChangeText={(value) => {
          setNotes(value);
          notesSave.schedule(value);
        }}
        onBlur={notesSave.flush}
        multiline
        placeholder={isPlan ? 'Ex.: beber 2 L de água por dia; trocar o arroz branco por integral.' : 'Ex.: dia atípico, final de semana.'}
      />

      <Button label="Exportar PDF" icon="share-outline" variant="secondary" onPress={exportPlan} fullWidth />

      <FoodPickerSheet
        visible={!!pickerMeal}
        mealLabel={pickerMeal?.label ?? ''}
        onClose={() => setPickerMeal(null)}
        onAdd={async ({ food, grams, household }) => {
          await mealPlans.addItem(plan.id, { meal: pickerMeal!.key, food_id: food.id, food_name: food.name, quantity_g: grams, household_measure: household });
          setPickerMeal(null);
          toast.success(`${food.name.split(',')[0]} adicionado`);
        }}
      />

      <Sheet visible={!!editing} onClose={() => setEditing(null)} title={editing?.food_name}>
        <View style={{ gap: 14 }}>
          <TextField label="Quantidade" value={editGrams} onChangeText={setEditGrams} keyboardType="decimal-pad" unit="g" selectTextOnFocus />
          <TextField label="Medida caseira (opcional)" value={editHousehold} onChangeText={setEditHousehold} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="Remover"
              variant="danger"
              icon="trash-outline"
              onPress={async () => {
                if (editing) await mealPlans.removeItem(editing.id);
                setEditing(null);
              }}
              style={{ flex: 1 }}
            />
            <Button label="Salvar" icon="checkmark" onPress={saveItem} disabled={!parseGrams(editGrams)} style={{ flex: 1 }} />
          </View>
        </View>
      </Sheet>

      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={plan.title}>
        <ListItem title="Exportar PDF" left={<IconTile name="document-attach-outline" size={36} />} onPress={exportPlan} divider />
        <ListItem title="Duplicar (ex.: para o retorno)" left={<IconTile name="copy-outline" size={36} />} onPress={duplicate} divider />
        <ListItem title="Excluir" danger left={<IconTile name="trash-outline" size={36} color={colors.danger} />} onPress={remove} />
      </Sheet>
    </Screen>
  );
}

function Macro({ label, grams, percent }: { label: string; grams: number; percent: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: `${colors.onPrimary}1F`, borderRadius: 10, padding: 8 }}>
      <AppText variant="small" tone="onPrimary" style={{ opacity: 0.85 }}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" tone="onPrimary">
        {formatNumber(Math.round(grams))} g
      </AppText>
      <AppText variant="small" tone="onPrimary">
        {formatNumber(Math.round(percent))}% da energia
      </AppText>
    </View>
  );
}
