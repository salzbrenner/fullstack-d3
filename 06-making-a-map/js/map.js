(async () => {

    // 1. data
    const countryShapes = await d3.json('./data/world-geojson.json');
    const dataset = await d3.csv('./data/world_bank_data.csv');

    console.log(dataset)
    
    const countryNameAccessor = d => d.properties["NAME"];
    const countryIdAccessor = d => d.properties["ADM0_A3_IS"];
    const metric = "Population growth (annual %)";

    let metricDataByCountry = {};

    dataset.forEach(d => {
        if (d["Series Name"] != metric) return
        metricDataByCountry[d["Country Code"]] = +d["2017 [YR2017]"] || 0
    });

   
    // 2. dimensions
    let dimensions = {
        width: window.innerWidth * 0.9, 
        margin: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
        }, 
    }

    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right

    const sphere = ({type: "Sphere"}) // mock GeoJSON object
    const projection = d3.geoEqualEarth().fitWidth(dimensions.boundedWidth, sphere);
    // d3.geoPath() similar to d3.line() - creates a <path>
    const pathGenerator = d3.geoPath(projection);
    console.log(pathGenerator(sphere));
    // has a bounds() method that returns an array of [x, y] coordinates describing
    // a bounding box of GeoJSON object - this helps determine the height of generated path 
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere)

    dimensions.boundedHeight = y1;
    dimensions.height = dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom

    // 3. draw canvas
    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)

    const bounds = wrapper.append('g')
        .style(`transform`,`translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

    // 4. create scales
    const metricValues = Object.values(metricDataByCountry);
    const metricValueExtent = d3.extent(metricValues); // gives back smallest and largest

    /**
     * So far, we’ve only create scales that have one minimum and one maximum value for both their domain and range. But we can create piecewise scales, which are basically multiple scales in one. If we use a domain and range with more than two values, d3 will create a scale with more than two “anchors”.
        In this case, we want to create a scale with a “middle” population growth of 0% that converts to a middle color of white. Population growth amounts above 0 should be converted with a color scale from white (0) to green (5) and population growth amounts below 0 should be converted with a color scale from red (-2) to white (0).
     */
    // converting negative smallest to positive here (metricValueExtent[0] is negative already)
    const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]]);
    // Creating a piecewise scale like this is easier than it might seem: just add a middle value to both the domain and the range.
    const colorScale = d3.scaleLinear()
        .domain([-5, 0, 5]) // even scale allows viewer to see if countries are shrinking at same pace as growing, the colors on both ends will correlate
        // .domain([-maxChange, 0, maxChange]) // an uneven scale will maximize color scale, making clear distinctions, but can be confusing if light color in negative doesn't match light color in positive
        .range(["indigo", "white", "darkgreen"]);
    
    // 5. draw data
    const earth = bounds.append("path") 
        .attr("class", "earth") 
        .attr("d", pathGenerator(sphere));
    
    const graticuleJson = d3.geoGraticule10();

    const graticule = bounds.append('path')
        .attr('class', 'graticule')
        .attr('d', pathGenerator(graticuleJson))

    /**
     * First, we’ll select all of the elements with a class of .country. 
     * Remember: even though these elements don’t yet exist, this is priming our d3 selection object to bind data to similar elements.
     */
    const countries = bounds.selectAll(".country") 
        .data(countryShapes.features)
        .enter()
        .append('path')
        .attr("class", "country") 
        .attr("d", pathGenerator)
        .attr('fill', d => {
            const metricValue = metricDataByCountry[countryIdAccessor(d)];
            if (typeof metricValue === 'undefined') return '#e2e6e9'; // return white for countries that don't exist in data set
            return colorScale(metricValue)
        })

    // 6. Draw peripherals
    const legendGroup = wrapper.append('g')
        .attr('transform', `translate(${120}, ${dimensions.width < 800 ? dimensions.boundedHeight - 30 : dimensions.boundedHeight * 0.5})`)

    const legendTitle = legendGroup.append('text')
        .attr('y', -23)
        .attr('class', 'legend-title')
        .text('population growth')

    const legendByline = legendGroup.append('text')
        .attr('y', -9)
        .attr('class', 'legend-byline')
        .text('percent change in 2017')

    /**
     * Elements created within <defs> won’t be visible by themselves, but we can use them later. Let’s create a <defs> element to store a gradient.
     */
    const defs = wrapper.append('defs');
    const legendGradientId = "legend-gradient";

    const gradient = defs.append("linearGradient")
        .attr("id", legendGradientId)
        .selectAll('stop')
        .data(colorScale.range())
        .enter()
        .append('stop')
        .attr("stop-color", d => d)
        .attr('offset', (d, i) => `${
            i * 100 / 2 // 2 is one less than array length
        }%`)

    const legendWidth = 120;
    const legendHeight = 16;
    const legendGradient = legendGroup.append('rect')
        .attr('x', -legendWidth / 2)
        .attr('height', legendHeight)
        .attr('width', legendWidth)
        .style('fill', `url(#${legendGradientId})`)

    const legendValueRight = legendGroup.append("text") 
        .attr("class", "legend-value")
        .attr("x", legendWidth / 2 + 10)
        .attr("y", legendHeight / 2) 
        .text(`${d3.format(".1f")(maxChange)}%`)

    const legendValueLeft = legendGroup.append("text") 
        .attr("class", "legend-value")
        .attr("x", -legendWidth / 2 - 10)
        .attr("y", legendHeight / 2) 
        .text(`${d3.format(".1f")(-maxChange)}%`) 
        .style("text-anchor", "end")

    navigator.geolocation.getCurrentPosition(myPosition => { 
            const [x, y] = projection([ 
                myPosition.coords.longitude, 
                myPosition.coords.latitude
            ]);
            const myLocation = bounds.append("circle") 
                .attr("class", "my-location") 
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 0) 
                .transition()
                .duration(500)
                .attr("r", 10)
    })
    

    // 7. set up interactions

    countries
        .on("mouseenter", onMouseEnter) 
        .on("mouseleave", onMouseLeave)

    
    const tooltip = d3.select("#tooltip")

    function onMouseEnter(e, datum) {
         tooltip.style("opacity", 1)

         const metricValue = metricDataByCountry[countryIdAccessor(datum)]
         
         tooltip.select('#country')
            .text(countryNameAccessor(datum))

        tooltip.select('#value')
            .text(`${d3.format(",.2f")(metricValue || 0)}%`)

        /**
         * Remember how we used pathGenerator.bounds(sphere) to get the height of the entire globe? 
         * Our pathGenerator also has a .centroid() method that will give us the center of the passed GeoJSON object. 
         */
        const [centerX, centerY] = pathGenerator.centroid(datum)
        const x = centerX + dimensions.margin.left
        const y = centerY + dimensions.margin.top
        tooltip.style("transform", `translate(` + `calc( -50% + ${x}px),`
            + `calc(-100% + ${y}px)`
            + `)`)
        // const hoveredCircle = bounds.append("circle") 
        //     .attr("cx", centerX)
        //     .attr("cy", centerY)
        //     .attr("r", 3)
    }

    function onMouseLeave() {
         tooltip.style("opacity", 0)
    }
        
})()
