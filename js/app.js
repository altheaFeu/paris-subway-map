// Avant de commencer, il faut installer http-server sinon la couche des stations ne s'affichera pas !
// Pour cela, il faut installer http-server via le terminal avec la commande :
// npm install -g http-server
// Puis on peut lancer le serveur via le terminal avec la commande : http-server -c-1
// Un serveur local http:// devrait s'afficher. Vous pouvez copier le lien et le coller dans votre navigateur

/**
 * Les fonds de carte
 */

const map = new ol.Map({

    target: "map",

    // Création de la vue en WGS84
    view: new ol.View({
        center: ol.proj.fromLonLat([2.35, 48.85]),
        zoom:11,
        minZoom: 9,
        maxZoom: 20
    }),

    // Tableau des contrôles de la carte
    controls: ol.control.defaults().extend([
        new ol.control.FullScreen(),
        new ol.control.ScaleLine({
            minWidth: 70,
        }),
    ]),
});
  
// Source de données de type raster : OSM 
osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    extent: [-1500000, 4056000, 2100000, 7500000],
});
  
// Source de données de type raster : ESRI
esriLayer = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest({
        url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'  
    }),
    extent: [-1500000, 4056000, 2100000, 7500000],
    visible: false
});
  
// Source de données de type raster : Street
streetLayer = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest({
        url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer'  
    }),
    extent: [-1500000, 4056000, 2100000, 7500000],
    visible: false
});

// Ajout des données de type raster
map.getLayers().extend([osmLayer, esriLayer, streetLayer]);

var osmRadio = document.getElementById('base-map-osm');
var esriRadio = document.getElementById('base-map-esri');
var streetRadio = document.getElementById('base-map-street');
var buttons = [osmRadio, esriRadio, streetRadio];
var layers = [osmLayer, esriLayer, streetLayer];

// Activiation de la visibilité des couches raster
buttons.forEach(function(radio, idRadio) {
    radio.addEventListener('click', function() {

      layers.forEach(function(layer, idLayer) {
        if(idRadio == idLayer){
            layer.setVisible(true);
        }else{
            layer.setVisible(false);
        }
      });

    });
});


// ==========================================================================
/**
 * Les données geojson des arrondissements
 */
// Objet geojson des arrondissements de Paris
var arrondissements = JSON.parse(arrondissementsGeoJson);

// Création de la source
var arrFeatures = new ol.format.GeoJSON().readFeatures(arrondissements ,{
    featureProjection: 'EPSG:3857'
});

var arrSource = new ol.source.Vector({
    features: arrFeatures
});

// Création de la couleur poru chaque feature
var randCol = function(feature){
    // Utilisation de la propriété c_ar pour la couleur de chaque feature
    var featureId = feature.get("c_ar");
    var featureColor = colors[featureId];

    // Permet de modifier le texte en fonction du zoom
    var zoom = map.getView().getZoom();
    var fontSize = zoom * 0.7;

    // Si on est dans le 1er arrondissement, on doit avoir le texte "1er"
    if(featureId == 1 && zoom>10){
        return new ol.style.Style({
            text : new ol.style.Text({
                text: featureId+ "er",
                font: fontSize + 'pt sans-serif',
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 0.75
                }),
                fill: new ol.style.Fill({
                    color: 'white'
                }),
                overflow: true
            }),
    
            stroke: new ol.style.Stroke({
                color: '#cccccc',
                width: 1
            }), 
            fill: new ol.style.Fill({
                color : featureColor,
            })
        });

    // Si le zoom est inférieur ou égal à 10, on enlève le texte
    }else if(zoom <= 10){
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#cccccc',
                width: 1
            }), 
            fill: new ol.style.Fill({
                color : featureColor,
            })
        });

    // Si nous sommes dans un autre arrondissement, on souhaite avoir le texte "nb ème"
    }else{
        return new ol.style.Style({
            text : new ol.style.Text({
                text: featureId+ "ème",
                font: fontSize + 'pt sans-serif',
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 0.75
                }),
                fill: new ol.style.Fill({
                    color: 'white'
                }),
    
                overflow: true
            }),
    
            stroke: new ol.style.Stroke({
                color: '#cccccc',
                width: 1
            }), 
            fill: new ol.style.Fill({
                color : featureColor,
            })
        });
    }
};

