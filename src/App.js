import React from "react";
import { useFetch } from "./hooks/useFetch";
import { scaleLinear } from "d3-scale";
import { extent, max, min, bin } from "d3-array";
import { None, scale } from "vega";
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
    const maxTemp = d3.max(data, function(d){ return d.TMAX; });

    const chartSize = 500;
    const margin = 20;
    const axisTextAlignmentFactor = 3;
    const barcodeLength = 100;
    const tickLength = 8;


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
            <p>Does the state of Washington and the state of Hawaii have a similar climate? </p>

            <h4>Specific Questions:</h4>
            <p>1. Compared to other states in America, is Hawaii and Washington state average temperature normal?</p>
            <p>2. Is Hawaii one of the states with the highest recorded temperatures?</p>
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
            <p>Comparing Hawaii and Washington state daily average tempereature to the rest of the country's daily average temperature. Despite some salient differences for lower average temperature, 
                Washington state and other U.S. State average temperature have a high level of association. Though, opposite is true Hawaii. Hawaii has a higher average temperature compared to the rest of the U.S.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                     {/* left 0 */}
                     <text 
                    x={barcodeLength} 
                    textAnchor="end"
                    y={chartSize - margin + axisTextAlignmentFactor - 20} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        0
                    </text>
                    {/* left 37 */}
                    <text 
                    x={barcodeLength} 
                    textAnchor="end"
                    y={chartSize - margin + axisTextAlignmentFactor - 150} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        {maxTemp}
                    </text>
                    {/* right 0 */}
                    <text 
                    x={chartSize - barcodeLength + axisTextAlignmentFactor} 
                    textAnchor="end"
                    y={chartSize - margin + axisTextAlignmentFactor - 20} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        0
                    </text>
                    {/* right 37 */}
                    <text 
                    x={chartSize - barcodeLength + axisTextAlignmentFactor + 30} 
                    textAnchor="end"
                    y={chartSize - margin + axisTextAlignmentFactor - 150} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        {maxTemp}
                    </text>
                    {/* left 37 tick */}
                    <line 
                        x1={chartSize / 4 - tickLength} 
                        y1={chartSize - margin + axisTextAlignmentFactor - 150}   
                        x2={chartSize / 4 - tickLength * 2} 
                        y2={chartSize - margin + axisTextAlignmentFactor - 150}
                        stroke={"black"}
                        stroke-width= {"3"} />
                    {/* left 0 tick */}
                    <line
                        x1={chartSize / 4 - tickLength}
                        y1={chartSize - margin - 20}
                        x2={chartSize / 4 - tickLength * 2}
                        y2={chartSize - margin - 20}
                        stroke={"black"} 
                        stroke-width= {"3"} />
                    {/* right 37 tick */}
                    <line 
                        x1={chartSize - (chartSize / 4) + tickLength * 2} 
                        y1={chartSize - margin + axisTextAlignmentFactor - 150} 
                        x2={chartSize - (chartSize / 4) + tickLength} 
                        y2={chartSize - margin + axisTextAlignmentFactor - 150} 
                        stroke={"black"} 
                        stroke-width= {"3"} />
                    {/* right 0 tick */}
                    <line
                        x1={chartSize - (chartSize / 4) + tickLength * 2}
                        y1={chartSize - margin - 20}
                        x2={chartSize - (chartSize / 4) + tickLength}
                        y2={chartSize - margin -20} 
                        stroke={"black"}
                        stroke-width= {"3"} />

                    <text 
                    x={chartSize / 2 + margin / 2 - 40}  
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        Hawaii vs. U.S. 
                    </text>
                    {/* right label */}
                    <text 
                    x={chartSize - (chartSize / 10) - margin / 2} 
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        Washington vs. U.S.
                    </text>
                
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "WA";
                  return <circle 
                            key={index} 
                            cx={highlight ? chartSize/2 + 100 : chartSize / 2 + 120} 
                            cy={chartSize - margin - measurement.TAVG - 50} 
                            fill = "none"
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = "0.2"
                            r="3" />
                })}
                {dataSmallSample.map((measurement, index) => {
                    const hight2 = measurement.state == "HI";
                  return <circle 
                            key={index} 
                            cx={hight2 ? chartSize/4 : chartSize / 4 + 20} 
                            cy={chartSize - margin - measurement.TAVG - 50} 
                            fill = "none"
                            stroke = {hight2 ? "red" : "steelblue"}
                            strokeOpacity = "0.2"
                            r="3" />
                })}
            </svg>

            <h3>Distribution of max temperature</h3>
            <p>Examining Hawaii and Washington state highest/max temperatures compared to the rest of the states. 
                In comparison to other U.S. states, Washington State max temperature seems to closely mirror other state high temperature.
                Meanwhile, Hawaii is still exhibiting higher temperature compared to the rest of the States.</p>
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
                    {maxTemp}
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
                <text 
                    x={chartSize / 2 + margin / 2 - 40}  
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        Washington vs. U.S. 
                </text>
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
                    {maxTemp}
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
                <text 
                    x={chartSize / 2 + margin / 2 - 40}  
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        Hawaii vs. U.S. 
                </text>
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "HI";
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

            <h3>Distribution of max temperature of all U.S. States</h3>
            <p>Similar to Washington, the U.S. sttate average high temperature range from 70 - 80 F</p>
            <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
                
                <text 
                    x={chartSize - margin - 150}  
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        {maxTemp} 
                </text>
                <text 
                    x={chartSize - margin - 420}  
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        0 
                </text>
                {tmaxBins.map((bin, i) => {
                return (
                    <rect
                        y={chartSize - margin - bin.length - 5}
                        width="10"
                        height={bin.length}
                        x={histogramLeftPadding + i * 11}
                        fill = "steelblue"
                    />
                );
                })}
            </svg>
            
            <h3>Distribution of min temperature</h3>
            <p>Examining Hawaii and Washington state lowest/min temperatures compared to the rest of the states. 
                In comparison to other states, Washington State min temperature stays consistent from 50 - 65 F as indicated 
                by the opacity of the red. Though there is a great distribution is lower areas like 30 - 40 F with a no dip below 0 F.
                For Hawaii,the concentration of min temeperature is around 70 - 80 which is similar to Washington max temperature distribution.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 - 20} 
                    textAnchor="end"
                    y={xScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 - 20} 
                    textAnchor="end"
                    y={xScale(99.86) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    {maxTemp}
                </text>
                <line 
                    x1={chartSize/2 - 70} 
                    y1={xScale(100)} 
                    x2={chartSize / 2 - 60} 
                    y2={xScale(100)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 - 70} 
                    y1={xScale(0)} 
                    x2={chartSize / 2 - 60} 
                    y2={xScale(0)}
                    stroke = {"black"}                
                />

                <text 
                    x={chartSize/2 + 70} 
                    textAnchor="end"
                    y={xScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 + 70} 
                    textAnchor="end"
                    y={xScale(99.86) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    {maxTemp}
                </text>
                <line 
                    x1={chartSize/2 + 90} 
                    y1={xScale(100)} 
                    x2={chartSize / 2 + 80} 
                    y2={xScale(100)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 + 90} 
                    y1={xScale(0)} 
                    x2={chartSize / 2 + 80} 
                    y2={xScale(0)}
                    stroke = {"black"}                
                />

                    <text 
                    x={chartSize / 2 + margin / 2 - 40}  
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        Washington vs. U.S. 
                    </text>
                    {/* right label */}
                    <text 
                    x={chartSize - (chartSize / 10) - margin / 2} 
                    textAnchor="end"
                    y={chartSize - margin / 2.5} 
                    style={{ fontSize: 18, fontFamily: "Gill Sans, sans serif" }}>
                        Hawaii vs. U.S.
                    </text>

                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "HI";
                  return <line 
                            key={index}
                            x1={highlight ? chartSize/2 + 100 : chartSize/2 + 120} 
                            y1={xScale(measurement.TMIN) - margin}
                            x2={highlight ? chartSize / 2 + 120 : chartSize/2 + 140} 
                            y2={xScale(measurement.TMIN) - margin} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {.5}
                        />
                })}
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "WA";
                  return <line 
                            key={index}
                            x1={highlight ? chartSize/4 : chartSize/4 + 20} 
                            y1={xScale(measurement.TMIN) - margin}
                            x2={highlight ? chartSize / 4 + 20 : chartSize / 4 + 40} 
                            y2={xScale(measurement.TMIN) - margin} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {.5}
                        />
                })}
            </svg>
            
            <h3>Distribution of snow fall</h3>
            <p>Comparing Washington daily snow fall (red) to the rest of the country's (blue) daily snow fall. There is a big differences in that Washington State has
                way less snow fall daily compared to other U.S. States. But Washington state and other U.S. State average snowfall fall still have a similar pattern.</p>
                <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
                    {/* y axis */}
                    <line 
                        x1={margin * 2} 
                        y1={margin * 3} 
                        x2={margin * 2} 
                        y2={chartSize - margin * 2}
                        stroke={"black"}
                        stroke-width= {"3"} />
                    {/* x axis */}
                    <line 
                        x1={margin * 2} 
                        y1={chartSize - margin * 2} 
                        x2={chartSize - margin * 2} 
                        y2={chartSize - margin * 2}
                        stroke={"black"}
                        stroke-width= {"3"} />
                    
                    {/* -40 */}
                    <text 
                    x={margin * 2 - axisTextAlignmentFactor} 
                    textAnchor="end"
                    y={chartSize - margin * 2 + axisTextAlignmentFactor * 2} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        0
                    </text>
                    {/* y max */}
                    <text 
                    x={margin * 2 - axisTextAlignmentFactor * 2} 
                    textAnchor="end"
                    y={margin * 3 + axisTextAlignmentFactor * 2} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        5.5
                    </text>
                    {/* x max */}
                    <text 
                    x={chartSize - margin * 2} 
                    textAnchor="end"
                    y={chartSize - margin * 2 + axisTextAlignmentFactor * 4 + 5} 
                    style={{ fontSize: 15, fontFamily: "Gill Sans, sans serif" }}>
                        20
                    </text>
                    {/* x axis label */}
                    <text 
                    x={chartSize / 2} 
                    textAnchor="end"
                    y={chartSize - margin * 2 + axisTextAlignmentFactor * 4} 
                    style={{ fontSize: 12, fontFamily: "Gill Sans, sans serif" }}>
                        Snow depth (inches)
                    </text>
                    {/* y axis label */}
                    <text 
                    x={margin * 2 - axisTextAlignmentFactor + 100} 
                    textAnchor="end"
                    y={chartSize / 2 } 
                    style={{ fontSize: 12, fontFamily: "Gill Sans, sans serif" }}>
                        Snow fall (inches)
                    </text>

                    {dataSmallSample.map((measurement, index) => {
                    //const highlight = measurement.state === "WA";
                    if (measurement.state === "WA") {
                        return (
                            <circle
                            key={index}
                            cx={250 + measurement.SNWD}
                            cy={chartSize - margin - 150 - measurement.SNOW}
                            r="5"
                            fill="none"
                            stroke={"red" }
                            strokeOpacity="10"
                            />
                        )
                    }
                    })}

                    {dataSmallSample.map((measurement, index) => {
                            return (
                                <circle 
                                    key={index} 
                                    cx={250 + +measurement.SNWD} 
                                    cy={chartSize - margin - 150 - +measurement.SNOW} 
                                    r="1.5" 
                                    stroke="steelblue"
                                    fill= "none"
                                    stroke-opacity="0.2"  /> 
                            );
                    
                    })} 
                </svg>

            <h3>Distribution of precipitation (inch)</h3>
            <p>Examining Hawaii and Washington state daily precipiation compared to the rest of the U.S. states. 
                In comparison to other states, Washington State precipiation stays consistent at the lower range 
                by the opacity of the red. Which is surprsing since WA is known for its rainy wheather. The same is true
                about Hawaii. Most precipiation stays consistently on the lower rannge.</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
                <text 
                    x={chartSize/2 + 80} 
                    textAnchor="end"
                    y={pScale(15) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    Washington vs. U.S.              
                </text>
                <text 
                    x={chartSize/2 + 200} 
                    textAnchor="end"
                    y={pScale(15) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                Hawaii vs. U.S.
                </text>
                <text 
                    x={chartSize/2 + 90} 
                    textAnchor="end"
                    y={pScale(0) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    0
                </text>
                <text 
                    x={chartSize/2 + 90} 
                    textAnchor="end"
                    y={pScale(6) + axisTextAlignmentFactor} 
                    style={{ fontSize: 15 , fontFamily: "Gill San, sans serif"}}
                >
                    6 
                </text>
                <line 
                    x1={chartSize/2 + 75} 
                    y1={pScale(6)} 
                    x2={chartSize / 2 + 70} 
                    y2={pScale(6)}
                    stroke = {"black"}                
                />
                <line 
                    x1={chartSize/2 + 75} 
                    y1={pScale(0)} 
                    x2={chartSize / 2 + 70} 
                    y2={pScale(0)}
                    stroke = {"black"}                
                />
                {dataSmallSample.map((measurement, index) => {
                    const highlight = measurement.state == "HI";
                  return <line 
                            key={index}
                            x1={highlight ? chartSize/2 + 100 : chartSize/2 + 120} 
                            y1={pScale(measurement.PRCP)}
                            x2={highlight ? chartSize/2 + 120 : chartSize/2 + 140} 
                            y2={pScale(measurement.PRCP)} 
                            stroke = {highlight ? "red" : "steelblue"}
                            strokeOpacity = {.5}
                        />
                })}
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
                1. Compared to other states in America, is Hawaii and Washington state average temperature normal?
                2. Is Hawaii one of the states with the highest recorded temperatures?
                3. Is Washington one of the states with the lowest recorded temperature?
                4. What is the average snowfall per state recorded in 2017?</p>
            <p>After coming up with these questions, I used tableau to explore the data further. I gained insight into how the data was formatted and was able to see 
                that no further data wrangling was needed as the data already excluded null data. Though upon further investigation, I noticed there are data points from
                U.S. territories which I decided to remove for the purpose of only comparing U.S. states.
            </p>
            <p>Through creating these visualization, I saw that Hawaii and Washington state climate is very unique compared to each other and to other states.
                In that Washington state weather is consistently not too hot or too cold while Hawaii is consistently at a higher temperature. But one thing that was suprising was that, 
                Washingtotn did not have the highest precipiation rate! Considering it is seen as a rainy/evergreen state. 
                Lastly, my main take away from this assighnment is the data exploration is important in helping aid a great visualization. 
                Exploring helps you to understand the data at its core which can lead to great questions.
            </p>

            <h3>Peer Reviews Notes</h3>
            <p> Review #1: Charts needs to have labels and tik marks to help viewer digust information better. 
                For example, the distribution of average temp needs to have labels of which is Hawaii vs. Washington.</p>
            <p>Change #1: Added chart labels and tiks to chart 2 through 8.</p>
            <p>Review #2: Adding axes to chart when compaing two variables. For example chart 8 when comparing snowfall and snow depth. </p>
            <p>Change #2: Added axes title and range. </p>
            

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