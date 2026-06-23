# CLAUDE.md — Guide projet Easy Trip

## 🎯 Contexte du projet

**Easy Trip** est un site de location en ligne de kits d'aménagement amovibles en bois pour transformer un véhicule (SUV, break) en mini-van le temps d'un voyage.

- **Cliente / dirigeante** : Léane Appert (entrepreneur individuel)
- **Lieu d'activité** : La Rochelle et alentour (Bordeaux/Arcachon sur demande)
- **Activité officielle** : SIREN `106 429 699` · SIRET `10642969900015` · RCS Paris · APE `7739Z` · siège 47 rue Vivienne 75002 Paris (domiciliation Vivienne Domiciliation)
- **TVA** : franchise (auto-entrepreneur, art. 293 B du CGI)
- **Email** : `easytrip.kit@gmail.com` · Tél `+33 6 45 04 45 47` · Instagram `@easytrip_france`
- **Kit fournisseur** : On The Road Box (Box Compact) — 93×65×23 cm replié, couchage 190×130 cm

## 🛠 Stack

| Couche | Techno | Notes |
|---|---|---|
| Front | HTML / CSS / JS statiques | Pas de framework, pas de build, fichiers servis tels quels |
| Polices | Inter + Playfair Display (Google Fonts) | |
| Photos | JPEG locaux (`assets/img/kit-XX.jpg`) + quelques fallbacks Pexels CDN | Toutes les photos kit en portrait 1200×1600 |
| Vidéo | `assets/video/hero.mp4` (autoplay muted loop sur l'accueil) | |
| Hébergement | **Cloudflare Pages** (auto-deploy depuis GitHub) | URL : https://easy-trip.pages.dev |
| Functions | **Cloudflare Pages Functions** (`functions/api/*.js`) | ES modules, `nodejs_compat` activé |
| Paiement | Stripe Checkout en mode test, clés `sk_test_…` | Migration LIVE à faire ultérieurement |
| Emails | Resend (HTTP API, pas de SDK) | Optionnel pour MVP |
| DNS | `*.pages.dev` (Cloudflare) | Domaine custom à acheter ultérieurement |
| Repo | GitHub `pierrehafel9-cell/Easy-Trip`, branche `claude/youthful-dirac-fl5kan` | C'est la branche déployée — pas de `main` actif |

## 📁 Arborescence

```
.
├── index.html                  # Accueil (vidéo hero, "Pourquoi Choisir Easy Trip", "En 3 étapes")
├── nos-kits.html               # Carousel 14 photos + description + section compatibilité
├── accessoires.html            # 8 items inclus + ~16 options (forfait / jour / personne / semaine)
├── comment-ca-marche.html      # 4 étapes + FAQ (compat véhicules complète OnTheRoadBox)
├── reservation.html            # Formulaire avec calcul auto (dates, voyageurs, options)
├── reservation-confirmee.html  # Page de retour Stripe (récap dynamique via /api/get-session)
├── contact.html                # Formulaire + coordonnées + logos sociaux SVG
├── mentions-legales.html       # Infos légales complètes (Léane Appert, SIREN…)
├── cgv.html                    # Conditions générales de location (article 5 caution 500 €)
├── confidentialite.html        # RGPD
├── _routes.json                # Cloudflare routing : /api/* → Functions
├── package.json                # dependencies: stripe ^17.5, resend ^4
├── sitemap.xml + robots.txt    # SEO
├── functions/
│   ├── _emails.js              # Templates HTML clientEmail() + adminEmail()
│   └── api/
│       ├── create-checkout-session.js  # POST /api/create-checkout-session
│       ├── get-session.js              # GET  /api/get-session?session_id=…
│       └── stripe-webhook.js           # POST /api/stripe-webhook
└── assets/
    ├── css/style.css           # Toute la feuille de styles (≈1300 lignes)
    ├── js/
    │   ├── main.js             # Menu mobile, FAB Réserver, footer year
    │   ├── reservation.js      # Calcul tarif + soumission Stripe
    │   └── gallery.js          # Carousel photos page kits
    ├── img/                    # Logo (svg + png), favicon, og-image, kit-01..14
    └── video/hero.mp4          # ~7 MB
```

## ▶️ Commandes utiles

### Servir le site en local
```bash
cd /home/user/Easy-Trip
python3 -m http.server 8000
# → http://localhost:8000
```

> ⚠️ Les Functions `functions/api/*` ne s'exécutent pas via `python3 -m http.server`. Pour les tester en local, utiliser `npx wrangler pages dev .` (nécessite `npm install` au préalable).

### Tester les fonctions Cloudflare en local
```bash
npm install                         # une seule fois
npx wrangler pages dev . --compatibility-flag=nodejs_compat
# → http://localhost:8788
```

### Pousser des modifications
```bash
git add -A
git commit -m "Description courte"
git push origin claude/youthful-dirac-fl5kan
# Cloudflare redéploie automatiquement (~1 min)
```

### Logs Cloudflare en cas de bug
- Dashboard Cloudflare → projet `easy-trip` → **Functions** → onglet **Real-time logs**
- Ou voir les logs d'un déploiement précis dans **Deployments**

## 🚨 Règles importantes à respecter

1. **Branche unique** : tout le travail est sur `claude/youthful-dirac-fl5kan`. Cloudflare est branché sur cette branche en Production. Ne pas créer de PR vers `main`.
2. **Pas de secret en clair** : jamais de `sk_test_`, `sk_live_`, `whsec_`, `re_`, etc. dans le repo. Tout passe par les **variables d'environnement Cloudflare**.
3. **Caution = 500 €** partout (HTML, JS, CGV, emails). Une mauvaise valeur cassera la cohérence client.
4. **`nodejs_compat` requis** sur Cloudflare Pages (Production + Preview) pour que le SDK Stripe fonctionne. Sans ce flag, `import Stripe from 'stripe'` plante au runtime.
5. **Stripe SDK sur Workers** : toujours initialiser avec `httpClient: Stripe.createFetchHttpClient()` et utiliser `stripe.webhooks.constructEventAsync(...)` (pas la version sync).
6. **Pas de Node API** dans les Functions : `process.env` ne marche pas → utiliser `env` reçu en argument (`onRequestPost({ request, env })`).
7. **Pas de `npm install` auto sur Cloudflare** sans build command. Garder dans Settings → Build : `npm install` comme Build command (vide = échec du bundling).
8. **Pas de `<style>` inline lourd** : tout passer dans `assets/css/style.css`.
9. **Photos kit en portrait 1200×1600** (orientation native du shooting). Carousel page kits en `aspect-ratio: 3 / 4` pour matcher sans crop.
10. **Pas de dépôt INPI du nom « Easy Trip »** pour l'instant → le `© Easy Trip` dans le footer est OK juridiquement (copyright auto sur création), mais pas de mention « marque déposée ».

## ⚠️ Pièges déjà rencontrés (à éviter)

| Piège | Solution |
|---|---|
| Cloudflare Pages échoue avec `Could not resolve "stripe"` | Mettre `npm install` dans Build command (Settings → Builds) |
| Photos du carousel rognent trop le sujet | Aspect-ratio `3/4` portrait + `object-fit: cover` |
| Grid `1fr 1fr` qui déborde quand un enfant scroll horizontalement | Ajouter `.split > * { min-width: 0; }` |
| `sed 's/1200/500/g'` global → casse aussi `og:image:width="1200"` | Restreindre le pattern : `s/1 200 €/500 €/g; s/CAUTION = 1200/CAUTION = 500/g` |
| Webhook Stripe : `constructEvent` synchrone échoue sur Workers | Utiliser `constructEventAsync` (Web Crypto) |
| Email reçu depuis `onboarding@resend.dev` (moche) | Acheter un domaine, le vérifier dans Resend, mettre `EMAIL_FROM` |
| Pré-autorisation Stripe limitée à 7 jours | Caution = SetupIntent (carte mémorisée) + capture manuelle au jour J pour les locations courtes. Pour > 7 nuits, SetupIntent seul. |
| GitHub : barre verticale `|` dans `package.json` → casse l'install Cloudflare | Pas pertinent ici, juste un rappel : tester localement avant push |
| `hero.jpg`, `kit-suv-mountain.jpg`, etc. encore référencées | Toutes supprimées et remplacées par kit-01…14 + og-image dédiée |
| Compteur de caractères `metadata` Stripe limite à 500 chars par champ | `.slice(0, 490)` partout dans `create-checkout-session.js` |

## 🎨 Conventions du projet

- **Palette** : `--color-ink #1f2222` (charbon), `--color-rust #c4452b` (orange-rouille principal), `--color-teal #2f8a8a`, `--color-yellow #e8b820`, `--color-cream #ece2d0`, `--color-bg #faf6ee`. Pas d'autre couleur sans raison.
- **Polices** : `Playfair Display` pour les titres `h1/h2/h3.font-display`, `Inter` pour le reste.
- **Boutons** : `.btn .btn-primary` (rust), `.btn-ghost` (outline), `.btn-sm` (header). Padding du `.btn-sm` = `.65rem 2.25rem` (assez d'air pour « Réserver »).
- **Espacement** : sections `padding: 5rem 0` desktop, `3rem 0` mobile (`@media max-width: 720px`).
- **Mobile-first FAB** : bouton flottant rond `.mobile-fab` avec icône calendrier SVG, ouvre un panneau au clic. Présent sur toutes les pages sauf reservation.html.
- **Tone of voice** : tutoie/vouvoie cohérent — actuellement on **vouvoie le client** dans le copy long, **tutoie dans les CTA courts** (« Réserver mon kit »). Le slogan officiel est `Les kits pour dormir où tu veux et quand tu veux.`
- **Commit messages en français**, format court (1 ligne) + détail multi-lignes si nécessaire.

## 🔐 Variables d'environnement (Cloudflare Pages)

À configurer dans Cloudflare Dashboard → projet `easy-trip` → Settings → Variables and secrets, en **Production** et **Preview**.

| Nom | Type | Valeur (à compléter dans Cloudflare) | Obligatoire ? |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Secret | `sk_test_…` (test) ou `sk_live_…` (prod) | ✅ Oui |
| `STRIPE_WEBHOOK_SECRET` | Secret | `whsec_…` (généré côté Stripe) | ✅ Oui (sinon webhook 400) |
| `STRIPE_PUBLISHABLE_KEY` | Plain | `pk_test_…` | Optionnel (utile si Stripe.js front futur) |
| `SITE_URL` | Plain | `https://easy-trip.pages.dev` (ou domaine futur) | ✅ Oui (redirections success/cancel) |
| `NOTIFY_EMAIL` | Plain | `easytrip.kit@gmail.com` | ✅ Oui (destinataire admin) |
| `RESEND_API_KEY` | Secret | `re_…` (Resend) | Optionnel (sans, pas d'emails de confirmation) |
| `EMAIL_FROM` | Plain | `Easy Trip <onboarding@resend.dev>` ou `<noreply@easytrip.fr>` | Optionnel |

**Compatibility flag à activer (sinon Stripe SDK plante)** : `nodejs_compat` sur Production + Preview, dans Settings → Functions → Compatibility flags.

## 🧪 Test Stripe en mode test

Carte de test acceptée : `4242 4242 4242 4242`, date `12/30`, CVC `123`. Webhook à pointer sur `https://easy-trip.pages.dev/api/stripe-webhook`.
