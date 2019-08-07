/* eslint-disable compat/compat */
import React, { Component } from 'react';
import '../styles/App.css';
import {
    SelectItemGroup,
    SelectItem,
    DatePicker,
    DatePickerInput,
    TimePicker,
    TimePickerSelect,
    SelectSkeleton,
    Button,
} from 'carbon-components-react';
import axios, { post } from 'axios';
import swal from 'sweetalert';
import Loading from './Loading';

let minDate = (new Date().getDate() + 1) + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
let maxDate = new Date().getDate() + '/' + (new Date().getMonth() + 2) + '/' + new Date().getFullYear();

const APP_VIEWS = {
    INPUT: 'INPUT',
    LOADING: 'LOADING',
};

const debug = require('debug')('rentacar');

const DisplayImage = ({ selectedOptionCar }) => {
    switch (selectedOptionCar) {
        default:
            return <img src="http://chanhassenautoplex.com/wp-content/uploads/2018/01/CarsAndCaves106-2-of-18.jpg" alt="carros"/>;
        case 'yaris':
            return <img src="https://i.blogs.es/0f9d7d/toyota-yaris-r-2018_9/450_1000.jpg" alt="yaris"/>;
        case 'corolla':
            return <img src="https://www.cstatic-images.com/car-pictures/xl/usc70toc041g021001.png" alt="corolla"/>;
        case 'sienna':
            return <img src="https://www.cstatic-images.com/car-pictures/xl/usc80tov111a021001.png" alt="sienna"/>;
    }
};

const DisplayCars = ({ selectedOptionSuc, cars }) => {
    switch (selectedOptionSuc) {
        default:
            return <SelectItemGroup label="Selecciona una sucursal">
                <SelectSkeleton/>
            </SelectItemGroup>;
        case 'chapalita':
            return <SelectItemGroup label="chapalita">
                {
                    cars.filter((i) => i < 3).forEach(cars =>
                        <SelectItem value={ cars.id }
                            text={ `${cars.name} ${cars.modelo}` }/>)
                }
            </SelectItemGroup>;
        case 'gdlcentro':
            return <SelectItemGroup label="chapalita">
                {
                    cars.filter((i) => i < 3).forEach(cars =>
                        <SelectItem value={ cars.id }
                            text={ `${cars.name} ${cars.modelo}` }/>)
                }
            </SelectItemGroup>;
        case 'zapopan':
            return <SelectItemGroup label="zapopan">
                {
                    cars.filter((e, i) => i >= 6).forEach(cars =>
                        <SelectItem value={ cars.id }
                            text={ `${cars.name} ${cars.modelo}` }/>)
                }
            </SelectItemGroup>;
    }
};

