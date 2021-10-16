const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const router = require('./routes')
const db = require('./db/database')
app.use(express.json())
const passport = require('./middlewares/passport')
const session = require('cookie-session')
const cors = require('cors')

db()
app.use(session({
    name: "userlogin-cookie",
    keys: ["apaaja", "bisaapaaja"]
}))
app.use(passport.initialize())
app.use(passport.session())
app.use('/api/v1', router)
app.use(cors({ origin: "http://localhost:3000", credentials: true }))


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.get('/', (req, res) => {
    return res.status(200).json({
        status: "running",
        message: "server connected"
    })
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})