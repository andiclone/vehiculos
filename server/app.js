const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const mysql = require('mysql');
const debug = require('debug')('rentacar');
const app = express();

const DB = {
    host: 'localhost',
    user: 'andres',
    password: 'hola.1234',
    database: 'rentacar',
};

app.use(logger('dev'));
app.use(express.json());

app.use('/reservacion', (req, res) => {
    const conn = mysql.createConnection(DB);
    conn.connect((err) => {
        if (err) { res.status(500).send({ message: 'MySQL Error', error: err }); }
        debug('Connection established');

        let result = {
            message: 'Success',
        };
        console.log(req.body);
        let car_id = req.body.car_id;
        let fecha_inicio = req.body.fecha_inicio;
        let fecha_fin = req.body.fecha_fin;
        let total = req.body.total;
        let pagado = req.body.pagado;
        conn.query('INSERT INTO reservaciones (id_car, date_start, date_end, total, pagado) VALUES (' + car_id + ", '" + 
        fecha_inicio + "', '" + fecha_fin + "', " + total + ', ' + pagado + ');', (err, rows) => {
            if (err) {
                throw err;
            }
            conn.end((err1) => {
                // The connection is terminated gracefully
                // Ensures all previously enqueued queries are still
                // before sending a COM_QUIT packet to the MySQL server.
                if (err1) { 
                    result['error'] = { message: 'MySQL Closing Connection Error', error: err1 };
                }
                result.message = 'success';
                res.send(result);
            });
            return rows;
        });
    });
});

app.use('/getAllInfo', (req, res) => {
    const conn = mysql.createConnection(DB);
    conn.connect((err) => {
        if (err) { res.status(500).send({ message: 'MySQL Error', error: err }); }
        debug('Connection established');

        let result = {
            message: '',
            data: {},
        };
        conn.query('select c.id_car, c.name, c.modelo, c.precio, id_suc as suc from sucs_cars join cars as c using(id_car)', (err1, rows1) => {
            if (err1) { res.status(500).send({ message: 'MySQL Error', error: err1 }); }
            result.data['cars'] = rows1;
            conn.query('SELECT * FROM sucursales', (err2, rows2) => {
                if (err2) { res.status(500).send({ message: 'MySQL Error', error: err2 }); }
                result.data['sucs'] = rows2;
                conn.query('SELECT * FROM sucs_cars', (err3, rows3) => {
                    if (err3) { res.status(500).send({ message: 'MySQL Error', error: err3 }); }
                    result.data['cars_by_suc'] = rows3;
                    conn.end((err4) => {
                        // The connection is terminated gracefully
                        // Ensures all previously enqueued queries are still
                        // before sending a COM_QUIT packet to the MySQL server.
                        if (err4) { 
                            result['error'] = { message: 'MySQL Closing Connection Error', error: err4 };
                        }
                        result.message = 'success';
                        res.send(result);
                    });
                });
            });
        });
    });
});

app.use('/', (req, res) => { res.send('Not implemented yet'); });

// 404
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

module.exports = app;