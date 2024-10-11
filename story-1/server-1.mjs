import express from 'express';
import http from 'http';

const app = express();

const fetchSerially = async (countries) => {
	const combinedResponse = {}

	for (let country of countries) {
		const response = await fetch(`http://localhost:3001/pop/${country}`, { method: 'POST' });
		const json = await response.json();
		combinedResponse[country] = json;
	}

	return combinedResponse;
}

const countries = ['india', 'china'];

app.get('/', async (req, res) => {
	const data = await fetchSerially(countries);
	for (let i = 0; i < 100000000; i++) {
	}
	res.json(data);
});

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
