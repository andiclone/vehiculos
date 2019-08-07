import React, { Component } from 'react';
import loading from '../imgs/GIFProcess.gif';
import '../styles/App.css';

class Loading extends Component {
    render() {
        return (
            <div className="rentacar-form">
                <div className="div_center">
                    <h2>PLEASE WAIT</h2>
                    <h4>Your file is being processed, this may take up to 5 minutes.</h4>
                    <img src={ loading } alt="loading-gif" />
                </div>      
            </div>
        );
    }
}
  
export default Loading;