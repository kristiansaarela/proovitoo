const config = require('nconf')
const path = require('path')
const fs = require('fs')

let envconf = path.join(__dirname, '/config/default.json')

if (!fs.existsSync(envconf)) {
	throw new Error('config/default.js file is missing!')
	return false
}

config.argv({
	'PORT': {
		describe: 'Change server port'
	}
})

config.file({ file: envconf })

config.env(['NODE_ENV'])

config.defaults({
	port: 8080,

	CRYPTO_PASS: 'lkajshda',
	CRYPTO_ALGO: 'aes-256-ctr',

	POSTGRE_HOST: 'localhost',
	POSTGRE_PORT: 5432,
	POSTGRE_USER: 'postgres',
	POSTGRE_PASSWORD: 'paberkott',
	POSTGRE_DATABASE: 'proovitoo_kristian',

	ssl: {
		key: fs.readFileSync(path.join(__dirname, '/ssl/key.pem')),
		cert: fs.readFileSync(path.join(__dirname, '/ssl/cert.pem'))
	}
})

module.exports = config
