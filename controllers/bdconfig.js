require('dotenv').config({ path: '.env.local' });



const bdconfig = {
    server: process.env.BD_SERVER,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.BD_USERNAME,
            password: process.env.BD_PASSWORD
        }
    },
    options: {
        database:process.env.BD_DATABASE,
        trustServerCertificate: true
    }
}   

module.exports = {
    bdconfig
}