# Vidéo de la page d'accueil

Le site est prêt à utiliser une vidéo en arrière-plan dès qu'un fichier `hero.mp4` est déposé ici.

## Comment ajouter la vidéo

### 1. Téléchargez une vidéo libre de droits

**Option recommandée — Pexels (gratuit, sans inscription)** :

- 🎬 [Driving Car on Mountain Road](https://www.pexels.com/video/driving-car-on-mountain-road-13229471/) — voiture sur route de montagne
- 🎬 [Search "Dolomites"](https://www.pexels.com/search/videos/dolomites/) — paysages des Dolomites
- 🎬 [Search "mountain road"](https://www.pexels.com/search/videos/mountain%20road/) — 5000+ vidéos
- 🎬 [Mixkit — Mountain](https://mixkit.co/free-stock-video/mountain/) — sans watermark
- 🎬 [Coverr — Mountains](https://coverr.co/stock-video-footage/mountains) — optimisées pour fond de site

**Astuce** : sur Pexels, cliquez sur la vidéo qui vous plaît, puis bouton "Free download" → choisissez **HD 1920×1080** (suffisant et plus léger que 4K).

### 2. Optimisez la vidéo (très important)

Une vidéo brute peut peser 50–200 Mo. Pour un site web, viser **< 8 Mo**.

- Outil en ligne : https://www.freeconvert.com/video-compressor
- Réglages : H.264, 1920×1080, 5-10 secondes, sans son (silencieuse de toute façon)
- Format : MP4

### 3. Déposez le fichier

Nommez le fichier `hero.mp4` et déposez-le dans ce dossier (`assets/video/`).

Pour upload via GitHub : https://github.com/pierrehafel9-cell/Easy-Trip/upload/claude/youthful-dirac-fl5kan/assets/video

### Comportement

- Avant ajout du MP4 : l'image `assets/img/hero.jpg` est affichée (déjà en place)
- Après ajout : la vidéo joue en boucle, muette, en arrière-plan
- Sur mobile : l'image fixe reste affichée pour économiser les données
