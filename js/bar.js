d3.csv("https://gist.githubusercontent.com/hussam262/e78fdd04816c13009e86c7a077ed655b/raw/c3396300cb3fb57a2390cdca8aeaf05820f9a43e/CountryMeantemp.csv").then(function (data) {
  // Sort the data by descending average temperature
  data.sort((a, b) => b.mean_temp - a.mean_temp);

  // Filter the top, middle, and bottom countries
  const topCountries = data.slice(0, 15);
  const middleCountries = data.slice(150,170);
  const bottomCountries = data.slice(-15);

  // Concatenate the three groups of countries and re-sort by mean temperature
  const filteredData = topCountries.concat(middleCountries, bottomCountries);
  filteredData.sort((a, b) => b.mean_temp - a.mean_temp);

  // Set up the SVG
  const svg = d3.select("#bar-chart");
  const margin = { top: 40, right: 20, bottom: 30, left: 80 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up the scales
  const x = d3
    .scaleLinear()
    .rangeRound([0, width])
    .domain([-20, 30]);
  const y = d3
    .scaleBand()
    .rangeRound([height, 0])
    .padding(0.1)
    .domain(filteredData.map((d) => d.countries));

  // Add the bars
  g.selectAll("rect")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("x", (d) => x(Math.min(0, d.mean_temp)))
    .attr("y", (d) => y(d.countries))
    .attr("width", (d) => Math.abs(x(d.mean_temp) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => (d.mean_temp < 0 ? "red" : "steelblue"));

  // Add the X axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10));

  // Add the Y axis
  g.append("g").call(d3.axisLeft(y));

});
