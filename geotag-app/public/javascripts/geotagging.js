// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

const PAGE_SIZE = 5;
const geoTagListState = {
    latitude: "",
    longitude: "",
    searchterm: "",
    page: 1,
    limit: PAGE_SIZE
};

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.


/**
  * A class to help using the HTML5 Geolocation API.
  */

/**
 * A class to help using the Leaflet map service.
 */

/**
 * Reads the current browser location and writes it into both forms.
 * The same function also creates the Leaflet map for the first time.
 */
function updateLocation() {
    // Get the latitude/longitude fields from the Tagging form.
    const taggingLatitude = document.getElementById("latitude-Tagging");
    const taggingLongitude = document.getElementById("longitude-Tagging");

    // Get the hidden latitude/longitude fields from the Discovery form.
    const discoveryLatitude = document.getElementById("latitude-Discovery");
    const discoveryLongitude = document.getElementById("longitude-Discovery");

    // Store the MapManager globally so updateView() can update the same map later.
    window.mapManager = new MapManager();
    const mapManager = window.mapManager;

    function setLocation(latitude, longitude) {
        // Write the found location into both forms.
        taggingLatitude.value = latitude;
        taggingLongitude.value = longitude;

        discoveryLatitude.value = latitude;
        discoveryLongitude.value = longitude;
        geoTagListState.latitude = latitude;
        geoTagListState.longitude = longitude;

        // Read GeoTags that were rendered into the HTML by EJS on the first page load.
        const mapElement = document.getElementById("map");
        const taglistJson = mapElement.dataset.tags;

        // JSON.parse converts JSON text from the HTML data attribute back into a JS array.
        const taglist = taglistJson ? JSON.parse(taglistJson) : [];

        // If GeoTags already exist, center the map on the first tag. Otherwise use our location.
        if (taglist.length > 0) {
            mapManager.initMap(taglist[0].latitude, taglist[0].longitude);
        } else {
            mapManager.initMap(latitude, longitude);
        }

        // Draw the current location and all known GeoTags as markers.
        mapManager.updateMarkers(latitude, longitude, taglist);
        loadGeoTagsPage(1).catch(error => console.error("Fehler:", error));
    }

    
        LocationHelper.findLocation((location) => {
            setLocation(location.latitude, location.longitude);
        });
    
}

/**
 * Helper function to update the Map and List
 * @param {Array} tagList 
 */

function updateView(tagList) {
    // First update the visible result list in the Discovery area.
    var discoveryResults = document.getElementById("discoveryResults");
    if (discoveryResults) {
        // Delete the old list entries before inserting the new result set.
        discoveryResults.innerHTML = ""; 

        // tagList is a JS array that came from JSON returned by the REST API.
        tagList.forEach(function(tag) {     
            var li = document.createElement("li");
            li.innerHTML = tag.name + " (" + tag.latitude + ", " + tag.longitude + ") " + tag.hashtag;
            discoveryResults.appendChild(li);
        });
    }

   
    // Then update the map markers with the same result list.
    var latInput = document.getElementById("latitude-Discovery");
    var lonInput = document.getElementById("longitude-Discovery");
    
    if (window.mapManager && latInput && lonInput) {        
        window.mapManager.updateMarkers(latInput.value, lonInput.value, tagList);
    }
}

function renderPagination(pagination) {
    const paginationElement = document.getElementById("pagination");

    if (!paginationElement) {
        return;
    }

    paginationElement.innerHTML = "";

    if (!pagination || pagination.totalPages <= 1) {
        return;
    }

    function createPageButton(label, page, disabled, active) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.disabled = disabled;

        if (active) {
            button.classList.add("is-active");
        }

        button.addEventListener("click", () => {
            if (!disabled && page !== pagination.page) {
                loadGeoTagsPage(page).catch(error => console.error("Fehler:", error));
            }
        });

        return button;
    }

    paginationElement.appendChild(
        createPageButton("<", pagination.page - 1, !pagination.hasPreviousPage, false)
    );

    for (let page = 1; page <= pagination.totalPages; page++) {
        paginationElement.appendChild(
            createPageButton(String(page), page, false, page === pagination.page)
        );
    }

    paginationElement.appendChild(
        createPageButton(">", pagination.page + 1, !pagination.hasNextPage, false)
    );
}