var colors = {}

// Possibilités poru les couleurs
var propositions = ['#00FFFF', '#6957f2', '#305ba5', '#598df7', '#0a0fa8', '#5284ea', 
                '#9ae2e1', '#27399e', '#3dccf7', '#9581f9', '#40B5AD', '#008080', 
                '#4682B4', '#87CEEB', '#9FE2BF', '#CCCCFF', '#A7C7E7', '#B6D0E2', '#191970'];

// Choix d'une couleur aléatoire pour les arrondissements
for(i=1; i<=arrFeatures.length; i++){
    var index = Math.floor(Math.random()*propositions.length);
    var color = propositions[index];
    colors[i] = color;
    propositions.splice(index, 1);
}
  
// Créer la couche et appliquer la fonction de style
var arrLayer = new ol.layer.Vector({
    source: arrSource,
    style: randCol,
}); 

// Modifiction de l'opacité
arrLayer.setOpacity(0.7);
arrLayer.setVisible(false);

// Modifier la visibilité en fonction de la checkbox
var arrCheckBox = document.getElementById('arrondissement-paris');
arrCheckBox.addEventListener('click', function(event) {
  arrLayer.setVisible(event.target.checked);
});

// Ajout de la couche à la carte
map.addLayer(arrLayer);


// ==========================================================================
/**
 * Les données sur les stations
 */

// Déclarer la classe Station
class Station {
    // le constructeur de la classe
    constructor (lat, lon, name, line) {
      // les paramétres de la classe
      this.name = name;
      this.line = line;
      this.lon = lon;
      this.lat = lat;
    }
  
    // Obtenir la description de la station
    getDescription () {
      return 'Nom : ' + this.name + ', Ligne : ' + this.line + ', Lon : ' + this.lon + ', Lat : ' + this.lat;
    }
};

// Nom de l'ensemble des stations
nomStations = [
    'METRO 1',
    'METRO 2',
    'METRO 3',
    'METRO 3bis',
    'METRO 4',
    'METRO 5',
    'METRO 6',
    'METRO 7',
    'METRO 7bis',
    'METRO 8',
    'METRO 9',
    'METRO 10',
    'METRO 11',
    'METRO 12',
    'METRO 13',
    'METRO 14',
];

// Couleurs correspondant à chaque station
// Les couleurs sont retrouvables sur le site de la RATP : https://www.ratp.fr/plan-metro
colStations =[
    '#FECE00',
    '#0065AE',
    '#9F971A',
    '#99D4DE',
    '#BE418D',
    '#F19043',
    '#84C28E',
    '#F2A4B7',
    '#84C28E',
    '#CDACCF',
    '#D5C900',
    '#E4B327',
    '#8C5E24',
    '#007E49',
    '#99D4DE',
    '#622280',
];

// Création d'une nouvelle source poru le vecteur
const source = new ol.source.Vector();

// Utilisation de la librairie XMLHttpRequest qui permettra de récupérer les données de metro-paris.csv
const client = new XMLHttpRequest();
client.open('GET', './data/metro-paris.csv');

// Charger et lire les données du csv
client.onload = function () {
    // Données textuelles du csv
    const csv = client.responseText;
    const features = [];
    dataSplit = csv.split('\n'); // Découper les données à \n

    for (var i = 1; i < dataSplit.length; i++) {
        var line = dataSplit[i].split(',');

        // Création de l'objet station
        var point = new Station(parseFloat(line[0]), parseFloat(line[1]), line[2], line[3]); 
        // Création des coordonnées
        var coords = ol.proj.fromLonLat([point.lon, point.lat]);

        // Création de la feature avec la description, le nom, la ligne et la géométrie
        const feature = new ol.Feature({
            name: point.name,
            line: point.line,
            description: point.getDescription(),
            geometry: new ol.geom.Point(coords),
        });

        // Ajoute de la feature à la liste
        features.push(feature);
    };

    // Ajout de la liste de features à la source
    source.addFeatures(features);
};
client.send();

