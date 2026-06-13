# Easy Trip — Site web

Site vitrine + réservation en ligne pour **Easy Trip**, location de kits d'aménagement amovibles en bois pour SUV et breaks.

> *Les kits pour dormir où tu veux et quand tu veux.*

## Structure

```
.
├── index.html              # Accueil
├── nos-kits.html           # Présentation du Kit M (SUV / Break)
├── accessoires.html        # Catalogue d'accessoires & options
├── comment-ca-marche.html  # Mode d'emploi + FAQ
├── reservation.html        # Formulaire de réservation + paiement
├── contact.html            # Coordonnées + formulaire de contact
├── assets/
│   ├── css/style.css       # Feuille de styles principale
│   ├── js/
│   │   ├── main.js         # Script global (menu mobile, footer)
│   │   └── reservation.js  # Calcul tarif + soumission Stripe
│   └── img/
│       ├── logo.svg        # Logo Easy Trip (à remplacer par le PNG officiel)
│       └── README.md       # Liste des images à fournir
└── api/
    └── create-checkout-session.example.js  # Backend Stripe (exemple)
```

## Lancement local

C'est un site **statique** : pas de build, pas de dépendances. Pour le servir localement :

```bash
# Python 3
python3 -m http.server 8000
# ou Node.js
npx serve .
```

Puis ouvrez http://localhost:8000.

## Personnalisation

### Logo
Le logo SVG dans `assets/img/logo.svg` est une version d'aperçu. Pour utiliser le logo officiel :
1. Déposez votre fichier sous `assets/img/logo.png` (ou `.svg`).
2. Remplacez `assets/img/logo.svg` par `assets/img/logo.png` dans le `<img>` des headers/footers.

### Photos
Tous les `<div class="media-placeholder">` sont des emplacements à remplacer par vos vraies photos :
```html
<img src="assets/img/kit-main.jpg" alt="Kit M installé dans un SUV" />
```

### Contenu à compléter
Recherchez et remplacez dans les fichiers HTML :
- Coordonnées intégrées : `contact.easytrip@gmail.com`, `+33 6 45 04 45 47`, point de retrait à **La Rochelle**
- Adresse précise du point de retrait à compléter dans `contact.html` quand connue
- Liens `href="#"` Instagram / Facebook → vos URLs

## Paiement Stripe

Le formulaire de réservation calcule le total et envoie un POST sur
`/api/create-checkout-session`. Un exemple d'endpoint serverless est fourni
dans `api/create-checkout-session.example.js`.

Étapes pour activer le paiement réel :

1. Créez un compte Stripe et récupérez votre **clé secrète** (`sk_test_...` puis `sk_live_...`).
2. Déployez la fonction serverless sur votre hébergeur :
   - **Netlify** : déplacez le fichier dans `netlify/functions/create-checkout-session.js` et ajoutez `npm install stripe` à votre projet.
   - **Vercel** : placez-le dans `api/create-checkout-session.js`.
3. Ajoutez les variables d'environnement chez votre hébergeur :
   - `STRIPE_SECRET_KEY` = votre clé secrète Stripe
   - `SITE_URL` = `https://easy-trip.fr` (URL publique du site)
4. Renommez le fichier sans le `.example` et redéployez.

### Caution

Le code actuel encaisse uniquement le montant de la location via Stripe Checkout.
La caution (800 € par défaut) est mentionnée au client mais à débiter manuellement
au moment de la prise en charge du kit (par exemple via un Stripe Payment Link
généré séparément).

Pour automatiser le débit + remboursement de la caution :
- Utilisez l'API Stripe `PaymentIntent` avec `capture_method: 'manual'`.
- Capturez le montant si dommage, sinon annulez la pré-autorisation.

## Tarification configurée

| Période          | Tarif      |
|------------------|------------|
| Basse saison (septembre → juin) | 35 € / nuit |
| Haute saison (juillet & août)   | 45 € / nuit |
| Caution          | 800 € (débitée puis remboursée) |

Modifiable dans `assets/js/reservation.js` (constantes `RATES`, `HIGH_MONTHS`, `CAUTION`).

## Hébergement

Site statique, déployable gratuitement sur :
- [Netlify](https://www.netlify.com/) (recommandé : Functions intégrées pour Stripe)
- [Vercel](https://vercel.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- OVH / tout hébergement statique

Pour Netlify : glissez-déposez le dossier sur app.netlify.com, ou connectez le dépôt GitHub.

## Accessibilité & SEO

- HTML sémantique (header, main, nav, footer, sections)
- Métadonnées `<title>` et `<description>` par page
- Police de la navigation ≥ 14px, contrastes vérifiés
- Responsive mobile-first

À ajouter en production :
- Favicon (`favicon.ico` + variantes Apple touch)
- Sitemap.xml et robots.txt
- Open Graph / Twitter Card tags
- Mentions légales, CGV, politique de confidentialité
