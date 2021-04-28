import React from "react";
import { useFetch } from "./hooks/useFetch";
import { scaleLinear } from "d3-scale";
import { extent, max, min, bin } from "d3-array";
//import { scale } from "vega";
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
            
            <h3> Working with geo data </h3>
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
            </svg>
            
            <h3>Binning</h3>
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



            <h3> Scales in D3 - temperature</h3>
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
            </svg>


        <h3>Scatterplot</h3>
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
      </svg>
            
            <p> Barcode plot TMAX at Kalispell Glacier (sounds cold, expect it to be
        lower than average)</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
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
            </svg>

            <p> Display the distribution of max temperature</p>
            <svg width={chartSize} height={chartSize} style={{border : "1px solid black"}}>
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
            </svg>
        </div>
    );
    
};

export default App;