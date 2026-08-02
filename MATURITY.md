# API Evaluation: Richardson Maturity Model

## 1. Evaluation Table

| Level | What it means | Do we meet this? | My Evidence |
| :--- | :--- | :--- | :--- |
| **Level 0** | The Swamp of POX (one single URL for everything) | Yes, we passed this | Our API doesn't just use one big endpoint for all actions. We actually separate things out. |
| **Level 1** | Resources (using separate URLs for different things) | Yes | We use `/tasks` to get the list, and `/tasks/:id` for specific tasks. |
| **Level 2** | HTTP Verbs & Status Codes | Yes | I made sure to use the right methods (`GET`, `POST`, `PUT`, `DELETE`). The API also sends back real status codes like `201` when a task is created, or `404` if it's missing, instead of just sending `200 OK` for everything. |
| **Level 3** | HATEOAS (Adding links in the response) | No | Right now, my API just sends back the raw JSON data. It doesn't include any `_links` to tell the client what they can do next. |

## 2. Checking Level 2 Compliance
Looking back at the `server.js` file from the previous practical, the code actually already satisfies Level 2. I used the proper HTTP methods for all the CRUD routes and added correct status codes (like 400 for bad requests and 500 for server errors). Because of this, I didn't need to go back and fix any of the routes.

## 3. HATEOAS Awareness (Level 3 Example)
If I wanted to take this API all the way to Level 3, I would need to start including hypermedia links in the responses. For example, if someone requested a single task, I would add a `_links` object so they know the exact URLs to update or delete it.

It would look something like this:

```json
{
  "id": 123,
  "title": "Complete AWF assignment",
  "description": "Finish the practical work",
  "completed": false,
  "_links": {
    "self": "/tasks/123",
    "delete": "/tasks/123"
  }
}
```

## 4. Why Most APIs Stop at Level 2
From what I've learned, most real-world APIs don't actually bother going to Level 3, and they usually stop at Level 2. The main reason is that HATEOAS just adds way too much complexity. For the server, it takes a lot of extra code to constantly generate the correct links for every single response. And on the frontend/client side, developers usually find it easier to just read the API documentation and hardcode standard routes (like `PUT /tasks/123`), rather than writing complicated logic to parse dynamic `_links` every time they get a response. Basically, Level 2 is the "sweet spot" where the API is clean and standard without being overly complicated to build or use.
