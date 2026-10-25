class InMemoryGeoTagStore {

    #geoTags = [];
    #nextId = 1;

    // adds a geotag to the store and gives it a unique id
    addGeoTag(geotag) {
        geotag.id = this.#nextId;
        this.#nextId++;

        this.#geoTags.push(geotag);

        return geotag;
    }

    // returns all geotags.
    getAllGeoTags() {
        return this.#geoTags;
    }

    // returns one geotag by id
    getGeoTagById(id) {
        return this.#geoTags.find(gtag => gtag.id === Number(id));
    }

    // updates one geotag by id
    updateGeoTag(id, updatedGeoTag) {
        const index = this.#geoTags.findIndex(gtag => gtag.id === Number(id));

        if (index === -1) {
            return undefined;
        }

        updatedGeoTag.id = Number(id);
        this.#geoTags[index] = updatedGeoTag;

        return updatedGeoTag;
    }

    // deletes one geotag by id
    deleteGeoTag(id) {
        const index = this.#geoTags.findIndex(gtag => gtag.id === Number(id));

        if (index === -1) {
            return undefined;
        }

        const deletedGeoTag = this.#geoTags[index];
        this.#geoTags.splice(index, 1);

        return deletedGeoTag;
    }

    // remove all geotags with the given name.
    removeGeoTag(name) {
        this.#geoTags = this.#geoTags.filter(gtag => gtag.name !== name);
    }

    // returns all geotags near a given location.
    getNearbyGeoTags(latitude, longitude, radius = 10) {
        return this.#geoTags.filter(gtag => {
            const distance = this._getDistanceInKm(
                Number(latitude),
                Number(longitude),
                Number(gtag.latitude),
                Number(gtag.longitude)
            );
            return distance <= radius;
        });
    }

    // returns all geotags that match a keyword.
    searchGeoTags(keyword = "") {
        const searchText = String(keyword).trim().toLowerCase();

        if (searchText === "") {
            return this.getAllGeoTags();
        }

        return this.#geoTags.filter(gtag => {
            return (
                String(gtag.name).toLowerCase().includes(searchText) ||
                String(gtag.hashtag).toLowerCase().includes(searchText)
            );
        });
    }

    // returns all nearby geotags that match a keyword.
    searchNearbyGeoTags(latitude, longitude, radius = 10, keyword = "") {
        const nearbyGeoTags = this.getNearbyGeoTags(latitude, longitude, radius);
        const searchText = String(keyword).trim().toLowerCase();

        if (searchText === "") {
            return nearbyGeoTags;
        }

        return nearbyGeoTags.filter(gtag => {
            return (
                String(gtag.name).toLowerCase().includes(searchText) ||
                String(gtag.hashtag).toLowerCase().includes(searchText)
            );
        });
    }

    // Computes distance between two coordinates in kilometers.
    _getDistanceInKm(lat1, lon1, lat2, lon2) {
        const earthRadiusKm = 6371;

        const dLat = this._toRadians(lat2 - lat1);
        const dLon = this._toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRadians(lat1)) *
            Math.cos(this._toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusKm * c;
    }

    _toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
}

module.exports = InMemoryGeoTagStore;
