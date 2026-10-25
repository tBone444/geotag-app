# geotag-app
Location-based full-stack web application using Node.js, Express, REST APIs and JavaScript.

# GeoTagApp

A location-based web application for creating, searching, and exploring GeoTags on an interactive map. Developed as a university group project for the **Distributed Systems 1** lab at Karlsruhe University of Applied Sciences.

The project started with a responsive HTML/CSS interface and was extended with browser geolocation, server-side JavaScript, and asynchronous communication through a REST API.

> **Project context:** This is a learning project developed as part of a university lab. Team members developed and discussed their own solutions before selecting a shared submission. The final REST/AJAX exercise and optional pagination were independently presented and defended by me during the lab assessment. The final submitted code is a collaborative result.

## Screenshots

<!-- Replace these placeholders with screenshots of the running app. -->

![GeoTagApp overview](screenshots/overview.png)

*Main interface with the tagging form, nearby GeoTags, and interactive map.*

<details>
<summary>More screenshots</summary>

![GeoTag search](screenshots/search.png)

*Searching for GeoTags and displaying nearby locations.*

![Pagination](screenshots/pagination.png)

*Paginated search results.*

</details>

## Features

- **Create GeoTags:** Record a name, optional hashtag, and geographical coordinates.
- **Discover nearby locations:** Search GeoTags by name or hashtag and filter by distance.
- **Interactive map:** Display your current location and GeoTag markers using Leaflet and OpenStreetMap.
- **REST API:** Create, read, update, and delete GeoTags through HTTP endpoints.
- **Asynchronous interface:** Use the browser's Fetch API to update the results without reloading the full page.
- **Pagination:** Load and navigate through paginated GeoTag search results.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, Leaflet |
| Backend | Node.js, Express.js |
| Communication | REST, HTTP, JSON, Fetch API |
| Rendering | EJS |
| Data storage | In-memory JavaScript store |
| Development | npm, nodemon, Git |

## Getting started

### Requirements

- Node.js and npm
- A modern web browser

### Installation

```bash
git clone https://github.com/<YOUR-USERNAME>/<YOUR-REPOSITORY>.git
cd <YOUR-REPOSITORY>
npm install
npm start
```

Open **http://localhost:3000** in your browser. Allow location access if prompted, so the map can center on your position.

> The project currently uses an **in-memory store**, not a database. GeoTags added during a session are lost when the server restarts. The `npm start` script uses nodemon for local development.

## REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/geotags` | List and search GeoTags; supports filtering and pagination |
| `POST` | `/api/geotags` | Create a GeoTag |
| `GET` | `/api/geotags/:id` | Retrieve a GeoTag by ID |
| `PUT` | `/api/geotags/:id` | Update a GeoTag |
| `DELETE` | `/api/geotags/:id` | Delete a GeoTag |

Example: retrieve the first five results:

```bash
curl "http://localhost:3000/api/geotags?page=1&limit=5"
```

The API also supports a text search and location-based filtering. For details, see the Express routes in [`routes/index.js`](routes/index.js).

## How it works

1. The browser determines the user's location using the Geolocation API.
2. The frontend sends requests to the Express backend through the Fetch API.
3. Express routes process the requests and access the in-memory GeoTag store.
4. The backend responds with JSON, and the frontend updates the result list and map markers.

## Project structure

```text
bin/                  Server startup script
models/               GeoTag model, example data, and in-memory store
public/               Browser JavaScript, CSS, images, and static assets
routes/index.js       Web route and REST API endpoints
views/                EJS templates
app.js                Express application configuration
package.json          Dependencies and development start command
```

## Background and attribution

Based on the laboratory exercises and starter templates from [VS1lab](https://github.com/zirpins/vs1lab). The app was developed and extended as part of a university group assignment. This repository documents the group's completed implementation and my learning experience; it should not be interpreted as an individual authorship claim for every line of code.

<!-- Before publishing: check whether the starter repository's license and your team's agreement permit redistribution, and retain any required notices. -->
