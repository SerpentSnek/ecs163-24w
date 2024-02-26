const width = window.innerWidth;
const height = window.innerHeight;

let scatterMargin = {top: 0.1*height, right: 0.05*width, bottom: 0.02*height, left: 0.05*width},
    scatterWidth = 0.4*width - scatterMargin.left - scatterMargin.right,
    scatterHeight = 0.55*height - scatterMargin.top - scatterMargin.bottom;

let barMargin = {top: 0.05*height, right: 0.05*width, bottom: 0.05*height, left: 0.05*width},
    barWidth = width - barMargin.left - barMargin.right,
    barHeight = 0.35*height - barMargin.top - barMargin.bottom;
let barTop = height-barHeight*2.8;

let parallelMargin = {top: 0.1*height, right: 0.05*width, bottom: 0.05*height, left: 0.05*width},
    parallelHeight = 0.25*height - parallelMargin.top - parallelMargin.bottom
    parallelWidth = 0.35*width - parallelMargin.left - parallelMargin.right;

// helper functions for drawCircleRadiusSpeedLegend()
const radiusScale = d3.scaleLinear() // to dynamically scale the CircleRadiusSpeedLegend
    .domain([0, 160]) 
    .range([1, 10]);
const speedCircleRadiusScale = d3.scaleOrdinal()
    .domain(["Min Radius: 5 Speed", "Middle Radius: 82.5 Speed" , "Max Radius: 160 Speed" ])
    .range([radiusScale(5),radiusScale(82.5),radiusScale(160)])

// helper function for drawPokeTypeColorLegend()
const pokeTypeColorScale = d3.scaleOrdinal() // used colorbrewer to get approximate color matches to the main color of each Pokemon type, using categorical color palette
    .domain(["Grass","Fire","Water","Bug","Normal","Poison","Electric","Ground","Fairy","Fighting","Psychic","Rock","Ghost","Ice","Dragon","Dark","Steel","Flying"])
    .range(["#33a02c","#ff7f00","#a6cee3","#b2df8a","#8b8b00","#6a3d9a","#ffff99","#fdbf6f","#fde0dd","#e31a1c","#fb9a99","#cdcd00","#9e9ac8","#8dd3c7","#1f78b4","#b15928","#878787","#cab2d6"])

// unused helper function
const pokeBodyStyleColorScale = d3.scaleOrdinal() // used colorbrewer qualitative scale for categorical data
    .domain(["quadruped", "bipedal_tailed", "insectoid", "serpentine_body", "four_wings", "two_wings", "bipedal_tailless", "head_legs", "head_base", "multiple_bodies", "several_limbs", "head_arms", "with_fins","head_only"])
    .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928", "#000000", "#808588"])

// load data, call visualization and legend functions
d3.csv("pokemon.csv").then(rawData =>{
    console.log("rawData:", rawData);
    console.log("Columns:",rawData.columns);

    const uniqueTypes = [...new Set(rawData.map(d => d.Type_1))];
    console.log("PokeTypes:", uniqueTypes); // identifying pokeTypes

    const uniqueBodyStyle = [...new Set(rawData.map(d => d.Body_Style))];
    console.log("Body Styles:", uniqueBodyStyle); // identifying poke Body Styles

    rawData.forEach(function(d){ // convert relevant data from string to number
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
        d.Speed= Number(d.Speed);
    });
    setupVis1(rawData);

    // determine radius sizes to include on the CircleRadiusSpeedLegend
    console.log("Min", d3.min(rawData, d => d.Speed));
    console.log("Middle", ((d3.min(rawData, d => d.Speed)+(d3.max(rawData, d => d.Speed))) / 2.0));
    console.log("Max", d3.max(rawData, d => d.Speed));
    drawCircleRadiusSpeedLegend(speedCircleRadiusScale)
    
    setupVis2(rawData);
    setupVis3(rawData);
    drawPokeTypeColorLegend(pokeTypeColorScale);
    
}).catch(function(error){
    console.log(error);
});

// POKEMON DASHBOARD: LOOKING INTO WHAT KIND OF POKEMON TYPES ARE MOST DESIRABLE
// Context: In the Pokemon community, when a new pack of cards is opened, the first part of the card that sticks out is its color.
// Since color indicates Pokemon type, I wanted to investigate whether seeing certain colors (aka Pokemon Types)
// could be considered as immediately more desirable and a good sign that the Pokemon drawn is powerful.

