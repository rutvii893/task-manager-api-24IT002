# API Evaluation: Richardson Maturity Model

## 1. Evaluation Table

| Level | What it means | Do we meet this? | Evidence |
| :--- | :--- | :--- | :--- |
| **Level 0** | Simple HTTP endpoint without resource modeling | Yes | The API is organized around `/tasks` resource endpoints instead of one monolithic route. |
| **Level 1** | Separate URLs for resources | Yes | We use `/tasks` for the collection and `/tasks/:id` for a single task resource. |
| **Level 2** | Proper HTTP methods and status codes | Yes | The server uses `GET`, `POST`, `PUT`, and `DELETE` with correct responses like `201`, `200`, `400`, and `404`. |
| **Level 3** | HATEOAS using hypermedia links | No, but documented as the next step | The API currently returns task data in JSON, while the example below shows how `_links` can be included for discoverability. |

## 2. Level 2 Compliance Check
The route design and HTTP behavior meet Level 2 requirements. There were no significant Level 2 violations in the task routes: each action uses the correct verb and meaningful status codes. The main addition was the read-single route, which makes the resource structure clearer and supports better client navigation.

## 3. HATEOAS Example (Level 3)
A Level 3 implementation would include links that guide the client to related actions. For example, a single task response could look like this:

```json
{
  "id": 123,
  "title": "Complete AWF assignment",
  "description": "Finish the practical work",
  "completed": false,
  "_links": {
    "self": "/tasks/123",
    "update": "/tasks/123",
    "delete": "/tasks/123",
    "allTasks": "/tasks"
  }
}
```

This demonstrates HATEOAS because the client can discover available actions from the response itself instead of hardcoding every route.

## 4. Why Level 3 Is Optional in Most APIs
Most real-world APIs stop at Level 2 because HATEOAS adds extra complexity without major practical value for simple client-server systems. For this project, Level 2 is sufficient and easier to implement while still following REST principles correctly.
