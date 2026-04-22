# Déploiement BMW Motorrad — Suivi SEO

## État actuel

- **Repo** : https://github.com/emichel-blip/bmw-motorrad-suivi (public)
- **URL Pages** : https://emichel-blip.github.io/bmw-motorrad-suivi/ (accessible dans 2-5 min le temps du build)
- **Synchro Notion auto** : workflow préparé mais **pas encore poussé** (voir étape 1 ci-dessous)

## Étape 1 — Pousser le workflow GitHub Actions (à faire par toi)

Le scope `workflow` n'est pas dans le token GitHub actuel de `gh`. Dans ton Terminal :

```bash
gh auth refresh -s workflow
```

Suis le flow interactif (ouvre le navigateur, accepte). Ensuite :

```bash
cd "/Users/emmanuelmichel/Tools/BMW Motorrad - Avancement projet"
git add .github
git commit -m "ci: add Notion sync workflow"
git push
```

## Étape 2 — Ajouter le secret NOTION_TOKEN

1. **Régénère** le token Notion (l'ancien a traîné dans le chat) : Notion → Settings → Connections → révoque l'ancien, crée un nouveau, vérifie qu'il est bien ajouté à la base BMW Motorrad (Share → Add connections).
2. Dans Terminal :

```bash
gh secret set NOTION_TOKEN --repo emichel-blip/bmw-motorrad-suivi
# colle le nouveau token quand demandé
```

3. Déclenche la première exécution du workflow :

```bash
gh workflow run notion-sync.yml --repo emichel-blip/bmw-motorrad-suivi
```

La sync tournera ensuite toutes les 15 minutes automatiquement.

## Étape 3 — Custom domain + Cloudflare Access

### 3a. Choisis un sous-domaine

Suggestion : `suivi-bmw.empirik.fr` (cohérent avec `impakkt.empirik.fr` qui est déjà sur Cloudflare).

### 3b. Dans Cloudflare (dashboard DNS de `empirik.fr`)

Ajoute un enregistrement :

| Type  | Nom       | Contenu                       | Proxy       |
|-------|-----------|-------------------------------|-------------|
| CNAME | suivi-bmw | emichel-blip.github.io        | ✅ Proxifié (orange) |

### 3c. Dans GitHub → Settings → Pages du repo

- **Custom domain** : `suivi-bmw.empirik.fr`
- Enforcer HTTPS (tu peux attendre que Cloudflare provisionne le cert avant d'activer)
- Cela crée un fichier `CNAME` dans le repo — GitHub s'en occupe.

### 3d. Dans Cloudflare Zero Trust

1. Aller sur https://one.dash.cloudflare.com/ → sélectionner le compte qui gère `empirik.fr`.
2. **Access** → **Applications** → **Add an application** → **Self-hosted**
3. Config :
   - Name : **BMW Motorrad — Suivi SEO**
   - Session Duration : 24h (ou ce que tu veux)
   - Application domain : `suivi-bmw.empirik.fr`
4. **Policies** → **Add a policy** :
   - Policy name : `Equipe autorisée`
   - Action : `Allow`
   - Rules → **Emails** :
     - `stats@empirik.fr`
     - `emmanuel.michel@empirik.fr` (si différent)
     - les emails des personnes côté BMW (contact client)
   - Optionnel : ajouter une règle **Emails ending in** = `@empirik.fr` pour autoriser toute l'agence
5. **Identity providers** : laisse **One-time PIN** activé (email magique). Tu peux ajouter Google plus tard si tu veux.
6. **Next** → **Add application**.

### 3e. Vérification

- Ouvre https://suivi-bmw.empirik.fr
- Cloudflare te demande ton email → il t'envoie un code → tu entres le code → accès au dashboard.
- Le client reçoit ses propres codes par email à chaque nouvelle session (ou par Google/SSO selon ce que tu configures).

## Récap des URLs

- **Repo** : https://github.com/emichel-blip/bmw-motorrad-suivi
- **URL Pages brute** (publique sans auth) : https://emichel-blip.github.io/bmw-motorrad-suivi/
- **URL client final** (Cloudflare Access) : https://suivi-bmw.empirik.fr

⚠️ Tant que le custom domain n'est pas configuré, l'URL Pages brute est accessible à n'importe qui avec le lien. Tu peux soit :
- Activer la **porte d'entrée mot de passe** (`AUTH_HASH`) le temps de la transition
- Ou ne pas communiquer l'URL brute

## Mettre à jour le suivi (workflow quotidien)

Le dashboard s'auto-rafraîchit côté Notion via l'Action. Pour toi :
- **Cocher des cases du devis** → travaille en local dans ton navigateur, puis **Exporter pour publication** → colle dans `index.html`, `git commit && git push`. GitHub Pages rebuild en 1-2 min.
- **Tâches Notion** : simplement coche les cases dans ton kanban Notion. L'Action pull automatiquement.
