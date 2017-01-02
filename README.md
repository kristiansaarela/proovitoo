# Install

## Requirements

* NodeJS 6.9.1
* npm 3.10.9
* PostgreSQL 9.6.1

## Ubuntu

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

Create config file based on `config/example.json` and save it as `default.json`

Generate self-signed certificate for HTTPS

```
mkdir ssl && cd ssl
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
npm start
```

Run tests

```
npm test
```

## PM2 & start up (optional)

Install pm2

```
sudo npm install -g pm2
```

Run

```
pm2 start process.js
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

Returns HTTP status 201 and location on success, JSON data and status code 400 on error.

## Get client data

`GET /client/<id>`

Id parameter must be number.

Returns HTTP status 200 and client data as JSON on success, status code 404 if client is not found.

## Get all clients data

`GET /client/`

Returns JSON object with client ids as keys and client data as values.

## Find client

``GET /client/<key>=<value>`

Key and value must both be strings. Only supports searching by 1 pair.

Returns HTTP status 200 and clients matching search data.

# Author

Kristian Saarela `kristian.saarela(ät)eesti.ee`
