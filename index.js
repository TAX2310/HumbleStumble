const express = require ('express')
const bodyParser = require ('body-parser')
const session = require ('express-session')
const validator = require ('express-validator');
const flash = require('express-flash-notification');
const expressSanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express()
const port = 8000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: '2e62d371bf77b877f1d86cfb040f234cac7bbab0069775a1f88d9b081d181588df8c2143d8821404d1aa42336af58fd9c1164e23da143c32ea4a6c33d925fd367453c187adb6d1dba4ef5351404f7abb',
    resave: false,
    saveUninitialized: false,
    cookie: {
    expires: 600000
    }
}));

app.use(cookieParser());
app.use(expressSanitizer());
app.use(flash(app));


//main.js link
require('./routes/main')(app);
require('./routes/create_account.js')(app);
require('./routes/login.js')(app);

app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
//app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => console.log(`app listening on port ${port}!`))