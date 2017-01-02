'use strict'

const express = require('express')
const app = express()
const config = require('./config.js')

app.disable('x-powered-by')
app.disable('etag')

app.use('/client', require('./routes/client.js'))

let server = require('https').createServer(config.get('ssl'), app)

server.listen(config.get('PORT'), () => {
	console.log('Listening on', config.get('PORT'))
})

module.exports = server
