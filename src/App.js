import React from "react";

const viewHeight = 500;
const viewWidth = 500;

const App = () => {
    return (
        <svg style={{ border: "5px solid red", width:viewWidth, height:viewHeight}}>
            <circle cx={20} cy={20} r="5"></circle>
            <rect x={200} y={200} width={10} height={10} fill="pink"/>
            <rect x={212} y={200} width={10} height={10} fill="black"/>
            <rect x={224} y={200} width={10} height={10} fill="black"/>
            <line x1={0} y1={viewHeight} x2={150} y2={100} stroke="orange"/>
            <text x="50" y="50" style={{ font: "italic 16px" }}>
                ummmmm add something lol
            </text>
            <text> adding another thing</text>
        </svg>
    );
    
};

export default App;