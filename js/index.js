//URL for data to be pulled from, define arrays and variables to be used 
var ajaxUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json',
    mydata, yearsArray = [], yearStringArray = [], tempArray = [];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//upon ajax request being done, run code to set up graph
function runningData() {
  var toolTips = d3.selectAll('div.heat-map-data') //on hover, show this tooltip in graph
                    .data(mydata.monthlyVariance)
                    .enter().append('div')
                    .attr('class', 'heat-map-data')
                    .attr('id', function(d,i) { return i; })
                    .style('display', 'none')
                    .html(function(d,i) {
                      return '<h1>' + months[d.month - 1] + ' ' + d.year + '</h1><p>' + (d.variance + 8.66).toFixed(3) + ' C &#176;</p></div>'
                    });
  
  var h = 600;
  var w = window.innerWidth * .80;
  var yPadding = 50;
  var xPadding = 50;
    
  var xScale = d3.scaleTime() //based off years, greater to the right
                .domain([new Date(d3.min(yearsArray), 0), new Date(d3.max(yearsArray), 0)])
                .range([xPadding + 30, w - (xPadding + 15)]);
    
  var colorScale = d3.scaleLinear() //color scale
                .domain([d3.min(tempArray), d3.max(tempArray)])
                .range(['#00f6ff', '#ff0019']); 
  
  var yScale = d3.scaleLinear() //based off months
                .domain([1, 12])
                .range([yPadding, h - (yPadding * 2)]); 
    
  var mapSvg = d3.select('#root').append('svg') //base svg for heat map to go to
              .attr('id', 'root-svg')
              .attr('height', h)
              .attr('width', w);
  
  var xAxis = d3.axisBottom(xScale)
                .ticks(d3.timeYear.every(20));
                
  // top reference with regards to what colors mean what
  var legend = mapSvg.append('g')
                .attr('width', 300)
                .attr('height', 40)
                .attr('transform', 'translate(' + (w/2 - 150) + ', 15)');
                  
  legend.append('text')
    .text('Cooler Temps -')
    .attr('y', 12);
    
  legend.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', '#00f6ff')
    .attr('x', 100)
    .attr('y', 0);
  
  legend.append('text')
    .text('Hotter Temps -')
    .attr('x', 185)
    .attr('y', 12);
  
  legend.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', '#ff0019')
    .attr('x', 285)
    .attr('y', 0);
  
  mapSvg.append('g')
    .attr('transform', 'translate(5,' + (h - yPadding)+ ')')
    .call(xAxis);
  
  var button = mapSvg.append('g')
    .attr('class', 'button')
    .attr('width', 150)
    .attr('height', 40)
    //.attr('id', 'populate-graph-button')
    .attr('transform', 'translate(' + ((w + xPadding)/2 - 100) + ',100)')
    .on('click', runMapAnimation);
  
  //onclick, animation starts, graph populates
  button.append('rect')
    .attr('width', 150)
    .attr('height', 40)
    .attr('fill', '#070026')
    .attr('x', 0)
    .attr('y', 0)
    .attr('rx', 5)
    .attr('ry', 5);
  
  button.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', 150/2)
    .attr('y', 24)
    .style('fill', '#f2f2f2')
    .text('Click to see');
  
  //populate left side with months 
  mapSvg.selectAll('text.y-axis')
    .data(months).enter()
    .append('text')
    .attr('class', 'y-axis')
    .attr('x', 42)
    .attr('y', function(d,i) {
      return  yScale(i + 1) + 25;
    })
    .text(function(d,i) {return d;});
    
  //code for data related to each map rectangle representing
  //one month (yaxis) of each year(xaxis) & avg temp(color)
  mapSvg.selectAll('rect.map-rect')
    .data(mydata.monthlyVariance).enter().append('rect')
      .attr('fill', '#f2f2f2')
      .attr('height', function(d,i) { return Math.random() * 20})
      .attr('width', function(d,i) { return Math.random() * 20})
      .attr('x', function(d,i) { return Math.random() * w})
      .attr('y', function(d,i) { return Math.random() * -h})
      .attr('class', function(d,i) {
          return 'map-rect' + ' ' + i;
        })
        .on('mouseover', function() {
          var getTooltip = event.target.className.baseVal.replace('map-rect ', '');
          document.getElementById(getTooltip).style.display = 'inline-block';
          document.getElementById(getTooltip).style.top = event.pageY + 25 + 'px';
          if(event.pageX > (window.innerWidth / 2)) {
            document.getElementById(getTooltip).style.left = event.pageX - 200 + 'px';
          } else{
            document.getElementById(getTooltip).style.left = event.pageX - 200 + 'px';
          };
        })
        .on('mouseout', function() {
          var getTooltip = event.target.className.baseVal.replace('map-rect ', '');
          document.getElementById(getTooltip).style.display = 'none';
        });
   
  function runMapAnimation() { //animation after click of event button
    mapSvg.selectAll('rect.map-rect')
      .transition()
      .duration(1300)
      .delay( function(d,i) {return i;})
        .attr('x', function(d,i) { return xScale(new Date(d.year, d.month)); })
        .attr('y', function(d,i) { return yScale(d.month); })
        .attr('fill', function(d,i) { return colorScale(d.variance); })
        .attr('height', (h / 12) - 8.5)
        .attr('width', yearsArray.length / w + 4);
    
    mapSvg.select('g.button')
      .transition()
      .duration(750)
        .attr('transform', 'translate(57,5)')
    
    button.select('rect')
      .transition()
      .duration(500)
        .attr('fill', '#f2f2f2')
    
    button.select('text')
      .transition()
      .duration(1000)
      .delay(5000)
        .text('Hover for details')
        .style('fill', 'black')
        .style('font-weight', 'bolder')
        
  }    
}

$.getJSON(ajaxUrl, function(data) {
  mydata = data;
  
  for(var i = 0; i < mydata.monthlyVariance.length; i++) {
    yearsArray.push(mydata.monthlyVariance[i].year);
    tempArray.push(mydata.monthlyVariance[i].variance);
  }
    
  runningData();
})