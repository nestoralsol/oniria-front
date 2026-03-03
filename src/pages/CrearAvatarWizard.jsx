import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatarCatalog } from '../services/avatarCatalog';
import { createGameSession } from '../services/gameSession';
import { toOptions } from '../utils/catalogToOptions';

const STEPS = [
  { id: 'identity', label: 'Identidad' },
  { id: 'traits', label: 'Rasgos' },
  { id: 'masters', label: 'Masters' },
  { id: 'loadout', label: 'Equipo' },
  { id: 'session', label: 'Sesión' },
  { id: 'summary', label: 'Resumen' },
];

export default function CrearAvatarWizard() {
  const nav = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Avatar
    name: '',
    renown_key: '',
    temperament_key: '',
    philosophy_key: '',
    dream_phase_key: '',
    weakness_key: '',
    somna_affinity_key: '',
    experience_keys: [],

    master_skill_keys: [],
    master_martial_keys: [],
    master_maneuver_common_keys: [],
    master_maneuver_advanced_keys: [],

    magic_key: '',
    spell_key: '',

    armor_key: '',
    weapon_key: '',
    item_keys: [],
    totem_key: '',
    mantra_key: '',
    book_key: '',
    recipe_key: '',

    // Game Session (nuevo)
    session_name: '',
    session_password: '',
    max_players: 6,
  });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const data = await getAvatarCatalog();
        setCatalog(data);

        const magic0 = data?.masters?.magics?.[0];
        const magicKey0 = magic0?.key ?? '';
        const spellKey0 = magic0?.spells?.[0]?.key ?? '';

        const armorFirst =
          data?.armors?.light?.[0]?.key ??
          data?.armors?.medium?.[0]?.key ??
          data?.armors?.heavy?.[0]?.key ??
          '';

        const weaponFirst =
          data?.weapons?.one_handed?.[0]?.key ??
          data?.weapons?.two_handed?.[0]?.key ??
          data?.weapons?.ranged?.[0]?.key ??
          data?.weapons?.arcane?.[0]?.key ??
          '';

        const totemFirst =
          data?.totems?.common?.[0]?.key ??
          data?.totems?.advanced?.[0]?.key ??
          '';

        const recipeFirst =
          data?.recipes?.brews?.[0]?.key ??
          data?.recipes?.poisons?.[0]?.key ??
          '';

        setForm((p) => ({
          ...p,
          renown_key: data?.renown?.[0]?.key ?? '',
          temperament_key: data?.temperaments?.[0]?.key ?? '',
          philosophy_key: data?.philosophies?.[0]?.key ?? '',
          dream_phase_key: data?.dream_phases?.[0]?.key ?? '',
          weakness_key: data?.weaknesses?.[0]?.key ?? '',
          somna_affinity_key: data?.somna_affinities?.[0]?.key ?? '',
          magic_key: magicKey0,
          spell_key: spellKey0,
          armor_key: armorFirst,
          weapon_key: weaponFirst,
          totem_key: totemFirst,
          mantra_key: data?.mantras?.[0]?.key ?? '',
          book_key: data?.books?.[0]?.key ?? '',
          recipe_key: recipeFirst,
        }));
      } catch (e) {
        setError(e.message || 'Error cargando catálogo');
      }
    })();
  }, []);

  // Options (simple)
  const renownOptions = useMemo(() => toOptions(catalog?.renown), [catalog]);
  const temperamentOptions = useMemo(() => toOptions(catalog?.temperaments), [catalog]);
  const philosophyOptions = useMemo(() => toOptions(catalog?.philosophies), [catalog]);
  const dreamPhaseOptions = useMemo(() => toOptions(catalog?.dream_phases), [catalog]);
  const weaknessOptions = useMemo(() => toOptions(catalog?.weaknesses), [catalog]);
  const somnaOptions = useMemo(() => toOptions(catalog?.somna_affinities), [catalog]);
  const experienceOptions = useMemo(() => toOptions(catalog?.experiences), [catalog]);

  const masterSkillOptions = useMemo(() => toOptions(catalog?.masters?.skills), [catalog]);
  const masterMartialOptions = useMemo(() => toOptions(catalog?.masters?.martial), [catalog]);

  const maneuverCommonOptions = useMemo(() => {
    const arr = (catalog?.masters?.maneuvers?.commons ?? []).map((m) => ({
      key: m.key,
      display_key: m.display_key,
      display_description: m.requires_magic ? 'Requiere magia' : undefined,
    }));
    return toOptions(arr);
  }, [catalog]);

  const maneuverAdvancedOptions = useMemo(() => {
    const arr = (catalog?.masters?.maneuvers?.advanced ?? []).map((m) => ({
      key: m.key,
      display_key: m.display_key,
      display_description: m.requires_magic ? 'Requiere magia' : undefined,
    }));
    return toOptions(arr);
  }, [catalog]);

  const magicOptions = useMemo(() => toOptions(catalog?.masters?.magics), [catalog]);

  const currentMagic = useMemo(() => {
    return (catalog?.masters?.magics ?? []).find((m) => m.key === form.magic_key) || null;
  }, [catalog, form.magic_key]);

  const spellOptions = useMemo(() => toOptions(currentMagic?.spells ?? []), [currentMagic]);

  useEffect(() => {
    if (!catalog) return;
    const first = currentMagic?.spells?.[0]?.key ?? '';
    setField('spell_key', first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.magic_key]);

  const armorOptions = useMemo(() => {
    const list = [
      ...(catalog?.armors?.light ?? []),
      ...(catalog?.armors?.medium ?? []),
      ...(catalog?.armors?.heavy ?? []),
    ].map((a) => ({
      key: a.key,
      display_key: a.display_key,
      display_description: `DEF ${a.defense} • Val ${a.value} • Rareza ${a.rarity}`,
    }));
    return toOptions(list);
  }, [catalog]);

  const weaponOptions = useMemo(() => {
    const list = [
      ...(catalog?.weapons?.one_handed ?? []),
      ...(catalog?.weapons?.two_handed ?? []),
      ...(catalog?.weapons?.ranged ?? []),
      ...(catalog?.weapons?.arcane ?? []),
    ].map((w) => ({
      key: w.key,
      display_key: w.display_key,
      display_description: `ATK ${w.attack} • DEF ${w.defense} • Val ${w.value} • Rareza ${w.rarity}`,
    }));
    return toOptions(list);
  }, [catalog]);

  const itemOptions = useMemo(() => {
    const list = (catalog?.items ?? []).map((it) => ({
      key: it.key,
      display_key: it.display_key,
      display_description: it.display_description,
    }));
    return toOptions(list);
  }, [catalog]);

  const totemOptions = useMemo(() => {
    const list = [
      ...(catalog?.totems?.common ?? []),
      ...(catalog?.totems?.advanced ?? []),
    ].map((t) => ({
      key: t.key,
      display_key: t.display_key,
      display_description: t.display_description,
    }));
    return toOptions(list);
  }, [catalog]);

  const mantraOptions = useMemo(() => toOptions(catalog?.mantras ?? []), [catalog]);
  const bookOptions = useMemo(() => toOptions(catalog?.books ?? []), [catalog]);

  const recipeOptions = useMemo(() => {
    const list = [
      ...(catalog?.recipes?.brews ?? []),
      ...(catalog?.recipes?.poisons ?? []),
    ].map((r) => ({
      key: r.key,
      display_key: r.display_key,
      display_description: r.display_description,
    }));
    return toOptions(list);
  }, [catalog]);

  const toggle = (field, key) => {
    setForm((p) => {
      const prev = p[field] || [];
      const exists = prev.includes(key);
      return { ...p, [field]: exists ? prev.filter((x) => x !== key) : [...prev, key] };
    });
  };

  const canNext = useMemo(() => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 4) return form.session_name.trim().length > 0; // sesión necesita nombre
    return true;
  }, [step, form.name, form.session_name]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const payloadAvatar = useMemo(() => ({
    name: form.name,
    renown_key: form.renown_key,
    temperament_key: form.temperament_key,
    philosophy_key: form.philosophy_key,
    dream_phase_key: form.dream_phase_key,
    weakness_key: form.weakness_key,
    somna_affinity_key: form.somna_affinity_key,
    experience_keys: form.experience_keys,

    masters: {
      skills: form.master_skill_keys,
      martial: form.master_martial_keys,
      maneuvers: {
        commons: form.master_maneuver_common_keys,
        advanced: form.master_maneuver_advanced_keys,
      },
      magic: { magic_key: form.magic_key, spell_key: form.spell_key },
    },

    loadout: {
      armor_key: form.armor_key,
      weapon_key: form.weapon_key,
      item_keys: form.item_keys,
      totem_key: form.totem_key,
      mantra_key: form.mantra_key,
      book_key: form.book_key,
      recipe_key: form.recipe_key,
    },
  }), [form]);

  const payloadSession = useMemo(() => ({
    game_session: {
      name: form.session_name,
      password: form.session_password,
      max_players: Number(form.max_players || 6),
    },
    properties: {
      additionalProp1: payloadAvatar, // ✅ según tu contrato
    },
  }), [form.session_name, form.session_password, form.max_players, payloadAvatar]);

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      // útil para dashboard
      localStorage.setItem('avatar', JSON.stringify(payloadAvatar));

      const created = await createGameSession(payloadSession);

      if (created?.id) localStorage.setItem('game_session_id', String(created.id));

      nav('/dashboard');
    } catch (e) {
      setError(e.message || 'No se pudo crear la sesión');
    } finally {
      setSaving(false);
    }
  };

  if (!catalog && !error) return <div className="min-h-screen flex items-center justify-center text-moonGray">Cargando catálogo...</div>;
  if (error && !catalog) return <div className="min-h-screen flex items-center justify-center text-red-400 p-6 text-center">{error}</div>;

  const dreamDesc = dreamPhaseOptions.find((d) => d.value === form.dream_phase_key)?.description;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray p-6 md:p-10 font-serif flex justify-center items-center">
      <div className="bg-white/5 backdrop-blur-md border border-fadedGold p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-3xl text-fadedGold text-center mb-4">Crear Avatar</h1>

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

        {/* 0 Identidad */}
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            <Input label="Nombre *" value={form.name} onChange={(v) => setField('name', v)} placeholder="Ej: Aelor" />
            <Select label="Renown" options={renownOptions} value={form.renown_key} onChange={(v) => setField('renown_key', v)} />
          </div>
        )}

        {/* 1 Rasgos */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-5">
            <Select label="Temperamento" options={temperamentOptions} value={form.temperament_key} onChange={(v) => setField('temperament_key', v)} />
            <Select label="Filosofía" options={philosophyOptions} value={form.philosophy_key} onChange={(v) => setField('philosophy_key', v)} />
            <div className="md:col-span-2">
              <Select label="Fase del sueño" options={dreamPhaseOptions} value={form.dream_phase_key} onChange={(v) => setField('dream_phase_key', v)} />
              {dreamDesc && <p className="text-sm text-gray-300 mt-2">{dreamDesc}</p>}
            </div>
            <Select label="Debilidad" options={weaknessOptions} value={form.weakness_key} onChange={(v) => setField('weakness_key', v)} />
            <Select label="Afinidad Somna" options={somnaOptions} value={form.somna_affinity_key} onChange={(v) => setField('somna_affinity_key', v)} />

            <div className="md:col-span-2">
              <MultiButtons
                label="Experiencias"
                options={experienceOptions}
                selected={form.experience_keys}
                onToggle={(k) => toggle('experience_keys', k)}
              />
            </div>
          </div>
        )}

        {/* 2 Masters */}
        {step === 2 && (
          <div className="space-y-5">
            <MultiButtons label="Skills" options={masterSkillOptions} selected={form.master_skill_keys} onToggle={(k) => toggle('master_skill_keys', k)} />
            <MultiButtons label="Martial" options={masterMartialOptions} selected={form.master_martial_keys} onToggle={(k) => toggle('master_martial_keys', k)} />
            <MultiButtons label="Maneuvers (Commons)" options={maneuverCommonOptions} selected={form.master_maneuver_common_keys} onToggle={(k) => toggle('master_maneuver_common_keys', k)} showDescription />
            <MultiButtons label="Maneuvers (Advanced)" options={maneuverAdvancedOptions} selected={form.master_maneuver_advanced_keys} onToggle={(k) => toggle('master_maneuver_advanced_keys', k)} showDescription />

            <div className="grid md:grid-cols-2 gap-5">
              <Select label="Magia" options={magicOptions} value={form.magic_key} onChange={(v) => setField('magic_key', v)} />
              <Select label="Hechizo" options={spellOptions} value={form.spell_key} onChange={(v) => setField('spell_key', v)} />
            </div>
          </div>
        )}

        {/* 3 Equipo */}
        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-5">
            <Select label="Armadura" options={armorOptions} value={form.armor_key} onChange={(v) => setField('armor_key', v)} />
            <Select label="Arma" options={weaponOptions} value={form.weapon_key} onChange={(v) => setField('weapon_key', v)} />

            <div className="md:col-span-2">
              <MultiButtons label="Items" options={itemOptions} selected={form.item_keys} onToggle={(k) => toggle('item_keys', k)} showDescription />
            </div>

            <Select label="Totem" options={totemOptions} value={form.totem_key} onChange={(v) => setField('totem_key', v)} />
            <Select label="Mantra" options={mantraOptions} value={form.mantra_key} onChange={(v) => setField('mantra_key', v)} />
            <Select label="Libro" options={bookOptions} value={form.book_key} onChange={(v) => setField('book_key', v)} />
            <Select label="Receta" options={recipeOptions} value={form.recipe_key} onChange={(v) => setField('recipe_key', v)} />
          </div>
        )}

        {/* 4 Sesión */}
        {step === 4 && (
          <div className="grid md:grid-cols-2 gap-5">
            <Input label="Nombre de la sesión *" value={form.session_name} onChange={(v) => setField('session_name', v)} placeholder="Ej: Bosque Umbrío" />
            <Input label="Password (opcional)" value={form.session_password} onChange={(v) => setField('session_password', v)} placeholder="••••••••" />

            <div>
              <label className="block text-sm mb-1">Máx. jugadores</label>
              <select
                value={String(form.max_players)}
                onChange={(e) => setField('max_players', Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

           
          </div>
        )}

        {step === 5 && (
  <div className="space-y-5">
    <p className="text-sm text-gray-300 text-center">
      Revisa tu Avatar antes de crearlo.
    </p>

    <div className="grid md:grid-cols-2 gap-4">
      <SummaryCard title="Identidad">
        <SummaryRow label="Nombre" value={form.name || '—'} />
        <SummaryRow label="Renown" value={labelOf(renownOptions, form.renown_key)} />
      </SummaryCard>

      <SummaryCard title="Rasgos">
        <SummaryRow label="Temperamento" value={labelOf(temperamentOptions, form.temperament_key)} />
        <SummaryRow label="Filosofía" value={labelOf(philosophyOptions, form.philosophy_key)} />
        <SummaryRow label="Fase del sueño" value={labelOf(dreamPhaseOptions, form.dream_phase_key)} />
        {dreamDesc ? (
          <p className="mt-2 text-xs text-gray-300 italic leading-relaxed">
            “{dreamDesc}”
          </p>
        ) : null}
        <SummaryRow label="Debilidad" value={labelOf(weaknessOptions, form.weakness_key)} />
        <SummaryRow label="Afinidad Somna" value={labelOf(somnaOptions, form.somna_affinity_key)} />
      </SummaryCard>

      <SummaryCard title="Experiencias">
        {form.experience_keys?.length ? (
          <TagList
            items={form.experience_keys.map((k) => labelOf(experienceOptions, k))}
          />
        ) : (
          <p className="text-sm text-gray-400">— Ninguna elegida</p>
        )}
      </SummaryCard>

      <SummaryCard title="Masters">
        <SummaryRow label="Magia" value={labelOf(magicOptions, form.magic_key)} />
        <SummaryRow label="Hechizo" value={labelOf(spellOptions, form.spell_key)} />

        <Divider />

        <SummaryRow label="Skills" value={`${form.master_skill_keys?.length || 0}`} />
        {form.master_skill_keys?.length ? (
          <TagList items={form.master_skill_keys.map((k) => labelOf(masterSkillOptions, k))} />
        ) : null}

        <SummaryRow label="Martial" value={`${form.master_martial_keys?.length || 0}`} />
        {form.master_martial_keys?.length ? (
          <TagList items={form.master_martial_keys.map((k) => labelOf(masterMartialOptions, k))} />
        ) : null}

        <SummaryRow label="Maneuvers (Commons)" value={`${form.master_maneuver_common_keys?.length || 0}`} />
        {form.master_maneuver_common_keys?.length ? (
          <TagList items={form.master_maneuver_common_keys.map((k) => labelOf(maneuverCommonOptions, k))} />
        ) : null}

        <SummaryRow label="Maneuvers (Advanced)" value={`${form.master_maneuver_advanced_keys?.length || 0}`} />
        {form.master_maneuver_advanced_keys?.length ? (
          <TagList items={form.master_maneuver_advanced_keys.map((k) => labelOf(maneuverAdvancedOptions, k))} />
        ) : null}
      </SummaryCard>

      <SummaryCard title="Equipo">
        <SummaryRow label="Armadura" value={labelOf(armorOptions, form.armor_key)} />
        <SummaryRow label="Arma" value={labelOf(weaponOptions, form.weapon_key)} />
        <SummaryRow label="Totem" value={labelOf(totemOptions, form.totem_key)} />
        <SummaryRow label="Mantra" value={labelOf(mantraOptions, form.mantra_key)} />
        <SummaryRow label="Libro" value={labelOf(bookOptions, form.book_key)} />
        <SummaryRow label="Receta" value={labelOf(recipeOptions, form.recipe_key)} />

        <Divider />

        <SummaryRow label="Items" value={`${form.item_keys?.length || 0}`} />
        {form.item_keys?.length ? (
          <TagList items={form.item_keys.map((k) => labelOf(itemOptions, k))} />
        ) : (
          <p className="text-sm text-gray-400">— Sin items</p>
        )}
      </SummaryCard>

      <SummaryCard title="Sesión" className="md:col-span-2">
        <SummaryRow label="Nombre" value={form.session_name || '—'} />
        <SummaryRow label="Máx. jugadores" value={String(form.max_players ?? 6)} />
        <SummaryRow label="Password" value={form.session_password ? '●●●●●●' : '—'} />
        <p className="text-xs text-gray-400 mt-2">
          Podemos poner algun mensaje aqui .
        </p>
      </SummaryCard>
    </div>
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
              disabled={saving || form.name.trim().length === 0 || form.session_name.trim().length === 0}
              className="bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 border border-purple-500 px-5 py-2 rounded-lg text-white disabled:opacity-50"
            >
              {saving ? 'Creando sesión...' : 'Crear sesión + Avatar'}
            </button>
          )}
        </div>
      </div>
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

function Select({ label, options, value, onChange }) {
  const selected = options?.find((o) => o.value === value);
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray"
      >
        {options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {selected?.description ? (
        <p className="text-xs text-gray-300 mt-1">{selected.description}</p>
      ) : null}
    </div>
  );
}

function MultiButtons({ label, options, selected, onToggle, showDescription }) {
  return (
    <div>
      <p className="mb-2 text-sm">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options?.map((o) => {
          const active = selected?.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              className={`px-3 py-2 rounded-lg border font-bold ${
                active ? 'bg-arcanePurple border-purple-400 text-white' : 'bg-black/30 border-fadedGold text-moonGray'
              }`}
              title={showDescription ? (o.description || '') : ''}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {showDescription ? (
        <p className="text-xs text-gray-400 mt-2">Pasa el ratón por encima para ver notas.</p>
      ) : null}
    </div>
  );
}
  function SummaryCard({ title, children, className = '' }) {
  return (
    <div className={`bg-black/25 border border-fadedGold/60 rounded-xl p-4 shadow-lg ${className}`}>
      <h3 className="text-fadedGold text-lg mb-3 tracking-wide">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-sm text-moonGray font-semibold text-right max-w-[60%]">
        {value || '—'}
      </span>
    </div>
  );
}

function TagList({ items = [] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.filter(Boolean).map((t) => (
        <span
          key={t}
          className="px-2 py-1 rounded-lg border border-fadedGold/50 bg-black/30 text-xs text-moonGray"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-fadedGold/30 my-2" />;
}

function labelOf(options = [], key) {
  return options.find((o) => o.value === key)?.label || key || '—';
}


