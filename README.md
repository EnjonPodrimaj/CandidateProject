# Candidate Assignment

Note: This repository includes the [postman collection for the finished API](postman_collection.json)!

# Technologies included
* Node.js
* MongoDB with Mongoose
* TypeScript
* Express.js & Express.js middleware
* JWT tokens and authenticated API calls
* ZOD schema validation
* Pino for prettier logging

# Application Flow
For the strucute/workflow I've used the following approach:
1. Endpoints - A call on an enpoint happens
2. Express - listens and responds to all endpoints
3. Schema - validation upon given request payload is made
4. Controller - controlls the flow of the operation
5. Service - contains all logic behind requests, separated in different functions, for separation of concerns
6. Database - CRUD operations called upon the MongoDB Collections - users and sessions

* for running the application run `npm run dev`. I've given access to the database to any IP for not worrying about adding IPs to the white-list. This and also repo privacy of course will be restricted after the technical interview.

# Database choice
* I've choosen MongoDB, because I prefer working with NoSQL databases as they are much more flexible which is the condition needed in this Assignment. Also wanted to use Zod a bit more for schema validation, and that turned out to be really great. Another reason why I choose MongoDb is because of the easier testing.

# Testing APIs
* For testing APIs I've chosen Jest Testing Framwork in collab with Supertest for HTTP assertions. For Database access while testing I've used mongodb-memory-server for having a running instance for local API testing. There are a total of 14 tests, with included edge cases. For testing run `npm test`.

# Deployment
* Docker (image)
* docker-compose (container)
* Caddy - Web server

