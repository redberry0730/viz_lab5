const margin = {top: 20, right: 20, bottom: 40, left: 50};
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let svg = d3
    .select('.chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const group = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const xScale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

const x_axis = d3.axisBottom()
    .scale(xScale);

const yScale = d3.scaleLinear()
    .range([height, 0]);

const y_axis = d3.axisLeft()
    .scale(yScale);

let x_container = group
    .append('g')
    .attr('class', 'axis x-axis');

let y_container = group
    .append('g')
    .attr('class', 'axis y-axis');

let y_title = svg
    .append('text')
    .attr('x', 50)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', 16)
    .attr('font-weight', 'bold')
    .attr('alignment-baseline', 'middle');

let order = -1;
let companies = (d => d.company);
let category = d3.select('#group-by').node().value;

function update(data, category, order) {
    if (order == -1) {
        data.sort((a, b) => b[category] - a[category]);
    } 
    else {
        data.sort((a, b) => a[category] - b[category]);
    }

    xScale.domain(data.map(companies));
    yScale.domain([0, d3.max(data, d => d[category])]);

    const bar_chart = group
        .selectAll('rect')
        .data(data, companies);

    bar_chart
        .enter()
        .append('rect')
        .attr('y', height)
        .merge(bar_chart)
        .transition()
        .duration(1000)
        .attr('x', d => xScale(d.company))
        .attr('y', d => yScale(d[category]))
        .attr('width', d => xScale.bandwidth())
        .attr('height', d => (height - yScale(d[category])))
        .attr('fill', 'blueviolet');

    bar_chart
        .exit()
        .remove();

    x_container
        .attr("transform", `translate(0, ${height})`)
        .transition()
        .duration(500)
        .call(x_axis);

    y_container
        .transition()
        .duration(500)
        .call(y_axis);

    y_title
        .transition()
        .duration(500)
        .text(() => {
                if (category == 'stores') {
                    return 'Stores';
                }
                else {
                    return 'Billion USD';
                }
            });
}

d3.csv('coffee-house-chains.csv', d3.autoType).then(data => {
    update(data, category, order);
    d3.select('#group-by')
        .on('change', d => {
            category = d.target.value;
            update(data, category, order);
        });
    d3.select('#button')
        .on('click', d => {
            order *= -1;
            update(data, category, order);
        });
});