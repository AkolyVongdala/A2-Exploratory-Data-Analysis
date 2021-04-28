import React from "react";
import { useFetch } from "./hooks/useFetch";
import { scaleLinear } from "d3-scale";
import { extent, max, min, bin } from "d3-array";
import { scale } from "vega";
import * as topojson from "topojson-client";
import world from "../land-50m";
// import world from "../states-10m.json";


const App = () => {
    const [data, loading] = useFetch(
        "https://raw.githubusercontent.com/AkolyVongdala/A2-Exploratory-Data-Analysis/main/data/weather.csv"
    );

    const dataSmallSample = data.slice(0, 5000);
    const TMAXextent = extent(dataSmallSample, (d) => {
        return +d.TMAX;
    });

    const TMINextent = extent(dataSmallSample, (d) => {
        return +d.TMIN;
    });

    const PRCPextent = extent(dataSmallSample, (d) => {
        return +d.PRCP;
    });

    const land = topojson.feature(world, world.objects.land);
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath(projection);
    const mapPathString = path(land);

    const chartSize = 500;
    const margin = 20;
    const axisTextAlignmentFactor = 3;
    const yScale = scaleLinear()
    .domain(TMAXextent) // unit: km
    .range([chartSize - margin, chartSize - 350]); // unit: pixels

    const xScale = scaleLinear()
    .domain(TMINextent) // unit: km
    .range([chartSize - margin, chartSize - 350]); // unit: pixels

    const pScale = scaleLinear()
    .domain(PRCPextent) // unit: km
    .range([chartSize - margin, chartSize - 350]); // unit: pixels

    // bin is a function 
    _bins = bin().thresholds(35);
    tmaxBins = _bins(
        dataSmallSample.map((d) => {
            return +d.TMAX;
        })
    );

    const histogramLeftPadding = 20;

    console.log("from hook", loading, data);
    return (
        <div>
            <p>{loading && "Loading data!"}</p>
            
            {/* Introduction */}
            <h2>Dataset: Daily Weather in the U.S., 2017</h2>
            <p>This dataset contains daily weather measurements from weather stations across the US in 2017, provided by the <a target="_black" href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">NOAA Daily Global Historical Climatology Network.</a> This data has been transformed and there are a total of 1,000 weather measurements: some weather stations with only sparse measurements have been filtered out. </p>
            <p>Column description:</p>
            <p>
            PRCP = Precipitation (inch),
            SNOW = Snowfall (inch),
            SNWD = Snow depth (inch),
            TMAX = Maximum temperature (F),
            TMIN = Minimum temperature (F),
            TAVG = Average temperature (F),
            AWND = Average daily wind speed (miles / hour),
            WSF5 = Fastest 5-second wind speed (miles / hour),
            WDF5 = Direction of fastest 5-second wind (degrees)
            </p>

            <hr />
            {/* Analysis questions*/}
            <h2>Analysis Questions</h2>
            <p>Does Washington State have a unique climate compared to other U.S. States? </p>

            <h4>Specific Questions:</h4>
            <p>1. Compared to other states, is Washington state average temperature normal?</p>
            <p>2. Is Washington one of the states with the highest recorded temperature?</p>
            <p>3. Is Washington one of the states with the lowest recorded temperature?</p>
            <p>4. What is the average snowfall per state recorded in 2017?</p>

            <hr />
            {/* SVG Work */}
            <p>Sanity check to see if all data points are from the U.S. States. Noticed there are small amount of data points from U.S. territories like Guam, 
                Puerto Rico, and U.S. Virgin Islands. Based on this observation, the data will be transformed to include only U.S. state data.</p>
            <svg width={1000} height={600} style={{ border: "1px solid black" }}>
                <path d={mapPathString} fill="rgb(200, 200, 200)" />
                {dataSmallSample.map((measurement) => {
                return (
                    <circle
                    transform={`translate(
                        ${projection([measurement.longitude, measurement.latitude])})`}
                    r=".7"
                    stroke = {"steelblue"}
                    strokeOpacity = "0.2"
                    />
                );
                })}
            </svg>


            <h3>Distribution of average temperature</h3>
            <p>Comparing Washington state daily average tempereature (red) to the rest of the country's (blue) daily average temperature. Despite some salient differences for lower average temperature, 
                Washington state and other U.S. State average temperature have a high level of association.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "WA";
                  return <circle 
                            key={index} 
                            cx={highlight ? chartSize/2 : chartSize / 2 + 20} 
                            cy={chartSize - margin - measurement.TAVG} 
                            fill = "none"
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = "0.2"
                            r="3" />
                })}
            </svg>

            <h3>Distribution of max temperature</h3>
            <p>Examining Washington state highest/max temperatures compared to the rest of the states. 
                In comparison to other U.S. states, Washington State (red) max temperature stays consistent from 70 - 85 F as indicated 
                by the opacity of the red.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 - 12} 
                    textAnchor="end"
                    y={yScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 - 15} 
                    textAnchor="end"
                    y={yScale(100) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    100
                </text>
                <line 
                    x1={chartSize/2 - 10} 
                    y1={yScale(100)} 
                    x2={chartSize / 2 - 5} 
                    y2={yScale(100)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 - 10} 
                    y1={yScale(0)} 
                    x2={chartSize / 2 - 5} 
                    y2={yScale(0)}
                    stroke = {"black"}                
                />
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "WA";
                  return <line 
                            key={index}
                            x1={highlight ? chartSize/2 : chartSize/2 + 20} 
                            y1={yScale(measurement.TMAX)}
                            x2={highlight ? chartSize / 2 + 20 : chartSize/2 + 40} 
                            y2={yScale(measurement.TMAX)} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {.5}
                        />
                })}
            </svg>

            <h3>Vs. Distribution of max temperature of all U.S. States</h3>
            <p>Similar to Washington, the U.S. sttate average high temperature range from 70 - 90 F</p>
            <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
                {tmaxBins.map((bin, i) => {
                return (
                    <rect
                        y={chartSize - 10 - bin.length}
                        width="10"
                        height={bin.length}
                        x={histogramLeftPadding + i * 11}
                        fill = "steelblue"
                    />
                );
                })}
            </svg>
            
            <h3>Distribution of min temperature</h3>
            <p>Examining Washington state lowest/min temperatures compared to the rest of the states. 
                In comparison to other states, Washington State (red) min temperature stays consistent from 50 - 65 F as indicated 
                by the opacity of the red. Though there is a great distribution is lower areas like 30 - 40 F with a small dip below 0 F.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 - 12} 
                    textAnchor="end"
                    y={xScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 - 15} 
                    textAnchor="end"
                    y={xScale(100) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    100
                </text>
                <line 
                    x1={chartSize/2 - 10} 
                    y1={xScale(100)} 
                    x2={chartSize / 2 - 5} 
                    y2={xScale(100)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 - 10} 
                    y1={xScale(0)} 
                    x2={chartSize / 2 - 5} 
                    y2={xScale(0)}
                    stroke = {"black"}                
                />
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "WA";
                  return <line 
                            key={index}
                            x1={highlight ? chartSize/2 : chartSize/2 + 20} 
                            y1={xScale(measurement.TMIN)}
                            x2={highlight ? chartSize / 2 + 20 : chartSize/2 + 40} 
                            y2={xScale(measurement.TMIN)} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {.5}
                        />
                })}
            </svg>
            
            <h3>Distribution of snow fall</h3>
            <p>Comparing Washington state daily snow fall (red) to the rest of the country's (blue) daily snow fall. There is a big differences in that Washington State has
                way less snow fall daily compared to other U.S. States. But Washington state and other U.S. State average snowfall fall still have a similar pattern.</p>
                <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
                    {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state === "WA";
                    return (
                        <circle
                        key={index}
                        cx={highlight ? 100 - measurement.SNOW : 200 - measurement.SNOW}
                        cy={chartSize - margin - measurement.SNWD}
                        r="3"
                        fill="none"
                        stroke={highlight ? "red" : "steelblue"}
                        strokeOpacity="0.2"
                        />
                    );
                    })}
                </svg>

            <h3>Distribution of precipitation (inch)</h3>
            <p>Examining Washington state daily precipiation compared to the rest of the U.S. states. 
                In comparison to other states, Washington State (red) precipiation stays consistent at the lower range 
                by the opacity of the red. Which is surprsing since WA is known for its rainy wheather.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 - 12} 
                    textAnchor="end"
                    y={pScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 - 12} 
                    textAnchor="end"
                    y={pScale(6) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    6
                </text>
                <line 
                    x1={chartSize/2 - 10} 
                    y1={pScale(6)} 
                    x2={chartSize / 2 - 5} 
                    y2={pScale(6)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 - 10} 
                    y1={pScale(0)} 
                    x2={chartSize / 2 - 5} 
                    y2={pScale(0)}
                    stroke = {"black"}                
                />
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "WA";
                  return <line 
                            key={index}
                            x1={highlight ? chartSize/2 : chartSize/2 + 20} 
                            y1={pScale(measurement.PRCP)}
                            x2={highlight ? chartSize / 2 + 20 : chartSize/2 + 40} 
                            y2={pScale(measurement.PRCP)} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {.5}
                        />
                })}
            </svg>

            <h3>Final write up</h3>
            <p>The goal of this analysis was to explore the question: Does Washington State have a unique climate compared to other U.S. States?
                To help explore this topic, I came up with a few sub questions to lead this exploration:
                1. Compared to other states, is Washington state average temperature normal?
                2. Is Washington one of the states with the highest recorded temperature?
                3. Is Washington one of the states with the lowest recorded temperature?
                4. What is the average snowfall per state recorded in 2017?</p>
            <p>After coming up with these questions, I used tableau to explore the data further. I gained insight into how the data was formatted and was able to see 
                that no further data wrangling was needed as the data already excluded null data. Though upon further investigation, I noticed there are data points from
                U.S. territories which I decided to remove for the purpose of only comparing U.S. states.
            </p>
            <p>Through creating these visualization, I saw that Washington state climate is slightly unique compared to other states.
                In that Washington statet weather is consistently not too hot or too cold. But one thing that was suprising was that, 
                Washingtotn did not have the highest precipiation rate! Considering it is seen as a rainy/evergreen state. 
                Lastly, my main take away from this assighnment is the data exploration is important in helping aid a great visualization. 
                Exploring helps you to understand the data at its core which can lead to great questions.
            </p>

            {/* below */}
            {/* <h3> Working with geo data </h3>
            <svg width={1000} height={600} style={{ border: "1px solid black" }}>
                <path d={mapPathString} fill="rgb(200, 200, 200)" />
                {dataSmallSample.map((measurement) => {
                return (
                    <circle
                    transform={`translate(
                        ${projection([measurement.longitude, measurement.latitude])})`}
                    r="1.5"
                    />
                );
                })}
            </svg> */}
            
            {/* <h3>Binning</h3>
            <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
            {tmaxBins.map((bin, i) => {
            return (
                <rect
                    y={chartSize - 10 - bin.length}
                    width="10"
                    height={bin.length}
                    x={histogramLeftPadding + i * 11}
                    fill = "steelblue"
                />
            );
            })}
        </svg> */}



            {/* <h3> Scales in D3 - temperature</h3>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 - 12} 
                    textAnchor="end"
                    y={yScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 - 15} 
                    textAnchor="end"
                    y={yScale(100) + axisTextAlignmentFactor} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    100
                </text> */}
                {/* <line 
                    x1={chartSize/2 - 10} 
                    y1={yScale(100)} 
                    x2={chartSize / 2 - 5} 
                    y2={yScale(100)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 - 10} 
                    y1={yScale(0)} 
                    x2={chartSize / 2 - 5} 
                    y2={yScale(0)}
                    stroke = {"black"}                
                /> */}
                {/* {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.station == "KALISPELL GLACIER AP";
                  return <line 
                            key={index}
                            x1={chartSize/2} 
                            y1={yScale(measurement.TMAX)}
                            x2={chartSize / 2 + 20} 
                            y2={yScale(measurement.TMAX)} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {highlight ? 1 : 0.1 }
                        />
                })}
            </svg> */}


        {/* <h3>Scatterplot</h3>
        <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
        {dataSmallSample.map((measurement, index) => {
          const highlight = measurement.station === "KALISPELL GLACIER AP";
          return (
            <circle
              key={index}
              cx={100 - measurement.TMIN}
              cy={chartSize - margin - measurement.TMAX}
              r="3"
              fill="none"
              stroke={highlight ? "red" : "steelblue"}
              strokeOpacity="0.2"
            />
          );
        })}
      </svg> */}
            
            {/* <p> Barcode plot TMAX at Kalispell Glacier (sounds cold, expect it to be
        lower than average)</p> */}
            {/* <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 - 15} 
                    textAnchor="end"
                    y={chartSize - margin + 3} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 - 15} 
                    textAnchor="end"
                    y={chartSize - margin - 100} 
                    style={{ fontSize: 10 , fontFamily: "Gill San, sans serif"}}
                >
                    100
                </text>
                <line 
                    x1={chartSize/2 - 10} 
                    y1={chartSize - margin - 100} 
                    x2={chartSize / 2 - 5} 
                    y2={chartSize - margin - 100}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 - 10} 
                    y1={chartSize - margin} 
                    x2={chartSize / 2 - 5} 
                    y2={chartSize - margin}
                    stroke = {"black"}                
                />
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.station == "KALISPELL GLACIER AP";
                  return <line 
                            key={index}
                            x1={chartSize/2} 
                            y1={chartSize - margin - measurement.TMAX}
                            x2={chartSize / 2 + 20} 
                            y2={chartSize - margin - measurement.TMAX} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {highlight ? 1 : 0.1 }
                        />
                })}
            </svg> */}

            {/* <p> Display the distribution of max temperature</p> */}
            {/* <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.station == "KALISPELL GLACIER AP";
                  return <circle 
                            key={index} 
                            cx={highlight ? chartSize/2 : chartSize / 2 - 20} 
                            cy={chartSize - margin - measurement.TMAX} 
                            fill = "none"
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = "0.2"
                            r="3" />
                })}
            </svg> */}
        </div>
    );
    
};

export default App;