const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

const render = (error, us, educationData) => {

	const width = 960; 
	const height = 600; 
	const path = d3.geoPath();
	
	if(error) throw error;
	
	const svg = d3.select("svg");

	svg.attr("width", width)
		.attr("height", height)
		.style("width", "100%")
		.style("height", "auto");

	const color = d3.scaleThreshold()
		.domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
		.range(d3.schemeGreens[9]);

	const x = d3.scaleLinear()
		.domain([2.6, 75.1])
		.rangeRound([600, 860]);

	const format = d3.format("");
	
	const g = svg.append("g");


	g.selectAll("rect")
		.data(color.range().map(function(d) {
			d = color.invertExtent(d);
			if (d[0] == null) d[0] = x.domain()[0];
			if (d[1] == null) d[1] = x.domain()[1];
			return d;
		}))
		.enter().append("rect")
			.attr("height", 8)
			.attr("x", function(d) { return x(d[0]); })
			.attr("width", function(d) { return x(d[1]) - x(d[0]); })
			.attr("fill", function(d) { return color(d[0]); });

	g.call(d3.axisBottom(x)
		.tickSize(13)
		.tickFormat(function(x) { return Math.round(x) + '%' })
		.tickValues(color.domain()))
		.select(".domain")
		.remove();

		g.selectAll("path")
			.data(topojson.feature(us, us.objects.counties).features)
			.enter().append("path")
			.attr("data-fips", d => d.id)
			.attr("data-education", d => {
				let result = educationData.filter(item => item.fips == d.id);

				if(result){
					return result[0].bachelorsOrHigher;
				}
				
				console.log(`Could not find data for ${d.id}`);
				return 0;
			})
			.attr("fill", d => {
				let result = educationData.filter(item => item.fips == d.id);
				
				if(result){
					return color(result[0].bachelorsOrHigher);
				}
			}) 
			.attr("d", path)
			.on("mouseover", d => {
				let result = educationData.filter(item => item.fips == d.id);
				mouseOverHandler(result[0]);
			})
			.on("mouseout", mouseOutHandler);

	g.append("path")
		.attr("class", "county-borders")
		.attr("d", path(topojson.mesh(us, us.objects.counties, (a,b) => a !== b)));


	g.append("text")
		.attr("fill", "black")
		.attr("x", width/3)
		.attr("y", 15)
		.text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");
	
	
	svg.call(d3.zoom()
		.on("zoom", () => {
			g.attr("transform", d3.event.transform);
			console.log(d3.event.transform);	
		}));

	
		
};


function mouseOverHandler(county){

  console.log(county);
  
  message = `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`; 
  
  tooltip
    .style('opacity', 1)
    .style('left', (d3.event.pageX) + "px")
    .style('top', (d3.event.pageY - 28) + "px")
    .html(message);
}

function mouseOutHandler(){
  d3.select('.tooltip')
    .style('opacity', 0);
}

d3.queue()
	.defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")
	.defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")
	.await(render);
