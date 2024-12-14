const express = require('express')
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')

//const authRouter = require('./routes/auth')
//const categoryRouter = require('./routes/category')

const app = express()
const port = 3000

app.use(morgan('dev'));
app.use(express.json());
app.use(cors())

//app.use('/api',authRouter)
//app.use('/api',categoryRouter)

readdirSync('./routes')
    .map((c)=> app.use('/api', require('./routes/' + c)))

app.listen(port, () => console.log(`Start server on port ${port}!`))