async function loadGeoTagsPage(page) {
    geoTagListState.page = page;

    const params = new URLSearchParams({
        latitude: geoTagListState.latitude,
        longitude: geoTagListState.longitude,
        searchterm: geoTagListState.searchterm,
        page: geoTagListState.page,
        limit: geoTagListState.limit
    });

    const response = await fetch('/api/geotags?' + params.toString(), {
        headers: {"Accept": "application/json"}
    });

    if (!response.ok) {
        throw new Error("GeoTags could not be loaded.");
    }

    const result = await response.json();
    const tagList = Array.isArray(result) ? result : result.items;

    updateView(tagList);
    renderPagination(result.pagination);

    return result;
}


function readTagForm () {
    // Read the current values from the Tagging form.
    var latitude = document.getElementById("latitude-Tagging").value;
    var longitude = document.getElementById("longitude-Tagging").value;
    var name = document.getElementById("name").value;
    var hashtag = document.getElementById("hashtag").value;

    // If required values are missing, no GeoTag object can be created.
    if(!latitude || !longitude || !name ) return;

    // This is a normal JavaScript object. It will later be converted to JSON.
    var geotag = {
        name : name,
        latitude : parseFloat(latitude),
        longitude : parseFloat(longitude),
        hashtag : hashtag
    };

    return geotag;
}

async function handleDiscoveryForm() {

    var lat = document.getElementById("latitude-Discovery").value;      //Werte aus Discovery Form auslesen
    var lon = document.getElementById("longitude-Discovery").value;
    var searchterm = document.getElementById("searchterm") ? document.getElementById("searchterm").value : "";

    geoTagListState.latitude = lat;
    geoTagListState.longitude = lon;
    geoTagListState.searchterm = searchterm;

    // A new search always starts on page 1.
    return await loadGeoTagsPage(1);
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {           //  sobald die HTML-Seite fertig geladen ist startet dieser Code:
    updateLocation();                                           //  Funktionaufruf updateLocation(): holt die aktuelle Position über LocationHelper, schreibt Latitude/Longitude in die Formularfelde und die Karte wird initialisiert und Marker gesetzt

    const tagForm = document.getElementById("tag-form");                        // Tagging-Formular wird gesucht
    const discoveryForm = document.getElementById("discoveryFilterForm");       // Discovery-Formular wird gesucht
                                                                                // beide male wird ein Event-Listener registriert


if (tagForm) {
        tagForm.addEventListener("submit", async (event) => {
             // Stop the browser from doing the old form submit with a full page reload.
             event.preventDefault();

              // Keep the HTML validation from the form, for example required/pattern/maxlength.
              if (!tagForm.checkValidity()) {
                  tagForm.reportValidity();
                  return;
              }

              // Convert the form values into one GeoTag JS object.
              var geotag = readTagForm();

              if (!geotag) {
                  return;
              }

              try {
                // POST means: create a new resource on the server.
                // The GeoTag object is sent as JSON in the request body.
                var postResponse = await fetch("/api/geotags", {
                method: "POST",
                headers: {
                    // Content-Type tells Express that the request body contains JSON.
                    "Content-Type": "application/json",
                    // Accept tells the server that this client wants JSON as response.
                    "Accept": "application/json"
                },
                // JSON.stringify converts the JS object into JSON text for the HTTP request.
                body: JSON.stringify(geotag)
              });

              // If the server returns an error status, stop here and jump to catch().
              if (!postResponse.ok) {
                  throw new Error("GeoTag could not be saved.");
              }

              // After saving, load the first page around the new GeoTag location.
              geoTagListState.latitude = geotag.latitude;
              geoTagListState.longitude = geotag.longitude;
              geoTagListState.searchterm = "";
              const searchInput = document.getElementById("searchterm");
              if (searchInput) {
                  searchInput.value = "";
              }
              await loadGeoTagsPage(1);
              } catch (error) {
                  console.error("Fehler:", error);
              }

        });
    } 


if(discoveryForm){
        discoveryForm.addEventListener("submit", async (event) => {
            event.preventDefault();     //standardmaeßiges Absenden des Formulars verhindert
            
            try {
                await handleDiscoveryForm();      //stattdessen wird Funktion mit fetch API aufgerufen
            } catch (error) {
                console.error("Fehler:", error);
            }
        });
    }
    




    
});
