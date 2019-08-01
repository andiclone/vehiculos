/* eslint-disable max-len */
import React, { Component } from 'react';
import logo from '../imgs/ibm_logo.jpg';
import '../styles/App.css';

class Navbar extends Component {

    render() {
        return (
            <React.Fragment>
                <div className="navbar">
                    <img src={ logo } alt="ibm-logo" />
                </div>
                {
                    (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENV_NAME === 'DEV' || process.env.REACT_APP_ENV_NAME === 'TEST') &&
          <div className="navbarEnv">
              <label>{ process.env.REACT_APP_ENV_NAME || 'DEV' } Site</label>
          </div>
                }
            </React.Fragment>
        );
    }
}

export default Navbar;
