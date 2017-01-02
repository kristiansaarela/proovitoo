const pg = require('pg-promise')()
const config = require('../config.js')
const database = require('./db')

class Model {

	constructor () {
		this.db = database
	}

}

module.exports = Model
