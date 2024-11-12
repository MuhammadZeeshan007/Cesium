Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYWE1ZDRhNi1iMmY3LTQ2N2EtYjVhZi1lNGQxYTU2OTlhMmIiLCJpZCI6MjUzMDQ1LCJpYXQiOjE3MzA4MTU0NDZ9.CIx9NToIFk0s0T-PhLs-lU38Qy87HHtCJkLlHTTMM50'; // Replace with your actual Cesium API key




// Initialize the Cesium viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 })
});

viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(78.9629, 20.5937, 4000000) // Centered on India
});

// Define central coordinates for each state
const states = [
    { name: "Delhi", lat: 28.7041, lon: 77.1025 },
    { name: "Maharashtra", lat: 19.7515, lon: 75.7139 },
    { name: "Karnataka", lat: 15.3173, lon: 75.7139 },
    // Add more states here
];

// Function to fetch temperature data from OpenWeatherMap API
async function fetchTemperature(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=a97f26f3240956e5d7339044ee74bd65&units=metric`);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        const data = await response.json();
        return data.main.temp;
    } catch (error) {
        console.error("Error fetching temperature:", error);
        return null;
    }
}

// Function to add temperature bars to the map
async function addTemperatureBars() {
    for (const state of states) {
        const temperature = await fetchTemperature(state.lat, state.lon);
        if (temperature === null) continue; // Skip if temperature data is missing

        // Add a bar representing the temperature
        viewer.entities.add({
            name: `${state.name} Temperature`,
            position: Cesium.Cartesian3.fromDegrees(state.lon, state.lat),
            cylinder: new Cesium.CylinderGraphics({
                length: temperature * 1000, // Height of bar based on temperature
                topRadius: 50000,
                bottomRadius: 50000,
                material: Cesium.Color.RED.withAlpha(0.6)
            }),
            label: {
                text: `${state.name}: ${temperature.toFixed(1)}°C`,
                font: '14pt sans-serif',
                fillColor: Cesium.Color.BLACK,
                outlineColor: Cesium.Color.WHITE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -100)
            }
        });
    }
}
addTemperatureBars();

// Load state boundaries GeoJSON and add interactive hover effect
Cesium.GeoJsonDataSource.load("E:/Temp/temp/Cesium js/india-states-geojson.json", {
    stroke: Cesium.Color.TRANSPARENT,
    fill: Cesium.Color.TRANSPARENT,
    strokeWidth: 2
}).then((dataSource) => {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;

    viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedObject = viewer.scene.pick(movement.endPosition);
        entities.forEach(entity => {
            if (pickedObject && pickedObject.id === entity) {
                entity.polygon.outlineColor = Cesium.Color.BLUE.withAlpha(0.8); // Highlight on hover
            } else {
                entity.polygon.outlineColor = Cesium.Color.BLUE.withAlpha(0.0); // Reset when not hovered
            }
        });
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
});
