import React, { Component } from 'react';
import BigHex from './BigHex.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h3>Hexagon Puzzle Utility</h3>
          <p>This tool can help you solve a puzzle like "Hex-agony" from <a href="https://www.janestreet.com/puzzles/hex-agony-2/">Jane Street</a>.</p>
        </div>
        <BigHex
          hexPerSide={5}
          sideLen={30}
          height={400}
          width={400}/>
      </div>
    );
  }
}

export default App;
