async function testAPI() {
    console.log("--- Testing API ---");

    const postRes = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Task 1', description: 'Test task' })
    });
    const created = await postRes.json();
    console.log("POST /tasks:", created);

    const getRes = await fetch('http://localhost:5000/tasks');
    const all = await getRes.json();
    console.log("GET /tasks:", all);

    const putRes = await fetch(`http://localhost:5000/tasks/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
    });
    const updated = await putRes.json();
    console.log("PUT /tasks/:id:", updated);

    const delRes = await fetch(`http://localhost:5000/tasks/${created.id}`, {
        method: 'DELETE'
    });
    const deleted = await delRes.json();
    console.log("DELETE /tasks/:id:", deleted);
}

testAPI();
