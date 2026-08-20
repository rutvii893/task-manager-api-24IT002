# Task Management API

## Practical 4

Task Management REST API using:

* Node.js
* Express.js
* CRUD operations
* In-memory task data

## Practical 5

Extended the Practical 4 backend by:

* Connecting MongoDB using Mongoose
* Creating the Task schema/model
* Using MongoDB instead of the in-memory array
* Implementing CRUD operations with Mongoose
* Testing APIs using Postman/Thunder Client

Task fields:

* title
* description
* completed
* priority
* createdAt

## Practical 6

Extended the same backend by:

* Adding CORS
* Connecting the React frontend to the existing backend
* Supporting full-stack CRUD operations
* React frontend runs on localhost:5173
* Express backend runs on localhost:5000
* MongoDB stores the task data

### API Endpoints

GET /tasks
GET /tasks/:id
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id

### How to Run

Install dependencies:

```bash
npm install
```

Create a `.env` file with the MongoDB connection string.

Start the backend:

```bash
npm run dev
```

or:

```bash
node server.js
```

Backend runs on:

http://localhost:5000

### Practical 6 Full Stack Flow

React Frontend
↓
fetch()
↓
Express Backend
↓
Mongoose
↓
MongoDB Atlas
