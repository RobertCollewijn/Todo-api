/**
 * Created by Robert on 18-9-2016.
 */
var express = require('express');
var app = express();
const PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false,
}, {
    id: 2,
    description: 'Go to market',
    completed: false,
}, {
    id: 3,
    description: 'Feed the cat',
    completed: true,
}
];


app.get("/", function (req, res) {
    res.send("Todo API root")
})

// get todos
app.get("/todos", function (req, res) {
        res.json(todos)
    }
)

// get specific id  todos/:id
app.get("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    var todoFound = false;
  //  var matchedToDo;
    console.log("Asking for todo with id of " + todoId);
    for (i = 0; i < todos.length; i++) {
        console.log("todosID[" + i+"].id = " + todos[i].id);
        // res.send("loop " + i);
        // res.json(todos[i]);
        if (todos[i].id === todoId) {
            res.json(todos[i]);
            todoFound = true;
            break;
        }
    }

   if (!todoFound) {
  //  if(!matchedToDo){
        console.log("not found")
        res.sendStatus(404); //.send("Todo " + todoID +" not found");
    }

})

app.listen(PORT, function () {
    console.log("Express listening on port " + PORT + "!")
})