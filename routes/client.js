'use strict'

const router = require('express').Router()
const bodyparser = require('body-parser')
const validatePhone = require('phone')
const ClientModel = require('../models/client.js')

router.use(bodyparser.json())

// todo check if i send content type json

const client = new ClientModel()

// GET /clients + query string?
router.get('/', (req, res, next) => {
	if (Object.keys(req.query).length) {
		if (Object.keys(req.query).length > 1) {
			// Only searching by 1 key is supported.
		}

		let key = Object.keys(req.query)[0]
		let val = req.query[key]

		client.find(key, val).then((items) => {
			res.status(200)
			res.send(items)
		}).catch((error) => {
			// log
			console.log(error)
			res.sendStatus(500)
		})

	} else {
		client.list().then((items) => {
			res.status(200)
			res.send(items)
		}).catch((error) => {
			// log
			console.error(error)
			res.sendStatus(500)
		})
	}
})

router.post('/', (req, res) => {
	if (!('phone' in req.body) || !('email' in req.body)) {
		res.status(400)
		res.send({ error: 'missing_param' })
		return false
	}

	let phone = client.validatePhone(req.body.phone.toString())

	if (phone === false) {
		res.status(400)
		res.send({ error: 'invalid_phone' })
		return false
	}

	let email = client.validateEmail(req.body.email.toString())

	if (email === false) {
		res.status(400)
		res.send({ error: 'invalid_email' })
		return false
	}

	req.body.phone = phone
	req.body.email = email

	client.create(req.body).then((id) => {
		res.location('/client/' + id)
		res.sendStatus(201)
	}).catch((error) => {
		// todo log
		res.sendStatus(500)
	})
})

// GET /clients/:id
router.get('/:id', (req, res, next) => {
	var id = parseInt(req.params.id)

	if (isNaN(id)) {
		res.sendStatus(404)
		return false
	}

	client.read(id).then((result) => {
		if (result === null) {
			res.sendStatus(404)
			return false
		}

		res.status(200)
		res.send(result)
	}).catch((error) => {
		res.sendStatus(500)

		// todo: log
		//next(error, req, res, next)
	})
})

module.exports = router
