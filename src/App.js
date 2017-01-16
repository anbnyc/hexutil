import React, { Component } from 'react';
import logo from './logo.svg';
import BigHex from './BigHex.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
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
