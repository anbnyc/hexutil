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
      <div>
        <input
          type="number"
          id="hexRow"
          value={this.props.hexRow}
          ref={(input)=>this.hexRow = input}
          onChange={this.handleChange}
          ></input>
        <input
          type="number"
          id="hexCell"
          value={this.props.hexCell}
          ref={(input)=>this.hexCell = input}
          onChange={this.handleChange}
          ></input>
        <input 
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
