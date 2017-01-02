const Phone = require('phone')
const crypto = require('crypto')
const config = require('../config')
const Model = require('../libs/model')

class Client extends Model {

	constructor () {
		super()
	}

	create (data) {
		let self = this

		data.phone = this.encrypt(data.phone)

		return new Promise((resolve, reject) => {
			self.db.query({
				name: 'insert-client',
				text: 'INSERT INTO client (id) VALUES (default) RETURNING id',
			}).then((result) => {
				let clientID = result[0].id

				self.db.tx((task) => {
					let queries = Object.keys(data).map((name) => {
						return task.none('INSERT INTO client_data (clientID, key, value) VALUES ($1, $2, $3)', [clientID, name, data[name]])
					})

					return task.batch(queries)
				}).then((result) => {
					resolve(clientID)
				})
			}).catch((error) => {
				reject(error)
			})
		})
	}

	read (id) {
		let self = this

		return new Promise((resolve, reject) => {
			self.db.query({
				name: 'select-client',
				text: 'SELECT key, value FROM client_data WHERE clientID = $1',
				values: [parseInt(id)]
			}).then((rows) => {
				if (!rows.length) {
					resolve(null)
					return true
				}

				let result = {}

				rows.forEach((row) => {
					row = self._parseRow(row)

					result[row.key] = row.value
				})

				resolve(result)
			}).catch((error) => {
				reject(error)
			})
		})
	}

	list () {
		let self = this

		return new Promise((resolve, reject) => {
			self.db.query({
				name: 'list-clients',
				text: 'SELECT clientID, key, value FROM client_data',
			}).then((rows) => {
				resolve(self._parseResultSet(rows))

			}).catch((error) => {
				reject(error)
			})
		})
	}

	find (key, value) {
		let self = this

		return new Promise((resolve, reject) => {
			let opts

			if (key === 'phone') {
				opts = {
					name: 'select-phones',
					text: 'SELECT clientID, value FROM client_data WHERE key = \'phone\'',
				}
			} else {
				opts = {
					name: 'find-clients',
					text: 'SELECT DISTINCT ON (clientID) clientID FROM client_data WHERE key = $1 AND value LIKE $2',
					values: [key, '%' + value + '%']
				}
			}

			self.db.query(opts).then((rows) => {
				if (!rows.length) {
					resolve({})
					return false
				}

				let ids = []

				if (key === 'phone') {
					rows.forEach((n) => {
						let phone = this.decrypt(n.value)

						if (phone.indexOf(value) !== -1) {
							ids.push(n.clientid)
						}
					})
				} else {
					ids = rows.map((n) => {
						return n.clientid
					})
				}

				self.db.query({
					name: 'select-bulk',
					text: 'SELECT clientID, key, value FROM client_data WHERE clientID = ANY($1::int[])',
					values: [ids]
				}).then((rows) => {
					resolve(this._parseResultSet(rows))
				})

			}).catch((error) => {
				reject(error)
			})
		})
	}

	_parseRow (row) {
		if (row.key === 'phone') {
			row.value = this.decrypt(row.value)
			row.value = this.hidePhone(row.value)
		} else {
			let int = parseInt(row.value)
			if (!isNaN(int)) {
				row.value = int
			}

			let float = parseFloat(row.value)
			if (!isNaN(float)) {
				row.value = float
			}
		}

		return row
	}

	_parseResultSet (rows) {
		let result = {}

		if (rows.length) {
			rows.forEach((row) => {
				row = this._parseRow(row)

				row.clientid = parseInt(row.clientid)

				if (!result[row.clientid]) {
					result[row.clientid] = {}
				}

				result[row.clientid][row.key] = row.value
			})
		}

		return result
	}

	validatePhone (n) {
		let res = Phone(n, 'GB') // 07472423945 => ['+447472423945', 'GBR']

		if (!res.length) {
			return false
		}

		return res[0]
	}

	validateEmail (addr) {
		// Testing if local part contains reasonable chars and is under 64 in length
		let emailregex = /^([a-z0-9.+-]{1,64})@([a-z0-9.-]+)$/i

		if (addr.length > 255 || addr.length < 2 || !emailregex.test(addr)) {
			return false
		}

		return addr
	}

	encrypt (data) {
		var cipher = crypto.createCipher(config.get("CRYPTO_ALGO"), config.get("CRYPTO_PASS"))
		var crypted = cipher.update(data, 'utf8', 'hex')
		crypted += cipher.final('hex')

		return crypted
	}

	decrypt (data) {
		var decipher = crypto.createDecipher(config.get("CRYPTO_ALGO"), config.get("CRYPTO_PASS"))
		var source = decipher.update(data, 'hex', 'utf8')
		source += decipher.final('utf8')

		return source
	}

	hidePhone (n, show) {
		n = n.toString()
		show = show || 4

		let len = n.length - show
		let visible = n.substr(show * -1)

		return '*'.repeat(len) + visible
	}

}

module.exports = Client
