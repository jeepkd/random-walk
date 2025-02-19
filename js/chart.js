var dim = {
  width: 960, height: 500,
  margin: { top: 20, right: 50, bottom: 30, left: 50 },
  ohlc: { height: 305 },
  indicator: { height: 65, padding: 5 }
};
dim.plot = {
  width: dim.width - dim.margin.left - dim.margin.right,
  height: dim.height - dim.margin.top - dim.margin.bottom
};
dim.indicator.top = dim.ohlc.height+dim.indicator.padding;
dim.indicator.bottom = dim.indicator.top+dim.indicator.height+dim.indicator.padding;
var indicatorTop = d3.scaleLinear()
    .range([dim.indicator.top, dim.indicator.bottom]);
var parseDate = d3.timeParse("%d-%b-%y");
var zoom = d3.zoom()
    .on("zoom", zoomed);
var x = techan.scale.financetime()
    .range([0, dim.plot.width]);
var y = d3.scaleLinear()
    .range([dim.ohlc.height, 0]);
var yPercent = y.copy();   // Same as y at this stage, will get a different domain later
var yInit, yPercentInit, zoomableInit;
var yVolume = d3.scaleLinear()
    .range([y(0), y(0.2)]);
var candlestick = techan.plot.candlestick()
    .xScale(x)
    .yScale(y);
var sma0 = techan.plot.sma()
    .xScale(x)
    .yScale(y);
var sma1 = techan.plot.sma()
    .xScale(x)
    .yScale(y);
var ema2 = techan.plot.ema()
    .xScale(x)
    .yScale(y);
var volume = techan.plot.volume()
    .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
    .xScale(x)
    .yScale(yVolume);
var supstance = techan.plot.supstance()
    .xScale(x)
    .yScale(y);
var xAxis = d3.axisBottom(x);
var timeAnnotation = techan.plot.axisannotation()
    .axis(xAxis)
    .orient('bottom')
    .format(d3.timeFormat('%Y-%m-%d'))
    .width(65)
    .translate([0, dim.plot.height]);
var yAxis = d3.axisRight(y);
var ohlcAnnotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('right')
    .format(d3.format(',.2f'))
    .translate([x(1), 0]);
var closeAnnotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('right')
    .accessor(candlestick.accessor())
    .format(d3.format(',.2f'))
    .translate([x(1), 0]);
var percentAxis = d3.axisLeft(yPercent)
    .tickFormat(d3.format('+.1%'));
var percentAnnotation = techan.plot.axisannotation()
    .axis(percentAxis)
    .orient('left');
var volumeAxis = d3.axisRight(yVolume)
    .ticks(3)
    .tickFormat(d3.format(",.3s"));
var volumeAnnotation = techan.plot.axisannotation()
    .axis(volumeAxis)
    .orient("right")
    .width(35);
var macdScale = d3.scaleLinear()
    .range([indicatorTop(0)+dim.indicator.height, indicatorTop(0)]);
var rsiScale = macdScale.copy()
    .range([indicatorTop(1)+dim.indicator.height, indicatorTop(1)]);
var macd = techan.plot.macd()
    .xScale(x)
    .yScale(macdScale);
var macdAxis = d3.axisRight(macdScale)
    .ticks(3);
var macdAnnotation = techan.plot.axisannotation()
    .axis(macdAxis)
    .orient("right")
    .format(d3.format(',.2f'))
    .translate([x(1), 0]);
var macdAxisLeft = d3.axisLeft(macdScale)
    .ticks(3);
var macdAnnotationLeft = techan.plot.axisannotation()
    .axis(macdAxisLeft)
    .orient("left")
    .format(d3.format(',.2f'));
var rsi = techan.plot.rsi()
    .xScale(x)
    .yScale(rsiScale);
var rsiAxis = d3.axisRight(rsiScale)
    .ticks(3);
var rsiAnnotation = techan.plot.axisannotation()
    .axis(rsiAxis)
    .orient("right")
    .format(d3.format(',.2f'))
    .translate([x(1), 0]);
var rsiAxisLeft = d3.axisLeft(rsiScale)
    .ticks(3);
var rsiAnnotationLeft = techan.plot.axisannotation()
    .axis(rsiAxisLeft)
    .orient("left")
    .format(d3.format(',.2f'));
var ohlcCrosshair = techan.plot.crosshair()
    .xScale(timeAnnotation.axis().scale())
    .yScale(ohlcAnnotation.axis().scale())
    .xAnnotation(timeAnnotation)
    .yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation])
    .verticalWireRange([0, dim.plot.height]);
var macdCrosshair = techan.plot.crosshair()
    .xScale(timeAnnotation.axis().scale())
    .yScale(macdAnnotation.axis().scale())
    .xAnnotation(timeAnnotation)
    .yAnnotation([macdAnnotation, macdAnnotationLeft])
    .verticalWireRange([0, dim.plot.height]);
var rsiCrosshair = techan.plot.crosshair()
    .xScale(timeAnnotation.axis().scale())
    .yScale(rsiAnnotation.axis().scale())
    .xAnnotation(timeAnnotation)
    .yAnnotation([rsiAnnotation, rsiAnnotationLeft])
    .verticalWireRange([0, dim.plot.height]);
var svg = d3.select("#chart-display").append("svg")
    .attr("width", dim.width)
    .attr("height", dim.height);
var defs = svg.append("defs");
defs.append("clipPath")
    .attr("id", "ohlcClip")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", dim.plot.width)
    .attr("height", dim.ohlc.height);
defs.selectAll("indicatorClip").data([0, 1])
    .enter()
    .append("clipPath")
    .attr("id", function(d, i) { return "indicatorClip-" + i; })
    .append("rect")
    .attr("x", 0)
    .attr("y", function(d, i) { return indicatorTop(i); })
    .attr("width", dim.plot.width)
    .attr("height", dim.indicator.height);
