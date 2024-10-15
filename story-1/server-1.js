const express = require('express');
const fetch = require('node-fetch');
const compression = require('compression');
const http = require('http');

// global.fetch = fetch;
// global.Headers = fetch.Headers;
// global.Request = fetch.Request;
// global.Response = fetch.Response;


process.on('SIGINT', () => {
	process.exit(130);
});

process.on('SIGHUP', () => {
	process.exit(129);
});

process.on('SIGTERM', () => {
	process.exit(143);
});

const app = express();
app.use(compression());

class ApiCaller {
	constructor() {
		this.agent = new http.Agent({ keepAlive: true, maxSockets: 24 });
	}

	async fetchWithTimeout(url, options, timeout = 1000) {
		let timerId = undefined;
		const timeoutPromise = new Promise((_, reject) => {
			timerId = setTimeout(reject, timeout, new Error('Request timed out'));
		});

		const finalOptions = {
			...options,
			agent: this.agent,
		};

		const fetchPromise = fetch(url, finalOptions).then((response) => {
			if (response.ok) {
				return response.json();
			}

			return response.json().then(errorjson => {
				return Promise.reject(errorjson);
			})
		})

		return Promise.race([fetchPromise, timeoutPromise]).then((response) => {
			clearTimeout(timerId);
			return response;
		});
	}
}

const apiCaller = new ApiCaller();

const fetchSerially = async (countries) => {
	const combinedResponse = {}
	const timeout = 150000;

	for (let country of countries) {
		try {
			const json = await apiCaller.fetchWithTimeout(
				`http://localhost:3001/pop/${country}`,
				{
					method: 'POST',
					headers: {
						'accept-encoding': 'gzip',
						'content-type': 'application/json',
						'accept': 'application/json'
					},
				},
				timeout
			);
			combinedResponse[country] = json;
		} catch(error) {
			combinedResponse[country] = { error: error.message };
		}
	}

	return combinedResponse;
}

const fetchall = (countries) => {
	const promises = countries.map((country) => {
		return apiCaller.fetchWithTimeout(
			`http://localhost:3001/pop/${country}`,
			{
				method: 'POST',
				headers: {
					'accept-encoding': 'gzip',
					'content-type': 'application/json',
					'accept': 'application/json'
				},
			},
			150000
		)
			.catch(error => { return { error: error } })
			.then((json) => {
				return { [country]: json };
			});
	})

	return Promise.all(promises).then((responses) => {
		const combinedResponse = {};
		for (let response of responses) {
			Object.assign(combinedResponse, response);
		}
		return combinedResponse;
	});
}


const countries = ['india', 'china'];

app.get('/', async (req, res) => {
	const data = await fetchall(countries);
	res.setHeader('Content-Type', 'application/json');
	for (let i = 0; i < 10; i++) {
		JSON.stringify(data);
	}
	res.json(data);
});

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
