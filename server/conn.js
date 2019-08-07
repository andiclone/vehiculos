const mysql = require('mysql');

// First you need to create a connection to the db
const con = mysql.createConnection({
    host: 'localhost',
    user: 'andres',
    password: 'hola.1234',
    database: 'rentacar',
});

con.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        console.log(err);
        return;
    }
    console.log('Connection established');
});

const reservation = {
    id_car: 1,
    date_start: '',
    date_end: '',
};

function makeReservation() {
    con.query('INSERT INTO reservaciones (id_car, date_start, date_end) VALUES (' + reservation + ')', (err, rows) => {
        if (err) {
            throw err;
        } 
        return rows;
    });
}

/* con.query('SELECT * FROM cars', (err, rows) => {
    if (err) {throw err;}
    rows.forEach( (row) => {
        console.log(`${row.name} modelo ${row.modelo}`);
    });
}); */



/* con.end((err) => {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
    if (err) { 
        console.log('Conection ended unexpectedly', err);
    }
    console.log('Conection ended');
}); */




