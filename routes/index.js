// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();



/**
 * The module "geotag" exports a class GeoTag.
 * It represents geotags.
 */
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
const GeoTagStore = require('../models/geotag-store');

// App routes (A3)

const GeoTagExamples = require('../models/geotag-examples');


// Create one in-memory store for all GeoTags.
const geoTagStore = new GeoTagStore();

// Add example GeoTags to the store.
GeoTagExamples.tagList.forEach(tag => {
  const geoTag = new GeoTag(tag[0], tag[1], tag[2], tag[3]);
  geoTagStore.addGeoTag(geoTag);
});


/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', { taglist: [] })
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get('/api/geotags', (req, res) => {
  // Read query parameters from URL.
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const searchterm = req.query.searchterm;
  const radius = req.query.radius || 100;

  const page = Number(req.query.page) || 1;       // Implementierung der Seitenanzhal für Pagination
  const limit = Number(req.query.limit) || 5;
  const wantsPagination = req.query.page !== undefined || req.query.limit !== undefined;

  const hasLocation = latitude && longitude;
  const hasSearchterm = searchterm && String(searchterm).trim() !== '';

  //Zunächst wird die normale Suche ausgeführt
  let taglist = geoTagStore.getAllGeoTags();    //Ohne Filter: alle GeoTags

  if (hasLocation && hasSearchterm) {     // Suche mit Koordinaten und Suchbegriff: GeoTags in der Nähe
    taglist = geoTagStore.searchNearbyGeoTags(latitude, longitude, radius, searchterm); 
  } else if (hasLocation) {               // Suche mit Koordinaten
    taglist = geoTagStore.getNearbyGeoTags(latitude, longitude, radius);
  } else if (hasSearchterm) {           //Suche mit Suchbegriff
    taglist = geoTagStore.searchGeoTags(searchterm);
  }

  if (wantsPagination) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const total = taglist.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const currentPage = Math.min(safePage, totalPages);
    const startIndex = (currentPage - 1) * safeLimit;

    return res.json({
      items: taglist.slice(startIndex, startIndex + safeLimit),
      pagination: {
        page: currentPage,
        limit: safeLimit,
        total: total,
        totalPages: totalPages,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages
      }
    });
  }

  // Send GeoTags as JSON.
  res.json(taglist);
});


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => {
  // Read GeoTag data from JSON body.
  const name = req.body.name;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const hashtag = req.body.hashtag;

  // Create new GeoTag object.
  const geoTag = new GeoTag(name, latitude, longitude, hashtag);

  // Add GeoTag to store.
  geoTagStore.addGeoTag(geoTag);

  // Send location header for the new resource.
  res.location(`/api/geotags/${geoTag.id}`);

  // Send created GeoTag as JSON.
  res.status(201).json(geoTag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {
  // Read id from URL path.
  const id = req.params.id;

  // Find GeoTag by id.
  const geoTag = geoTagStore.getGeoTagById(id);

  // Return 404 if GeoTag does not exist.
  if (!geoTag) {
    return res.status(404).json({ error: 'GeoTag not found' });
  }

  // Send GeoTag as JSON.
  res.json(geoTag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

router.put('/api/geotags/:id', (req, res) => {
  // Read id from URL path.
  const id = req.params.id;

  // Read updated GeoTag data from JSON body.
  const updatedGeoTag = new GeoTag(
    req.body.name,
    req.body.latitude,
    req.body.longitude,
    req.body.hashtag
  );

  // Update GeoTag in store.
  const result = geoTagStore.updateGeoTag(id, updatedGeoTag);

  // Return 404 if GeoTag does not exist.
  if (!result) {
    return res.status(404).json({ error: 'GeoTag not found' });
  }

  // Send updated GeoTag as JSON.
  res.json(result);
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete('/api/geotags/:id', (req, res) => {
  // Read id from URL path.
  const id = req.params.id;

  // Delete GeoTag from store.
  const deletedGeoTag = geoTagStore.deleteGeoTag(id);

  // Return 404 if GeoTag does not exist.
  if (!deletedGeoTag) {
    return res.status(404).json({ error: 'GeoTag not found' });
  }

  // Send deleted GeoTag as JSON.
  res.json(deletedGeoTag);
});


module.exports = router;
