# BMW Motorrad — Suivi projet SEO 2026

Outil de suivi d'avancement pour le projet SEO BMW Motorrad (bmw-motorrad.fr). Fichier HTML autonome, visible en ligne pour le client, déployable sur GitHub Pages.

## Utilisation

### Consulter (client et équipe)
Ouvrir `index.html` dans un navigateur, ou consulter l'URL GitHub Pages une fois déployé. Vue en lecture seule par défaut.

### Éditer l'avancement (Empirik)
1. Cocher les sous-tâches au clic, cliquer sur les pastilles de statut pour cycler (À engager → En cours → Terminé → Non applicable), ajuster les compteurs (briefs, contenus, liens).
2. L'état est sauvegardé automatiquement en localStorage (navigateur) — pas besoin de bouton « Enregistrer ».
3. Pour publier ces modifications auprès du client : cliquer sur **Exporter pour publication** → la constante `ACTIONS` à jour s'affiche, la copier et la coller dans `index.html` (remplacer le bloc `const ACTIONS = [...]`), mettre à jour `LAST_PUBLISHED`, puis commiter et pusher → GitHub Pages rafraîchit la page client.

Le bouton **Restaurer** efface les modifications locales et restaure l'état publié.

> ⚠️ localStorage est local au navigateur : les clics du client chez lui ne modifient pas la vue des autres. Seule la version commitée sur GitHub est la « source de vérité » publique.

## Déploiement sur GitHub Pages

```bash
cd "BMW Motorrad - Avancement projet"
git init
git add index.html README.md
git commit -m "init: suivi projet BMW Motorrad"
git branch -M main
git remote add origin git@github.com:<ton-compte>/bmw-motorrad-suivi.git
git push -u origin main
```

Puis dans Settings → Pages du repo : source `main` / root. L'URL sera `https://<ton-compte>.github.io/bmw-motorrad-suivi/`.

## Porte d'entrée (mot de passe)

Par défaut : **désactivée** (`AUTH_HASH = []` dans `index.html` → accès libre).

Pour activer une porte d'entrée email + mot de passe :

1. Ouvrir `index.html` dans le navigateur (sans auth configurée).
2. Dans la console JS du navigateur, lancer :
   ```js
   await generateCredentialsHash("contact@bmw-motorrad.fr", "monMotDePasse")
   ```
3. Copier le hash affiché dans la constante `AUTH_HASH` du fichier :
   ```js
   const AUTH_HASH = [
       "f3a2…hash1",
       "b4e1…hash2"   // un deuxième compte si besoin
   ];
   ```
4. Commiter et pusher → à partir de là, la page exige les identifiants.

> ⚠️ Ce n'est pas une authentification sécurisée : le hash est lisible dans le code source. Cela bloque un visiteur lambda, pas un attaquant qui lit le code. Pour une vraie protection, utiliser **Cloudflare Access** devant le site (gratuit jusqu'à 50 comptes, auth email magique ou Google).

Le bouton **Déconnexion** (en bas à droite) vide la session.

## Synchronisation Notion (tâches du kanban)

L'API Notion ne permet **pas d'appels directs depuis le navigateur** (pas de CORS). La sync se fait server-side via GitHub Actions.

### Setup (une fois, après déploiement)

1. Aller dans Notion → **Settings** → **Connections** (ou Integrations) → créer une intégration, récupérer le token (`ntn_...`).
2. Ouvrir la base BMW Motorrad dans Notion → bouton **Share** → **Add connections** → sélectionner l'intégration créée.
3. Sur le repo GitHub : **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name : `NOTION_TOKEN`
   - Value : le token `ntn_...`
4. Activer le workflow : onglet **Actions** → **Notion sync** → **Enable workflow**.
5. Exécution manuelle la première fois : onglet **Actions** → **Notion sync** → **Run workflow**.

La Action tourne ensuite toutes les 15 minutes, commit `notion-snapshot.json` si des tâches ont changé, et le dashboard le lit automatiquement.

### Test en local (optionnel)

```bash
NOTION_TOKEN=ntn_xxx node scripts/notion-sync.mjs
```

Génère `notion-snapshot.json` à côté de `index.html`. Recharger le dashboard pour le voir.

## Structure du suivi

Les actions sont organisées selon le devis signé :

1. **Stratégie** — Kick-off, Audit SEO (technique/sémantique/popularité), Étude de mots-clés, Stratégie & mix SEO
2. **Optimisations (crédit temps)** — Techniques, Sémantiques (50 briefs, 50 contenus, maillage, charte nommage), Off-page (~70 liens, RP, GMB), Correctives
3. **Pilotage T1** — Tableau de bord Looker + calls mensuels janvier/février/mars
4. **Pilotage T2 → T4** — Bilans trimestriels (juin, septembre, décembre)

## Ressources liées (accessibles depuis la barre en haut)

- Looker Studio, IMPAKKT, charte de nommage mots-clés, dossier de travail, livrables Drive, site bmw-motorrad.fr

## Personnalisation

- Modifier `CONTRACT` pour ajuster les dates contractuelles.
- Modifier `ACTIONS` directement dans `index.html` pour ajouter/retirer des livrables.
- La barre tempo et le scoring "Attendu / En avance / En retard" sont calculés automatiquement en fonction de la date du jour et de la période contractuelle.
