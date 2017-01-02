CREATE DATABASE proovitoo_kristian;

\c proovitoo_kristian;

CREATE TABLE client (
  id SERIAL PRIMARY KEY
);

CREATE TABLE client_data (
  clientID INTEGER REFERENCES client (id),
  key VARCHAR,
  value VARCHAR
);
