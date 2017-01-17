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
    cellValue = parseInt(cellValue,10);
    if(this.state.cellValue !== cellValue){
      const data = this.state.data;
      data[hexRow][hexCell].value = cellValue;
      const ruleCheck = checkRules(data);
      this.setState({
        data: ruleCheck.data,
        cellValue: cellValue,
        ruleOK: ruleCheck.ruleOK,
        ruleBreakers: ruleCheck.ruleBreakers
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
        cellLabel: j,
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
    // data[0][4].color = "blue"; data[0][4].value = 130321;
    // data[2][0].color = "red"; data[2][0].value = 169;
    // data[8][2].color = "green"; data[8][2].value = 1;
    // data[6][0].color = "red"; data[6][0].value = 0;
    // data[6][6].color = "red"; data[6][6].value = 0;

    let hardCode = [
      [130490,"red"],
      [13,"black"],
      [130321,"red"],
      [130321,"red"],
      [130321,"blue"],

      [169,"red"],
      [0,"red"],
      [0,"red"],
      [0,"red"],
      [130321,"red"],
      [130321,"red"],

      [169,"red"],
      [0,"red"],
      [19,"black"],
      [0,"red"],
      [130321,"red"],
      [0,"red"],
      [130321,"red"],

      [169,"blue"],
      [169,"green"],
      [169,"red"],
      [169,"red"],
      [130490,"red"],
      [169,"red"],
      [169,"red"],
      [13,"black"],

      [169,"red"],
      [169,"red"],
      [0,"red"],
      [19,"black"],
      [130321,"green"],
      [19,"black"],
      [0,"red"],
      [0,"red"],
      [130321,"red"],

      [0,"red"],
      [169,"red"],
      [0,"red"],
      [19,"black"],
      [0,"red"],
      [0,"red"],
      [0,"red"],
      [0,"red"],

      [0,"red"],
      [169,"red"],
      [130321,"red"],
      [0,"red"],
      [0,"red"],
      [0,"red"],
      [0,"red"],

      [0,"red"],
      [130490,"red"],
      [0,"red"],
      [0,"red"],
      [0,"red"],
      [0,"red"],

      [130321,"red"],
      [169,"red"],
      [1,"green"],
      [0,"red"],
      [0,"red"]
    ]

    _.each(data,row=>{
      _.each(row,cell=>{
        let entry = hardCode.shift();
        cell.value = entry[0];
        cell.color = entry[1];
      });
    });

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
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
        <Editor 
          onUserInput={this.handleUserInput}
          hexRow={this.state.hexRow}
          hexCell={this.state.hexCell}
          cellValue={this.state.cellValue} />
        <pre>
          <span>{"PASSES ALL RULES: "+this.state.ruleOK}</span><br/>
          <span>{"VIOLATIONS: "+this.state.ruleBreakers}</span>
        </pre>
      </div>
      <svg id="big-hex" height={dim} width={dim}></svg>
    </div>;
  }
  
}

function checkRules(data){
  let flatData = _.reduce(data,(t,v)=>t.concat(v),[]);
  let ruleCheck = {
    ruleOK: true,
    ruleBreakers: []
  }
  flatData.forEach(cell=>{
    const matchR = cell.row;
    const matchC = cell.cell;
    if(cell.color === "red"){
      cell.ruleValue = _.chain(flatData)
        .filter(o=>o.color === "blue" && inView(o,matchR,matchC))
        .reduce((t,v)=>t+v.value,0)
        .value();
    } else if (cell.color === "blue"){
      cell.ruleValue = _.chain(flatData)
        .filter(o=>o.color === "green" && inView(o,matchR,matchC))
        .reduce((t,v)=>Math.max(t,v.value),0)
        .value();
    } else if (cell.color === "green"){
      cell.ruleValue = _.chain(flatData)
        .filter(o=>o.color === "black" && inView(o,matchR,matchC))
        .reduce((t,v)=>t*v.value,1)
        .value();
    } else {
      cell.ruleValue = flatData.filter(o=>o.color === "red" && inView(o,matchR,matchC)).length;
    }
    cell.ruleOK = cell.ruleValue === cell.value;
    if(!cell.ruleOK){
      ruleCheck.ruleBreakers.push("("+cell.row+","+cell.cell+"):"+cell.ruleValue);
    }
    ruleCheck.ruleOK = ruleCheck.ruleOK && cell.ruleOK;
  });
  ruleCheck.data = unflattenArray(data,flatData);
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
    .text(d=>"("+d.row+","+d.cellLabel+")");

  tiles
    .on("click",tileClick)
    .on("mouseover",tileHover)
    .on("mouseout",tileClear);

}

/*** D3 INTERACTIVITY FUNCTIONS ***/
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
      if(inView(d,matchR,matchC,matchDiff)){
        return .6;
      } else {
        return .2;
      }
    });
}

function tileClear(){
  d3.selectAll("polygon").style("opacity",.2);
}

/*** UTILITY FUNCTIONS ***/
function unflattenArray(unflatArray,flatArray){
  _.each(unflatArray,row=>{
    _.each(row,cell=>{
      cell = flatArray.shift();
    });
  });
  return unflatArray;
}

function inView(tile,matchR,matchC){
  return tile.row === matchR || tile.cell === matchC || tile.row-tile.cell === matchR - matchC;
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
