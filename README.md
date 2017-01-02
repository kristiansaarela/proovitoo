# Install

## Requirements

* NodeJS 6.9.1
* npm 3.10.9
* PostgreSQL 9.6.1

## Ubuntu (16.04)

Unpack zip and enter the folder.

Install node and npm as instructed in [nodejs.org](https://nodejs.org/en/download/package-manager/):

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install PostgreSQL:

```
sudo apt-get install -y postgresql postgresql-contrib
```

Change/create password for default user

```
sudo -u postgres psql postgres
\password postgres
\q
```

Create database schema

```
sudo -u postgres psql < schema.sql
```

Create config file based on `config/example.json` and save it as `config/default.json`

Generate self-signed certificate for HTTPS

```
cd ssl
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
cd ..
```

Install dependencies

```
npm install
```

# Running

```
sudo npm start
```

Run tests

```
sudo npm test
```

## PM2 & start up (optional)

Install pm2

```
sudo npm install -g pm2
```

Run

```
pm2 start process.json
```

### Create start up script

#### Ubuntu

Follow the instructions from this command

```
pm2 startup ubuntu
```

# Usage

## Store client data

`POST /client/`

Payload must be object, key value based and must contain `email` and `phone` key-value pairs.

```json
{
	"name": "jason born",
	"email": "iwasbornjason@example.com",
	"phone": "77 1234 5678",
	"age": 44,
	"alive": true
}
```

Returns HTTP status 201 and location header on success, JSON data and status code 400 on error.

## Get client data

`GET /client/<id>`

Id parameter must be number.

Returns HTTP status 200 and client data as JSON on success, status code 404 if client is not found.

```json
{
	"name": "jason born",
	"email": "iwasbornjason@example.com",
	"phone": "*********5678",
	"age": 44,
	"alive": "true"
}
```

## Get all clients data

`GET /client/`

Returns JSON object with client ids as keys and client data as values.

```json
{
	"1": {
		"email": "kris@hallaine.net",
		"phone": "*********2852",
		"tere": "piim",
		"alma": 123
	},
	"2": {
		"email": "kris@hallaine.net",
		"phone": "*********2852",
		"tere": "piim",
		"alma": 123
	},
	"3": {
		"email": "kris@hallaine.net",
		"phone": "*********2852",
		"tere": "piim",
		"alma": 123,
		"textas": "{1,2,0}"
	}
}
```

## Find clients

`GET /client/?<key>=<value>`

Key and value must both be strings. Only supports searching by 1 pair.

Returns HTTP status 200 and clients matching search data.

```json
{
	"184": {
		"name": "jason born",
		"email": "iwasbornjason@example.com",
		"phone": "*********5678",
		"age": 44,
		"alive": "true"
	}
}
```

# Author

Kristian Saarela `kristian.saarela(ät)eesti.ee`
