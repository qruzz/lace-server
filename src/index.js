const PORT = 8080;

const express           = require('express');
const compression       = require('compression');
const bodyParser        = require('body-parser');
const mongoose          = require('mongoose');

const Graph             = require('./Graph');

const app = express();

const AUTHCODE = "afjCEsnkK3bJ@#$dz%3JRTMtWJIAZs@Cc$Me*%!KkXpNR9G1MS$2xtfn5!FfGsy!caK5#kVd4l%ghDyFWp2jAVGaPYdAaerCDW9Snu0G#IOXVBIb*uCx5gt7O0&c1&tUg#G7Nd5nUHTQM7d32nzRlRa3D&WqWN9y&Bqe3SCv7C*mS4LFV5kM37wFbgDgvjELZI%mvx*v&a!w0Ie3XWy$Gdu6NJJUJ#eN^&Q!pCUVyWkZ9B7py8p^a*92r80iOrX3v@BSREqS^MEkx3$#2kUtP%#X5Oq!L*Ovg9Fg5$6xR0oX";

const httpError = (status, defaultMessage) => {
    return (
        (message) => {
            this.status = status;
            this.message = message || defaultMessage;
            Error.captureStackTrace(this, this.constructor);
        }
    );
};

// Compress all request and responses that passes through the middleware
app.use(compression());
// Returns middleware that only parses urlencoded bodies
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Control the maximum request body size
app.use(bodyParser.json({ limit: '50mb'}))

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/lace');
mongoose.connection.on('connected', () => {
    console.log('Connected successfully to the database');
});
mongoose.connection.on('error', () => {
    console.warn('Error while connecting to the database');
});
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from the database');
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.error('Disconnected from the database through app termination');
        process.exit(0);
    });
});

app.use((req, res, next) => {
    // Set the IP to print on bad AUTHCODE
    const ip = (req. headers['x-forwarded-for'] || '').split(',').pop()
    || req.connection.remoteAddress
    || req.socket.remoteAddress
    || req.connection.socket.remoteAddress

    if (req.headers.auth !== AUTHCODE) {
        httpError(400, 'Validation failed');
        console.warn('Bad Auth Code');
        console.warn(req.headers.auth);
        console.warn(ip);
        return (res.json('Validation failed'));
    }

    console.log(`${new Date().toLocaleTimeString('fr', {timeZone: 'Europe/Paris', hourCycle: 'h24', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} : ${req.method} - ${req.url}`);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

Graph.route(app);

app.listen(PORT, () => {
    console.log(`Express Server is running on port ${PORT}`);
});