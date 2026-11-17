# IPS-NEO

Socle indépendant pour la planification industrielle NEOMEDIC, développé progressivement.

## Périmètre V0.1
- Une seule application React / TypeScript, sans backend local à démarrer
- Une seule base PostgreSQL **Supabase IPS_NEO**
- Connexion par Supabase Auth, sans inscription publique depuis l'interface
- Référentiel **Ateliers** et **Équipements**
- Historique des changements en lecture seule
- Aucune simulation ni donnée fictive
- L'ancien IPS est indépendant, non modifié

## Sur le PC
1. Cloner le dépôt dans `C:\IPS_NEO` (si un ancien contenu y est déjà présent, le sauvegarder avant de le remplacer).
2. Installer Node.js 22 ou supérieur.
3. `npm install`
4. Copier `.env.example` vers `.env.local` et renseigner uniquement l'URL Supabase + la **clé publishable**.
5. `npm run dev`, puis ouvrir http://127.0.0.1:5173.

Ne jamais copier une clé `service_role`, secrète, ni un mot de passe dans GitHub ou les variables Vite.

## En ligne
- Importer `ney1990/IPS_NEO` dans Netlify.
- Construire via `npm run build`, publier le répertoire `dist` (config dans `netlify.toml`).
- Variables d'environnement Netlify : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Dans Supabase > Authentication > Users, inviter/créer l'utilisateur initial autorisé.
- Autoriser les URLs de connexion/redirect dans Supabase Auth si nécessaire.

## Données et sécurité
- Projet Supabase : `IPS_NEO`, migration initiale versionnée dans `supabase/migrations/`.
- Données séparées par compte utilisateur grâce aux politiques RLS ; partage multi-utilisateurs non implémenté.
- Aucun DELETE dans l'interface ou dans les permissions du rôle authenticated : désactivation via `active`.
- Journal technique des modifications ; pas de déclaration de conformité GxP à ce stade.
- Ne pas importer de données réelles NEOMEDIC sans accord de l'entreprise.

## Discipline
Les fonctionnalités suivantes feront l'objet d'une validation métier, puis de tests techniques, avant intégration. Un commit GitHub ne vaut pas validation fonctionnelle.
