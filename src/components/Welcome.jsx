/* eslint-disable max-len */
import React, { Component } from 'react';
import '../styles/App.css';

class Welcome extends Component {  
    constructor(props) {
        super(props);
        this.state = {};

    }


    render() {
        return (
            <div className="welcome-message">
                <span className="bold-title">RENT-A-CAR</span> <span className="bold-titl2">GDL</span>
                <br/> 
                <h3 className="bold-title3">
                Bienvenido a rent-a-car Gdl, el mejor sitio para rentar autos desde la comodidad de tu hogar.
                    {
                        (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENV_NAME === 'DEV' || process.env.REACT_APP_ENV_NAME === 'TEST')
                    }
                </h3>
            </div>
        );
    }
}

export default Welcome;


