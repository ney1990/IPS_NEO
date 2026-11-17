# IPS-NEO — Thème lavande compact

## Référence
Interface inspirée de la capture utilisateur « My Courses » : navigation violet moyen, espace de travail blanc, touches lavande et rose très pâle, cartes arrondies, interface respirante.

**Adaptation industrielle :** pas d'illustrations décoratives au détriment des tableaux Ateliers et Équipements. Les données ne sont pas modifiées par ce thème.

## Règles UX
- Navigation latérale repliable avec chevron explicite.
- Vue déployée : pictogrammes + noms des modules + nombres de lignes.
- Vue repliée : pictogrammes accessibles au clavier, infobulles au survol, largeur de 70 px.
- L'état de la barre latérale est enregistré sous `ips-neo-sidebar-collapsed` dans le navigateur (localStorage), sans communication serveur.
- Mobile : sidebar horizontale compacte ; lorsque repliée, seuls les pictogrammes sont visibles.
- Tableau toujours scrollable horizontalement sur petits écrans ; aucune colonne masquée.
- Police générale ~12–12,5 px, tableaux ~11,5 px, titre ~24 px.
- L'accessibilité visuelle prime sur la reproduction exacte : contrastes renforcés pour les textes et boutons.

## Palette
| Token | Hex |
|---|---|
| Sidebar | `#5B55AB` |
| Actif sidebar | `#766BC6` |
| Fond app | `#F7F3FE` |
| Surface | `#FFFFFF` |
| En-tête tableau | `#F3EFFD` |
| Bordure | `#E9E3F3` |
| Texte principal | `#292442` |
| Texte secondaire | `#666178` |
| Accent / action | `#6256AD` |
| Bouton action à texte blanc | `#4E4496` |

## Architecture CSS
- `src/styles.css` : styles de base, conservés pour retour arrière.
- `src/theme-lavande.css` : surcharge activée après `styles.css`.
- `src/main.tsx` : bouton replier/déplier, composants icônes, stockage de préférence.
- Aucun changement de schéma, de règle RLS ou de donnée Supabase.

## Critères de validation
1. Connexion et déconnexion restent fonctionnelles.
2. Barre latérale ouverte/repliée permet d'accéder aux trois modules.
3. Le choix reste mémorisé après actualisation.
4. Les référentiels Ateliers et Équipements affichent les mêmes lignes.
5. Formulaires de création/modification non impactés.
6. Les erreurs et messages de validation restent visibles.
7. Vérifier l'écran sur PC (1920px), ordinateur portable (1366px) et mobile (390px).
8. Build TypeScript/Vite vert sur GitHub Actions ; déploiement Netlify en état `ready`.

## Prochain module industriel recommandé
Calendriers de disponibilité par équipement et gestion des shifts, puis fiches procédés des produits. Ne pas ajouter de module d'ordonnancement avant validation de ces deux fondations.
