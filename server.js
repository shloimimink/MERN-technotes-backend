require('dotenv').config()
require('express-async-errors')
const colors = require('colors')
const express = require('express')
const app = express()
const path = require('path')
const {logger, logEvents} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

mongoose.set('strictQuery', true);

connectDB()

console.log(process.env.NODE_ENV.blue.bold.underline)

app.use(logger)
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())

app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB'.cyan.bold.underline)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`.yellow.bold))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log'.red.underline)
})