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
                <span className="bold-title">MEDALLIA</span> <span className="bold-titl2">Relationship</span>
                <br/> 
                <h3 className="bold-title3">
                This page is for submission of Invitation Files for Medallia Relationship Implementation
                    {
                        (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENV_NAME === 'DEV' || process.env.REACT_APP_ENV_NAME === 'TEST') &&
                    <span> in <span style={ { fontWeight: 'bold' } }>{ process.env.REACT_APP_ENV_NAME || 'DEV'}</span> mode only.</span>
                    }
                </h3>
            </div>
        );
    }
}

export default Welcome;


