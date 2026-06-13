# Images Easy Trip

## Logo

- `logo.svg` — Version SVG d'aperçu (utilisée actuellement par le site)
- **À déposer** : `logo.png` — Version PNG officielle (fond transparent)
  Une fois en place, remplacez `logo.svg` par `logo.png` dans les `<img src="assets/img/logo.svg">` des fichiers HTML.

## Photos du kit (à déposer)

Le site est prêt à afficher ces photos une fois déposées dans ce dossier :

| Nom de fichier | Usage | Description |
|---|---|---|
| `hero.jpg` | Accueil — visuel principal | Kit installé dans un SUV, vue paysage (montagne / lac / forêt) |
| `kit-suv-mountain.jpg` | Page « Nos kits » — photo principale | SUV (type Dacia Duster) avec kit déployé en pleine nature |
| `kit-cuisine.jpg` | Page « Nos kits » — vignette | Détail tiroir cuisine avec réchaud et planche à découper |
| `kit-couchage.jpg` | Page « Nos kits » — vignette | Vue dépliée du couchage avec matelas |
| `kit-rangements.jpg` | Page « Nos kits » — vignette | Détail des tiroirs et rangements en bois |
| `kit-campsite.jpg` | Accueil ou « Comment ça marche » | Voiture + table de camping + chaises, ambiance bivouac |

## Format conseillé

- Format : JPG (photos) ou WebP (plus léger)
- Résolution : 1600×1200 ou 1920×1080
- Poids : viser < 300 Ko par image (utilisez https://squoosh.app pour compresser)
- Orientation : paysage de préférence pour le hero

## Comment intégrer une photo

Dans le HTML, repérez les blocs comme :
```html
<div class="media-placeholder large" aria-hidden="true">
  <span>Photo du kit installé</span>
</div>
```
Et remplacez par :
```html
<img src="assets/img/kit-suv-mountain.jpg" alt="Kit Easy Trip installé dans un SUV en pleine nature" />
```