// Visualization 1 is a scatterplot context view. For every Pokemon in the dataset, it displays any correlations between Attack and Defense points. 
// The size of the circle displays the Speed points. The color displays the Pokemon type. I wanted to use a scatter plot to see if any clusters existed,
// which would indicate that certain Pokemon types tend to have a specific combination of Attack, Defense, and Speed.
function setupVis1(rawData){ // scatter plot
    const svg = d3.select("svg")

    const g1 = svg.append("g") // g1 = group for the entire scatterplot
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

    // SETUP
    // Plot Title label
    g1.append("text")
    .attr("x", scatterWidth*0.6)
    .attr("y", -scatterHeight*0.05)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Context View: Scatter Plot of Attack, Defense, and Speed Points")

    // X label
    g1.append("text")
    .attr("x", scatterWidth*0.5)
    .attr("y", scatterHeight*1.11)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Attack")

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight*0.5))
    .attr("y", -scatterHeight*0.1)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Defense")

    // X ticks
    const x1 = d3.scaleLinear() // create linear scale for attack
    .domain([0, d3.max(rawData, d => d.Attack)]) 
    .range([0, scatterWidth])

    const xAxisCall = d3.axisBottom(x1) // create attack axis ticks
        .ticks(20)
    g1.append("g").call(xAxisCall)

    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y1 = d3.scaleLinear() // create linear scale for defense
    .domain([0, d3.max(rawData, d => d.Defense)])
    .range([scatterHeight, 0])

    const yAxisCall = d3.axisLeft(y1) // create defense axis ticks
        .ticks(30)
    g1.append("g").call(yAxisCall)

    const zScale = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.Speed)]) // Define the domain based on the range of Speed values
        .range([1, 10]);

    // DRAW PLOT 1
    const rects = g1.selectAll("circle").data(rawData) // data join

    rects.enter().append("circle")
        .attr("cx", function(d){
            return x1(d.Attack);
        })
        .attr("cy", function(d){
            return y1(d.Defense);
        })
        .attr("r", function(d){
            return zScale(d.Speed);
        }) // circle radius pixels
        .attr("fill", function(d){
            return pokeTypeColorScale(d.Type_1); // display scatter point based on type
        });
}

// Helper function to draw a legend for the Vis1 Scatter Plot
function drawCircleRadiusSpeedLegend(speedCircleRadiusScale){ // to display legend, used for all 3 plots
    const svg = d3.select("svg");

    speedLegendData = speedCircleRadiusScale.domain();
    console.log(speedLegendData)

    const speedLegend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${0.30*width}, ${height*0.12})`);

    let y = 0;
    for (const name of speedLegendData) {
        const legendItem = speedLegend.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(0, ${y})`);

        console.log(speedCircleRadiusScale(name));
        console.log(name);

        legendItem.append("circle")
            .attr("r", speedCircleRadiusScale(name))
            .style("fill", "#000000");

        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 0)
            .attr("dy", "10")
            .text(name);

        y += 40; 
    }
}

// Helper function to calculate the median
function median(values){ // helper function to segment data for focus view
    if(values.length === 0) return 0;
    sorted = values.sort((a,b) => a-b); // sort in ascending order
    const half = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0){ // if even length
        return (sorted[half-1] + sorted[half]) / 2.0;
    }else{ // if odd length
        return sorted[half];
    }
}

// Helper function to filter data for the focus views, which only concern Above-Median Pokemons
// Above-Median Pokemons are in the upper half of Attack, Defense, AND Speed point categories
// This essentially focuses on the top and right-most areas of the scatter plot in Vis1 
function filterUpperMedian(rawData){ // helper function to filter rawData, only keeping Pokemon with above-median attack, defense, and speed
    // only retain the part of the dataset where pokemon are in the upper median of every category
    const attackArray = rawData.map(d => d.Attack);
    const defenseArray = rawData.map(d => d.Defense);
    const speedArray = rawData.map(d=> d.Speed);
    
    rawDataFiltered = rawData.filter(d=> d.Attack>median(attackArray) &&
                            d.Defense>median(defenseArray) &&
                            d.Speed>median(speedArray));
    return rawDataFiltered;
}

// Visualization 2 is a bar chart focus view. 
// It only looks at Above-Median Pokemons, which are in the upper half of Attack, Defense, AND Speed point categories
// I wanted to get an idea of how many Pokemons are in each Pokemon Type category, to identify whether certain Types tend to have more powerful Pokemon
function setupVis2(rawData){ // bar chart
    // only retain the part of the dataset where pokemon are in the upper median of attack, defense, and speed category
    rawData1 = filterUpperMedian(rawData);
    console.log("Vis2 Dataset: ", rawData1);

    // reduce initializes an empty {} accumulator, and looks at the {Type_1} attribute of rawData1
    // in accumulator[Type_1] || 0, if it is the first time seeing a type, its initialized to 0 instead of undefined, and if not it keeps the old value. either way, +1
    counts = rawData1.reduce((accumulator, { Type_1 }) => (accumulator[Type_1] = (accumulator[Type_1] || 0) + 1, accumulator), {}); // get data for bar chart
    console.log(counts);
    categories= Object.keys(counts).map((key) => ({ Type_1: key, count: counts[key] }));
    console.log(categories);

    const svg = d3.select("svg")

    const g2 = svg.append("g")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
        .attr("transform", `translate(${barMargin.left}, ${0.95*height-barTop})`)
    
    // Plot Title label
    g2.append("text")
    .attr("x", barWidth*0.25)
    .attr("y", -barHeight*0.08)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Focus View: Bar Chart of Pokemons with Above-Median Attack, Defense, and Speed Points")

    // X label
    g2.append("text")
    .attr("x", barWidth*0.4)
    .attr("y", barHeight*1.25)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Pokemon Type")
    
    // Y label
    g2.append("text")
    .attr("x", -(barHeight*0.5))
    .attr("y", -barWidth*0.02)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number Of Pokemon")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(categories.map(d => d.Type_1))
    .range([0, barWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g2.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")
        .attr("font-size", "14px")

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(categories, d => d.count)])
    .range([barHeight, 0])

    const yAxisCall2 = d3.axisLeft(y2)
        .ticks(10)
    g2.append("g").call(yAxisCall2)

    // draw bars
    const rects2 = g2.selectAll("rect").data(categories)

    rects2.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", (d) => x2(d.Type_1))
    .attr("width", x2.bandwidth)
    .attr("height", d => barHeight - y2(d.count))
    .attr("fill", function(d){
        return pokeTypeColorScale(d.Type_1); // display scatter point based on type
    })
}

