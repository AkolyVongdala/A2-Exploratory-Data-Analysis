import React from "react";
import {csv} from "d3-fetch";

const viewHeight = 500;
const viewWidth = 500;

const App = () => {
    csv("https://raw.githubusercontent.com/AkolyVongdala/A2-Exploratory-Data-Analysis/main/data/weather.csv"
    ).then((data) => console.log(data));
    return (
        <div>
            <p>Data!</p>
        </div>
    );
    
};

export default App;