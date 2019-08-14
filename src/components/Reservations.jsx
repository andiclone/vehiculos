import React, { Component } from 'react';
import '../styles/App.css';
import { DataTable,
    TableContainer,
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
} from 'carbon-components-react';

class Reservations extends Component {

    /* componentWillMount() {
        this.errors = {};
        if (this.props.data.data.message === 'File not valid') {
            // eslint-disable-next-line
            this.props.data.data.reasons.map(elem => {
                let array = [];
                if (elem.error) {
                    Object.keys(elem.error).forEach((key) => {
                        elem.error[key].forEach(el => {
                            array.push(key.toUpperCase() + ': ' + el);
                        });
                    });
                }
                let errorId = elem.email_id + ' with PID: ' + elem.gbt_level_40_code;
                this.errors[errorId] = (array.length) ? array : [elem.rejected_reason];
            });
        } else {
            this.errors.message = this.props.data.data.message;
            this.errors.invalidColumns = this.props.data.data.reasons;
        }
    } */
    

    render() {
        return (
            <div className="contenido">
                <div className="div_ui_errors">
                    <label className="labelwhite_ui_errors">Reservaciones</label>
                </div>
                <div className="tablaReservaciones">
                    <DataTable
                        rows={ 'carro' }
                        headers={ 'carros' }
                        render={ ({ rows, headers, getHeaderProps }) => (
                            <TableContainer title="DataTable">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {headers.map(header => (
                                                // eslint-disable-next-line react/jsx-key
                                                <TableHeader { ...getHeaderProps({ header }) }>
                                                    {header.header}
                                                </TableHeader>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map(row => (
                                            <TableRow key={ row.id }>
                                                {row.cells.map(cell => (
                                                    <TableCell key={ cell.id }>{cell.value}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) }
                    />
                </div>
            </div>
        );
    }
}

export default Reservations;