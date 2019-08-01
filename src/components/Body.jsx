/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import '../styles/App.css';
import Form from './Form.jsx';
import Welcome from './Welcome.jsx';

class Body extends Component {

    constructor(props) {
        super(props);
        this.state = {
            messageIsShown: true,
        };

        this.messageCallback = this.messageCallback.bind(this);
    }
    
    messageCallback = (answer) => {
        this.setState({
            messageIsShown: false,
        });
    }    

    render() {
    
        return (
            <div className="relationship-container">
                {this.state.messageIsShown}
                <Welcome/>
                <Form/>
            </div>
        );
    }
}

export default Body;