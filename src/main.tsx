import { Component, StrictMode, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Session } from '@supabase/supabase-js';
import { configured, supabase } from './supabase';
import './styles.css';
import './theme-lavande.css';
import { IconButton } from './ui/IconButton';

type Workshop = { id: string; code: string; name: string; description: string; active: boolean; created_at: string; updated_at: string };
type Equipment = { id: string; workshop_id: string; code: string; name: string; category: string; manufacturer: string; model: string; description: string; active: boolean; created_at: string };
type Audit = { id: number; entity_type: string; action: string; actor_id: string | null; created_at: string; before_row: Record<string, unknown> | null; after_row: Record<string, unknown> | null };
type Section = 'workshops' | 'equipment' | 'history';
type WorkForm = Pick<Workshop, 'code' | 'name' | 'description' | 'active'>;
type EqForm = Pick<Equipment, 'code' | 'name' | 'category' | 'manufacturer' | 'model' | 'description' | 'active' | 'workshop_id'>;
const newWork = (): WorkForm => ({ code: '', name: '', description: '', active: true });
const newEq = (): EqForm => ({ code: '', name: '', category: '', manufacturer: '', model: '', description: '', active: true, workshop_id: '' });
function displayError(e: unknown) { return e instanceof Error ? e.message : String(e || 'Erreur inconnue'); }
function dateFr(v: string) { return new Date(v).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); }

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error('IPS-NEO : rendu interrompu', error); }
  render() {
    if (this.state.failed) return <main className="fatal"><h1>Erreur d'affichage IPS-NEO</h1><p>Aucune donnée n'a été modifiée. Actualise la page pour réessayer.</p><button onClick={() => location.reload()}>Actualiser</button></main>;
    return this.props.children;
  }
}

