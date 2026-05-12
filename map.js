import mapboxgl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia3lkMDAyIiwiYSI6ImNtcDJ4Zmd0NjA5NmkydG9heGk4amFpeHgifQ.rPPUWCu9r3gxkEMJ9YMhtQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.Long, +station.Lat);
  const { x, y } = map.project(point);
  return { cx: x, cy: y };
}

map.on("load", async () => {
  // Boston bike lanes
  map.addSource("boston_route", {
    type: "geojson",
    data: "https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson",
  });

  map.addLayer({
    id: "bike-lanes",
    type: "line",
    source: "boston_route",
    paint: {
      "line-color": "#32D400",
      "line-width": 5,
      "line-opacity": 0.6,
    },
  });

  // Cambridge bike lanes
  map.addSource("cambridge_route", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson",
  });

  map.addLayer({
    id: "cambridge-bike-lanes",
    type: "line",
    source: "cambridge_route",
    paint: {
      "line-color": "#32D400",
      "line-width": 5,
      "line-opacity": 0.6,
    },
  });

  let jsonData;
  try {
    const jsonurl =
      "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
    jsonData = await d3.json(jsonurl);
    console.log("Loaded JSON Data:", jsonData);
  } catch (error) {
    console.error("Error loading JSON", error);
  }
  let stations = jsonData.data.stations;
  console.log("Stations Array:", stations);
  const svg = d3.select("#map").select("svg");
  const circles = svg
    .selectAll("circle")
    .data(stations, (d) => d.short_name)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("opacity", 0.8);

  function updatePositions() {
    circles
      .attr("cx", (d) => getCoords(d).cx)
      .attr("cy", (d) => getCoords(d).cy);
  }
  updatePositions();

  map.on("move", updatePositions);
  map.on("zoom", updatePositions);
  map.on("resize", updatePositions);
  map.on("moveend", updatePositions);
});
