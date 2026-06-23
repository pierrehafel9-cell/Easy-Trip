# PROJECT_HANDOFF.md — Passation Easy Trip

> **Lis aussi `CLAUDE.md`** pour le contexte technique, les commandes et les conventions. Ce fichier-ci est focalisé sur **l'état d'avancement** et **les prochaines étapes**.

## 📍 État au 23 juin 2026

- **Site déployé** : https://easy-trip.pages.dev (Cloudflare Pages)
- **Repo GitHub** : `pierrehafel9-cell/Easy-Trip`, branche de prod = `claude/youthful-dirac-fl5kan`
- **Lancement prévu par la cliente** : jeudi (cette semaine)
- **Mode Stripe** : **TEST** (`sk_test_…`) — bascule LIVE à faire avant ouverture publique
- **Domaine** : `*.pages.dev` (custom domain pas encore acheté)

## ✅ Ce qui fonctionne déjà

### Site et contenu
- 10 pages HTML statiques cohérentes (accueil, kits, accessoires, comment ça marche, FAQ, réservation, confirmation, contact, mentions, CGV, confidentialité)
- Vidéo hero accueil en autoplay
- Carousel page kits avec 14 photos portrait (recadrées 3/4) + vignettes scrollables
- Page accessoires : 8 items inclus + ~16 options à la carte avec tarification par jour / personne / forfait / semaine·pers.
- Page réservation : calcul automatique du tarif (basse/haute saison + voyageurs + options), validation porte-vélos (≥ 15 j à l'avance)
- FAQ : liste complète des véhicules compatibles (Box Compact OnTheRoadBox)
- Page contact : formulaire + logos SVG Instagram / Facebook
- Footer : liens mentions / CGV / confidentialité, infos contact, lien Insta actif

### Mobile
- Vidéo hero qui joue sur mobile
- Bouton flottant rond « Réserver » qui s'ouvre au tap (FAB)
- Tous les CTA accessibles
- Navigation hamburger fluide

### Infos légales complètes
- `mentions-legales.html` : Léane Appert, SIREN, SIRET, RCS Paris, APE 7739Z, siège Paris (domiciliation), franchise TVA
- `cgv.html` : article 5 caution 500 €, article 7 annulation 7j/2j, article 14 médiateur (encore en placeholder)
- `confidentialite.html` : RGPD, droits, durées de conservation

### Stripe
- Architecture en place : SetupIntent (carte mémorisée à la résa) + capture manuelle de 500 € le jour J + débit additionnel possible en cas de dégâts > 500 €
- Functions Cloudflare créées : `create-checkout-session`, `get-session`, `stripe-webhook`
- Code testé en local, déployé, **utilisable dès que les variables d'env sont saisies dans Cloudflare**

### SEO & partage
- Google Search Console : balise vérifiée dans `index.html`
- Sitemap + robots.txt
- og-image dédiée 1200×630 régénérée à partir de `kit-01.jpg` portrait
- Données structurées JSON-LD (LocalBusiness) sur l'accueil

## 🟡 Ce qui reste à faire avant ouverture publique

### Bloquants (à régler avant le lancement)
1. **Tester le paiement Stripe en mode test** sur le site live. Carte test `4242 4242 4242 4242`. Confirmer que la redirection vers `reservation-confirmee.html` se passe bien.
2. **Configurer le webhook Stripe** : endpoint `https://easy-trip.pages.dev/api/stripe-webhook`, événements `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`. Copier `whsec_…` dans `STRIPE_WEBHOOK_SECRET`.
3. **Activer le médiateur de la consommation** (CM2C ~80 €/an ou Médicys ~90 €/an) et renseigner ses coordonnées dans `cgv.html` article 14 (encore en placeholder).
4. **Basculer Stripe en LIVE** : remplacer `sk_test_` par `sk_live_` dans Cloudflare, recréer le webhook en mode LIVE.

### Important (peut suivre le lancement)
5. **Domaine personnel** (`easytrip.fr` si dispo, sinon `.com` ou `easytripfrance.fr`). Recommandation : Cloudflare Registrar (prix coûtant ~9 €/an, intégration auto avec Pages).
6. **Photos accessoires** : la cliente trouve les images Pexels « pas top » sur certains items. À remplacer au fil de l'eau par ses propres photos (uploads via GitHub web dans `assets/img/` avec nommage explicite).
7. **Resend** : créer compte (`https://resend.com`), générer une API key, l'ajouter dans Cloudflare → les emails de confirmation client + admin commenceront à partir.
8. **Page Facebook** : actuellement liée à `#` dans tous les footers. Mettre l'URL réelle quand la page sera créée.
9. **Photo de notre kit dans la section « Notre kit » de l'accueil** : utilise actuellement `kit-01.jpg`. La cliente pourrait vouloir une autre photo plus tard.

### Nice-to-have
- Améliorer les CGV avec le contrat de location que la cliente a déjà rédigé (elle doit l'envoyer)
- Google Business Profile (énorme effet local SEO pour « La Rochelle »)
- Tags Open Graph plus poussés (vidéo, structured data Product)
- Mini-dashboard admin pour gérer les cautions sans aller dans Stripe à la main

## 📄 Fichiers importants à connaître

| Fichier | Pourquoi c'est crucial |
|---|---|
| `nos-kits.html` | Carousel délicat à modifier (HTML + CSS + JS doivent rester en sync). Voir `assets/js/gallery.js`. |
| `assets/css/style.css` | ~1300 lignes, contient tout. Sections balisées par commentaires (Header / Hero / Sections / Cards / Split / Gallery / FAB mobile / Forms / Legal pages…). |
| `assets/js/reservation.js` | Calcul tarifaire complet. `CAUTION = 500` (ligne 9), `RATES` (lignes 6-8), `PORTE_VELO_LEAD_DAYS = 15`. Si on change un prix, modifier ICI **et** dans le HTML correspondant (`data-price`, `data-price-type`). |
| `functions/api/create-checkout-session.js` | Reçoit le payload du formulaire, crée la session Stripe Checkout avec `setup_future_usage: 'off_session'` pour mémoriser la carte. Métadonnées riches passées à Stripe pour traçabilité. |
| `functions/api/stripe-webhook.js` | Reçoit `checkout.session.completed`, déclenche l'envoi des emails via Resend. Utilise `constructEventAsync` (Web Crypto). |
| `functions/_emails.js` | Templates HTML des emails (client + admin). Style inline, compat Outlook. Le `siteUrl` est passé en paramètre (pas de `process.env`). |
| `_routes.json` | `{"version":1,"include":["/api/*"]}` — sans ça, les Functions ne seraient pas routées proprement. |
| `package.json` | `stripe ^17.5` + `resend ^4`. Cloudflare installe via `npm install` lors du build. |
| `mentions-legales.html` + `cgv.html` | Infos officielles déjà saisies (Léane Appert, SIREN, SIRET, RCS Paris…). Ne pas écraser sans recopier. |
| `assets/img/kit-01.jpg` à `kit-14.jpg` | Photos du shooting de la cliente, format portrait 1200×1600. **NE PAS RECADRER en carré sans confirmation** — ça a déjà été fait par erreur puis annulé. |

## 🔧 Problèmes déjà résolus (pour ne pas refaire les mêmes erreurs)

| Problème | Cause | Solution appliquée |
|---|---|---|
| Build Cloudflare échoue « Could not resolve "stripe" » | Pas de `npm install` lancé par défaut | Build command = `npm install` dans Settings |
| Photos déformées sur page kits | `aspect-ratio: 4/3` + photos portrait → crop trop violent | `aspect-ratio: 3/4` (match photo aspect) + `object-fit: cover` |
| Carousel déborde et écrase la colonne texte | CSS Grid + enfant qui scroll horizontalement | Ajouter `.split > * { min-width: 0; }` |
| Aperçu noir sur WhatsApp/FB | Photos sources carrées 1445×1445 (pas paysage) | og-image dédiée 1200×630 générée via PIL |
| Caution à 1200 € → trop pour beaucoup de CB | Limites bancaires | Caution baissée à 500 € (sur demande client) |
| Caution affichée « débitée » → angoissant | Mauvais wording | Reformulée « empreinte bancaire bloquée, levée sous 72 h » |
| Site « invisible » sur Google | Pas indexé | Sitemap + robots.txt + Search Console activé |
| Logo PNG affichait carré blanc autour | PNG opaque sur fond dark du header | SVG transparent généré, repris dans header/footer |
| Bouton « Réserver » header trop serré | Padding `1rem` insuffisant | Augmenté à `2.25rem` |
| Le sed `1200 → 500` global a aussi changé og:image:width | Pattern trop large | Restauré à 1200 manuellement, fix scripté futur : pattern restrictif |
| Photos accessoires (douche, panneau solaire, etc.) « ne collaient pas » | Pexels random | Sélection ciblée Pexels via Web search + remplacement individuel — à itérer |
| « Pourquoi Easy Trip » → trop générique | Tone of voice | Renommé en « Pourquoi Choisir Easy Trip » + textes plus chaleureux |

## ❓ Problèmes encore ouverts

1. **Test Stripe non confirmé** : Léane a fait toutes les configs Cloudflare (compatibility flag + env vars + build command) mais le résultat du test (carte `4242…`) n'a pas été remonté. À vérifier en priorité.
2. **Médiateur conso** : article 14 des CGV en placeholder. Léane doit s'inscrire chez CM2C ou Médicys.
3. **Domaine custom** : pas encore acheté. La cliente envisageait Hostinger. Recommandation : Cloudflare Registrar pour rester dans le même écosystème (config DNS automatique).
4. **Photos accessoires partielles** : sur certaines options (cache-vitres « sur mesure », moustiquaire de coffre, repas lyophilisés, etc.) la cliente trouve l'image trop générique. À itérer dès qu'elle a ses propres photos.
5. **Resend pas branché** : sans `RESEND_API_KEY`, les emails de confirmation client + notif admin ne partent pas. Stripe envoie un reçu basique, ça reste fonctionnel mais moins joli.
6. **Page Facebook** : URL `#` partout dans le footer en attendant.
7. **Image OG « la vraie liberté »** : la nouvelle tagline n'apparaît pas encore dans l'image OG (texte hardcodé). À régénérer si on change le slogan.
8. **CGV à enrichir** : Léane a un contrat de location papier, elle veut l'utiliser comme base pour étoffer les CGV. Pas encore envoyé.

## 🚀 Prochaines étapes prioritaires (ordre conseillé)

1. **Confirmer test Stripe** (5 min) : aller sur https://easy-trip.pages.dev/reservation.html, remplir, payer avec `4242 4242 4242 4242`, vérifier la redirection vers `/reservation-confirmee.html` et le paiement dans Stripe Dashboard test.
2. **Créer le webhook Stripe** + copier `whsec_…` dans Cloudflare (10 min).
3. **Activer Resend** (15 min) : créer compte, générer key, ajouter `RESEND_API_KEY` dans Cloudflare. Re-tester le paiement — un email doit arriver dans la boîte de la cliente.
4. **S'inscrire chez un médiateur conso** (~30 min) + renseigner CGV article 14.
5. **Bascule LIVE Stripe** (10 min) : remplacer les clés `test` par `live`, recréer le webhook LIVE.
6. **Acheter domaine** + connecter à Cloudflare Pages (1-2 h propagation).
7. Communication / réseaux sociaux pour démarrer l'activité.

## 🔐 Cloudflare Pages — récap config

- **Projet** : `easy-trip` (auto-création depuis GitHub repo `pierrehafel9-cell/Easy-Trip`)
- **Branche prod** : `claude/youthful-dirac-fl5kan` (Cloudflare déploie automatiquement à chaque push)
- **Build command** : `npm install` ← obligatoire pour résoudre `import Stripe from 'stripe'`
- **Build output directory** : `/` (vide ou `/`)
- **Compatibility flags Production + Preview** : `nodejs_compat` ← obligatoire
- **Variables d'env à configurer** : voir tableau `CLAUDE.md` § Variables d'environnement

## 💳 Stripe — récap config

- **Mode actuel** : TEST
- **Mécanisme caution** :
  - À la résa : Checkout Session avec `payment_intent_data.setup_future_usage: 'off_session'` → carte mémorisée
  - Jour J : créer manuellement (depuis Stripe Dashboard) un PaymentIntent capture_method=manual de 500 € sur le client → carte bloquée
  - Au retour OK : annuler le PaymentIntent → empreinte levée
  - Dégât ≤ 500 € : capturer le montant exact des dégâts
  - Dégât > 500 € : capturer 500 € + créer un nouveau PaymentIntent pour le complément
- **Webhook attendu** :
  - URL : `https://easy-trip.pages.dev/api/stripe-webhook` (à recréer si on change de domaine)
  - Événements : `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
  - Signing secret à copier dans `STRIPE_WEBHOOK_SECRET` (Cloudflare env vars)

## 🏛 Décisions déjà prises (à respecter)

| Décision | Pourquoi |
|---|---|
| Hébergement = Cloudflare Pages | Netlify a saturé les credits gratuits, Cloudflare = illimité free tier |
| Caution = 500 € (et non plus 1200 €) | Compromis sécurité Easy Trip / accessibilité CB clients |
| Wording caution = « empreinte bancaire bloquée 72 h » | Évite l'angoisse du mot « débit » |
| Lieu de remise = « La Rochelle et alentour, RDV à convenir » | Aligné sur déclaration INPI (activité mobile, pas de local) |
| Pas de pack vaisselle inclus | Déplacé en option à 5 €/séjour (poêle + casserole + couverts) |
| Photos kit en format portrait 1200×1600 | Format natif du shooting de la cliente, recadrage carré donne un effet « pro fournisseur » qu'elle ne veut plus |
| Carousel page kits en `aspect-ratio: 3/4` | Pas de crop des photos portrait |
| Logos sociaux SVG (pas de Font Awesome) | Pas de dépendance supplémentaire |
| Pas de tracking analytics tiers | Privacy-first, conformité RGPD facile |
| Tagline « Easy Trip · la vraie liberté » (au lieu de « since 2025 ») | Décision marketing |
| Branche `claude/youthful-dirac-fl5kan` = prod | Branche initiale Claude Code, Cloudflare est branché dessus. Ne pas merger vers `main`. |
| Pas de framework JS | Le site est statique simple, pas besoin de React/Vue. Maintenance plus simple. |
| Stripe Functions en ES modules (`export async function onRequestPost`) | Format natif Cloudflare Pages Functions |

---

## ▶️ Reprendre dans une nouvelle session Claude Code

```bash
cd /home/user/Easy-Trip
git pull origin claude/youthful-dirac-fl5kan
# Puis demander à Claude : « Lis CLAUDE.md et PROJECT_HANDOFF.md pour reprendre le projet Easy Trip. »
```