function NavIcon({ name }: { name: Section }) {
  return <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'workshops' && <><rect x="3" y="10" width="18" height="11" rx="1.5" /><path d="M3 13 9 9l5 3 7-4M7 21v-5h4v5m4 0v-5h3v5M6 6h3M7 3v6" /></>}
    {name === 'equipment' && <><rect x="3" y="8" width="18" height="12" rx="2" /><circle cx="9" cy="14" r="2.2" /><path d="M14 12h4m-4 4h4M7 8V5h10v3M7 20v2m10-2v2" /></>}
    {name === 'history' && <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>}
  </svg>;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<Section>('workshops');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return window.localStorage.getItem('ips-neo-sidebar-collapsed') === 'true'; }
    catch { return false; }
  });
  function toggleSidebar() {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { window.localStorage.setItem('ips-neo-sidebar-collapsed', String(next)); }
    catch { /* Keep the toggle usable if storage is restricted. */ }
  }
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [workId, setWorkId] = useState<string | null>(null);
  const [eqId, setEqId] = useState<string | null>(null);
  const [work, setWork] = useState<WorkForm>(newWork);
  const [eq, setEq] = useState<EqForm>(newEq);

  useEffect(() => {
    if (!supabase) { setBooting(false); return; }
    let live = true;
    supabase.auth.getSession()
      .then(({ data, error: authError }) => {
        if (!live) return;
        if (authError) setError(authError.message);
        setSession(data.session);
      })
      .catch(e => { if (live) setError(displayError(e)); })
      .finally(() => { if (live) setBooting(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, current) => {
      if (live) setSession(current);
    });
    return () => { live = false; subscription.unsubscribe(); };
  }, []);

  async function refresh() {
    const client = supabase;
    if (!client) return;
    setLoading(true); setError('');
    try {
      const [w, e, a] = await Promise.all([
        client.from('workshops').select('id,code,name,description,active,created_at,updated_at').order('code'),
        client.from('equipment').select('id,workshop_id,code,name,category,manufacturer,model,description,active,created_at').order('code'),
        client.from('audit_log').select('id,entity_type,action,actor_id,created_at,before_row,after_row').order('created_at', { ascending: false }).limit(100),
      ]);
      if (w.error) throw w.error;
      if (e.error) throw e.error;
      if (a.error) throw a.error;
      setWorkshops((w.data ?? []) as Workshop[]);
      setEquipments((e.data ?? []) as Equipment[]);
      setAudits((a.data ?? []) as Audit[]);
    } catch (e) { setError(displayError(e)); } finally { setLoading(false); }
  }

  useEffect(() => {
    if (session) void refresh();
    else { setWorkshops([]); setEquipments([]); setAudits([]); }
  }, [session?.user.id]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setPassword('');
    } catch (e) { setError(displayError(e)); } finally { setSaving(false); }
  }
  async function logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  }

  function resetWork() { setWorkId(null); setWork(newWork()); }
  function resetEq() { setEqId(null); setEq(newEq()); }
  function editWork(w: Workshop) { setWorkId(w.id); setWork({ code: w.code, name: w.name, description: w.description, active: w.active }); setSection('workshops'); }
  function editEq(e: Equipment) { setEqId(e.id); setEq({ workshop_id: e.workshop_id, code: e.code, name: e.name, category: e.category, manufacturer: e.manufacturer, model: e.model, description: e.description, active: e.active }); setSection('equipment'); }

  async function saveWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return;
    setError(''); setNotice(''); setSaving(true);
    try {
      const payload = { ...work, code: work.code.trim().toUpperCase(), name: work.name.trim(), description: work.description.trim() };
      if (!payload.code || !payload.name) throw Error('Code et désignation obligatoires.');
      const q = workId
        ? supabase.from('workshops').update(payload).eq('id', workId).select('id').single()
        : supabase.from('workshops').insert(payload).select('id').single();
      const { error } = await q;
      if (error) throw error;
      resetWork(); await refresh(); setNotice('Atelier enregistré.');
    } catch (e) { setError(displayError(e)); } finally { setSaving(false); }
  }

  async function saveEq(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return;
    setError(''); setNotice(''); setSaving(true);
    try {
      const payload = { ...eq, code: eq.code.trim().toUpperCase(), name: eq.name.trim(),
        category: eq.category.trim(), manufacturer: eq.manufacturer.trim(), model: eq.model.trim(),
        description: eq.description.trim() };
      if (!payload.workshop_id || !payload.code || !payload.name) throw Error('Atelier, code et désignation obligatoires.');
      const q = eqId
        ? supabase.from('equipment').update(payload).eq('id', eqId).select('id').single()
        : supabase.from('equipment').insert(payload).select('id').single();
      const { error } = await q;
      if (error) throw error;
      resetEq(); await refresh(); setNotice('Équipement enregistré.');
    } catch (e) { setError(displayError(e)); } finally { setSaving(false); }
  }

  async function changeActive(entity: 'workshops' | 'equipment', id: string, active: boolean, name: string) {
    if (!supabase || saving) return;
    if (entity === 'workshops' && active && equipments.some(e => e.workshop_id === id && e.active)) {
      setNotice('');
      setError('Désactive les équipements de cet atelier avant de désactiver l’atelier.');
      return;
    }
    if (active && !window.confirm(`Désactiver « ${name} » ? Cette action est réversible.`)) return;
    const newActive = !active;
    setSaving(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.from(entity).update({ active: newActive }).eq('id', id).select('id').single();
      if (error) throw error;
      if (entity === 'workshops' && workId === id) setWork(prev => ({ ...prev, active: newActive }));
      if (entity === 'equipment' && eqId === id) setEq(prev => ({ ...prev, active: newActive }));
      await refresh();
      setNotice(`${name} : ${newActive ? 'activé' : 'désactivé'}.`);
    } catch (e) { setError(displayError(e)); } finally { setSaving(false); }
  }

  const query = search.trim().toLocaleLowerCase('fr-FR');
  const visibleWorkshops = workshops.filter(w => !query || (w.code + ' ' + w.name + ' ' + w.description).toLocaleLowerCase('fr-FR').includes(query));
  const visibleEquipment = equipments.filter(e => !query || (e.code + ' ' + e.name + ' ' + e.category + ' ' + e.manufacturer + ' ' + e.model).toLocaleLowerCase('fr-FR').includes(query));
  const workshopName = (id: string) => workshops.find(w => w.id === id)?.name ?? 'Atelier non disponible';

  if (!configured) return <main className="login-shell"><section className="login-card"><div className="brand-mark">N</div><h1>IPS-NEO</h1><p>L'application n'est pas encore connectée à Supabase.</p><p>Configurer <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> dans Netlify ou dans <code>.env.local</code>.</p></section></main>;
  if (booting) return <main className="login-shell"><p>Vérification de la session…</p></main>;
  if (!session) return <main className="login-shell"><form className="login-card" onSubmit={login}>
    <div className="brand-mark">N</div><p className="eyebrow">Industrial Planning System</p><h1>IPS-NEO</h1>
    <p>Référentiel des ateliers et des équipements.</p>
    {error && <div className="alert" role="alert">{error}</div>}
    <label>Adresse e-mail<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
    <button className="primary" disabled={saving}>{saving ? 'Connexion…' : 'Se connecter'}</button>
    <small>Comptes gérés dans Supabase Authentication. Inscription publique non proposée.</small>
  </form></main>;

  return <div className="shell">
    <aside className={sidebarCollapsed ? 'sidebar sidebar--collapsed' : 'sidebar'} aria-label="Menu latéral">
      <div className="logo">
        <div className="brand-mark">N</div>
        <div className="logo-copy"><strong>IPS-NEO</strong><small>Référentiel industriel</small></div>
        <button type="button" className="sidebar-toggle" onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Déployer le menu' : 'Réduire le menu'}
          aria-label={sidebarCollapsed ? 'Déployer le menu latéral' : 'Réduire le menu latéral'}
          aria-expanded={!sidebarCollapsed} aria-controls="ips-neo-main-nav">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={sidebarCollapsed ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} />
          </svg>
        </button>
      </div>
      <div className="group-title">RÉFÉRENTIELS</div>
      <nav id="ips-neo-main-nav" aria-label="Navigation principale">
        <button type="button" title="Ateliers" aria-current={section === 'workshops' ? 'page' : undefined} className={section === 'workshops' ? 'nav active' : 'nav'} onClick={() => { setSection('workshops'); setSearch(''); }}>
          <NavIcon name="workshops" /><span className="nav-label">Ateliers</span><span className="nav-count">{workshops.length}</span>
        </button>
        <button type="button" title="Équipements" aria-current={section === 'equipment' ? 'page' : undefined} className={section === 'equipment' ? 'nav active' : 'nav'} onClick={() => { setSection('equipment'); setSearch(''); }}>
          <NavIcon name="equipment" /><span className="nav-label">Équipements</span><span className="nav-count">{equipments.length}</span>
        </button>
        <button type="button" title="Historique" aria-current={section === 'history' ? 'page' : undefined} className={section === 'history' ? 'nav active' : 'nav'} onClick={() => { setSection('history'); setSearch(''); }}>
          <NavIcon name="history" /><span className="nav-label">Historique</span>
        </button>
      </nav>
      <div className="sidebar-foot"><span>IPS-NEO · V0.1</span><small>Référentiels industriels</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><span>IPS Industrie / Référentiel</span><div><span className="user-email">{session.user.email}</span><button className="ghost" onClick={logout}>Déconnexion</button></div></header>
      <div className="content">
        <div className="heading"><div><p className="eyebrow">CONFIGURATION INDUSTRIELLE</p><h1>{section === 'workshops' ? 'Ateliers' : section === 'equipment' ? 'Équipements' : 'Traçabilité'}</h1><p>Une seule base Supabase. Données réelles uniquement, sans doublons fictifs.</p></div><button className="ghost" disabled={loading} onClick={() => void refresh()}>{loading ? 'Chargement…' : 'Actualiser'}</button></div>
        {error && <div className="alert" role="alert">{error}</div>}
        {notice && <div className="ok" role="status">{notice}</div>}
        {section !== 'history' && <div className="toolbar"><input aria-label="Rechercher" placeholder="Rechercher par code, désignation…" value={search} onChange={e => setSearch(e.target.value)} /><span>{section === 'workshops' ? visibleWorkshops.length : visibleEquipment.length} élément(s)</span></div>}
        {section === 'workshops' && <div className="two-columns">
          <section className="panel"><div className="panel-head"><h2>Référentiel ateliers</h2><IconButton action="add" label="Ajouter un atelier" disabled={saving} onClick={resetWork} /></div><div className="table-scroll"><table><thead><tr><th>Code</th><th>Désignation</th><th>Statut</th><th>Équipements</th><th></th></tr></thead><tbody>
            {visibleWorkshops.map(w => <tr key={w.id}><td><strong>{w.code}</strong></td><td>{w.name}</td><td><span className={w.active ? 'pill live' : 'pill'}>{w.active ? 'Actif' : 'Inactif'}</span></td><td>{equipments.filter(e => e.workshop_id === w.id).length}</td><td><div className="row-actions">
              <IconButton action="edit" label={`Modifier l’atelier ${w.name}`} onClick={() => editWork(w)} disabled={saving} />
              <IconButton action={w.active ? 'disable' : 'enable'} label={`${w.active ? 'Désactiver' : 'Activer'} l’atelier ${w.name}`}
                onClick={() => void changeActive('workshops', w.id, w.active, w.name)} disabled={saving} />
            </div></td></tr>)}
            {!visibleWorkshops.length && <tr><td colSpan={5} className="empty">Aucun atelier enregistré.</td></tr>}
          </tbody></table></div></section>
          <form className="panel editor" onSubmit={saveWork}><div className="panel-head"><h2>{workId ? 'Modifier l’atelier' : 'Nouvel atelier'}</h2></div>
            <label>Code *<input required maxLength={40} value={work.code} onChange={e => setWork({ ...work, code: e.target.value.toUpperCase() })} placeholder="Code existant en interne" /></label>
            <label>Désignation *<input required maxLength={160} value={work.name} onChange={e => setWork({ ...work, name: e.target.value })} /></label>
            <label>Description<textarea rows={3} value={work.description} onChange={e => setWork({ ...work, description: e.target.value })} /></label>
            <label className="inline-check"><input type="checkbox" checked={work.active} onChange={e => setWork({ ...work, active: e.target.checked })} /> Atelier actif</label>
            <div className="actions"><button type="button" className="ghost" onClick={resetWork}>Annuler</button><button className="primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
          </form>
        </div>}
        {section === 'equipment' && <div className="two-columns">
          <section className="panel"><div className="panel-head"><h2>Référentiel équipements</h2><IconButton action="add" label="Ajouter un équipement" disabled={saving} onClick={resetEq} /></div><div className="table-scroll"><table><thead><tr><th>Code</th><th>Équipement</th><th>Atelier</th><th>Statut</th><th></th></tr></thead><tbody>
            {visibleEquipment.map(e => <tr key={e.id}><td><strong>{e.code}</strong></td><td>{e.name}<small>{e.category}</small></td><td>{workshopName(e.workshop_id)}</td><td><span className={e.active ? 'pill live' : 'pill'}>{e.active ? 'Actif' : 'Inactif'}</span></td><td><div className="row-actions">
              <IconButton action="edit" label={`Modifier l’équipement ${e.name}`} onClick={() => editEq(e)} disabled={saving} />
              <IconButton action={e.active ? 'disable' : 'enable'} label={`${e.active ? 'Désactiver' : 'Activer'} l’équipement ${e.name}`}
                onClick={() => void changeActive('equipment', e.id, e.active, e.name)} disabled={saving} />
            </div></td></tr>)}
            {!visibleEquipment.length && <tr><td colSpan={5} className="empty">Aucun équipement enregistré.</td></tr>}
          </tbody></table></div></section>
          <form className="panel editor" onSubmit={saveEq}><div className="panel-head"><h2>{eqId ? 'Modifier l’équipement' : 'Nouvel équipement'}</h2></div>
            <label>Atelier *<select required value={eq.workshop_id} onChange={e => setEq({ ...eq, workshop_id: e.target.value })}><option value="">Choisir un atelier</option>{workshops.filter(w => w.active || w.id === eq.workshop_id).map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}</select></label>
            <label>Code *<input required maxLength={40} value={eq.code} onChange={e => setEq({ ...eq, code: e.target.value.toUpperCase() })} /></label>
            <label>Désignation *<input required maxLength={160} value={eq.name} onChange={e => setEq({ ...eq, name: e.target.value })} /></label>
            <label>Catégorie<input value={eq.category} onChange={e => setEq({ ...eq, category: e.target.value })} /></label>
            <label>Fabricant<input value={eq.manufacturer} onChange={e => setEq({ ...eq, manufacturer: e.target.value })} /></label>
            <label>Modèle<input value={eq.model} onChange={e => setEq({ ...eq, model: e.target.value })} /></label>
            <label>Observations<textarea rows={3} value={eq.description} onChange={e => setEq({ ...eq, description: e.target.value })} /></label>
            <label className="inline-check"><input type="checkbox" checked={eq.active} onChange={e => setEq({ ...eq, active: e.target.checked })} /> Équipement actif</label>
            <div className="actions"><button type="button" className="ghost" onClick={resetEq}>Annuler</button><button className="primary" disabled={saving || !workshops.length}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
          </form>
        </div>}
        {section === 'history' && <section className="panel"><div className="panel-head"><h2>Historique des changements</h2><span>Lecture seule · {audits.length} derniers événements</span></div><div className="table-scroll"><table><thead><tr><th>Date</th><th>Action</th><th>Référentiel</th><th>Code</th><th>Désignation</th></tr></thead><tbody>
          {audits.map(a => { const item = a.after_row ?? a.before_row ?? {}; return <tr key={a.id}><td>{dateFr(a.created_at)}</td><td>{a.action === 'INSERT' ? 'Création' : a.action === 'UPDATE' ? 'Modification' : 'Suppression'}</td><td>{a.entity_type === 'workshops' ? 'Ateliers' : 'Équipements'}</td><td>{String(item.code ?? '')}</td><td>{String(item.name ?? '')}</td></tr>; })}
          {!audits.length && <tr><td colSpan={5} className="empty">Aucun changement enregistré.</td></tr>}
        </tbody></table></div><p className="small-note">Journal applicatif de référence. La conformité GxP et la validation informatique restent à instruire séparément.</p></section>}
        <footer>IPS-NEO · Une application · Une base · Modules intégrés après validation.</footer>
      </div>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>);
