import express from 'express';
import indjson from './india-pop.json' with {type: 'json'};
import chjson from './ch-pop.json' with {type: 'json'};
import { setTimeout as setTimeoutPromise } from 'timers/promises';

const app = express();

app.post('/pop/:country', async (req, res) => {
	let response = {};
	if (req.params.country === 'china') {
		response = chjson;
	}

	response = indjson;
	await setTimeoutPromise(200);
	return res.json(response);
});

app.listen(3001, () => {
	console.log('Server is running on port 3001');
});
