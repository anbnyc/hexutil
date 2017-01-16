import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import './App.css';

class BigHex extends Component {
  constructor(props){
    super(props);
    this.state = {}
  }

  componentDidMount(){
    drawHexes(this.props);
  }

  render() {
    const dim = (Math.sqrt(3) * this.props.sideLen * (2*this.props.hexPerSide-1));
    return (
      <svg id="big-hex" height={dim} width={dim}></svg>
    );
  }
  
}

function drawHexes({hexPerSide,sideLen}){

  const r3o2S = Math.sqrt(3)/2 * sideLen;

  let data = [];
  _.times(2*hexPerSide - 1,i=>{
    // hPS to 2hPS-1 to hPS, eg 5 -> 9 -> 5
    var rowlen = (2*hexPerSide - 1) - Math.abs((hexPerSide - 1) - i);
    let row = [];
    const cell = {
      value: 0,
      color: "black"
    };
    _.times(rowlen,()=>row.push(cell))
    data.push(row);
  });

  const parent = d3.select("body")
    .select("#big-hex")
    .append("g")
    .attr("transform","translate("+1.5*sideLen+","+((hexPerSide)*r3o2S)+")")
    .attr("class","big-hex");

  const rows = parent
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("class","little-hex")
    .attr("transform",(d,i)=>{
      console.log("i",i);
      const special = Math.max(0,i - hexPerSide + 1);
      const rowShiftY = (-r3o2S*special) + (i*2*r3o2S);
      const rowShiftX = (1.5*sideLen*special) + sideLen;
      return "translate("+rowShiftX+","+rowShiftY+")";
    });

  const tiles = rows.selectAll(".little-hex")
    .data((d) => d)
    .enter()
    .append("g")
    .attr("class","tile")
    .attr("transform",(d,i)=>"translate("+i*1.5*sideLen+",-"+i*r3o2S+")");

  tiles
    .append("polygon")
    .attr("class","hex")
    .attr("fill",(d,i)=>d.color)
    .style("opacity",.5)
    .attr("points",hexPath(sideLen,r3o2S));

  tiles
    .append("text")
    .text((d)=>d.value)
    .attr("x",-sideLen);

  // add polygons to each row

}

function hexPath(s,r3o2S){
  const halfS = .5*s;
  return "0,0"+
    " -"+halfS+",-"+r3o2S+
    " -"+(s+halfS)+",-"+r3o2S+
    " -"+2*s+",0"+
    " -"+(s+halfS)+","+r3o2S+
    " -"+halfS+","+r3o2S;
}

export default BigHex;
