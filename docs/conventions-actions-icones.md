# Convention de présentation des actions — IPS-NEO

**Règle permanente :** dans les tableaux et les en-têtes de fiches, les actions courtes sont représentées par des **icônes**, et non des mots répétés. Utiliser `src/ui/IconButton.tsx` afin de garder une iconographie homogène.

| Action | Icône | Couleur | Sécurité |
|---|---|---|---|
| Ajouter | Plus (+) | Vert | Ouvre / réinitialise un formulaire vide |
| Modifier | Crayon | Violet | Charge l'enregistrement dans le formulaire |
| Activer | Cercle avec coche | Vert | Mise à jour du statut uniquement |
| Désactiver | Cercle avec croix | Ambre | Confirmer avant de désactiver |
| Supprimer | Corbeille | Rouge | Non implémenté : définir règles et autorisations avant mise en service |

**Accessibilité :** chaque icône doit posséder `title` (survol) et `aria-label` (lecteur d'écran). Le focus clavier doit être visible ; la couleur ne suffit jamais à elle seule. Les cibles tactiles doivent rester utilisables sur mobile.

**Cohérence métier :** aucun bouton ne doit exister sans action fonctionnelle. Ne jamais présenter « Supprimer » si la suppression n'est pas autorisée par les règles métier. Pour l'instant, utiliser **Désactiver** de préférence à « Supprimer » afin de préserver les rattachements et l'historique. Les validations/erreurs doivent rester en texte lisible.

**Périmètre initial :** Ateliers, Équipements ; futurs modules Sites et autres référentiels reprendront les mêmes composants.
