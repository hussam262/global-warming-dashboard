(function (d3, topojson) {
    'use strict';
  
    const svg = d3.select('svg');
  
    const projection = d3.geoNaturalEarth1();
    const pathGenerator = d3.geoPath().projection(projection);
  
    const g = svg.append('g');
  
    g.append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({type: 'Sphere'}));
  
    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  
    svg.call(zoom);
  
    Promise.all([
      d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
      d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json'),
      d3.csv('https://gist.githubusercontent.com/hussam262/e78fdd04816c13009e86c7a077ed655b/raw/c3396300cb3fb57a2390cdca8aeaf05820f9a43e/CountryMeantemp.csv'),
      d3.csv("https://gist.githubusercontent.com/hussam262/e78fdd04816c13009e86c7a077ed655b/raw/c3396300cb3fb57a2390cdca8aeaf05820f9a43e/CountriesThroughTime.csv")
    ]).then(([tsvData, topoJSONdata, csvData, data]) => {
      const countryName = tsvData.reduce((accumulator, d) => {
        accumulator[d.iso_n3] = d.name;
        return accumulator;
      }, {});
  
      const countryTemp = csvData.reduce((accumulator, d) => {
        accumulator[d.countries] = +d.mean_temp;
        return accumulator;
      }, {});
  
      const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
      g.selectAll('path')
        .data(countries.features)
        .enter().append('path')
          .attr('class', 'country')
          .attr('d', pathGenerator)
          .style('fill', d => {
            const temp = countryTemp[countryName[d.id]];
            return d3.scaleSequential().domain([40, -10]).interpolator(d3.interpolateRdBu)(temp);
          })
          .on('click', function(event, d) {
            const country = countryName[d.id];
            const temp = countryTemp[country];
            console.log(`Clicked on ${country}, mean temp is ${temp}°C`);
            drawLineChart(country);
          })
        .append('title')
          .text(d => `${countryName[d.id]}: ${countryTemp[countryName[d.id]]}°C`);
  
      data = data.map(({ dt, AverageTemperature, Country }) => ({
        dt: new Date(dt),
        AverageTemperature: +AverageTemperature,
        Country,
      }));
  
      const dataByYear = d3.group(data, d => d3.timeYear(d.dt), d => d.Country);
      const dataAvgByYear = [];
      dataByYear.forEach((valuesByCountry, year) => {
        valuesByCountry.forEach((values, country) => {
          const avgTemp = d3.mean(values, d => d.AverageTemperature);
          dataAvgByYear.push({year, country, avgTemp});
        });
      });
  
      const margin = { top: 10, right: 10, bottom: 30, left: 90 };
      const width = 700 - margin.left - margin.right;
      const height = 250 - margin.top - margin.bottom;
  
      const svg = d3
      .select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height",height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleTime()
  .domain(d3.extent(dataAvgByYear, d => d.year))
  .range([0, width]);

const y = d3.scaleLinear()
  .domain(d3.extent(dataAvgByYear, d => d.avgTemp))
  .range([height, 0]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const line = d3.line()
  .x(d => x(d.year))
  .y(d => y(d.avgTemp))
  .curve(d3.curveBasis);

const xAxis = d3.axisBottom(x)
  .tickFormat(d3.timeFormat("%Y"));

const yAxis = d3.axisLeft(y);

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

svg.append("g")
  .call(yAxis);

const pathContainer = svg.append("g");

function drawLineChart(country) {
  const filteredData = dataAvgByYear.filter(d => d.country === country);
  const countryPath = pathContainer.selectAll("path")
    .data([filteredData], d => d.country);

  countryPath.enter()
    .append("path")
    .merge(countryPath)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", color(country))
    .attr("stroke-width", 2)
    .attr("opacity", 0.7);

  countryPath.exit().remove();
}
drawLineChart("United Arab Emirates");
});

}(d3, topojson));
  