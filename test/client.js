process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // Ignore self signed cert errror

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server.js')
const should = chai.should()
const ClientModel = require('../models/client.js')

const client = new ClientModel()

chai.use(chaiHttp)

describe('Client', () => {

	describe('Model', () => {

		it('create', () => {
			let data = {
				email: 'kristian@gmail.net',
				phone: '+447758422852',
				tere: 'piim',
				alma: 123,
				textas: [1, 2, 0],
				adwa: { a: 0, b: 7, g: 'asd', g: [0,2,5] },
				j222: NaN,
				'dawjda': 'adjifjaak',
				'dawjda2': 'adjifjaak',
				'dawjda3': 'jaduwhda',
				'dawjda3': 'adjifjaak',
				isdeleted: false,
				istrused: 'FALSE',
				'named': true
			}

			client.create(data).then((id) => {
				id.should.be.a('number')
			}).catch((error) => {
				console.log(error)
			})
		})

		it('read', () => {
			let data = {
				email: 'chris@gmail.org',
				phone: '+447758422852',
				tere: 'pi22im',
				alma: 123
			}

			client.create(data).then((id) => {
				id.should.be.a('number')

				return client.read(id).then((item) => {
					item.should.be.a('object')
					item.should.have.property('alma')
					item.alma.should.eq(123)

					item.should.have.property('phone')
					item.phone.should.eq('*********2852')
				}).catch((error) => {
					console.log(error)
				})
			}).catch((error) => {
				console.log(error)
			})
		})

		it('list', () => {
			client.list().then((items) => {
				items.should.be.a('object')
			}).catch((error) => {
				console.log(error)
			})
		})

		it('find', () => {
			let data = {
				email: 'chris@gmail.org',
				phone: '+447758422852',
				tere: 'pi22im',
				alma: 555
			}

			client.create(data).then((id) => {
				id.should.be.a('number')

				return client.find('alma', 555).then((item) => {
					item.should.be.a('object')

					item.should.have.property(id)

					item[id].should.have.property('alma')
					item[id].alma.should.eq(555)

					item[id].should.have.property('email')
					item[id].email.should.eq('chris@gmail.org')

					item[id].should.have.property('phone')
					item[id].phone.should.eq('*********2852')
				}).catch((error) => {
					console.log(error)
				})
			})
		})

		it('hide phone functionality', () => {
			let n = client.hidePhone('+447758422852')
			n.should.eq('*********2852')

			n = client.hidePhone('+07472423945')
			n.should.eq('********3945')
		})

		describe('email validation', () => {
			let tests = [
				{ arg: '1234567890123456789012345678901234567890123456789012345678901234+x@example.com', expected: false },
				{ arg: 'this\ still\"not\\allowed@example.com', expected: false },
				{ arg: 'a"b(c)d,e:f;g<h>i[j\k]l@example.com', expected: false },
				{ arg: 'A@b@c@example.com', expected: false },
				{ arg: 'Abc.example.com', expected: false },

				{ arg: 'prettyandsimple@example.com', expected: true },
				{ arg: 'very.common@example.com', expected: true },
				{ arg: 'disposable-style.email.with+symbol@example.com', expected: true },
				{ arg: 'x@example.com', expected: true },
				{ arg: 'example-indeed@strange-example.com', expected: true },
				{ arg: 'admin@mailserver1', expected: true },
				{ arg: 'example@localhost', expected: true },
				{ arg: 'example@s.solutions', expected: true },
				{ arg: 'user@localserver', expected: true },
				{ arg: 'user@tt', expected: true }
			]

			tests.forEach((test) => {
				it(test.arg + ' should ' + (test.expected?'':'not') + ' succeed', () => {
					let res = !!client.validateEmail(test.arg)

					res.should.equal(test.expected)
				})
			})
		})

		describe('phone validation', () => {
			let tests = [
				{ arg: '+48 58547228899', expected: false },
				{ arg: '819816186184', expected: false },
				{ arg: '112258887', expected: false },
				{ arg: '59846518461', expected: false },
				{ arg: '80848616846', expected: false },

				{ arg: '07712345678 ', expected: true },
				{ arg: '+447712345678', expected: true },
				{ arg: '77 1234 5678', expected: true }
			]

			tests.forEach((test) => {
				it(test.arg + ' should ' + (test.expected?'':'not') + ' succeed', () => {
					let res = !!client.validatePhone(test.arg)

					res.should.equal(test.expected)
				})
			})
		})
	})

	describe('REST API', () => {

		it('GET /client/', (done) => {
			chai.request(server).get('/client/').end((err, res) => {
				res.should.have.status(200)
				res.should.have.property('body')
				res.body.should.be.a('object')

				done()
			})
		})

		it('GET /client/?name=james', (done) => {
			chai.request(server).get('/client/?name=james').end((err, res) => {
				res.should.have.status(200)
				res.should.have.property('body')
				res.body.should.be.a('object')

				done()
			})
		})

		it('POST /client/', (done) => {
			let data = {
				phone: '074 72423945',
				email: 'bob123@gmail.com',
				name: 'james bond',
				something: 'dark side'
			}

			chai.request(server).post('/client/').send(data).end((err, res) => {
				res.should.have.status(201)
				res.should.have.header('Location')

				done()
			})
		})

		it('GET /client/<id>', (done) => {
			let data = {
				phone: '074 72423945',
				email: 'bob123@gmail.com',
				name: 'james bond',
				something: 'dark side'
			}

			client.create(data).then((id) => {
				id.should.be.a('number')

				chai.request(server).get('/client/' + id).end((err, res) => {
					res.should.have.status(200)
					res.should.have.property('body')
					res.body.should.be.a('object')

					res.body.should.have.property('phone')
					res.body.phone.should.eq('********3945')

					done()
				})
			})
		})

		describe('Testing invalid inputs', () => {
			it('POST /client/ - (missing phone)', (done) => {
				let data = {
					email: 'bob123@gmail.com',
					name: 'bob'
				}

				chai.request(server).post('/client').send(data).end((err, res) => {
					res.should.have.status(400)
					res.body.should.be.a('object')
					res.body.should.have.property('error').eq('missing_param')

					done()
				})
			})

			it('POST /client/ - (missing email)', (done) => {
				let data = {
					phone: '+07472 423945',
					name: 'bob'
				}

				chai.request(server).post('/client').send(data).end((err, res) => {
					res.should.have.status(400)
					res.body.should.be.a('object')
					res.body.should.have.property('error').eq('missing_param')

					done()
				})
			})

			it('POST /client/ - (invalid phone)', (done) => {
				let data = {
					phone: '+372585 42005',
					email: 'bob123@gmail.com',
					name: 'bob'
				}

				chai.request(server).post('/client').send(data).end((err, res) => {
					res.should.have.status(400)
					res.body.should.be.a('object')
					res.body.should.have.property('error').eq('invalid_phone')

					done()
				})
			})

			it('POST /client/ - (invalid email)', (done) => {
				let data = {
					phone: '+07472 423945',
					email: 'invalid.email.com',
					name: 'bob'
				}

				chai.request(server).post('/client').send(data).end((err, res) => {
					res.should.have.status(400)
					res.body.should.be.a('object')
					res.body.should.have.property('error').eq('invalid_email')

					done()
				})
			})
		})

	})
})
