const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 3000;

const secretKey = 'My Super Secret Key!';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'bob',
        password: '123'
    },
    {
        id: 2,
        username: 'sach',
        password: '456'
    }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    let token;
    
    for (let user of users) {
        if (username === user.username && password === user.password) {
            token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m'});
            break;
        }
    }
    if (token) {
        res.json({
            success: true,
            err: null,
            token
        })
    }
    else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

app.post('/api/decodeJwt', (req, res) => {
    const data = req.body;
    try {
        const decoded = jwt.decode(data.token, secretKey);
        res.json({
            success: true,
            exp: decoded.exp
        });
    }
    catch (err) {
        res.json({
            success: false,
            officialError: "JWT Token Validation Failed"
        });
    }
    
})

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see :3'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Welcome to the settings page!'
    });
});

app.use(function(err, req, res, next) {
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});