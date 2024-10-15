#!/bin/bash

docker build -t talk-server-1 -f Dockerfile .
docker run -it --rm --network host --cpus 2 --memory 3GB --name server-1 talk-server-1 \
	node \
	--inspect \
	server-1.js