svg = svg.append("g")
    .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + dim.plot.height + ")");
var ohlcSelection = svg.append("g")
    .attr("class", "ohlc")
    .attr("transform", "translate(0,0)");
ohlcSelection.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + x(1) + ",0)")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -12)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price ($)");
ohlcSelection.append("g")
    .attr("class", "close annotation up");
ohlcSelection.append("g")
    .attr("class", "volume")
    .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
    .attr("class", "candlestick")
    .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
    .attr("class", "indicator sma ma-0")
    .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
    .attr("class", "indicator sma ma-1")
    .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
    .attr("class", "indicator ema ma-2")
    .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
    .attr("class", "percent axis");
ohlcSelection.append("g")
    .attr("class", "volume axis");
var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd", "rsi"]).enter()
    .append("g")
    .attr("class", function(d) { return d + " indicator"; });
indicatorSelection.append("g")
    .attr("class", "axis right")
    .attr("transform", "translate(" + x(1) + ",0)");
indicatorSelection.append("g")
    .attr("class", "axis left")
    .attr("transform", "translate(" + x(0) + ",0)");
indicatorSelection.append("g")
    .attr("class", "indicator-plot")
    .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });
// Add trendlines and other interactions last to be above zoom pane
svg.append('g')
    .attr("class", "crosshair ohlc");
svg.append('g')
    .attr("class", "crosshair macd");
svg.append('g')
    .attr("class", "crosshair rsi");
d3.select(".reset-btn").on("click", reset);

var accessor = candlestick.accessor(),
    indicatorPreRoll = 33;  // Don't show where indicators don't have data
data = random_data()
data = data.sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
x.domain(techan.scale.plot.time(data).domain());
y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
yVolume.domain(techan.scale.plot.volume(data).domain());
var macdData = techan.indicator.macd()(data);
macdScale.domain(techan.scale.plot.macd(macdData).domain());
var rsiData = techan.indicator.rsi()(data);
rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());
svg.select("g.candlestick").datum(data).call(candlestick);
svg.select("g.close.annotation").datum([data[data.length-1]]).call(closeAnnotation);
svg.select("g.volume").datum(data).call(volume);
svg.select("g.sma.ma-0").datum(techan.indicator.ema().period(12)(data)).call(sma0);
svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(26)(data)).call(sma1);
svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);
svg.select("g.macd .indicator-plot").datum(macdData).call(macd);
svg.select("g.rsi .indicator-plot").datum(rsiData).call(rsi);
svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
// Stash for zooming
zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy(); // Zoom in a little to hide indicator preroll
yInit = y.copy();
yPercentInit = yPercent.copy();
draw();

function reset() {
    // zoom.scale(1);
    // zoom.translate([0,0]);
    draw();
}
function zoomed() {
    x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
    y.domain(d3.event.transform.rescaleY(yInit).domain());
    yPercent.domain(d3.event.transform.rescaleY(yPercentInit).domain());
    draw();
}
function draw() {
    svg.select("g.x.axis").call(xAxis);
    svg.select("g.ohlc .axis").call(yAxis);
    svg.select("g.volume.axis").call(volumeAxis);
    svg.select("g.percent.axis").call(percentAxis);
    svg.select("g.macd .axis.right").call(macdAxis);
    svg.select("g.rsi .axis.right").call(rsiAxis);
    svg.select("g.macd .axis.left").call(macdAxisLeft);
    svg.select("g.rsi .axis.left").call(rsiAxisLeft);
    // We know the data does not change, a simple refresh that does not perform data joins will suffice.
    svg.select("g.candlestick").call(candlestick.refresh);
    svg.select("g.close.annotation").call(closeAnnotation.refresh);
    svg.select("g.volume").call(volume.refresh);
    svg.select("g .sma.ma-0").call(sma0.refresh);
    svg.select("g .sma.ma-1").call(sma1.refresh);
    svg.select("g .ema.ma-2").call(ema2.refresh);
    svg.select("g.macd .indicator-plot").call(macd.refresh);
    svg.select("g.rsi .indicator-plot").call(rsi.refresh);
    svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh);
    svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
    svg.select("g.crosshair.rsi").call(rsiCrosshair.refresh);
}

function round(value, step) {
    step || (step = 1.0)
    var inv = 1.0 / step
    return Math.round(value * inv) / inv
}

function randn_bm() {
    var u = 1 - Math.random()
    var v = 1 - Math.random()
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
}

function random_data(n, step, max_ratio) {
    n || (n = 250)
    step || (step = 0.5)
    max_ratio || (max_ratio = 0.30)

    base_price = round((Math.random() * 50 + 100), step)
    base_date = new Date()
    data = []
    n_tick_bar = 8

    for (i = 0; i<n; i++) {
        max_change = base_price * max_ratio;
        random_numbers = []
        number = base_price
        for (rdi = 0; rdi < n_tick_bar; rdi++) {
            number = number + step * Math.round(Math.random()*4 - 2.0)
            if (number > base_price + max_change) number = base_price + max_change
            if (number < base_price - max_change) number = base_price - max_change
            random_numbers.push(round(number, step))
        }
        data.push({
            date: base_date,
            open: base_price,
            high: Math.max(...random_numbers),
            low: Math.min(...random_numbers),
            close: random_numbers[n_tick_bar - 1],
            volume: 2000*Math.random() + 50000*(Math.max(...random_numbers) - Math.min(...random_numbers))
        })
        base_price = data[i].close
        base_date = new Date(base_date)
        base_date.setDate(base_date.getDate() + 1)
    }
    return data
}
