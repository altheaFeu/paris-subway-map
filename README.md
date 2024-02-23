# Carte des stations de métro de paris🚇

[![OpenLayers](https://img.shields.io/badge/OpenLayers-6.10.1-brightgreen.svg)](https://openlayers.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952B3.svg)](https://getbootstrap.com/)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg)](LICENSE.md)
[![Build By](https://img.shields.io/badge/Build%20By-Althéa_Feuillet-orange.svg)](https://yourportfolio.com)
[![En Cours de Modification](https://img.shields.io/badge/En%20Cours%20de%20Modification-Oui-green.svg)](LICENSE.md)


# Présentation

**Objectif du Projet :** Créer une carte web du métro de Paris avec OpenLayers, incluant une couche de fond de carte, les arrondissements de Paris, et les stations de métro.

# Données

Les données utilisées sont enregistrées dans le dossier "data". Ce dossier contient les fichiers suivants :
- `arrondissements.js` : le GeoJSON des arrondissements de Paris.
- `metro-paris.csv` : les stations du métro de Paris.

Le dossier `/js` contient `app.js`, qui permet de déclarer les variables de données GeoJSON.

# Arborescence

```
.
├── css/
│   ├── popup.css
├── data/
│   ├── arrondissements.js
│   ├── metro-paris.csv
├── js/
│   ├── app.js
└── index.html
```

# Installation

Les données sont directement récupérées à partir du tableur CSV. Pour les récupérer, j'utilise la bibliothèque http-server. Elle permet de regrouper les données dans un même serveur. Pour visualiser la couche des stations, veuillez exécuter les lignes suivantes dans le terminal :
```bash
npm install -g http-server 
http-server -c-1
```

Cela installera http-server sur votre machine et lancera le serveur en local. Naviguez ensuite vers l'URL fournie par http-server pour explorer la carte web du métro de Paris.