class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            app_view: APP_VIEWS.INPUT,
            sucs: [],
            cars: [],
            cars_by_suc: [],
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const url = '/getAllInfo';
        axios.get(url)
            .then(res => {
                // Expected result
                /* data = {
                    sucs: [],
                    cars: [],
                    cars_by_suc: [],
                }; */
                let data = res.data.data;
                this.setState({
                    // response: res.data.message,
                    ...data,
                    isLoading: false,
                });
            })
            .catch(err => {
                // handle error
                console.warn(err);
                this.setState({
                    response: err.message,
                });
            });

        this.callApi()
            .then(res => this.setState({ response: res.express }))
            .catch(err => console.log(err));

    }

    callApi = async () => {
        const response = await fetch('/');
        const body = await response.json();
        if (response.status !== 200) { throw Error(body.message); }
        return body;
    };

    onCarChange(event) {
        this.setState({ selectedOptionCar: event.target.value });
    }

    onSucursalChange(event) {
        this.setState({ selectedOptionSuc: event.target.value });
    }

    handleSubmit() {

        const url = '/';
        const formData = new FormData();
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };

        this.setState({
            ...this.setState,
            app_view: APP_VIEWS.LOADING,
        });

        post(url, formData, config)
            .then(res => {
                let resStatus = res.data.status;
                let view;
                switch (resStatus) {
                    default:
                        break;
                    case 'system_error':
                        view = APP_VIEWS.INPUT;
                        swal('Whoops', 'There was an error, please try again. If this error persists, please contact the site administrator.', 'error');
                        break;
                    case 'fail':
                        view = APP_VIEWS.INPUT;
                        swal('Whoops', 'process failed', 'error');
                        break;
                    case 'success':
                        view = APP_VIEWS.INPUT;
                        swal('Awesome!', 'Your reservation has been made!');
                        break;
                } // Uno u otro
                this.setState({
                    ...this.setState,
                    data: res.data,
                    app_view: view,
                });
            })
            .catch((err) => {
                let view;
                debug('error form: ', err);
                view = APP_VIEWS.INPUT;
                this.setState({
                    app_view: view,
                });
                swal('The process is taking too long, please try again later.', '',
                    {
                        icon: 'error',
                    }
                );
            });
    }

    render() {
        switch (this.state.app_view) {
            default:
                return <div></div>;
            case APP_VIEWS.INPUT:
                return (
                    <div className="rentacar-form">
                        <div className="rentacar-form-flex">
                            <div className="rentacar-form-inside">
                                <div className="rentacar-form-column">
                                    <div className="mail-datos-panel">
                                        <p className="form-datos" >
                                            Por favor seleccione una sucursal
                                        </p>
                                        <div className="dropdown-renta">
                                            <div className="bx--form-item">
                                                <select
                                                    onChange={ this.onSucursalChange.bind(this) }
                                                    defaultValue="placeholder-item"
                                                    id="select-1"
                                                    className="bx--select-input"
                                                    disabled={ null }
                                                    data-invalid={ null }
                                                >
                                                    <SelectItem
                                                        disabled
                                                        hidden
                                                        value="placeholder-item"
                                                        text="Sucursal"
                                                    />
                                                    <SelectItemGroup label="ZMG">
                                                        <SelectItem value="chapalita" text={ this.state.sucs.map(sucs => sucs.name)[0] } />
                                                        <SelectItem value="gdlcentro" text={ this.state.sucs.map(sucs => sucs.name)[1] } />
                                                        <SelectItem value="zapopan" text={ this.state.sucs.map(sucs => sucs.name)[2] } />
                                                    </SelectItemGroup>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="form-datos" >
                                            Por favor ingrese su direccion
                                        </p>
                                        <input className="input-renta"></input>
                                        <p className="form-datos" >
                                            Por favor seleccione el estado
                                        </p>
                                        <div className="dropdown-renta">
                                            <div className="bx--form-item">
                                                <select
                                                    //onChange={ anonymous }
                                                    defaultValue="placeholder-item"
                                                    id="select-1"
                                                    className="bx--select-input"
                                                    disabled={ null }
                                                    data-invalid={ null }
                                                >
                                                    <SelectItem
                                                        disabled
                                                        hidden
                                                        value="placeholder-item"
                                                        text="Estado"
                                                    />
                                                    <SelectItemGroup label="Mexico">
                                                        <SelectItem value="aguascalientes" text="Aguascalientes" />
                                                        <SelectItem value="bjn" text="Baja California" />
                                                        <SelectItem value="bjs" text="Baja California Sur" />
                                                        <SelectItem value="campeche" text="Campeche" />
                                                        <SelectItem value="chiapas" text="Chiapas" />
                                                        <SelectItem value="chihuahua" text="Chihuahua" />
                                                        <SelectItem value="coahuila" text="Coahuila de Zaragoza" />
                                                        <SelectItem value="colima" text="Colima" />
                                                        <SelectItem value="durango" text="Durango" />
                                                        <SelectItem value="cdmx" text="Estado de México" />
                                                        <SelectItem value="guanajuato" text="Guanajuato" />
                                                        <SelectItem value="guerrero" text="Guerrero" />
                                                        <SelectItem value="hidalgo" text="Hidalgo" />
                                                        <SelectItem value="jalisco" text="Jalisco" />
                                                        <SelectItem value="michoacan" text="Michoacán de Ocampo" />
                                                        <SelectItem value="morelos" text="Morelos" />
                                                        <SelectItem value="nayarit" text="Nayarit" />
                                                        <SelectItem value="nuevo_leon" text="Nuevo León" />
                                                        <SelectItem value="oaxaca" text="Oaxaca" />
                                                        <SelectItem value="puebla" text="Puebla" />
                                                        <SelectItem value="queretaro" text="Querétaro" />
                                                        <SelectItem value="quintana_roo" text="Quintana Roo" />
                                                        <SelectItem value="slp" text="San Luis Potosí" />
                                                        <SelectItem value="sinaloa" text="Sinaloa" />
                                                        <SelectItem value="sonora" text="Sonora" />
                                                        <SelectItem value="tabasco" text="Tabasco" />
                                                        <SelectItem value="tamaulipas" text="Tamaulipas" />
                                                        <SelectItem value="tlaxcala" text="Tlaxcala" />
                                                        <SelectItem value="veracruz de Ignacio de la Llave" text="Veracruz de Ignacio de la Llave" />
                                                        <SelectItem value="yucatan" text="Yucatán" />
                                                        <SelectItem value="zacatecas" text="Zacatecas" />
                                                    </SelectItemGroup>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="form-datos" >
                                            Por favor seleccione la fecha de inicio y fin
                                        </p>
                                        <div className="fecha-input">
                                            <DatePicker
                                                id="date-picker"
                                                //onChange={ anonymous }
                                                //onClose={ anonymous }
                                                minDate={ minDate }
                                                maxDate={ maxDate }
                                                datePickerType="range"
                                                locale="es"
                                                dateFormat="d/m/Y"
                                            >
                                                <DatePickerInput
                                                    id="date-picker-input-id"
                                                    className="some-class"
                                                    pattern="d{1,2}/d{4}"
                                                    placeholder="dd/mm/yyyy"
                                                    invalidText="Ingresa una fecha"
                                                    //onClick={ anonymous }
                                                    //onChange={ anonymous }
                                                />
                                                <DatePickerInput
                                                    id="date-picker-input-id-2"
                                                    className="some-class"
                                                    pattern="d{1,2}/d{4}"
                                                    placeholder="dd/mm/yyyy"
                                                    invalidText="Ingresa una fecha"
                                                    //onClick={ anonymous }
                                                    //onChange={ anonymous }
                                                />
                                            </DatePicker>
                                        </div>
                                        <p className="form-datos">
                                            Por favor selecciona una hora de entrega y de devolucion
                                        </p>
                                        <div className="hora-input">
                                            <TimePicker
                                                //id="time-picker"
                                                hideLabel={ false }
                                                invalidText="Ingresa una hora"
                                                /* onClick={ anonymous }
                                                onChange={ anonymous }
                                                onBlur={ anonymous } */
                                            >
                                                <TimePickerSelect id="time-picker-select-1" labelText="Selecciona una hora">
                                                    <SelectItem value="AM" text="AM" />
                                                    <SelectItem value="PM" text="PM" />
                                                </TimePickerSelect>
                                            </TimePicker>
                                            <TimePicker
                                                id="time-picker"
                                                hideLabel={ false }
                                                invalidText="Ingresa una hora"
                                                /* onClick={ anonymous }
                                                onChange={ anonymous }
                                                onBlur={ anonymous } */
                                            >
                                                <TimePickerSelect id="time-picker-select-2" labelText="Selecciona una hora">
                                                    <SelectItem value="AM" text="AM" />
                                                    <SelectItem value="PM" text="PM" />
                                                </TimePickerSelect>
                                            </TimePicker>
                                        </div>
                                    </div>
                                </div>
                                <div className="car-model">
                                    <div className="car-name">
                                        <select
                                            onChange={ this.onCarChange.bind(this) }
                                            defaultValue="placeholder-item"
                                            id="select-1"
                                            className="bx--select-input"
                                            disabled={ null }
                                            data-invalid={ null }
                                        >
                                            <SelectItem
                                                disabled
                                                hidden
                                                value="placeholder-item"
                                                text="Modelo"
                                            />
                                            <DisplayCars selectedOptionSuc={ this.state.selectedOptionSuc } cars={ this.state.cars } />
                                        </select>
                                    </div>
                                    <div className="car-image">
                                        <DisplayImage selectedOptionCar={ this.state.selectedOptionCar } />
                                    </div>
                                    <div className="submitRentar">
                                        <Button className="submit_button"
                                            kind="tertiary" onClick={ (event) => this.handleSubmit(event) } >
                                                Rentar!
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case APP_VIEWS.LOADING:
                return (
                    <Loading />
                );
        }
    }
}

export default Form;