/* eslint-disable compat/compat */
import React, { Component } from 'react';
import '../styles/App.css';
/* import {
    Button,
} from 'carbon-components-react'; */
import axios, { post } from 'axios';
import swal from 'sweetalert';
import Loading from './Loading';

let ibmEmailRegex = /^([-a-z0-9~!$%^&amp;*_=+}{'?]+\.)*([-a-z0-9~!$%^&amp;*_=+}{'?])+(@)([-a-z0-9~!$%^&amp;*_=+}{'?]+\.)?(ibm.com)$/i;

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
                                    <div className="mail-form-panel">
                                        <p className="form-mail" >
                                            Please ensure that your Invite File contains all required fields as defined in the MEDALLIA Invitation File Data Dictionary 
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="help-contact">
                                <p className="form-contact">
                                    Having trouble? You can contact us in our Slack Channel <a className="form-mail" href="https://ibm-go.slack.com/messages/CLEH289GA/ " target="_blank" rel="noopener noreferrer"><svg width="16" height="16" className="c-nav--footer__svgicon c-slackhash" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"></path><path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"></path><path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"></path><path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"></path></g></svg>#rel-file-setup</a> under NPS Implementation.
                                </p>
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