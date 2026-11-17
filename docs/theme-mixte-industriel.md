# IPS-NEO — Charte UI : Mixte industriel pharmaceutique

**Statut :** direction graphique approuvée.  
**Périmètre V0.1 :** connexion, Ateliers, Équipements, Historique et états d'interface.  
**Principe :** la présentation est séparée des règles métier et du stockage des données.

## 1. Identité

- **Navigation sombre**, stable et compacte.
- **Espace de travail clair** pour les tableaux de données et les formulaires.
- **Vert pétrole** pour l'action principale, les états actifs et les validations.
- **Bleu technique** pour la recherche, les informations et les actions secondaires.
- Ne pas utiliser de couleur pour une information non justifiée par un état métier.

## 2. Palette / tokens CSS

| Rôle | Variable | Valeur |
| --- | --- | --- |
| Navigation | `--ips-sidebar` | `#14263F` |
| Navigation hover | `--ips-sidebar-hover` | `#1C3557` |
| Navigation active | `--ips-sidebar-active` | `#244B78` |
| Texte navigation | `--ips-sidebar-text` | `#F4F7FB` |
| Fond application | `--ips-canvas` | `#F4F7FA` |
| Surface | `--ips-surface` | `#FFFFFF` |
| En-têtes tableaux | `--ips-table-head` | `#EEF3F8` |
| Bordure | `--ips-border` | `#D9E2EC` |
| Titres | `--ips-heading` | `#1B2B3A` |
| Texte | `--ips-body` | `#425466` |
| Texte secondaire | `--ips-muted` | `#6B7C93` |
| Accent principal | `--ips-primary` | `#1F8A70` |
| Hover principal | `--ips-primary-hover` | `#176B57` |
| Accent secondaire | `--ips-secondary` | `#2F6B9A` |
| Succès | `--ips-primary-light` | `#E8F7F1` |
| Information | `--ips-secondary-light` | `#EAF3FB` |
| Alerte | `--ips-warning-light` | `#FFF4E5` |
| Erreur | `--ips-error-light` | `#FDECEC` |

Les variables de référence vivent dans `src/styles.css`, pas dans les composants React.

## 3. Typographie et densité

- Police : Inter si installée, puis Segoe UI, Arial et sans-serif.
- Titres de page : 25–31 px ; sections : 16 px.
- Texte standard / formulaires : 13–14 px.
- Tableaux : 13 px ; intitulés des colonnes : 11 px en capitales.
- Tous les montants, dates, numéros de lot et données comparables : alignement tabulaire lorsque pertinent.
- Bordure de carte de 1 px, rayon de 12 px, ombre discrète.

## 4. Composants à maintenir cohérents

| Élément | Règle |
| --- | --- |
| `.sidebar`, `.nav`, `.logo` | Navigation foncée ; élément sélectionné identifiable sans ambiguïté |
| `.topbar`, `.content`, `.heading` | Zone claire, titres et actions distincts |
| `.panel`, `.panel-head`, `.editor` | Cartes blanches, formulaires espacés et lisibles |
| `table`, `th`, `td`, `.table-scroll` | En-têtes gris-bleu, lignes discrètement alternées, défilement horizontal mobile |
| `.primary`, `.ghost`, `.link` | Une action primaire vert pétrole, actions secondaires bleues |
| `.pill`, `.pill.live` | Inactif neutre, actif vert ; couleur + libellé |
| `.alert`, `.ok` | Erreur rouge, réussite verte, messages explicites |
| `.login-shell`, `.login-card` | Même identité que l'application |
| `.fatal` | Erreur d'affichage lisible sans disparition totale de l'interface |

## 5. Critères de validation

1. Les écrans Ateliers, Équipements et Historique affichent les données existantes.
2. Les actions et leur comportement sont inchangés.
3. La connexion Supabase fonctionne ; aucune clé secrète n'est embarquée côté navigateur.
4. Le build TypeScript + Vite est vert dans GitHub Actions.
5. Le contraste est lisible et la sélection clavier visible.
6. Les tableaux restent utilisables sur écran étroit.
7. Aucune table, migration, règle RLS ou donnée de production ne change dans une PR purement graphique.

## 6. Consigne courte de développement futur

> Pour toute nouvelle page IPS-NEO, respecter la charte `docs/theme-mixte-industriel.md` et les tokens CSS dans `src/styles.css`. Réutiliser les composants existants. Ne pas inventer de nouvelles couleurs ni modifier la logique métier. Tester le build avant fusion.
