(async () => {
    const dataset = await d3.json('./my_weather_data.json');
    const xAccessor  = d => d.humidity;
    const yAccessor = d => d.dewPoint;
    const colorAccesor = d => d.cloudCover;

    const dimensions = getDimensions();

    const xScale = d3.scaleLinear() 
            .domain(d3.extent(dataset, xAccessor)) 
            .range([0, dimensions.boundedWidth])
            .nice()

    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()
    
    const colorScale = d3.scaleLinear()
        .domain(d3.extent(dataset, colorAccesor))
        .range(["skyblue", "darkslategray"])

    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
        .ticks(4)

    const wrapper = d3.select('#wrapper')
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);
    
    const bounds = wrapper.append('g')
        .style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);
    
    async function drawChart() {
        const xAxis = bounds.append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`)

        const xAxisLabel = xAxis.append("text")
            .attr("x", dimensions.boundedWidth / 2)
            .attr("y", dimensions.margin.bottom - 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .html("Dew point (&deg;F)")

        const yAxis = bounds.append("g")
            .call(yAxisGenerator)

        const yAxisLabel = yAxis.append("text")
            .attr("x", -dimensions.boundedHeight / 2)
            .attr("y", -dimensions.margin.left + 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .style("transform", "rotate(-90deg)") 
            .style("text-anchor", "middle")
            .text("Relative humidity")

        let dots = bounds.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(xAccessor(d)))
            .attr("cy", d => yScale(yAccessor(d)))
            .attr("r", 5)
            .attr("fill", d => colorScale(colorAccesor(d)))
        
    }

    function drawDots(dataset, color) {
 
        const dots = bounds.selectAll("circle").data(dataset)
        
        // dots.enter()
        //     .append("circle")
        //     .merge(dots) // all dates both entering now and already in _groups
        //         .attr("cx", d => xScale(xAccessor(d))) 
        //         .attr("cy", d => yScale(yAccessor(d))) 
        //         .attr("r", 5)
        //         .attr("fill", color)

        // same as above but .join() is shortcut for .enter(), .append(), .merge()
        dots.join("circle") 
            .attr("cx", d => xScale(xAccessor(d))) 
            .attr("cy", d => yScale(yAccessor(d))) 
            .attr("r", 5)
            .attr("fill", color)
    }

    function getDimensions() {
        const width = d3.min([
            window.innerWidth * 0.9,
            window.innerHeight * 0.9
        ]);

        let dimensions = {
            width,
            height: width,
            margin: {
                  top: 10,
                  right: 10,
                  bottom: 50,
                  left: 50,
            }, 
        }
        dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
        dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
        return dimensions;
    }
    
    drawChart();
})();

