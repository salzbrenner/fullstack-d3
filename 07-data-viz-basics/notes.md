# Qualitative

Qualitative data (strings) does not have a numerical value, but it can be put into categories. For example, precipType can either have a value of “rain” or “snow”.

***Binary*** data can be placed into only two categories

For example, if our weather data had an did rain metric that was either true or false,
that metric would be binary.

***Nominal*** data can be placed multiple categories that don’t have a natural order.

For example, our weather data has the metric icon with values such as clear-day
and wind — these values can’t be ordered.

***Ordinal*** data can be placed in multiple categories with a natural order.

For example, if our weather data instead represented wind speed values with not
windy, somewhat windy, and very windy, that metric would be ordinal.

# Quantitative
Quantitative data (numbers) is numerical and can be measured objectively. For
example, temperatureMax has values ranging from 10°F to 100°F.

***Discrete*** data has numerical values that can’t be interpolated between, such as a metric that can only be represented by an integer (whole number).

A classic example is number of kids — a family can have 1 or 2 kids, but not 1.5 kids. With weather data, a good example would be number of tornados that happened.

***Continuous*** data has numerical values that can be interpolated between. Usually a metric will fall under this category — for example, max temperature can be 50°F or 51°F or 50.5°F.

# Colors

When choosing a color scale, identify its purpose.

3 basic use cases:

1. Representing a category - binary and nominal, use d3-scale-chromatic schemes
2. Representing a continuous metric - d3-scale-chromatic sequential scales - get more visually clear at end of scale - ie goes from gray to dark blue (so good for highlighing high end values)
3. Representing a diverging metric - good for representing both high and low values - diverging scales start with and end with a very saturated/dark color w/ less intense middle range

## Custom color scales

use d3-interpolate

d3.interpolateRgb("cyan", "tomato") from cyan to tomato



## d3-color

hcl is ideal for creating charts

While the browser will recognize colors in rgb and hsl formats, there isn’t much native functionality for manipulating colors. The d3-color60 module has methods for recognizing colors in the hcl format, for converting between formats, and for manipulating colors along the color space dimensions.