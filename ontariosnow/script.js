/* eslint-disable no-undef */
/**
 * image on map
 */

// config map
let config = {
  minZoom: 1,
  maxZoom: 18,
};
// magnification with which the map will start
const zoom = 5;
// co-ordinates
const lat = 50.090898;
const lng = -85.168359;

// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// add image to map ;)
const imageBounds = [
  [41.6759295,-95.1560034],
  [56.8704471,-74.3460437],
];

// images
var urlPrefix = "https://raw.githubusercontent.com/elicir/elicir.github.io/master/ontariosnow/data/";

const changeRastUrl = urlPrefix+"perchange_clip.png";

// init years
var years = [];
for(let i = 1997; i < 2022; i++) {
  years.push(i);
}

var yearlyUrl = urlPrefix+years[0]+"clip.png";

const yearlyButton = "year-raster";
const changeRastButton = "change-raster";
const changeCensusButton = "change-census"

var census;
// create colors for census geojson
function getColor(d, id=changeCensusButton) {
  if (id == yearlyButton) {
    return       d <= 40   ? '#30123b' :
       40 < d && d <= 80   ? '#4147ad' :
       80 < d && d <= 120  ? '#4777ef' :
      120 < d && d <= 160  ? '#38a5fb' :
      160 < d && d <= 200  ? '#1bd0d5' :
      200 < d && d <= 240  ? '#26eda6' :
      240 < d && d <= 280  ? '#64fd6a' :
      280 < d && d <= 320  ? '#a4fc3c' :
      320 < d && d <= 360  ? '#d3e835' :
      360 < d && d <= 400  ? '#f5c63a' :
      400 < d && d <= 440  ? '#fe992c' :
      440 < d && d <= 480  ? '#f36315' :
      480 < d && d <= 520  ? '#d93807' :
      520 < d && d <= 560  ? '#b01901' :
                   560 < d ? '#7a0403' :
                             '#000000';
  } else if (id == changeRastButton) {
    return      d <= -25 ? '#836db2' :
    -25 < d && d <= -15  ? '#a99fcc' :
    -15 < d && d <= -5   ? '#c9c4de' :
       -5 < d && d <= 5  ? '#e8e6ef' :
       5 < d && d <= 15  ? '#f8e9d6' :
      15 < d && d <= 25  ? '#fbcd94' :
      25 < d && d <= 35  ? '#faae58' :
      35 < d && d <= 45  ? '#f0882d' :
                  45 < d ? '#e66101' :
                           '#000000';
  } else if (id == changeCensusButton) {
    return     d <= -15 ? '#5e3c99' :
    -15 < d && d <= -5  ? '#b2abd2' :
     -5 < d && d <= 5   ? '#f7f7f7' :
      5 < d && d <= 15  ? '#fdb863' :
                 15 < d ? '#e66101' :
                          '#000000';
  } else {
    return '#000000';
  }
}

function style(feature) {
  return {
      fillColor: getColor(feature.properties._mean),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
}

// info control for census
var info = L.control();

function createControl(){
  info = L.control();
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
      this._div.innerHTML = '<h4>Percent change in annual snowfall</h4><h5><em>Average from 1997-2001 to 2017-2021</em></h5>'
      +  (props ?
          '<b>' + props.CDNAME + '</b><br />' + parseFloat(props._mean ).toFixed(2) + '%'
          : 'Hover over a census division');
  };

  info.addTo(map);
}

var censusLegend = L.control();
var yearlyLegend = L.control();
var changeLegend = L.control();
// legend for census
function createLegend(id){
  var legend;
  if (id == yearlyButton) {
    legend = L.control({position: 'bottomleft'});
  } else {
    legend = L.control({position: 'topright'});
  }
  var title = "",
      grades = [],
      minVal = "";
  switch(id) {
    case changeRastButton:
      title = "Mean % change (raster)";
      changeLegend = legend;
      grades = [-25, -15, -5, 5, 15, 25, 35, 45];
      minVal = "<=";
      break;
    case yearlyButton:
      title = "Annual snowfall";
      yearlyLegend = legend;
      grades = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560];
      minVal = "<=";
      break;
    case changeCensusButton:
      title = "Mean % change";
      censusLegend = legend;
      grades = [-15, -5, 5, 15, 25];
      minVal = "-25";
      break;
    default:
      title = "";
  }

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML += "<h4>"+title+"</h4>";
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] - 1, id) + '"></i> ' +
              (grades[i - 1] ? grades[i-1] : minVal) + 
              ((!grades[i - 1] && minVal == "<=") ? " " : ' &ndash; ') + grades[i] + '<br>';
      }
      if (id != changeCensusButton) {
        div.innerHTML +=
              '<i style="background:' + getColor(grades.slice(-1)[0]  + 1, id) + '"></i> ' +
              '> ' + grades.slice(-1)[0] + '<br>';
      }
  
      return div;
  };
  
  legend.addTo(map);
}

