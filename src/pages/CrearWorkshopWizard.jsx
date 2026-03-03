import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMasterGameConfig } from '../services/masterConfig';
import { createGameSession } from '../services/gameSession';

const STEPS = [
  { id: 'mission', label: 'Misión' },
  { id: 'world', label: 'Mundo' },
  { id: 'npc', label: 'PNJs' },
  { id: 'conflict', label: 'Conflicto' },
  { id: 'enemies', label: 'Enemigos' },
  { id: 'session', label: 'Sesión' },
  { id: 'summary', label: 'Resumen' },
];

export default function CrearPartidaWizard() {
  const nav = useNavigate();
  const [cfg, setCfg] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Objetivos
    objective_motive: null,
    objective_action: null,
    objective_target: null,
    objective_need: null,
    objective_status: null,

    // Commissions
    commission_patron: null,
    commission_condition: null,

    // Faction
    faction: null,

    // NPC traits
    npc: {
      name: null, // {name,surname,roll}
      appearance: null,
      skin: null,
      facial: null,
      hair: null,
      attire: null,
      voice: null,
      attitude: null,
      defect: null,
    },

    // Scenarios
    scenario_location: null,
    scenario_concept: null,

    // Dungeon aspects
    dungeon_ascendancy: null,
    dungeon_usage: null,
    dungeon_content: null,
    dungeon_threat: null,
    dungeon_value: null,
    dungeon_context: null,

    // Conflict entities
    conflict_entity1: null,
    conflict_entity2: null,

    // Random event
    random_event: null,

    // Tone modifiers
    tone_fear: null,
    tone_hope: null,

    // Rewards
    reward_object_type: null,
    reward_origin: null,
    reward_creation: null,
    reward_effect: null,
    reward_side_effect: null,

    // Enemies
    enemy_type_key: '',
    enemy_subtype_key: '',

    // Game session
    session_name: '',
    session_password: '',
    max_players: 6,
  });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setNpc = (k, v) => setForm((p) => ({ ...p, npc: { ...p.npc, [k]: v } }));

  useEffect(() => {
    (async () => {
      try {
        const data = await getMasterGameConfig();
        setCfg(data);

        const firstEnemy = data?.enemies?.[0];
        const enemyType0 = firstEnemy?.key ?? '';
        const enemySubtype0 = firstEnemy?.subtypes?.[0]?.key ?? '';

        setForm((p) => ({
          ...p,
          enemy_type_key: enemyType0,
          enemy_subtype_key: enemySubtype0,
        }));
      } catch (e) {
        setError(e.message || 'Error cargando config del Maestro');
      }
    })();
  }, []);

  // Helpers para tirar dado (simple: elige random del array)
  const rollPick = (arr = []) => {
    if (!arr.length) return null;
    const idx = Math.floor(Math.random() * arr.length);
    const item = arr[idx];
    // guardamos roll como índice+1 si no viene (para visual)
    return { ...item, roll: item.roll ?? idx + 1 };
  };

  const enemies = cfg?.enemies ?? [];
  const currentEnemy = useMemo(
    () => enemies.find((e) => e.key === form.enemy_type_key) || enemies[0] || null,
    [enemies, form.enemy_type_key]
  );

  useEffect(() => {
    const firstSubtype = currentEnemy?.subtypes?.[0]?.key ?? '';
    setField('enemy_subtype_key', firstSubtype);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.enemy_type_key]);

  const canNext = useMemo(() => {
    // exige nombre de sesión en el paso sesión
    if (STEPS[step]?.id === 'session') return form.session_name.trim().length > 0;
    return true;
  }, [step, form.session_name]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const masterSetup = useMemo(() => ({
    objectives: {
      motive: form.objective_motive,
      action: form.objective_action,
      target: form.objective_target,
      need: form.objective_need,
      status: form.objective_status,
    },
    commissions: {
      patron: form.commission_patron,
      condition: form.commission_condition,
    },
    faction: form.faction,
    npc: form.npc,
    scenarios: {
      location: form.scenario_location,
      concept: form.scenario_concept,
    },
    dungeon_aspects: {
      ascendancy: form.dungeon_ascendancy,
      usage: form.dungeon_usage,
      content: form.dungeon_content,
      threat: form.dungeon_threat,
      value: form.dungeon_value,
      context: form.dungeon_context,
    },
    conflict_entities: {
      entity1: form.conflict_entity1,
      entity2: form.conflict_entity2,
    },
    random_event: form.random_event,
    tone_modifiers: {
      fear: form.tone_fear,
      hope: form.tone_hope,
    },
    rewards: {
      object_type: form.reward_object_type,
      origin: form.reward_origin,
      creation: form.reward_creation,
      effect: form.reward_effect,
      side_effect: form.reward_side_effect,
    },
    enemies: {
      type_key: form.enemy_type_key,
      subtype_key: form.enemy_subtype_key,
    },
  }), [form]);

  const sessionPayload = useMemo(() => ({
    game_session: {
      name: form.session_name,
      password: form.session_password,
      max_players: Number(form.max_players || 6),
    },
    properties: {
      additionalProp1: {
        master_setup: masterSetup,
      },
    },
  }), [form.session_name, form.session_password, form.max_players, masterSetup]);

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      localStorage.setItem('master_setup', JSON.stringify(masterSetup));
      const created = await createGameSession(sessionPayload);
      if (created?.id) localStorage.setItem('game_session_id', String(created.id));
      nav('/dashboard');
    } catch (e) {
      setError(e.message || 'No se pudo crear la partida');
    } finally {
      setSaving(false);
    }
  };

  if (!cfg && !error) return <div className="min-h-screen flex items-center justify-center text-moonGray">Cargando…</div>;
  if (error && !cfg) return <div className="min-h-screen flex items-center justify-center text-red-400 p-6 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray p-6 md:p-10 font-serif flex justify-center items-center">
      <div className="bg-white/5 backdrop-blur-md border border-fadedGold p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-5xl">
        <h1 className="text-3xl text-fadedGold text-center mb-4">Forja la Partida</h1>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {STEPS.map((st, idx) => {
            const active = idx === step;
            const done = idx < step;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStep(idx)}
                className={`px-3 py-2 rounded-lg border text-sm font-bold ${
                  active ? 'bg-arcanePurple border-purple-400 text-white'
                  : done ? 'bg-black/40 border-fadedGold text-moonGray'
                  : 'bg-black/20 border-gray-500 text-gray-300'
                }`}
              >
                {idx + 1}. {st.label}
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        {/* STEP: Misión */}
        {STEPS[step].id === 'mission' && (
          <div className="grid md:grid-cols-2 gap-5">
            <DiceSelect
              label="Objetivo: Motivo"
              options={cfg.objectives?.motive}
              value={form.objective_motive}
              onPick={(v) => setField('objective_motive', v)}
              onRoll={() => setField('objective_motive', rollPick(cfg.objectives?.motive))}
            />
            <DiceSelect
              label="Objetivo: Acción"
              options={cfg.objectives?.action}
              value={form.objective_action}
              onPick={(v) => setField('objective_action', v)}
              onRoll={() => setField('objective_action', rollPick(cfg.objectives?.action))}
            />
            <DiceSelect
              label="Objetivo: Objetivo"
              options={cfg.objectives?.target}
              value={form.objective_target}
              onPick={(v) => setField('objective_target', v)}
              onRoll={() => setField('objective_target', rollPick(cfg.objectives?.target))}
            />
            <DiceSelect
              label="Objetivo: Necesidad"
              options={cfg.objectives?.need}
              value={form.objective_need}
              onPick={(v) => setField('objective_need', v)}
              onRoll={() => setField('objective_need', rollPick(cfg.objectives?.need))}
            />
            <DiceSelect
              label="Objetivo: Estado"
              options={cfg.objectives?.status}
              value={form.objective_status}
              onPick={(v) => setField('objective_status', v)}
              onRoll={() => setField('objective_status', rollPick(cfg.objectives?.status))}
            />

            <div className="md:col-span-2">
              <h3 className="text-fadedGold text-lg mt-2 mb-2">Encargo</h3>
            </div>

            <DiceSelect
              label="Patrón"
              options={cfg.commissions?.patron}
              value={form.commission_patron}
              onPick={(v) => setField('commission_patron', v)}
              onRoll={() => setField('commission_patron', rollPick(cfg.commissions?.patron))}
            />
            <DiceSelect
              label="Condición"
              options={cfg.commissions?.condition}
              value={form.commission_condition}
              onPick={(v) => setField('commission_condition', v)}
              onRoll={() => setField('commission_condition', rollPick(cfg.commissions?.condition))}
            />
          </div>
        )}

        {/* STEP: Mundo */}
        {STEPS[step].id === 'world' && (
          <div className="grid md:grid-cols-2 gap-5">
            <DiceSelect
              label="Facción"
              options={cfg.factions}
              value={form.faction}
              onPick={(v) => setField('faction', v)}
              onRoll={() => setField('faction', rollPick(cfg.factions))}
              extraRender={(v) => (
                v ? (
                  <div className="mt-2 text-xs text-gray-300 space-y-1">
                    <p><span className="text-fadedGold">Ideología:</span> {v.display_ideology}</p>
                    <p><span className="text-fadedGold">Recurso:</span> {v.display_resource}</p>
                    <p><span className="text-fadedGold">Límite:</span> {v.display_limit}</p>
                  </div>
                ) : null
              )}
            />

            <DiceSelect
              label="Evento aleatorio"
              options={cfg.random_events}
              value={form.random_event}
              onPick={(v) => setField('random_event', v)}
              onRoll={() => setField('random_event', rollPick(cfg.random_events))}
            />

            <div className="md:col-span-2">
              <h3 className="text-fadedGold text-lg mt-2 mb-2">Escenario</h3>
            </div>

            <DiceSelect
              label="Localización"
              options={cfg.scenarios?.location}
              value={form.scenario_location}
              onPick={(v) => setField('scenario_location', v)}
              onRoll={() => setField('scenario_location', rollPick(cfg.scenarios?.location))}
              extraRender={(v) => (
                v ? (
                  <div className="mt-2 text-xs text-gray-300 space-y-1">
                    <p><span className="text-fadedGold">Amenazas posibles:</span> {v.display_possible_threats}</p>
                    <p><span className="text-fadedGold">Peligros:</span> {v.display_hazards}</p>
                  </div>
                ) : null
              )}
            />

            <DiceSelect
              label="Concepto"
              options={cfg.scenarios?.concept}
              value={form.scenario_concept}
              onPick={(v) => setField('scenario_concept', v)}
              onRoll={() => setField('scenario_concept', rollPick(cfg.scenarios?.concept))}
              extraRender={(v) => (
                v ? (
                  <div className="mt-2 text-xs text-gray-300 space-y-1">
                    <p><span className="text-fadedGold">Amenazas posibles:</span> {v.display_possible_threats}</p>
                    <p><span className="text-fadedGold">Peligros:</span> {v.display_hazards}</p>
                  </div>
                ) : null
              )}
            />
          </div>
        )}

        {/* STEP: NPC */}
        {STEPS[step].id === 'npc' && (
          <div className="grid md:grid-cols-2 gap-5">
            <NpcNamePicker
              label="Nombre PNJ"
              options={cfg.npc_names}
              value={form.npc.name}
              onPick={(v) => setNpc('name', v)}
              onRoll={() => setNpc('name', rollPick(cfg.npc_names))}
            />

            <DiceSelect label="Apariencia" options={cfg.npc_traits?.appearance} value={form.npc.appearance}
              onPick={(v) => setNpc('appearance', v)} onRoll={() => setNpc('appearance', rollPick(cfg.npc_traits?.appearance))} />
            <DiceSelect label="Piel" options={cfg.npc_traits?.skin} value={form.npc.skin}
              onPick={(v) => setNpc('skin', v)} onRoll={() => setNpc('skin', rollPick(cfg.npc_traits?.skin))} />
            <DiceSelect label="Rasgos faciales" options={cfg.npc_traits?.facial} value={form.npc.facial}
              onPick={(v) => setNpc('facial', v)} onRoll={() => setNpc('facial', rollPick(cfg.npc_traits?.facial))} />
            <DiceSelect label="Cabello" options={cfg.npc_traits?.hair} value={form.npc.hair}
              onPick={(v) => setNpc('hair', v)} onRoll={() => setNpc('hair', rollPick(cfg.npc_traits?.hair))} />
            <DiceSelect label="Atuendo" options={cfg.npc_traits?.attire} value={form.npc.attire}
              onPick={(v) => setNpc('attire', v)} onRoll={() => setNpc('attire', rollPick(cfg.npc_traits?.attire))} />
            <DiceSelect label="Voz" options={cfg.npc_traits?.voice} value={form.npc.voice}
              onPick={(v) => setNpc('voice', v)} onRoll={() => setNpc('voice', rollPick(cfg.npc_traits?.voice))} />
            <DiceSelect label="Actitud" options={cfg.npc_traits?.attitude} value={form.npc.attitude}
              onPick={(v) => setNpc('attitude', v)} onRoll={() => setNpc('attitude', rollPick(cfg.npc_traits?.attitude))} />
            <DiceSelect label="Defecto" options={cfg.npc_traits?.defect} value={form.npc.defect}
              onPick={(v) => setNpc('defect', v)} onRoll={() => setNpc('defect', rollPick(cfg.npc_traits?.defect))} />
          </div>
        )}

        {/* STEP: Conflicto */}
        {STEPS[step].id === 'conflict' && (
          <div className="grid md:grid-cols-2 gap-5">
            <DiceSelect label="Entidad 1" options={cfg.conflict_entities?.entity1} value={form.conflict_entity1}
              onPick={(v) => setField('conflict_entity1', v)} onRoll={() => setField('conflict_entity1', rollPick(cfg.conflict_entities?.entity1))} />
            <DiceSelect label="Entidad 2" options={cfg.conflict_entities?.entity2} value={form.conflict_entity2}
              onPick={(v) => setField('conflict_entity2', v)} onRoll={() => setField('conflict_entity2', rollPick(cfg.conflict_entities?.entity2))} />

            <div className="md:col-span-2">
              <h3 className="text-fadedGold text-lg mt-2 mb-2">Aspectos de mazmorra</h3>
            </div>

            <DiceSelect label="Ascendencia" options={cfg.dungeon_aspects?.ascendancy} value={form.dungeon_ascendancy}
              onPick={(v) => setField('dungeon_ascendancy', v)} onRoll={() => setField('dungeon_ascendancy', rollPick(cfg.dungeon_aspects?.ascendancy))} />
            <DiceSelect label="Uso" options={cfg.dungeon_aspects?.usage} value={form.dungeon_usage}
              onPick={(v) => setField('dungeon_usage', v)} onRoll={() => setField('dungeon_usage', rollPick(cfg.dungeon_aspects?.usage))} />
            <DiceSelect label="Contenido" options={cfg.dungeon_aspects?.content} value={form.dungeon_content}
              onPick={(v) => setField('dungeon_content', v)} onRoll={() => setField('dungeon_content', rollPick(cfg.dungeon_aspects?.content))} />
            <DiceSelect label="Amenaza" options={cfg.dungeon_aspects?.threat} value={form.dungeon_threat}
              onPick={(v) => setField('dungeon_threat', v)} onRoll={() => setField('dungeon_threat', rollPick(cfg.dungeon_aspects?.threat))} />
            <DiceSelect label="Valor" options={cfg.dungeon_aspects?.value} value={form.dungeon_value}
              onPick={(v) => setField('dungeon_value', v)} onRoll={() => setField('dungeon_value', rollPick(cfg.dungeon_aspects?.value))} />
            <DiceSelect label="Contexto" options={cfg.dungeon_aspects?.context} value={form.dungeon_context}
              onPick={(v) => setField('dungeon_context', v)} onRoll={() => setField('dungeon_context', rollPick(cfg.dungeon_aspects?.context))} />

            <div className="md:col-span-2">
              <h3 className="text-fadedGold text-lg mt-2 mb-2">Tono</h3>
            </div>

            <DiceSelect label="Miedo" options={cfg.tone_modifiers?.fear} value={form.tone_fear}
              onPick={(v) => setField('tone_fear', v)} onRoll={() => setField('tone_fear', rollPick(cfg.tone_modifiers?.fear))} />
            <DiceSelect label="Esperanza" options={cfg.tone_modifiers?.hope} value={form.tone_hope}
              onPick={(v) => setField('tone_hope', v)} onRoll={() => setField('tone_hope', rollPick(cfg.tone_modifiers?.hope))} />

            <div className="md:col-span-2">
              <h3 className="text-fadedGold text-lg mt-2 mb-2">Recompensa</h3>
            </div>

            <DiceSelect label="Tipo de objeto" options={cfg.rewards?.object_type} value={form.reward_object_type}
              onPick={(v) => setField('reward_object_type', v)} onRoll={() => setField('reward_object_type', rollPick(cfg.rewards?.object_type))} />
            <DiceSelect label="Origen" options={cfg.rewards?.origin} value={form.reward_origin}
              onPick={(v) => setField('reward_origin', v)} onRoll={() => setField('reward_origin', rollPick(cfg.rewards?.origin))} />
            <DiceSelect label="Creación" options={cfg.rewards?.creation} value={form.reward_creation}
              onPick={(v) => setField('reward_creation', v)} onRoll={() => setField('reward_creation', rollPick(cfg.rewards?.creation))} />
            <DiceSelect label="Efecto" options={cfg.rewards?.effect} value={form.reward_effect}
              onPick={(v) => setField('reward_effect', v)} onRoll={() => setField('reward_effect', rollPick(cfg.rewards?.effect))} />
            <DiceSelect label="Efecto secundario" options={cfg.rewards?.side_effect} value={form.reward_side_effect}
              onPick={(v) => setField('reward_side_effect', v)} onRoll={() => setField('reward_side_effect', rollPick(cfg.rewards?.side_effect))} />
          </div>
        )}

        {/* STEP: Enemigos */}
        {STEPS[step].id === 'enemies' && (
          <div className="grid md:grid-cols-2 gap-5">
            <SelectSimple
              label="Tipo de enemigo"
              options={(cfg.enemies || []).map((e) => ({ value: e.key, label: e.display_key }))}
              value={form.enemy_type_key}
              onChange={(v) => setField('enemy_type_key', v)}
            />
            <SelectSimple
              label="Subtipo"
              options={(currentEnemy?.subtypes || []).map((s) => ({ value: s.key, label: s.display_key }))}
              value={form.enemy_subtype_key}
              onChange={(v) => setField('enemy_subtype_key', v)}
            />

            {currentEnemy ? (
              <div className="md:col-span-2 bg-black/20 border border-fadedGold/40 rounded-xl p-4">
                <h3 className="text-fadedGold mb-2">Rangos</h3>
                <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-200">
                  <Range label="Threshold" min={currentEnemy.threshold_min} max={currentEnemy.threshold_max} />
                  <Range label="Danger" min={currentEnemy.danger_min} max={currentEnemy.danger_max} />
                  <Range label="Endurance" min={currentEnemy.endurance_min} max={currentEnemy.endurance_max} />
                  <Range label="Stamina" min={currentEnemy.stamina_min} max={currentEnemy.stamina_max} />
                  <Range label="Weakness" min={currentEnemy.weakness_min} max={currentEnemy.weakness_max} />
                  <Range label="Strength" min={currentEnemy.strength_min} max={currentEnemy.strength_max} />
                  <Range label="Special" min={currentEnemy.special_min} max={currentEnemy.special_max} />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* STEP: Sesión */}
        {STEPS[step].id === 'session' && (
          <div className="grid md:grid-cols-2 gap-5">
            <Input label="Nombre de la sesión *" value={form.session_name} onChange={(v) => setField('session_name', v)} placeholder="Ej: El Bosque de Niebla" />
            <Input label="Password (opcional)" value={form.session_password} onChange={(v) => setField('session_password', v)} placeholder="••••••••" />
            <SelectSimple
              label="Máx. jugadores"
              value={String(form.max_players)}
              onChange={(v) => setField('max_players', Number(v))}
              options={[2,3,4,5,6,7,8].map((n) => ({ value: String(n), label: String(n) }))}
            />
          </div>
        )}

        {/* STEP: Summary */}
        {STEPS[step].id === 'summary' && (
          <div className="grid md:grid-cols-2 gap-4">
            <SummaryCard title="Misión">
              <SummaryPick label="Motivo" v={form.objective_motive} />
              <SummaryPick label="Acción" v={form.objective_action} />
              <SummaryPick label="Objetivo" v={form.objective_target} />
              <SummaryPick label="Necesidad" v={form.objective_need} />
              <SummaryPick label="Estado" v={form.objective_status} />
              <Divider />
              <SummaryPick label="Patrón" v={form.commission_patron} />
              <SummaryPick label="Condición" v={form.commission_condition} />
            </SummaryCard>

            <SummaryCard title="Mundo">
              <SummaryPick label="Facción" v={form.faction} />
              <SummaryPick label="Evento" v={form.random_event} />
              <Divider />
              <SummaryPick label="Localización" v={form.scenario_location} />
              <SummaryPick label="Concepto" v={form.scenario_concept} />
            </SummaryCard>

            <SummaryCard title="PNJ">
              <SummaryNpcName label="Nombre" v={form.npc.name} />
              <Divider />
              <SummaryPick label="Apariencia" v={form.npc.appearance} />
              <SummaryPick label="Piel" v={form.npc.skin} />
              <SummaryPick label="Rasgos faciales" v={form.npc.facial} />
              <SummaryPick label="Cabello" v={form.npc.hair} />
              <SummaryPick label="Atuendo" v={form.npc.attire} />
              <SummaryPick label="Voz" v={form.npc.voice} />
              <SummaryPick label="Actitud" v={form.npc.attitude} />
              <SummaryPick label="Defecto" v={form.npc.defect} />
            </SummaryCard>

            <SummaryCard title="Conflicto">
              <SummaryPick label="Entidad 1" v={form.conflict_entity1} />
              <SummaryPick label="Entidad 2" v={form.conflict_entity2} />
              <Divider />
              <SummaryPick label="Ascendencia" v={form.dungeon_ascendancy} />
              <SummaryPick label="Uso" v={form.dungeon_usage} />
              <SummaryPick label="Contenido" v={form.dungeon_content} />
              <SummaryPick label="Amenaza" v={form.dungeon_threat} />
              <SummaryPick label="Valor" v={form.dungeon_value} />
              <SummaryPick label="Contexto" v={form.dungeon_context} />
            </SummaryCard>

            <SummaryCard title="Tono y Recompensas">
              <SummaryPick label="Miedo" v={form.tone_fear} />
              <SummaryPick label="Esperanza" v={form.tone_hope} />
              <Divider />
              <SummaryPick label="Objeto" v={form.reward_object_type} />
              <SummaryPick label="Origen" v={form.reward_origin} />
              <SummaryPick label="Creación" v={form.reward_creation} />
              <SummaryPick label="Efecto" v={form.reward_effect} />
              <SummaryPick label="Secundario" v={form.reward_side_effect} />
            </SummaryCard>

            <SummaryCard title="Enemigos">
              <SummaryText label="Tipo" value={currentEnemy?.display_key || '—'} />
              <SummaryText label="Subtipo" value={(currentEnemy?.subtypes || []).find(s => s.key === form.enemy_subtype_key)?.display_key || '—'} />
            </SummaryCard>

            <SummaryCard title="Sesión" className="md:col-span-2">
              <SummaryText label="Nombre" value={form.session_name || '—'} />
              <SummaryText label="Máx. jugadores" value={String(form.max_players || 6)} />
              <SummaryText label="Password" value={form.session_password ? '●●●●●●' : '—'} />
              <p className="text-xs text-gray-400 mt-2">
                Se enviará al backend dentro de <span className="text-fadedGold">properties.additionalProp1.master_setup</span>.
              </p>
            </SummaryCard>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="bg-black/30 border border-gray-500 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Atrás
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className="bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 border border-purple-500 px-5 py-2 rounded-lg text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canNext || saving}
              className="bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 border border-purple-500 px-5 py-2 rounded-lg text-white disabled:opacity-50"
            >
              {saving ? 'Forjando…' : 'Crear Partida'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI blocks ---------- */

function DiceSelect({ label, options = [], value, onPick, onRoll, extraRender }) {
  const selectedKey = value?.key || '';

  return (
    <div className="w-full">
      <label className="block text-sm mb-1 text-gray-200">{label}</label>

      <div className="flex items-stretch gap-2 w-full">
        <select
          value={selectedKey}
          onChange={(e) => {
            const k = e.target.value;
            const found = (options || []).find((x) => x.key === k) || null;
            onPick(found);
          }}
          className="flex-1 min-w-0 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray pr-10"
        >
          <option value="">—</option>
          {(options || []).map((o) => (
            <option key={o.key} value={o.key}>
              {o.display_key}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRoll}
          className="shrink-0 w-24 px-3 py-2 rounded-lg border border-fadedGold/60 bg-black/30 hover:brightness-110 text-sm flex items-center justify-center gap-1"
        >
          🎲 Tirar
        </button>
      </div>

      {value ? (
        <div className="mt-2 text-xs text-gray-300">
          <span className="text-fadedGold">Resultado:</span> {value.display_key}
          {value.roll !== undefined ? <span className="opacity-80"> (roll {value.roll})</span> : null}
          {value.dice ? <span className="opacity-80"> • {value.dice}</span> : null}
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-500 italic">Sin seleccionar</div>
      )}

      {extraRender ? extraRender(value) : null}
    </div>
  );
}

function NpcNamePicker({ label, options = [], value, onPick, onRoll }) {
  const selected = value ? `${value.name} ${value.surname}` : '';
  return (
    <div className="md:col-span-2">
      <label className="block text-sm mb-1">{label}</label>

      <div className="flex gap-2 items-center">
        <input
          value={selected}
          readOnly
          className="flex-1 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray"
          placeholder="Pulsa tirar para generar"
        />
        <button
          type="button"
          onClick={onRoll}
          className="px-3 py-2 rounded-lg border border-fadedGold/60 bg-black/30 hover:brightness-110 text-sm"
          title="Tirar"
        >
          🎲 Tirar
        </button>
      </div>

      {value ? (
        <div className="mt-2 text-xs text-gray-300">
          <span className="text-fadedGold">PNJ:</span> {value.name} {value.surname}{' '}
          {value.roll !== undefined ? <span className="opacity-80">(roll {value.roll})</span> : null}
          {value.dice ? <span className="opacity-80"> • {value.dice}</span> : null}
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-500 italic">Sin generar</div>
      )}

      {/* Para guardar objeto entero como en el resto */}
      <button type="button" className="hidden" onClick={() => onPick(value)} />
    </div>
  );
}

function SelectSimple({ label, options = [], value, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        className="w-full p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray placeholder-gray-400"
      />
    </div>
  );
}

function Range({ label, min, max }) {
  return (
    <div className="bg-black/20 border border-fadedGold/30 rounded-lg p-2">
      <div className="text-xs text-gray-300">{label}</div>
      <div className="text-sm font-semibold">{min} — {max}</div>
    </div>
  );
}

/* ---------- Summary (estilo app) ---------- */

function SummaryCard({ title, children, className = '' }) {
  return (
    <div className={`bg-black/25 border border-fadedGold/60 rounded-xl p-4 shadow-lg ${className}`}>
      <h3 className="text-fadedGold text-lg mb-3 tracking-wide">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryText({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-sm text-moonGray font-semibold text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );
}

function SummaryPick({ label, v }) {
  if (!v) return <SummaryText label={label} value="—" />;
  return (
    <SummaryText
      label={label}
      value={`${v.display_key || v.key || '—'}${v.roll !== undefined ? ` (roll ${v.roll})` : ''}`}
    />
  );
}

function SummaryNpcName({ label, v }) {
  if (!v) return <SummaryText label={label} value="—" />;
  return <SummaryText label={label} value={`${v.name} ${v.surname}${v.roll !== undefined ? ` (roll ${v.roll})` : ''}`} />;
}

function Divider() {
  return <div className="h-px bg-fadedGold/30 my-2" />;
}
