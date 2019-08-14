/* eslint-disable compat/compat */
import React, { Component } from 'react';
import '../styles/App.css';
import {
    SelectItemGroup,
    SelectItem,
    Dropdown,
    DatePicker,
    DatePickerInput,
    TimePicker,
    Button,
} from 'carbon-components-react';
import axios, { post } from 'axios';
import swal from 'sweetalert';
import Loading from './Loading';
//import Reservations from './Reservations';
import moment from 'moment';

let minDate = (new Date().getDate() + 1) + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
let maxDate = new Date().getDate() + '/' + (new Date().getMonth() + 2) + '/' + new Date().getFullYear();

const APP_VIEWS = {
    INPUT: 'INPUT',
    LOADING: 'LOADING',
    //RESERVATIONS: 'RESERVATIONS',
};

const debug = require('debug')('rentacar');

const DisplayImage = ({ selectedOptionCar }) => {
    switch (selectedOptionCar) {
        default:
            return <img src="http://chanhassenautoplex.com/wp-content/uploads/2018/01/CarsAndCaves106-2-of-18.jpg" alt="carros"/>;
        case 'Yaris R 2019':
            return <img src="https://i.blogs.es/0f9d7d/toyota-yaris-r-2018_9/450_1000.jpg" alt="yaris"/>;
        case 'Corolla 2019':
            return <img src="https://www.cstatic-images.com/car-pictures/xl/usc70toc041g021001.png" alt="corolla"/>;
        case 'Sienna 2019':
            return <img src="https://www.cstatic-images.com/car-pictures/xl/usc80tov111a021001.png" alt="sienna"/>;
        case 'Spark 2017':
            return <img src="https://www.cstatic-images.com/car-pictures/xl/usc90chc331c021001.png" alt="spark"/>;
        case 'City 2016':
            return <img src="https://acs2.blob.core.windows.net/imgcatalogo/l/VA_ba7aadb2a6c94e93962c087db15f0f97.jpg" alt="city"/>;
        case 'Mazda 3 2018':
            return <img src="https://www.mazda.mx/siteassets/mazda-mx/mycos-2019/mazda-3-sedan/vlp/versiones/mazda-3-sedan-vlp-versiones-i.jpg" alt="mazda3"/>;
        case 'Tacoma 2010':
            return <img src="https://www.cstatic-images.com/car-pictures/xl/usc70tot096e121001.png" alt="yaris"/>;
        case 'HR-V 2019':
            return <img src="https://d1hv7ee95zft1i.cloudfront.net/custom/car-model-photo/original/2019-honda-hr-v-front-5b7fcb948d264.jpg" alt="corolla"/>;
        case 'Audi A6 2020':
            return <img src="https://s.aolcdn.com/dims-global/dims3/GLOB/legacy_thumbnail/640x400/quality/80/https://s.aolcdn.com/commerce/autodata/images/USC90AUC021A021001.jpg" alt="audia6"/>;
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
        this.onCarChange = this.onCarChange.bind(this);
        this.onDateChane = this.onDateChane.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.onTimeChange2 = this.onTimeChange2.bind(this);
        this.calculateTotal = this.calculateTotal.bind(this);
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
        this.setState({ selectedOptionCar: event.selectedItem.text });
        this.setState({ selectedOptionCarId: event.selectedItem.id });
    }

    onSucursalChange(event) {
        this.setState({ selectedOptionSuc: parseInt(event.target.value, 10) });
    }

    onSucursalChange2(event) {
        this.setState({ selectedOptionSucOut: parseInt(event.target.value, 10) });
    }

    onDateChane(event) {
        this.setState({ selectedOptionDateStart: event[0] });
        this.setState({ selectedOptionDateStartFormatted: moment(this.state.selectedOptionDateStart).format('YYYY-MM-DD') });
        this.setState({ selectedOptionDateEnd: event[1] });
        this.setState({ selectedOptionDateEndFormatted: moment(this.state.selectedOptionDateEnd).format('YYYY-MM-DD') });
        if (this.state.selectedOptionDateEnd) {
            let fechaRenta = (this.state.selectedOptionDateEnd - this.state.selectedOptionDateStart) / 1000 / 60 / 60; //converting ms to hours
            this.setState({ fechaRenta: fechaRenta });
        }
    }

    onTimeChange(event) {
        this.setState({ selectedOptionTimeStart: event.target.value });
    }

    onTimeChange2(event) {
        this.setState({ selectedOptionTimeEnd: event.target.value });
    }

    calculateTotal() {
        let total = 0;
        let tiempoRenta = 0;
        function timeToDecimal(t) {
            let arr = t.split(':');
            let dec = parseInt((arr[1] / 6) * 10, 10);
            return parseFloat(parseInt(arr[0], 10) + '.' + (dec < 10 ? '0' : '') + dec);
        }   
        const inicio = timeToDecimal(this.state.selectedOptionTimeStart);
        const fin = timeToDecimal(this.state.selectedOptionTimeEnd);
        let diff = inicio - fin;
        let diff2 = fin - inicio;
        if (this.state.selectedOptionTimeEnd < this.state.selectedOptionTimeStart) {
            let fechaRenta = (this.state.fechaRenta / 24) - 1;
            tiempoRenta = 24 - diff;
            total = (this.state.cars[this.state.selectedOptionCarId - 1].precio * fechaRenta) +
            ((this.state.cars[this.state.selectedOptionCarId - 1].precio / 3) * tiempoRenta);
        } else {
            tiempoRenta = diff2;
            total = (this.state.cars[this.state.selectedOptionCarId - 1].precio * this.state.fechaRenta / 24) + 
            ((this.state.cars[this.state.selectedOptionCarId - 1].precio / 3) * tiempoRenta);
        }
        if (this.state.selectedOptionSuc === 3) {
            total += (total * 0.10 );
        }
        if (this.state.selectedOptionSucOut === 3) {
            total += (total * 0.10 );
        }
        if (this.state.selectedOptionSuc !== this.state.selectedOptionSucOut) {
            total += 300;
        }
        if ((this.state.fechaRenta / 24) > 6) {
            total -= this.state.cars[this.state.selectedOptionCarId - 1].precio;
        }
        //this.setState({ totalRenta: total });
        return total;
    }
    
    handleSubmit() {
        const url = '/reservacion';
        let reservacion = {
            car_id: this.state.selectedOptionCarId,
            fecha_inicio: this.state.selectedOptionDateStartFormatted + ' ' + this.state.selectedOptionTimeStart,
            fecha_fin: this.state.selectedOptionDateEndFormatted + ' ' + this.state.selectedOptionTimeEnd,
            total: this.calculateTotal(), //this.state.total, 
            pagado: 0, //ahorita siempre sera 0 hasta implementar pago
        };

        this.setState({
            ...this.setState,
            app_view: APP_VIEWS.LOADING,
        });

        post(url, reservacion)
            .then(res => {
                let resStatus = res.data.message;
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
                                            Por favor seleccione una sucursal para recoger
                                        </p>
                                        <div className="dropdown-renta">
                                            <div className="bx--form-item">
                                                <select
                                                    onChange={ this.onSucursalChange.bind(this) }
                                                    defaultValue="placeholder-item"
                                                    id="select-suc-in"
                                                    className="bx--select-input"
                                                >
                                                    <SelectItem
                                                        disabled
                                                        hidden
                                                        value="placeholder-item"
                                                        text="Sucursal"
                                                    />
                                                    <SelectItemGroup label="ZMG">
                                                        <SelectItem value="1" text={ this.state.sucs.map(sucs => sucs.name)[0] } />
                                                        <SelectItem value="2" text={ this.state.sucs.map(sucs => sucs.name)[1] } />
                                                        <SelectItem value="3" text={ this.state.sucs.map(sucs => sucs.name)[2] } />
                                                        <SelectItem value="4" text={ this.state.sucs.map(sucs => sucs.name)[3] } />
                                                    </SelectItemGroup>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="form-datos" >
                                            Por favor seleccione una sucursal de retorno
                                        </p>
                                        <div className="dropdown-renta">
                                            <div className="bx--form-item">
                                                <select
                                                    onChange={ this.onSucursalChange2.bind(this) }
                                                    defaultValue="placeholder-item"
                                                    id="select-suc-out"
                                                    className="bx--select-input"
                                                >
                                                    <SelectItem
                                                        disabled
                                                        hidden
                                                        value="placeholder-item"
                                                        text="Sucursal"
                                                    />
                                                    <SelectItemGroup label="ZMG">
                                                        <SelectItem value="1" text={ this.state.sucs.map(sucs => sucs.name)[0] } />
                                                        <SelectItem value="2" text={ this.state.sucs.map(sucs => sucs.name)[1] } />
                                                        <SelectItem value="3" text={ this.state.sucs.map(sucs => sucs.name)[2] } />
                                                        <SelectItem value="4" text={ this.state.sucs.map(sucs => sucs.name)[3] } />
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
                                                onChange={ this.onDateChane } //this must change
                                                //onClose={ anonymous } //this must change
                                                minDate={ minDate }
                                                maxDate={ maxDate }
                                                datePickerType="range"
                                                locale="es"
                                                dateFormat="d/m/Y"
                                            >
                                                <DatePickerInput
                                                    id="date-picker-input-id"
                                                    labelText=""
                                                    className="some-class"
                                                    pattern="d{1,2}/d{4}"
                                                    placeholder="dd/mm/yyyy"
                                                    invalidText="Ingresa una fecha"
                                                />
                                                <DatePickerInput
                                                    id="date-picker-input-id-2"
                                                    labelText=""
                                                    className="some-class"
                                                    pattern="d{1,2}/d{4}"
                                                    placeholder="dd/mm/yyyy"
                                                    invalidText="Ingresa una fecha"
                                                />
                                            </DatePicker>
                                        </div>
                                        <p className="form-datos">
                                            Por favor selecciona una hora de entrega y de devolucion
                                        </p>
                                        <div className="hora-input">
                                            <TimePicker
                                                id="time-picker1"
                                                hideLabel={ false }
                                                invalidText="Ingresa una hora"
                                                //onClick={ this.onTimeChange }
                                                onChange={ this.onTimeChange }
                                            >
                                            </TimePicker>
                                            <TimePicker
                                                id="time-picker2"
                                                hideLabel={ false }
                                                invalidText="Ingresa una hora"
                                                onChange={ this.onTimeChange2 }
                                            >
                                            </TimePicker>
                                        </div>
                                    </div>
                                </div>
                                <div className="car-model">
                                    <div className="car-name">
                                        <Dropdown
                                            id="carbon-dropdown-cars"
                                            label="Carros Disponibles"
                                            ariaLabel="Cars Dropdown"
                                            invalidText="A valid value is required"
                                            items={ this.state.cars
                                                .filter(c => c.suc === this.state.selectedOptionSuc)
                                                .map(c => ({ id: c.id_car, text: c.name  + ' ' + c.modelo })) }
                                            itemToString={ item => { if (typeof item === 'string') { return item; } return item ? item.text : ''; } }
                                            onChange={ this.onCarChange }
                                        />
                                    </div>
                                    <div className="car-image">
                                        <DisplayImage selectedOptionCar={ this.state.selectedOptionCar } sucs={ this.state.sucs } />
                                    </div>
                                    <div className="submitRentar">
                                        <Button className="submit_button"
                                            kind="secondary" onClick={ (event) => this.handleSubmit(event) } >
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