// interaction for census
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
      weight: 2,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  census.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
  });
}

const layersContainer = document.querySelector(".layers");

function generateButton(id) {
  switch(id) {
    case changeRastButton:
      label = "percent change raster";
      break;
    case yearlyButton:
      label = "annual snowfall";
      break;
    case changeCensusButton:
      label = "percent change by census division"
      break;
    default:
      label = id;
  }

  const templateLayer = `
    <li class="layer-element">
      <label for="${id}">
        <input type="checkbox" id="${id}" name="item" class="item" value="${label}" checked>
        <span>${label}</span>
      </label>
    </li>
  `;

  layersContainer.insertAdjacentHTML("beforeend", templateLayer);
}

// add data to geoJSON layer and add to LayerGroup
const arrayLayers = [yearlyButton, changeRastButton, changeCensusButton];

arrayLayers.map((id) => {
  generateButton(id);
  switch(id) {
    case changeRastButton:
      url = changeRastUrl;
      break;
    case yearlyButton:
      url = yearlyUrl;
      break;
    default:
      url = ""
  }
  if (id == changeCensusButton) {
    fetch(urlPrefix+"census_avg_s.geojson")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // use geoJSON
        window["layer_" + id] = L.geoJSON(data, {style: style, onEachFeature: onEachFeature}).addTo(map);
        census = window["layer_" + id]
        checkedType(changeCensusButton, false);
      });
  }
  else {
    window["layer_" + id] = L.imageOverlay(url, imageBounds, { opacity: 0.7 }).addTo(map);
  }
});

document.addEventListener("click", (e) => {
  const target = e.target;

  const itemInput = target.closest(".item");

  if (!itemInput) return;

  showHideLayer(target);
});

function showHideLayer(target) {
  checkedType(target.id, target.checked);
}

function stopTimer(e){
  clearTimeout(playTimeOut);
  //hiding the stop button
  document.getElementById('stop').style.display = "none";
  //showing the play button
  document.getElementById('play').style.display = "block";
}

function checkedType(id, type) {
  map[type ? "addLayer" : "removeLayer"](window["layer_" + id]);

  if (type) {
    if (id == yearlyButton) {
      document.getElementById('yearlyslider').style.visibility = "visible";
    } else if (id == changeCensusButton) {
      createControl();
    } 
    createLegend(id);
    map.fitBounds(imageBounds);
  } else {
    if (id == yearlyButton) {
      stopTimer();
      document.getElementById('yearlyslider').style.visibility = "hidden";
      map.removeControl(yearlyLegend);
    } else if (id == changeCensusButton) {
      map.removeControl(info);
      map.removeControl(censusLegend);
    } else {
      map.removeControl(changeLegend);
    }
  }

  document.querySelector(`#${id}`).checked = type;
}

checkedType(changeRastButton, false);
checkedType(yearlyButton, true);

// set up slider

//set max value of the slider
document.getElementById("slider").max = ""+years.length+"";

//set default label of the slider
document.getElementById("sliderLabel").innerHTML = "July "+years[0]+" - June "+(years[0]+1);

var yearImageOverlay = window["layer_" + yearlyButton]

//function when sliding
slider.oninput = function() {
  //changing the label
  document.getElementById("sliderLabel").innerHTML = "July "+years[this.value-1]+" - June "+(years[this.value-1]+1)
  //setting the url of the overlay
  yearImageOverlay.setUrl(urlPrefix+years[this.value-1]+"clip.png")
}

var playTimeOut;

function play() {
    playTimeOut = setTimeout(function () {
        //increasing the slider by 1 (if not already at the end)
        var val = document.getElementById("slider").value
        console.log(val)
        //if end of slider, stopping
        if(val == document.getElementById("slider").max){
            clearTimeout(playTimeOut);
              //hiding the stop button
              document.getElementById('stop').style.display = "none";
              //showing the play button
              document.getElementById('play').style.display = "block";
        }
        else{
        document.getElementById("slider").value = Number(val)+1
        play()
        }
        //changing the label
        document.getElementById("sliderLabel").innerHTML = "July "+years[Number(val)-1]+" - June "+(years[Number(val)-1]+1)
        //setting the url of the overlay
        yearImageOverlay.setUrl(urlPrefix+years[Number(val)-1]+"clip.png")

    }, 1000);
}

document.getElementById('play').onclick = function(e){
  play()
  //showing the stop button
  document.getElementById('stop').style.display = "block";
  //hiding the play button
  document.getElementById('play').style.display = "none";
}

document.getElementById('stop').onclick = stopTimer;

//hiding the stop button by default
document.getElementById('stop').style.display = "none";