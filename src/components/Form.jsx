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
} from 'carbon-components-react';
import axios, { post } from 'axios';
import swal from 'sweetalert';
import Loading from './Loading';

let ibmEmailRegex = /^([-a-z0-9~!$%^&amp;*_=+}{'?]+\.)*([-a-z0-9~!$%^&amp;*_=+}{'?])+(@)([-a-z0-9~!$%^&amp;*_=+}{'?]+\.)?(ibm.com)$/i;

let minDate = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
let maxDate = new Date().getDate() + '/' + (new Date().getMonth() + 2) + '/' + new Date().getFullYear();

const debug = require('debug')('relationship');

const APP_VIEWS = {
    INPUT: 'INPUT',
    LOADING: 'LOADING',
};

class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filesPreview: [],
            filesToBeSent: [],
            printcount: 1,
            file: '',
            response: '',
            invalidEmailBool: false,
            invalidEmail: false,
            email: '',
            resultStatus: 'failed',
            app_view: APP_VIEWS.INPUT,
            
            data: {},
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkIBMEmail = this.checkIBMEmail.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({ response: res.express }))
            .catch(err => debug(err));
    }

    callApi = async () => {
        const response = await fetch('/');
        const body = await response.json();
        if (response.status !== 200) { throw Error(body.message); }
        return body;
    };



    handleSubmit = event => {
        event.preventDefault();
        const url = '/';
        const formData = new FormData();
        formData.append('file', new Blob(this.state.filesToBeSent[0]), 'file.csv');
        const config = {
            timeout: 300000,
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
                        this.setState({
                            filesToBeSent: [],
                            invalidEmail: true,
                            filesPreview: [],
                        });
                        swal('Whoops', 'There was an error, please try again. If this error persists, please contact the site administrator.', 'error');
                        break;
                    case 'fail':
                        view = APP_VIEWS.INPUT;
                        swal('Whoops', res.data.messages.message, 'error');
                        break;
                    /* case 'fixed':
                        view = APP_VIEWS.FIXED;
                        break;  */
                    case 'SQL_injection':
                        view = APP_VIEWS.INPUT;
                        swal({
                            title: res.data.data.USFED.MSG,
                            icon: 'error',
                        });
                        break;
                    /* case 'fail':
                        view = APP_VIEWS.DNS;
                        break; */
                    case 'success':
                        let rejected_data = res.data.rejected; //agregar validacion front
                        let usfedMessage = res.data.data.USFED.MSG;
                        let usfed_hash_id = usfedMessage[Object.keys(usfedMessage)[3]];
                        let usfedRejected = usfedMessage[Object.keys(usfedMessage)[2]];
                        let usfedDNS = usfedMessage[Object.keys(usfedMessage)[1]];
                        let usfedProcessed = usfedMessage[Object.keys(usfedMessage)[0]];
                        let wwMessage = res.data.data.WW.MSG;
                        let ww_hash_id = wwMessage[Object.keys(wwMessage)[3]];
                        let wwRejected = wwMessage[Object.keys(wwMessage)[2]];
                        let wwDNS = wwMessage[Object.keys(wwMessage)[1]];
                        let wwProcessed = wwMessage[Object.keys(wwMessage)[0]];
                        view = APP_VIEWS.INPUT;
                        //this is the Excel
                        this.action(res.data.rejected, res.data.data.USFED.DNS, res.data.data.USFED.FIXED, res.data.data.WW.DNS, res.data.data.WW.FIXED);
                        swal('Awesome!', 'Your file has ' + 
                        rejected_data.length + ' records with errors in the file, ' +
                        usfedRejected + ' rejected records and ' + usfedDNS + ' caught by DNS and ' + usfedProcessed + ' processed records for US Federal. And for WW ' + 
                        wwRejected + ' rejected records and ' + wwDNS + ' caught by DNS and ' + wwProcessed + ' processed records.', 'success',
                        {
                            buttons: ['Cancel', 'Send!'],
                        })
                            .then((send) => {
                                view = APP_VIEWS.LOADING;
                                this.setState({
                                    ...this.setState,
                                    data: res.data,
                                    app_view: view,
                                });
                                let url = '/send_invite/';
                                let confirm = send ? 'True' : '';
                                axios.post(url, {
                                    WW: { send: confirm, id: ww_hash_id }, 
                                    USFED: { send: confirm, id: usfed_hash_id },
                                })
                                    .then(() => {
                                        view = APP_VIEWS.INPUT;
                                        // handle success
                                        let data = { ...this.state.data };
                                        this.setState({
                                            filesToBeSent: [],
                                            invalidEmail: true,
                                            invalidEmailBool: false,
                                            filesPreview: [],
                                            app_view: view,
                                            data: data,
                                        });
                                        if (confirm === 'True') {
                                            let fileName = document.createElement('p');
                                            fileName.innerHTML = 'Files ibm_rel_invite_file_WW_' + ww_hash_id + ' and ibm_rel_invite_file_USFED_' + usfed_hash_id;
                                            let alertTitle = document.createElement('p');
                                            let wwProcessed = wwMessage[Object.keys(wwMessage)[0]];
                                            alertTitle.innerHTML = 'Awesome!! ' + usfedProcessed +
                                                ' USFED records and ' + wwProcessed + ' WW records have been uploaded to Medallia Relationship';
                                            swal(
                                                {
                                                    title: alertTitle.innerHTML,
                                                    content: fileName,
                                                    icon: 'success',
                                                    className: 'swal-final',
                                                }
                                            );
                                        } else {
                                            swal('Your file has been discarded', '',
                                                {
                                                    icon: 'warning',
                                                }
                                            );
                                            //this.action().bind(this);
                                        }
                                    })
                                    .catch(err => {
                                        view = APP_VIEWS.INPUT;
                                        // handle error
                                        debug(err);
                                        this.setState({
                                            response: err.message,
                                            app_view: view,
                                            filesToBeSent: [],
                                            invalidEmail: true,
                                            filesPreview: [],
                                        });
                                        swal('Bad bad bad...', '',
                                            {
                                                icon: 'error',
                                            }
                                        );
                                    });
                            });
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
                console.error('error form: ', err);
                view = APP_VIEWS.INPUT;
                this.setState({
                    response: err.message,
                    app_view: view,
                    filesToBeSent: [],
                    invalidEmail: true,
                    filesPreview: [],
                });
                swal('The process is taking too long, please try again later.', '',
                    {
                        icon: 'error',
                    }
                );
            });
    }

    handleFileReady(file) {
        this.setState({
            filesToBeSent: file,
        });
    }

    checkIBMEmail(event) {
        if (ibmEmailRegex.test(event.target.value)) {
            //todo enableSubmit
            this.setState({
                ...this.state,
                invalidEmail: false,
                invalidEmailBool: true,
                email: event.target.value,
            });
        } else {
            this.setState({
                ...this.state,
                invalidEmail: true,
                invalidEmailBool: false,
            });
        }
    }



    handleChange = event => {
        this.setState({ email: event.target.value });
        
    }
    
    render() {
        switch (this.state.app_view) {
            default:
                return <div></div>;
            case APP_VIEWS.INPUT:
                return (
                    <div className="relationship-form">
                        <div className="relationship-form-flex">
                            <div className="relationship-form-inside">
                                <div className="relationship-form-column">
                                    <div className="mail-datos-panel">
                                        <p className="form-datos" >
                                            Por favor seleccione una sucursal
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
                                                        text="Sucursal"
                                                    />
                                                    <SelectItemGroup label="ZMG">
                                                        <SelectItem value="chapalita" text="Chapalita" />
                                                        <SelectItem value="gdlcentro" text="Guadalajara Centro" />
                                                        <SelectItem value="zapopan" text="Zapopan" />
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