import React, { Component } from 'react';
import Body from './Body.jsx';

import '../styles/App.css';
import '../../node_modules/carbon-components/css/carbon-components.css';

class App extends Component {

    render() {
        return (
            <div id="app">
                <Body/>
            </div>
        );
    }
}

export default App;