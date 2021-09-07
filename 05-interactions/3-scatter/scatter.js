async function drawScatter() {

  //..................................................
  // 1. data
  const pathToJSON = './my_weather_data.json'
  const dataset = await d3.json(pathToJSON)

  const xAccessor = d => d.dewPoint
  const yAccessor = d => d.humidity

  //..................................................
  // 2. dimensions

  const width = d3.min([
    window.innerWidth * 0.9,
    window.innerHeight * 0.9,
  ])
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  //..................................................
  // 3. canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  
  //..................................................
  // 4. scales

  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice()

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  // 5. draw data
  const drawDots = (dataset) => {
    const dots = bounds.selectAll("circle")
      .data(dataset, d => d[0])

    const newDots = dots.enter().append("circle")

    const allDots = newDots.merge(dots)
        .attr("cx", d => xScale(xAccessor(d)))
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", 4)

    const oldDots = dots.exit()
        .remove()
  }
  drawDots(dataset)


  // individual scatter points make for poor UX when hovering, lets use a voronoi diagram
  // instead of using the deprecated voronoi generator built into D3 - d3-voronoi - we will be using the speedier third-party library d3-delaunay
  // Create a new Delaunay triangulation passing in our dataset, x accessor function, and y accessor function
  const delaunay = d3.Delaunay.from(dataset, d => xScale(xAccessor(d)), d => yScale(yAccessor(d)))

  // Turn delaunay triangulation into a voronoi diagram
  const voronoi = delaunay.voronoi()
  // set size to override default 960 x 500
  voronoi.xmax = dimensions.boundedWidth
  voronoi.ymax = dimensions.boundedHeight

  bounds.selectAll(".voronoi")
    .data(dataset)  // bind data
    .enter() // for new points
    .append("path") // add a <path>
    .attr("class", "voronoi") // with a class of .voronoi for styling
    .attr("d", (d, i) => voronoi.renderCell(i)) // Create each path's d attribute string by passing voronoi.renderCell() the index of our data point
    // .attr("stroke", "salmon")


  //..................................................
  // 6. draw peripherals

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const xAxisLabel = xAxis.append("text")
      .attr("class", "x-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)
      .html("dew point (&deg;F)")

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4)

  const yAxis = bounds.append("g")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("y", -dimensions.margin.left + 10)
      .text("relative humidity")

  //..................................................
  // 7. interactions
  bounds.selectAll(".voronoi")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)

  const tooltip = d3.select("#tooltip")

  function onMouseEnter(e, datum) {
    // we can change the color of the corresponding hovered dot by filtering and matching the current datum
    // but can run into z-index issues w/ other circles
    // so instead just draw another circle over the top
    const dayDot = bounds.append("circle")
        .attr("class", "tooltipDot")
        .attr("cx", d => xScale(xAccessor(datum))) // place at
        .attr("cy", d => yScale(yAccessor(datum))) // same location
        .attr("r", 7)
        .style("fill", "maroon")
        .style("pointer-events", "none")

    // We want to display the metric on our x axis (dew point) and the metric on our y axis (humidity)
    const formatDewPoint = d3.format(".2f")
    tooltip.select("#dew-point").text(formatDewPoint(xAccessor(datum)))

    const formatHumidity = d3.format(".2f")
    tooltip.select("#humidity").text(formatHumidity(yAccessor(datum)))

    // // Let's log the date (ex "2019-01-01") in a friendlier format use timeParse()
    // const dateParser = d3.timeParse("%Y-%m-%d")
    // console.log(dateParser(datum.date)) // Thu Sep 06 2018 00:00:00 GMT-0700 (Pacific Daylight Time)

    // Let's use timeFormat() to take a date formatter string and return a formatter function - see https://github.com/d3/d3-time-format
    const dateParser = d3.timeParse("%Y-%m-%d")
    const formatDate = d3.timeFormat("%A, %B %d, %Y") // Thursday, September 06, 2018

    // Plug the new date string into our tooltip
    tooltip.select("#date").text(formatDate(dateParser(datum.date)))

    // Grab the x and y value of our dot; offset by the left and top margins
    const x = xScale(xAccessor(datum)) + dimensions.margin.left
    const y = yScale(yAccessor(datum)) + dimensions.margin.top

    tooltip.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)

    // Make our tooltip visible
    tooltip.style("opacity", 1)

  }
  function onMouseLeave(datum, index) {
    tooltip.style("opacity", 0) // Hide our tooltip
    d3.selectAll(".tooltipDot").remove()  // Remove the dot drawn by the tooltip hover
  }
}
drawScatter()