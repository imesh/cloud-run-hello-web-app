const {GoogleAuth} = require('google-auth-library');
const got = require('got');
const auth = new GoogleAuth();

let client, serviceUrl;

if (!process.env.HELLO_API_URL) throw Error('HELLO_API_URL environment variable not found');
serviceUrl = process.env.HELLO_API_URL;

async function invokeHelloAPI() {
    const serviceRequestOptions = {
        method: 'GET',
        headers: {},
        timeout: 3000
    };

    try {
        // Create a Google Auth client with the target service url as the target audience
        if (!client) {
            console.log('Creating Google Auth client: [service-url] ' + serviceUrl);
            client = await auth.getIdTokenClient(serviceUrl);
        }
        // Fetch the client request headers and add them to the service request headers
        // The client request headers include an ID token that authenticates the request
        console.log('Obtaining an Access Token...');
        const clientHeaders = await client.getRequestHeaders();
        serviceRequestOptions.headers['Authorization'] = clientHeaders['Authorization'];
    } catch (err) {
        const message = 'GoogleAuth server could not respond to request: ';
        console.log(message, err);
        throw Error(message, err);
    };

    try {
        console.log('Invoking hello-api...');
        const response = await got(serviceUrl, serviceRequestOptions);
        return response.body;
    } catch (err) {
        const message = 'hello-api could not respond to request: ';
        console.log(message, err.response.body);
        throw Error(message, err.response.body);
    };
}

const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
    try {
        console.log('Invoking hello-api...');
        let response = await invokeHelloAPI(); 
        console.log(`hello-api response received: ${JSON.stringify(response)}`);
        res.status(200).send(response);
    } catch (err) {
        const message = 'Error invoking hello-api: ';
        console.log(message, err);
        res.status(500).send(message + err);
    }
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
