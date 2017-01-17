import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import Editor from './Editor.js';
import './App.css';

class BigHex extends Component {

  constructor(props){
    super(props);
    this.state = {
      cellValue: 0
    };
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(hexRow,hexCell,cellValue){
    cellValue = parseInt(cellValue);
    if(this.state.cellValue !== cellValue){
      const data = this.state.data;
      data[hexRow][hexCell].value = cellValue;
      const ruleCheck = checkRules(data);
      console.log(ruleCheck);
      this.setState({
        data: ruleCheck.data,
        cellValue: cellValue,
        ruleOK: ruleCheck.ruleOK
      });
    }
  }

  componentWillMount(){
    let data = [];
    const hexPerSide = this.props.hexPerSide;
    _.times(2*this.props.hexPerSide - 1,i=>{
      // hPS to 2hPS-1 to hPS, eg 5 -> 9 -> 5
      var rowlen = (2*hexPerSide - 1) - Math.abs((hexPerSide - 1) - i);
      let row = [];
      _.times(rowlen,j=>row.push({
        value: null,
        color: "gray",
        row: i,
        cell: j+Math.max(0, i - (hexPerSide - 1)),
        ruleValue: 0,
        ruleOK: true,
        toggleColor: function(){
          const colors = ["red","blue","green","black","gray"];
          const newColor = colors[(colors.indexOf(this.color)+1) % colors.length];
          return this.color = newColor;
        }
      }));
      data.push(row);
    });
    
    // starting vals
    data[0][4].color = "blue"; data[0][4].value = 130321;
    data[2][0].color = "red"; data[2][0].value = 169;
    data[8][2].color = "green"; data[8][2].value = 1;
    data[6][0].color = "red"; data[6][0].value = 0;
    data[6][6].color = "red"; data[6][6].value = 0;

    this.setState({
      data: data
    });
  }

  componentDidMount(){
    drawHexes(this.props,this.state.data);
  }

  componentDidUpdate(){
    updateHexes(this.state.data);
  }

  render() {
    const dim = (Math.sqrt(3) * this.props.sideLen * (2*this.props.hexPerSide-1));
    return <div>
      <Editor 
        onUserInput={this.handleUserInput}
        hexRow={this.state.hexRow}
        hexCell={this.state.hexCell}
        cellValue={this.state.cellValue} />
      <svg id="big-hex" height={dim} width={dim}></svg>
    </div>;
  }
  
}

function checkRules(data){
  let ruleCheck = {
    ruleOK: true
  }
  data.forEach(cell=>{
    if(cell.color === "red"){
      cell.ruleValue = _.chain(data)
        .filter(o=>o.color === "blue")
        .reduce((t,v)=>t+v.value,0)
        .value();
    } else if (cell.color === "blue"){
      cell.ruleValue = _.chain(data)
        .filter(o=>o.color === "green")
        .reduce((t,v)=>Math.max(t,v.value),0)
        .value();
    } else if (cell.color === "green"){
      cell.ruleValue = _.chain(data)
        .filter(o=>o.color === "black")
        .reduce((t,v)=>t*v.value,1)
        .value();
    } else {
      cell.ruleValue = data.filter(o=>o.color === "red").length;
    }
    cell.ruleOK = cell.ruleValue === cell.value;
    ruleCheck.ruleOK = ruleCheck.ruleOK && cell.ruleOK;
  });
  ruleCheck.data = data;
  return ruleCheck;
}

function updateHexes(data){
  const rows = d3.selectAll(".hex-row")
    .data(data);
  rows.selectAll(".tile")
    .select("text.val")
    .text(d=>d.value);
}

function drawHexes({hexPerSide,sideLen},data){

  const r3o2S = Math.sqrt(3)/2 * sideLen;

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
    .attr("class","hex-row")
    .attr("transform",(d,i)=>{
      const special = Math.max(0,i - hexPerSide + 1);
      const rowShiftY = (-r3o2S*special) + (i*2*r3o2S);
      const rowShiftX = (1.5*sideLen*special) + sideLen;
      return "translate("+rowShiftX+","+rowShiftY+")";
    });

  const tiles = rows.selectAll(".hex-row")
    .data(d=>d)
    .enter()
    .append("g")
    .attr("class","tile")
    .attr("transform",(d,i)=>"translate("+i*1.5*sideLen+",-"+i*r3o2S+")");

  tiles
    .append("polygon")
    .attr("class","hex")
    .style("fill",(d,i)=>d.color)
    .style("opacity",.2)
    .attr("points",hexPath(sideLen,r3o2S));

  tiles
    .append("text")
    .attr("class","val")
    .attr("x",-1.9*sideLen)
    .attr("y",6)
    .text(d=>d.value);

  tiles
    .append("text")
    .attr("class","coord")
    .attr("x",-1.5*sideLen)
    .attr("y",-.5*r3o2S)
    .text(d=>"("+d.row+","+d.cell+")");

  tiles
    .on("click",tileClick)
    .on("mouseover",tileHover)
    .on("mouseout",tileClear);

}

function tileClick(tile){
  d3.select(this).select("polygon")
    .style("fill",d=>d.toggleColor());
}

function tileHover(tile){
  const matchR = tile.row;
  const matchC = tile.cell;
  const matchDiff = matchR - matchC;
  d3.selectAll("polygon")
    .style("opacity",d=>{
      if(d.row === matchR || d.cell === matchC || d.row-d.cell === matchDiff){
        return .6;
      } else {
        return .2;
      }
    });
}

function tileClear(){
  d3.selectAll("polygon").style("opacity",.2);
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
