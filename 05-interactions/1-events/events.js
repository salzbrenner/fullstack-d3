async function createEvent() {
    const rectColors = ['yellowgreen', 'cornflowerblue', 'seagreen', 'slateblue']
  
    // create and bind data to our rects
    const rects = d3
      .select('#svg')
      .selectAll('.rect')
      .data(rectColors)
      // For all new data points, append a rect
      .enter()
      .append('rect')
      .attr('height', 100)
      .attr('width', 100)
      .attr('x', (d, i) => i * 110)
      .attr('fill', 'lightgrey')

    
    rects.on('mouseenter', function(e, data) {
      d3.select(this).style("fill", data)
    }).on('mouseleave', function(e, data) {
      d3.select(this).style("fill", "lightgrey")
    })
  
    setTimeout(() => {
      // This removes our listeners, but notice how we can have a box "stuck" in a mouseenter state...
      // rects.on('mouseenter', null).on('mouseout', null)
  
      // For this example, we can dispatch a mouseout event to ensure our boxes are not "stuck" before passing null
      rects.dispatch("mouseleave").on('mouseenter', null).on('mouseleave', null)
    }, 3000)
  }
  createEvent()