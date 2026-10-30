# Practical 12: CI/CD Pipeline with GitHub Actions

## 1. Practical Objective
The objective of this practical is to design, configure, and demonstrate a Continuous Integration (CI) pipeline using **GitHub Actions** for the Task Management backend application (`task-manager-api`). The pipeline automatically triggers on code pushes to the `main` branch, provisions an Ubuntu runner, configures Node.js, installs dependencies, and runs automated tests using Jest and Supertest.

Additionally, this practical demonstrates:
1. Isolated automated testing using mocks (without requiring a live MongoDB Atlas connection or manual token creation).
2. A deliberately failed pipeline execution (test expectation mismatch) and its diagnostic logs in GitHub Actions.
3. A successful pipeline execution once the bug is fixed and pushed, updating the build status badge to green.

---

## 2. Introduction to CI/CD

### What is Continuous Integration (CI)?
**Continuous Integration (CI)** is a software engineering practice where developers regularly merge their code changes into a central repository, after which automated builds and tests are run.
- **Key Goals**:
  - Detect errors and integration conflicts early.
  - Improve software quality and velocity.
  - Ensure that the `main` branch is always stable and production-ready.

### What is Continuous Delivery / Deployment (CD)?
- **Continuous Delivery (CD)**: Automatically packages and prepares validated code for release to staging or production environments after passing CI tests.
- **Continuous Deployment (CD)**: Automatically releases every validated change directly to production without manual intervention.

### Role of GitHub Actions
GitHub Actions is a built-in automation and CI/CD platform integrated directly into GitHub repositories. It allows developers to define automated workflows using YAML syntax within the `.github/workflows/` directory.

---

## 3. GitHub Actions Workflow Explanation

The workflow file is located at `.github/workflows/ci.yml`.

```yaml
name: CI Pipeline

on:
  push:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./task-manager-api

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: task-manager-api/package-lock.json

      - name: Install dependencies
        run: npm install

      - name: Execute automated tests
        run: npm test
```

### Breakdown of Workflow Elements:
1. `name: CI Pipeline`: Human-readable identifier displayed in GitHub's Actions tab.
2. `on.push.branches: [main]`: Event trigger that invokes the pipeline whenever commits are pushed to the `main` branch.
3. `runs-on: ubuntu-latest`: Specifies a hosted virtual machine running the latest LTS release of Ubuntu Linux.
4. `defaults.run.working-directory: ./task-manager-api`: Directs all command steps to execute inside the backend directory containing `package.json`.
5. `actions/checkout@v4`: Clones the repository code into the runner's workspace.
6. `actions/setup-node@v4`: Configures Node.js v18 and enables npm caching for accelerated dependency installation.
7. `npm install`: Installs all production and development dependencies (`jest`, `supertest`, `express`, `mongoose`, etc.).
8. `npm test`: Invokes the test runner (`jest`), returning an exit code of `0` on success or non-zero on failure.

---

## 4. Testing Implementation

### Dependencies Installed
- **Jest (`^30.5.2`)**: JavaScript testing framework providing the test runner, assertion library (`expect`), and mocking utilities (`jest.spyOn`, `jest.mock`).
- **Supertest (`^7.3.1`)**: Library for testing HTTP endpoints by invoking the Express application without binding to a network port.

### Backend Refactoring (`server.js`)
To allow Supertest to import the Express application without immediately trying to start an active network listener (`app.listen`) or connect to MongoDB in a test runner:
1. Added environment guard: MongoDB connects only when `process.env.NODE_ENV !== 'test'`.
2. Added module main check: Server listens on port only if executed directly via `node server.js` (`if (require.main === module)`).
3. Exported the Express application: `module.exports = app;`.

### Test File: `task-manager-api/tests/tasks.test.js`
The test checks whether `GET /tasks` returns HTTP status 200 and a JSON array:
```javascript
const request = require('supertest');
const Task = require('../models/Task');

// Mock auth middleware to isolate authentication during test
jest.mock('../middleware/auth', () => (req, res, next) => {
    req.user = { id: 'mockUserId123', email: 'test@example.com' };
    next();
});

// Import Express app after mocking middleware
const app = require('../server');

describe('GET /tasks', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return HTTP status 200 and a list of tasks', async () => {
        // Mock Task.find() to avoid requiring a live MongoDB connection
        const mockTasks = [
            {
                _id: '64f1a2b3c4d5e6f7a8b9c0d1',
                title: 'Sample Task for CI',
                description: 'Verify CI pipeline test passes',
                completed: false,
                priority: 'medium'
            }
        ];
        jest.spyOn(Task, 'find').mockResolvedValue(mockTasks);

        const response = await request(app).get('/tasks');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Sample Task for CI');
    });
});
```

---

## 5. Steps to Demonstrate the Pipeline

### Step A: Verify Local Test Execution
Before pushing to GitHub, run the tests locally inside `task-manager-api`:
```bash
cd task-manager-api
npm test
```
**Expected Output:**
```text
PASS tests/tasks.test.js
  GET /tasks
    √ should return HTTP status 200 and a list of tasks

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

---

### Step B: Demonstrate Failed Pipeline Execution (Deliberate Bug)
1. Open `task-manager-api/tests/tasks.test.js`.
2. Temporarily change the assertion on line 31:
   ```javascript
   // Change from 200 to 404
   expect(response.status).toBe(404);
   ```
3. Commit and push the broken test:
   ```bash
   git add task-manager-api/tests/tasks.test.js
   git commit -m "test: simulate failing test for CI demonstration"
   git push origin main
   ```
4. Navigate to your GitHub repository -> **Actions** tab.
5. Observe the workflow run with a **red cross (Failed)** icon.
6. Click into the job details -> **Execute automated tests** to view the failure logs:
   ```text
   Expected: 404
   Received: 200
   ```
7. Take a screenshot and save it to `docs/screenshots/pipeline-failed.png`.

---

### Step C: Demonstrate Successful Pipeline Execution (Fix & Restore)
1. Restore line 31 in `task-manager-api/tests/tasks.test.js` back to `200`:
   ```javascript
   expect(response.status).toBe(200);
   ```
2. Commit and push the fix:
   ```bash
   git add task-manager-api/tests/tasks.test.js
   git commit -m "fix: restore expected HTTP status 200 for GET /tasks test"
   git push origin main
   ```
3. Navigate to the **Actions** tab in GitHub.
4. Observe the new workflow run executing and completing with a **green checkmark (Passed)**.
5. Take a screenshot of the passed workflow and save it to `docs/screenshots/pipeline-success.png`.
6. Verify that the status badge on `README.md` shows **passing**.

---

## 6. Screenshot Evidence Checklist

Place the captured lab screenshots into the `docs/screenshots/` folder:
- `docs/screenshots/local-test-pass.png` – Local `npm test` terminal output showing 1 passed test suite.
- `docs/screenshots/pipeline-failed.png` – GitHub Actions run showing test assertion failure (404 != 200).
- `docs/screenshots/pipeline-success.png` – GitHub Actions run showing all checkmarks green and job succeeded.
- `docs/screenshots/readme-badge.png` – Repository `README.md` showing active green `passing` badge.

---

## 7. Conclusion
In this practical, an automated CI pipeline was created using GitHub Actions. By establishing automated unit testing with Jest and Supertest, isolating external dependencies like MongoDB, and configuring triggers on branch pushes, the application now verifies software integrity automatically. The demonstration showed that regressions or broken tests are immediately caught on remote runners, preventing buggy code from progressing into production.