// Visualization 3 is an advanced parallel coordinates plot focus view. 
// Again, it only looks at Above-Median Pokemons, which are in the upper half of Attack, Defense, AND Speed point categories
// However, this plot goes deeper by including all 6 Pokemon attributes that contribute to their Total score: Attack, Defense, Speed, HP, Sp_Atk, and Sp_Def
// I also wanted to investigate any connections between all 6 skill attributes, to see whether for example higher Attack correlated to lower Defense
function setupVis3(rawData){ // parallel coordinates plot
    // only retain the part of the dataset where pokemon are in the upper median of attack, defense, and speed category
    rawData2 = filterUpperMedian(rawData);
    console.log("Vis3 Dataset v1: ", rawData2);

    keptAttributes = ["HP","Attack","Defense","Sp_Atk","Sp_Def","Speed"];
    const rawData3 = rawData2.map(row => {
        const newObj = {}; 
        keptAttributes.forEach(attr => {
            newObj[attr] = row[attr];
        });
        return newObj;
    })
    console.log("Vis3 Dataset v2", rawData3);

    const svg = d3.select("svg")

    const g3 = svg.append("g")
        .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
        .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
        .attr("transform", `translate(${0.9*width-parallelWidth}, ${height*0.15})`)
    
    // Plot Title label
    g3.append("text")
    .attr("x", parallelWidth*0.45)
    .attr("y", -parallelHeight)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Focus View: Parallel Coordinate Plot of Points")
    
    g3.append("text")
    .attr("x", parallelWidth*0.45)
    .attr("y", -parallelHeight*0.8)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("in All Rating Categories for Above-Median Pokemons")

    g3.append("text")
    .attr("x", parallelWidth*0.45)
    .attr("y", -parallelHeight*0.5)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("NOTE: Color of paths is not representative")

    g3.append("text")
    .attr("x", parallelWidth*0.45)
    .attr("y", -parallelHeight*0.3)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text(" of a Pokemon Type")

    var scaledObjs = {};
    for (i in keptAttributes){
        categoryName = keptAttributes[i]
        scaledObjs[categoryName] = d3.scaleLinear()
        .domain([0, d3.max(rawData3, d=>d[categoryName])])
        .range([0,parallelWidth])
    };

    const x3 = d3.scaleBand()
        .domain(keptAttributes)
        .range([0, parallelWidth])
        .paddingInner(0.3)
        .paddingOuter(0.2)

    function getPath(d){ // referenced from d3 parallel coordinates plot template
        return d3.line()(keptAttributes.map(function(p){return [x3(p), scaledObjs[p](d[p])];}));
    }

    g3.selectAll("pokemonPath")
    .data(rawData3).enter().append("path")
    .attr("d", getPath)
    .style("fill","none")
    .style("stroke","#41b6c4")
    .style("opacity",5);
    //#67001f
    
    g3.selectAll("pokemonAxis")
    .data(keptAttributes).enter().append("g")
    .attr("transform", function(d){return "translate(" + x3(d) + ")";})
    .each(function(d){
        d3.select(this).call(d3.axisLeft().scale(scaledObjs[d]));
    })
    .append("text")
    .attr("y",-9)
    .style("text-anchor","middle")
    .text(function(d){return d;})
    .style("fill","black");
}

// Helper function to draw a legend for Pokemon Type
function drawPokeTypeColorLegend(pokeTypeColorScale){ // to display legend, used for all 3 plots
    const svg = d3.select("svg");

    legendData = pokeTypeColorScale.domain();
    console.log(legendData)

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${0.49*width}, ${height*0.15})`);

    let y = 0;
    for (const name of legendData) {
        const legendItem = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(0, ${y})`);

        legendItem.append("rect")
            .attr("width", 50)
            .attr("height", 20)
            .style("fill", pokeTypeColorScale(name));

        legendItem.append("text")
            .attr("x", 60)
            .attr("y", 5)
            .attr("dy", "10")
            .text(name);

        y += 20; 
    }
}