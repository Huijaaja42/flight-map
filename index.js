let map = L.map(
    "map",
    { attributionControl: false }
    ).setView([51.505, -0.09], 3);

L.gridLayer.googleMutant({
    type: "roadmap",
    maxZoom: 6,
    styles: [
        { featureType: "water", stylers: [{ color: "#444444" }] }
    ]}).addTo(map);

createMarkers();

showStats();

async function getStats() {
    return new Promise((resolve) => {
        $.getJSON("STATS URL HERE", data => {
            resolve(data);
        });
    });
}

async function showStats() {
    await getStats().then(stats => {
        let enabledStats = [
        ["Pilots", stats.pilots.total],
        ["Pireps", stats.pireps.total],
        ["Routes", stats.general.routes],
        ["Aircraft", stats.general.aircraft]];
        enabledStats.forEach(stat => {
            document.getElementById("stats").innerHTML += `
            <div class="col">
                <div class="card w-75">
                    <div class="card-body">
                        <h5 class="card-title">${stat[0]}</h5>
                        <p class="card-text">${stat[1]}</p>
                    </div>
                </div>
            </div>
            `
        });
    });
}

async function getFlights() {
    return new Promise((resolve) => {
        $.getJSON("FLIGHTS URL HERE", data => {
            resolve(data);
        });
    });
}

async function createMarkers() {
    await getFlights().then(flights => {
        flights.forEach(flight => {
            let planeIcon = L.icon({
                iconUrl: "plane.png",
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            let marker = L.marker([flight.currentLocation.latitude, flight.currentLocation.longitude], {
                rotationAngle: flight.currentLocation.heading - 78,
                icon: planeIcon
            }).addTo(map);

            marker.bindTooltip(`<b>${flight["flight-number"]} / ${flight.callsign}</b> (${flight.aircraft.code})<br>${flight.departure.icao} - ${flight.arrival.icao}<br>${flight.pilot.username} ${flight.network}`,
            {
                direction: "right",
                offset: [10, 0],
                className: "leaflet-tooltip"
            });

            let route = L.curve(false, {color:"red",fill:true}).addTo(map);

            marker.on("mouseover", e => {
                e.target.openPopup();
                route.setPath([
                    "M",
                    [flight.departure.latitude, flight.departure.longitude],
                    "Q",
                    [flight.currentLocation.latitude, flight.currentLocation.longitude],
                    [flight.arrival.latitude, flight.arrival.longitude],
                    "Z"
                ]);
            });

            marker.on("mouseout", e => {
                e.target.closePopup();
                route.setPath(false);
            });
        });
    });
}
