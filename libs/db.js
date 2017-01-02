const pg = require('pg-promise')()
const config = require('../config.js')

let db = pg({
	host: config.get("POSTGRE_HOST"),
	port: config.get("POSTGRE_PORT"),
	database: config.get("POSTGRE_DATABASE"),
	user: config.get("POSTGRE_USER"),
	password: config.get("POSTGRE_PASSWORD")
})

module.exports = db
