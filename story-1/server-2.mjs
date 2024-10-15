import express from 'express';
import indjson from './india-pop.json' with {type: 'json'};
import chjson from './ch-pop.json' with {type: 'json'};
import { setTimeout as setTimeoutPromise } from 'timers/promises';
import { gzipSync } from 'zlib';

const app = express();

const popJsons = {
	india: indjson,
	china: chjson,
}

const popJsonsBloated = ((jsons) => {
	let final = {};

	for (let key in jsons) {
		let json = jsons[key];
		final[key] = { main: json, bloat: Array(100).fill(json) };
	}

	return final;
})(popJsons);

const popJsonsStringified = ((jsons) => {
	let final = {};
	for (let key in jsons) {
		final[key] = JSON.stringify(jsons[key]);
	}

	return final;
})(popJsonsBloated);

const popJsonsGzipped = ((jsons) => {
	let final = {};
	for (let key in jsons) {
		final[key] = gzipSync(jsons[key]);
	}

	return final;
})(popJsonsStringified);


app.post('/pop/:country', async (req, res) => {
	const timeout = Math.floor(Math.random() * 100)
	const random = Math.floor(Math.random() * 10);
	await setTimeoutPromise(timeout);

	let jsons = popJsonsStringified;
	const encoding = req.headers['accept-encoding'];
	if (encoding === 'gzip') {
		res.setHeader('Content-Encoding', 'gzip');
		jsons = popJsonsGzipped;
	}
	res.setHeader('Content-Type', 'application/json');

	let response = jsons[req.params.country] ?? {};

	return res.send(response);
});

app.listen(3001, () => {
	console.log('Server is running on port 3001');
});
