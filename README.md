# Task Management API

[![CI Pipeline](https://github.com/rutvii893/task-manager-api-24IT002/actions/workflows/ci.yml/badge.svg)](https://github.com/rutvii893/task-manager-api-24IT002/actions/workflows/ci.yml)
[![Root CI Pipeline](https://github.com/rutvii893/task-manager-docker-compose/actions/workflows/ci.yml/badge.svg)](https://github.com/rutvii893/task-manager-docker-compose/actions/workflows/ci.yml)

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

---

## Practical 9 – In-Memory Caching and Query Optimization

### Objective
Implemented in-memory caching in the Task Management backend using `node-cache` to reduce repeated read queries to MongoDB Atlas, decrease server response time, and demonstrate query optimization.

### Cache Configuration
- **Library**: `node-cache`
- **TTL (Time To Live)**: 60 seconds (`stdTTL: 60`)
- **Check Period**: 120 seconds (`checkperiod: 120`)
- **All Tasks Cache Key**: `all_tasks`
- **Individual Task Cache Key**: `task_<id>` (e.g., `task_65f1a2b3c4d5e6f7a8b9c0d1`)

### Cache Flow
1. **GET `/tasks`**:
   - Check if `all_tasks` exists in cache.
   - **Cache HIT**: Increment hit counter, log `CACHE HIT: all_tasks`, and return cached task list immediately without querying MongoDB.
   - **Cache MISS**: Increment miss counter, log `CACHE MISS: all_tasks`, query MongoDB (`Task.find()`), store the result in cache with key `all_tasks`, and return the response.

2. **GET `/tasks/:id`**:
   - Check if `task_<id>` exists in cache.
   - **Cache HIT**: Increment hit counter, log `CACHE HIT: task_<id>`, and return cached task.
   - **Cache MISS**: Increment miss counter, log `CACHE MISS: task_<id>`, fetch from MongoDB (`Task.findById()`), save into cache under `task_<id>`, and return the task.

### Cache Invalidation
To prevent serving stale data to clients, cache entries are invalidated immediately after successful database write operations:
- **POST `/tasks`**: Deletes `all_tasks` cache (`cache.del('all_tasks')`).
- **PUT `/tasks/:id`**: Deletes both `all_tasks` and `task_<id>` caches (`cache.del('all_tasks')`, `cache.del('task_<id>')`).
- **DELETE `/tasks/:id`**: Deletes both `all_tasks` and `task_<id>` caches (`cache.del('all_tasks')`, `cache.del('task_<id>')`).

### Cache Debugging
- **Endpoint**: `GET /tasks/debug/cache`
- **Protected**: Yes (Requires JWT Bearer token in Authorization header)
- **Sample Response**:
```json
{
  "hits": 2,
  "misses": 1
}
```

### Performance Testing & Comparison

| Condition | Request 1 | Request 2 | Request 3 | Average |
|:---|:---:|:---:|:---:|:---:|
| **Without Cache** | 74 ms | 74 ms | 34 ms | 60.67 ms |
| **With Cache** | 107 ms (MISS) | 7 ms (HIT) | 11 ms (HIT) | 41.67 ms |

### Observation
- **Without caching**: The average response time was **60.67 ms**.
- **With caching**: The average across all three requests was **41.67 ms**, including the initial cache miss.
- **Cache hits**: The response times dropped drastically to **7 ms** and **11 ms**, demonstrating significantly faster responses for repeated requests.

**Conclusion**: In-memory caching reduces response time for repeated `GET` requests by avoiding repeated MongoDB queries. The first request may take longer (~107 ms) because it fetches data over the network from the database and populates the cache in RAM. Subsequent requests hit RAM directly.

### Limitations
- **Process-Local Memory**: `node-cache` stores items in the heap memory of the specific Node.js process.
- **Data Loss on Restart**: In-memory cache is completely cleared whenever the server restarts or crashes.
- **Multi-Instance Inconsistency**: If multiple Node.js server instances run behind a load balancer, each instance maintains its own isolated cache, causing potential data inconsistency.
- **Shared Cache Alternative**: For distributed and multi-instance production environments, a centralized distributed cache like **Redis** or **Memcached** is recommended.

### Viva Questions & Answers

1. **Why is caching useful?**
   - Caching stores frequently accessed data in fast in-memory storage (RAM), reducing latency, minimizing database load, and significantly improving response times.

2. **What is TTL (Time-To-Live)?**
   - TTL is the expiration duration assigned to cached data after which the cache entry is automatically invalidated and deleted from memory.

3. **Why invalidate cache after POST/PUT/DELETE?**
   - Invalidation ensures data consistency. When data is created, updated, or deleted in the database, old cached data becomes stale and must be cleared so subsequent read requests fetch the fresh data.

4. **What happens if the cache is not invalidated?**
   - The application will return stale (outdated or phantom) data to clients until the TTL expires, leading to data inconsistency.

5. **Why is `node-cache` unsuitable for multiple server instances?**
   - `node-cache` runs in the local memory of a single Node process. Multiple instances cannot share this memory, leading to inconsistent cache states across servers.

6. **What happens to cache after a server restart?**
   - Since `node-cache` stores data in volatile RAM, all cached entries are cleared on restart. The first subsequent requests will result in cache misses and repopulate the cache from MongoDB.

7. **Why might caching show little improvement with a very small database?**
   - For tiny local datasets, database query overhead is already very low; network round trips or minimal serialization dominate the time. Caching benefits become significantly more pronounced with remote databases (like MongoDB Atlas), complex queries, or large datasets.

---

## Practical 11 – Containerization with Docker and Docker Compose

### Objective
Containerize the full-stack Task Management Application comprising the Express.js + MongoDB backend and the React + Vite frontend using Docker and Docker Compose. This ensures environment consistency, isolated service deployment, persistent database storage, and seamless multi-container orchestration.

### Key Components & Files
1. **Backend Dockerfile** ([`task-manager-api/Dockerfile`](file:///e:/5TH/5th%20sem%20practical/AWF/week-4/task-manager-api/Dockerfile)):
   - Base Image: `node:18-alpine`
   - Working Directory: `/app`
   - Exposes Port: `5000`
   - Listens on host: `0.0.0.0`
2. **Frontend Dockerfile** ([`portfolio-24IT002/Dockerfile`](file:///e:/5TH/5th%20sem%20practical/AWF/week-4/portfolio-24IT002/Dockerfile)):
   - Multi-stage build with `node:18-alpine`
   - Stage 1: Compiles static assets with `npm run build`
   - Stage 2: Serves static dist output on port `5173` bound to `0.0.0.0`
3. **Docker Compose Configuration** ([`docker-compose.yml`](file:///e:/5TH/5th%20sem%20practical/AWF/week-4/docker-compose.yml)):
   - Services: `frontend`, `backend`, `mongodb`
   - Network: `app-network` (bridge network)
   - Volume: `mongo_data` attached to `/data/db` for persistent storage
   - Service Dependency: Backend waits for MongoDB `service_healthy` check.

### How to Build, Run & Stop

1. **Verify Docker Installation**:
   ```bash
   docker --version
   docker compose version
   ```

2. **Start Docker Desktop**:
   Ensure Docker Desktop is launched and running on host system.

3. **Build and Launch Stack**:
   ```bash
   docker compose up --build -d
   ```

4. **Verify Running Services & Logs**:
   ```bash
   docker ps
   docker compose logs -f
   ```

5. **Stop Stack**:
   ```bash
   docker compose down
   ```

---

## Practical 12 – CI/CD Pipeline with GitHub Actions

### Objective
Implement an automated Continuous Integration (CI) pipeline using **GitHub Actions** that automatically checks out the codebase, configures the Node.js runtime, installs dependencies, and executes automated tests on every `push` to the `main` branch.

### Key Implementations
1. **Automated Testing Setup**:
   - Installed `jest` and `supertest` as dev dependencies.
   - Refactored `server.js` minimally to export the Express `app` without eagerly starting the HTTP listener during tests (`if (require.main === module)`).
   - Mocked MongoDB queries via `jest.spyOn(Task, 'find')` and bypassed JWT auth middleware so unit/integration tests run isolated without requiring a live MongoDB Atlas connection.
   - Added `npm test` script mapped to Jest (`tests/tasks.test.js`).
2. **GitHub Actions Workflow (`.github/workflows/ci.yml`)**:
   - Triggers on `push` events to the `main` branch.
   - Runs on `ubuntu-latest`.
   - Checks out code with `actions/checkout@v4`.
   - Sets up Node.js v18 with `actions/setup-node@v4`.
   - Runs `npm install` and `npm test`.
3. **Pipeline Demonstration (Failure & Success)**:
   - Detailed walkthrough, screenshot guide, and concepts documented in [`docs/practical-12-cicd.md`](docs/practical-12-cicd.md).

---

## Practical 13 – AI API Integration into a Web Application

### Objective
Integrate an external AI API (Google Gemini API using `gemini-2.5-flash`) to generate context-aware task descriptions directly within the Task Management application.

### Key Implementations
1. **Backend AI Integration**:
   - Integrated the official Google GenAI SDK (`@google/genai`) via `services/aiService.js` using `gemini-2.5-flash`.
   - Maintained endpoint `POST /api/ai/generate-description`.
   - Uses `GEMINI_API_KEY` with placeholder guard and secure environment loading.
   - Enforced client rate-limiting (1 request per task per minute).
   - Ensured external failure gracefully degrades with friendly fallback messaging (`503 Service Unavailable`).
2. **Frontend Task Creation Form**:
   - Added a **"✨ Generate Description"** button with loading spinner.
   - Inserted the suggested text into an editable `<textarea>` so the user can review and edit before saving.
   - Added user notifications and a responsible AI disclaimer.
3. **Documentation**:
   - Complete architectural walkthrough, responsible AI notes, and demonstration instructions documented in [`docs/practical-13-ai-integration.md`](docs/practical-13-ai-integration.md).




