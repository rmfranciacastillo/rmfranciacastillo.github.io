const svg = d3.select('svg.treemap');
const width = 1260;
const height = 760;

svg
	.attr('width', width)
	.attr('height', height);

const legendWidth = 300;
const legendHeight = 300;

const legend = d3.select('svg.legend')
	.attr('class', 'legend-container')
	.attr('x', width/2)
	.attr('width', legendWidth)
	.attr('height', legendHeight)
	.attr('fill', 'red');


const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
	        .style('opacity', 0);

const render = data => {

	d3.select('g.treemap').remove();	
	d3.select('g.legend').remove();

	const margin = { top: 50, right: 10, bottom: 20, left: 30};

	const innerHeight = height - margin.top - margin.bottom;
	const innerWidth = width - margin.left - margin.right;

	const title = data.name;

	const format = d3.format(",d");
	const color = d3.scaleOrdinal().range(d3.schemeCategory10);

	const treemap = data => d3.treemap()
		.size([innerWidth, innerHeight])
		.padding(1)
		.round(true)
		(d3.hierarchy(data)
			.sum(d => d.value)
			.sort((a, b) => b.height - a.height || b.value - a.value));

	const root = treemap(data);

	const g = svg.append('g')
		.attr('class', 'treemap')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	g.append('text')
		.attr('class', 'title')
		.attr('y', -10)
		.attr('x', innerWidth/3 +25)
		.attr('fill', 'black')
		.text(title)

	const leaf = g.selectAll('g')
		.data(root.leaves())
		.enter().append('g')
			.attr('transform', d => `translate(${d.x0}, ${d.y0})`);
	
	leaf.append('rect')
		.attr('fill', d => { 
			while(d.depth > 1) d = d.parent;
			return color(d.data.name);
		})
		.attr('width', d => d.x1 - d.x0)
		.attr('height', d => d.y1 - d.y0)
		.on('mouseover', mouseOverHandler)
		.on('mouseout', mouseOutHandler);
	
  
	leaf.append("text")
		.attr("clip-path", d => d.clipUid)
	.selectAll("tspan")
	.data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
	.enter().append("tspan")
		.attr("x", 3)
		.attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
		.attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
		.text(d => isNaN(d)? d : '');

	//Legend
	const legend = d3.select('svg.legend-container').append('g')
		.attr('class', 'legend')
		.attr('height', 100);
	
	const categories = root.leaves()
		.map(nodes => nodes.data.category)
		.filter((category, index, self) => self.indexOf(category) === index);
	
	legend.selectAll('legend')
		.data(categories).enter()
		.append('text')
		.attr('fill', 'black')
		.attr('x', (d,i) => (i%3)*120 + 15)
		.attr('y', (d,i, arr) => {
			if(i%3 == 0) return 30 * i/3 + 30;
			return 30 * Math.floor(i/3) + 30;
		})
		.attr('height', 10)
		.text(d => d);


	legend.selectAll('legend')
		.data(categories).enter()
		.append('rect')
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', d => color(d))
		.attr('x', (d,i) => (i%3)*120)
		.attr('y', (d,i, arr) => {
			if(i%3 == 0) return 30 * i/3 + 20;
			return 30 * Math.floor(i/3) + 20;
		});

};

// Click Handlers
const videoGameData = document.getElementById('video-games');
const movieData = document.getElementById('movies');
const kickStarterData = document.getElementById('kickstarter');

videoGameData.addEventListener('click', () =>{
	let url = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';
	callData(url);
});

movieData.addEventListener('click', () =>{
	let url = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
	callData(url);
});

kickStarterData.addEventListener('click', () =>{
	let url = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json';
	callData(url);
});

function callData(url){
	d3.json(url, data => { render(data); }); 
}

d3.json('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json', data => {
	render(data);
});

function mouseOverHandler(d,i){
  
  let minutes = Math.floor(d.Seconds/60);
  let seconds = d.Seconds % 60;
      
  if(seconds === 0)
    seconds += "0";

  message = `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`;
  
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
