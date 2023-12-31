# Cosmian for SaaS Applications - KMS + PKI Basics with Covercrypt

This documentation provides instructions on using KMS (Key Management System) combined with our attribute-based encryption scheme, Covercrypt.
The relevant actions are documented in `/src/utils/actions.ts`.

## Setting up Environment Variables

Create a file named `.env` with the following variables:

```
VITE_AUTH0_DOMAIN="<your-tenant>.<region>.auth0.com"
VITE_AUTH0_CUSTOM_DOMAIN="AUTH0_DOMAIN_CUSTOM_DOMAIN"
VITE_AUTH0_CLIENT_ID="AUTH0_CLIENT_ID"
VITE_CLIENT_2_TOKEN="CLIENT_2_TOKEN_GOES_HERE"
VITE_BACKEND_URL="YOUR_BACKEND_URL_GOES_HERE"
VITE_MSE_APP_URL="YOUR_MSE_APP_URL_GOES_HERE"
```

## Running the KMS Image and the User Interface (UI)

Requires Node version 18 or higher.

```
docker-compose build
docker-compose up
```

After the process is complete, open your browser and navigate to [http://localhost:3000](http://localhost:3000/).

## Running in development mode

Start a Cosmian KMS server on http://localhost:9998:

```
docker run -p 9998:9998 --name kms ghcr.io/cosmian/kms:4.7 --jwt-issuer-uri=https://<your-tenant>.<region>.auth0.com/ --jwks-uri=https://<your-tenant>.<region>.auth0.com/.well-known/jwks.json
```

Then start the UI with:

```
npm install
npm run dev
```
