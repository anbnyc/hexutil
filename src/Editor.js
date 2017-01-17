import React, { Component } from 'react';
import './App.css';

class Editor extends Component {

  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(){
    this.props.onUserInput(
      this.hexRow.value,
      this.hexCell.value,
      this.cellInput.value
    )
  }

  render() {
    return (
      <div className="padding">
        Row: [<input
          type="number"
          id="hexRow"
          min={0}
          max={8}
          value={this.props.hexRow}
          ref={(input)=>this.hexRow = input}
          onChange={this.handleChange}
          ></input>]
        Cell: [<input
          type="number"
          id="hexCell"
          min={0}
          max={8}
          value={this.props.hexCell}
          ref={(input)=>this.hexCell = input}
          onChange={this.handleChange}
          ></input>]
        Value: <input 
          type="number"
          id="cellInput"
          value={this.props.cellValue}
          ref={(input)=>this.cellInput = input}
          onChange={this.handleChange}></input>
      </div>
    );
  }
}

export default Editor;
