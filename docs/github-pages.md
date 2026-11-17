# IPS-NEO — publication GitHub Pages (dépôt public)

## Pré-requis sécurité

- Contrôler **tous les fichiers ET l'historique Git** avant d'ouvrir le dépôt au public : source, migrations, documentation, données métiers et journaux de CI. Un retour au statut privé ne supprime pas les copies déjà téléchargées.
- Les données `sites`, `workshops`, `equipment` et `audit_log` restent dans Supabase, pas dans GitHub Pages.
- Supabase doit utiliser uniquement une **clé publishable** dans le navigateur, avec RLS active sur toutes les tables. Ne jamais mettre une clé `service_role`/secret, URL PostgreSQL avec mot de passe, ou identifiants utilisateurs dans `VITE_*`.
- Supabase Auth doit avoir des mots de passe robustes ; activer si disponible la protection contre les mots de passe compromis et idéalement MFA.
- Rendre le code public expose aussi la documentation métier qui mentionne NEOMEDIC. S'assurer d'avoir le droit de diffuser ces informations.

## Mise en ligne

1. Sur GitHub, dépôt **ney1990/IPS_NEO → Settings → General → Danger Zone → Change repository visibility → Public**.
2. Le workflow contient l'URL Supabase et **uniquement la clé publishable** (publique par conception) pour le premier déploiement. Aucun secret administratif n'y figure. En cas de rotation, les variables GitHub Actions `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` prennent le dessus sur les valeurs par défaut.
3. Dans **Settings → Pages → Build and deployment → Source**, choisir **GitHub Actions**. Cette activation est **obligatoire** : l'action `configure-pages@v5` ne peut pas initialiser Pages avec le simple `GITHUB_TOKEN` du dépôt.
4. Exécuter **Actions → Publish IPS-NEO (GitHub Pages) → Re-run failed jobs** (ou `Run workflow` sur `main`). Un commit futur sur `main` relancera automatiquement la publication.
5. Vérifier l'adresse `https://ney1990.github.io/IPS_NEO/` **après** le succès du job de déploiement, puis tester connexion, sites, ateliers et équipements.
6. Dans Supabase, vérifier **Authentication → URL Configuration**, notamment Site URL/redirects si des flux de confirmation ou réinitialisation par e-mail sont utilisés.

## Technique

- Vite `--mode pages` définit la racine des assets sur `/IPS_NEO/`, sans perturber le mode local et Netlify.
- Le workflow est automatiquement **ignoré pour un dépôt privé** sur GitHub Free.
- Le workflow refuse de publier si les deux variables publiques Supabase n'ont pas été configurées.
- Les artefacts statiques compilés sont publiés ; l'application continue à interroger Supabase depuis le navigateur après connexion.
- `npm ci` utilise le package-lock pour installer précisément les dépendances.
- `permissions: contents: read` pour les contrôles de build ; permissions Pages uniquement pour le déploiement.

## Limites

GitHub Pages ne protège **pas l'accès au site lui-même** : n'importe qui peut charger l'interface et voir sa page de connexion. Les données sont protégées côté Supabase par Auth + RLS, et les sessions par l'identification. Le dépôt *public* permet à toute personne de voir le code source. Il n'est pas équivalent à une application intranet privée.

**Prochaine étape sécurité** : un audit de l'historique Git et des droits d'accès des utilisateurs avant de diffuser des données sensibles ou de permettre plusieurs comptes partagés.