// Création du vecteur
const styleCache = {}; 
var stationsLayer = new ol.layer.Vector({ 
    // Créé des clusters pour les points séparés de 50 pixels
    source: new ol.source.Cluster({
      distance: 50, 
      minDistance: 50,
      source: source,
    }),  
    id:"stations",
    // Style pour les feature regroupées
    style: function (feature) {
        
        const size = feature.get('features').length;
        let style = styleCache[size];

        // S'il y a au moins 2 feature regroupé, appliqué le style des cluster
        if (size>1){
          style = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 13,
              stroke: new ol.style.Stroke({
                color: [220, 220, 220, 0.7],
                width: 2,
              }),
              // Couleur de remplissage
              fill: new ol.style.Fill({
                color: [105, 105, 105, 0.7],
              }),
            }),

            // Texte qui indique le nombre d'entité dans chaque cluster
            text: new ol.style.Text({
              text: size.toString(),
              font: 'bold 13px sans-serif',
              fill: new ol.style.Fill({
                color: [250, 250, 250, 1],
              }),
            }),
          });
          styleCache[size] = style;

        // S'il n'y a qu'une entité, appliqué la couleur de la station en fonction du nom de la ligne
        }else if(size == 1){
            // Pour chaque station, on donne une couleur différente en fonction du nom de la ligne
            const val = feature.get('features')['0']['values_']['line'];
            for (i=0; i<nomStations.length; i++){
                if (nomStations[i] == val){
                    console.log(feature);
                    var couleur = colStations[i];

                    // Création du style avec la couleur spécifiée
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({color: couleur}),
                            stroke: new ol.style.Stroke({
                            color: 'black', width: 1
                            })
                        })
                    });
                    styleCache[size] = style;
                    break;
                };
            };
        }
        return style;
    },
});

// Ajout de la couche à la carte
map.addLayer(stationsLayer);

// Modification de la visibilité en fonction de la checkbox 'stations-metro'
stationsLayer.setVisible(false);

var stationsCheckBox = document.getElementById('stations-metro');
    stationsCheckBox.addEventListener('click', function(event) {
    stationsLayer.setVisible(event.target.checked);
});

// ==========================================================================
/**
 * Modifier le pointer sur la couche des stations
 */

// Fonction qui permet de modifier le pointer quand la souris passe au dessus de la couche des stations
map.on("pointermove", function (evt) {
    var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        var layerId = layer.get('id');
        // Si la couche correspond au stations et non au arrondissement, on applique la fonction
        if (layerId === 'stations'){
            return true;
        }
    }); 
    if (hit) {
        this.getTargetElement().style.cursor = 'pointer';
    } else {
        this.getTargetElement().style.cursor = '';
    }
});


// ==========================================================================
/**
 * Zoom sur les clusters
 */
map.on('click', (e) => {
    stationsLayer.getFeatures(e.pixel).then((clickedFeatures) => {
    const features = clickedFeatures[0].get('features');
        if (features.length > 1) {        
            const extent = new ol.extent.boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
            );        
            map.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]});
        }
    });
});

// ==========================================================================
/**
 * Les popups des stations
 */

// Création du popup
var popup = new ol.Overlay({
    // l'element HTML de la popup
    element: document.getElementById('map-popup'),
    positioning: 'bottom-center',
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

// Ajout du popup à la carte
map.addOverlay(popup);
  
// Fonction close popup
const closer = document.getElementById('popup-closer');
closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};
  
// ajouter l'evenement clic à la carte
map.on('click', function (event) {
    
    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        const size = feature.get('features').length;
        //  Si la feature existe et que la taille est de 1
        if (feature && size == 1) {
            if (layer) {
                var layerId = layer.get('id');
                
                // Si la couche est une station et non un arrondissement
                if (layerId === 'stations') {
                    // récupérer les coordonnées (position)
                    var coordinates = feature.getGeometry().getCoordinates();
                    // modifier la position de la popup
                    popup.setPosition(coordinates);
                    // modifier le contenu de la popup
                    description = feature.get('features')['0']['values_']['description'].split(',');
                    document.getElementById('map-popup-content').innerHTML =  "<p>" + description[0] + "<br>" +
                                                                                description[1] + "<br>" +
                                                                                description[2] + "<br>" +
                                                                                description[3] + "</p>";
                };
            };
        };
    });     
});