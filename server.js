/**
 * Created by Robert on 18-9-2016.
 */
var express = require('express');

var bodyParser = require('body-parser');
var _ = require("underscore");

var app = express();
const PORT = process.env.PORT || 3000;
var todos = [{

    id: 1,
    description: 'Meet Petra for lunch',
    completed: false,
}, {
    id: 2,
    description: 'Go to market',
    completed: false,
}, {
    id: 3,
    description: 'Feed the cat',
    completed: true,
}, {
    id: 4,
    description: 'Work on saterday',
    completed: true,
}
];
var todoNextId = 5;

app.use(bodyParser.json());


app.get("/", function (req, res) {
    res.send("Todo API root")
})

// get todos?completed&q= in the description
app.get("/todos", function (req, res) {
        var queryParams = req.query;
        var filterdTodos = todos;
        var queryCompleted = queryParams.completed;
        //console.log("queryCompleted: " + typeof queryCompleted);

        if (queryParams.hasOwnProperty('completed')) {
            queryCompleted = queryParams.completed;
            if (queryCompleted === 'true') {
                filterdTodos = _.where(filterdTodos, {completed: true})
            } else if (queryCompleted === 'false') {
                filterdTodos = _.where(filterdTodos, {completed: false})
            }

        }
    if (queryParams.hasOwnProperty('q') && queryParams.q.length>0) {
        var searchInDescription = queryParams.q.toLocaleLowerCase();
        console.log(searchInDescription)
        filterdTodos = _.filter(filterdTodos,function(todo){
            return todo.description.toLocaleLowerCase().indexOf(searchInDescription)>-1;
        });
    }

//filter

        res.json(filterdTodos)
    }
)

// get specific id  todos/:id
app.get("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    var matchedToDo = _.findWhere(todos, {id: todoId});
    /*

     var todoFound = false;

     console.log("Asking for todo with id of " + todoId);
     for (i = 0; i < todos.length; i++) {
     console.log("todosID[" + i + "].id = " + todos[i].id);
     // res.send("loop " + i);
     // res.json(todos[i]);
     if (todos[i].id === todoId) {
     res.json(todos[i]);
     todoFound = true;
     break;
     }
     }

     */
    if (matchedToDo) {
        res.json(matchedToDo);
    } else {
        res.sendStatus(404); //.send("Todo " + todoID +" not found");
    }

})

app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.sendStatus(400);
    }
    body.id = todoNextId++
    body.description = body.description.trim();
    /*

     console.log('description: ' + body.description);
     var todo = {
     id: todoNextId,
     description: body.description,
     completed: body.completed,
     }
     todoNextId++
     */
    todos.push(body);
    res.json(body);

})

//DELETE
app.delete("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    var matchedToDo = _.findWhere(todos, {id: todoId});

    if (matchedToDo) {
        todos = _.without(todos, matchedToDo)
        res.json(todos);
    } else {
        res.status(404).send(); //json({"Todo: " + todoId + " not found"});
        // res.sendStatus(404);//.json("Todo " + todoID +" not found"); ID moet zijn Id
    }

})

app.put("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    var matchedToDo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedToDo) {
        return res.status(404).send(); //({"Todo: " + todoId + " not found"});
    }


    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    }
    else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();//.json({"error":"errormessage","var":"value"});
    } else {

    }


    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    }
    else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    } else {

    }

    _.extend(matchedToDo, validAttributes);

    res.send(matchedToDo);

})

app.listen(PORT, function () {
    console.log("Express listening on port " + PORT + "!")
})