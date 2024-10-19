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

const bloat = jsons => {
	let final = {};

	for (let key in jsons) {
		let json = jsons[key];
		final[key] = { main: json, bloat: Array(60).fill(json) };
	}

	return final;
}

const normal = jsons => {
	let final = {};

	for (let key in jsons) {
		let json = jsons[key];
		final[key] = { main: json };
	}

	return final;
}

const stringify = jsons => {
	let final = {};
	for (let key in jsons) {
		final[key] = JSON.stringify(jsons[key]);
	}

	return final;
}

const zip = jsons => {
	let final = {};
	for (let key in jsons) {
		final[key] = gzipSync(jsons[key]);
	}

	return final;
}

const popJsonsBloated = bloat(popJsons);
const popJsonsNormal = normal(popJsons);
const popJsonsStringified = stringify(popJsonsBloated);
const popJsonsGzipped = zip(popJsonsStringified);

const popJsonsStringifiedN = stringify(popJsonsNormal);
const popJsonsGzippedN = zip(popJsonsStringifiedN);


app.post('/pop/:country', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');

	let jsons = popJsonsStringified;
	if (req.query.nobloat) {
		jsons = popJsonsStringifiedN;
	}

	const encoding = req.headers['accept-encoding'];
	if (encoding === 'gzip') {
		res.setHeader('Content-Encoding', 'gzip');

		if (req.query.nobloat) {
			jsons = popJsonsStringifiedN;
		} else {
			jsons = popJsonsGzipped;
		}
	}

	let response = jsons[req.params.country] ?? {};

	if (req.query.nobloat) {
		return res.send(response);
	}

	const timeout = Math.floor(Math.random() * 100)
	const random = Math.floor(Math.random() * 10);
	await setTimeoutPromise(timeout);

	return res.send(response);
});

app.listen(3001, () => {
	console.log('Server is running on port 3001');
});
