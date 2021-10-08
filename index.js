const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const router = require('./routes')
const db = require('./db/database')
app.use(express.json())

db()

app.use('/api/v1', router)


app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})