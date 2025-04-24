const svg = d3.select("svg#map");
const infoBox = d3.select("#info-box");

let projection = d3.geoMercator();
let path = d3.geoPath().projection(projection);

const regionData = {
  "South East": {
    modHigh: "68,384",
    developable: "41,031",
    homes40: "1,641,226",
    homes60: "2,461,839"
  },
  "Yorkshire and The Humber": {
    modHigh: "47,549",
    developable: "28,529",
    homes40: "1,141,178",
    homes60: "1,711,767"
  },
  "West Midlands": {
    modHigh: "49,050",
    developable: "29,430",
    homes40: "1,177,211",
    homes60: "1,765,816"
  },
  "North West": {
    modHigh: "37,774",
    developable: "22,664",
    homes40: "906,577",
    homes60: "1,359,866"
  },
  "Eastern": {
    modHigh: "55,245",
    developable: "33,147",
    homes40: "1,325,884",
    homes60: "1,988,826"
  },
  "South West": {
    modHigh: "9,780",
    developable: "5,868",
    homes40: "234,722",
    homes60: "352,083"
  },
  "North East": {
    modHigh: "10,782",
    developable: "6,469",
    homes40: "258,762",
    homes60: "388,142"
  },
  "East Midlands": {
    modHigh: "7,976",
    developable: "4,786",
    homes40: "191,431",
    homes60: "287,147"
  },
  "London": {
    modHigh: "14,511",
    developable: "8,706",
    homes40: "348,259",
    homes60: "522,388"
  },
  "Total": {
    modHigh: "301,052",
    developable: "180,631",
    homes40: "7,225,250",
    homes60: "10,837,874"
  }
};

let activeRegion = null;

d3.json("https://martinjc.github.io/UK-GeoJSON/json/eng/topo_eer.json").then(data => {
  const regions = topojson.feature(data, data.objects.eer);

  projection.fitSize([window.innerWidth, window.innerHeight], regions);
  path = d3.geoPath().projection(projection);

  const bounds = path.bounds(regions);
  const [x0, y0] = bounds[0];
  const [x1, y1] = bounds[1];
  svg.attr("viewBox", `${x0} ${y0} ${x1 - x0} ${y1 - y0}`)
     .attr("preserveAspectRatio", "xMidYMid meet");

  const regionPaths = g.selectAll("path")
    .data(regions.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#b3cde0")
    .attr("stroke", "#333")
    .on("click", function(event, d) {
      if (activeRegion) activeRegion.classed("active-region", false);
      activeRegion = d3.select(this).classed("active-region", true);

      g.selectAll(".region-label")
        .style("display", label => label === d ? "none" : "block");

      const props = regionData[d.properties.EER13NM];
      if (props) {
        d3.select("#info").html(`
          <div class="info-title">${props.name}</div>
            <div class="info-list">
            <div class="info-list-item"><span>Mod and High (ha)</span><span>${props.modHigh.toLocaleString()}</span></div>
            <div class="info-list-item"><span>0% assumed Developable Area (ha)</span><span>${props.developable.toLocaleString()}</span></div>
            <div class="info-list-item"><span>Homes at 40 dph</span><span>${props.homes40.toLocaleString()}</span></div>
            <div class="info-list-item"><span>Homes at 60 dph</span><span>${props.homes60.toLocaleString()}</span></div>
          </div>`);
      }
    });

  g.selectAll(".region-label")
    .data(regions.features)
    .enter()
    .append("text")
    .attr("class", "region-label")
    .attr("x", d => path.centroid(d)[0])
    .attr("y", d => path.centroid(d)[1])
    .text(d => d.properties.EER13NM);

  // Zooming only on desktop
  if (window.innerWidth > 767) {
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);
  }

  // Default info on load
  const defaultInfo = regionData["Total"];
  d3.select("#info").html(`
        <div class="info-title">England</div>
          <div class="info-list">
          <div class="info-list-item"><span>Mod and High (ha)</span><span>${defaultInfo.modHigh}</span></div>
          <div class="info-list-item"><span>0% assumed Developable Area (ha)</span><span>${defaultInfo.developable}</span></div>
          <div class="info-list-item"><span>Homes at 40 dph</span><span>${defaultInfo.homes40}</span></div>
          <div class="info-list-item"><span>Homes at 60 dph</span><span>${defaultInfo.homes60}</span></div>
        </div>
      `);
});

// Handle resize
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  projection.fitSize([width, height], topojson.feature(data, data.objects.eer));
  path = d3.geoPath().projection(projection);

  svg.attr("viewBox", null);

  g.selectAll("path").attr("d", path);
  g.selectAll(".region-label")
    .attr("x", d => path.centroid(d)[0])
    .attr("y", d => path.centroid(d)[1]);
});
