# IPS-NEO — Référentiel industriel multisite

## Pourquoi
NEOMEDIC dispose de plusieurs sites de production. Il faut distinguer la localisation physique de la fonction de l'atelier.

## Hiérarchie retenue V0.2
**Site de production → Atelier → Équipement**

- **Site** : code, nom, description, actif/inactif (réel uniquement).
- **Atelier** : code, nom, secteur (FAB, CONDT_PR), site lié ou encore non affecté.
- **Équipement** : son atelier de rattachement détermine le site. Ne pas recopier de `site_id` dans les équipements.
- Un site peut contenir plusieurs ateliers et un atelier plusieurs équipements.
- Un équipement reste rattaché à un seul atelier dans ce référentiel ; les équipements partagés et les ressources mobiles feront l'objet de règles métier distinctes.

## Reprise de l'existant
Les **12 ateliers** et **18 équipements** préexistants restent inchangés.
Le champ `workshops.site_id` est **nullable** pour permettre la reprise sûre des ateliers.
**Aucun site fictif** n'a été créé ni affecté. Tous les ateliers restent à affecter jusqu'à saisie des noms réels.
Éviter toute affectation automatique à un site « principal » non confirmé.

## Règles sécurité et intégrité
- L'utilisateur ne consulte et n'édite que ses propres sites (RLS).
- La clé étrangère `(site_id, owner_id)` empêche l'affectation à un site extérieur au compte.
- On ne peut pas activer un atelier sur un site inactif.
- On ne peut pas désactiver un site qui a des ateliers actifs.
- Pas de suppression physique dans l'interface; désactivation seulement, avec confirmation et audit.
- Une modification de site d'atelier se propage implicitement à ses équipements.
- Toutes les actions restent historisées en base.
- `anon` n'a pas accès aux tables de référence.

## UI et inspiration
- Conserver le thème lavande compact demandé, avec barre latérale rétractable.
- Icônes colorées Ajouter, Modifier, Activer et Désactiver (texte en infobulle et pour lecteurs d'écran).
- Ajouter un filtre de site sur les ateliers et les équipements, avec « Tous » et « Non affectés ».
- Plus tard, réutiliser les concepts utiles de l'ancien IPS (explorateur des sites, filtres, recherche, lignes et salles **si nécessaires**), sans copier toute la complexité ni les règles de l'ancien backend.

## Étapes futures (non implémentées)
- Paramètres / organisation et multiutilisateurs.
- Calendrier, horaires et arrêts par équipement et par site.
- Fiche procédé / routage produit, ressources alternatives.
- Simulation d'ordonnancement avec capacité et calendriers.
- Confirmer l'identité et les possibilités réelles d'« Orbit » avant d'en copier les options.

## Validation
- 0 site factice; 12 ateliers; 18 équipements.
- Création d'un site réel, édition puis affectation contrôlée des ateliers.
- Équipements automatiquement filtrés selon le site de leur atelier.
- RLS, FK, audit et blocage de la désactivation d'un site encore utilisé.
- Build React + TypeScript et Netlify preview.
