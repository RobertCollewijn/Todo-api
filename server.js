/**
 * Created by Robert on 18-9-2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db');

var app = express();
const PORT = process.env.PORT || 3000;
var todos = [];
/*
 [{
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
 */
var todoNextId = 1;

app.use(bodyParser.json());


app.get("/", function (req, res) {
    res.send("Todo API root")
})

// get todos?completed&q= in the description
app.get("/todos", function (req, res) {
    var queryParams = req.query;
    var where = {};
    if (queryParams.hasOwnProperty('completed')) {
        queryCompleted = queryParams.completed;
        if (queryCompleted === 'true') {
            where.completed = true
        } else if (queryCompleted === 'false') {
            where.completed = false
        }
    }
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        where.description = {
            $like: '%' + queryParams.q + '%'
        }
    }

    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos)
    }).catch(function (e) {
        res.status(500).json(e)
    })
})

/*
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
 if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
 var searchInDescription = queryParams.q.toLocaleLowerCase();
 console.log(searchInDescription)
 filterdTodos = _.filter(filterdTodos, function (todo) {
 return todo.description.toLocaleLowerCase().indexOf(searchInDescription) > -1;
 });
 }

 //filter

 res.json(filterdTodos)

 */

//}
//)

// get specific id  todos/:id
app.get("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    //var matchedToDo = _.findWhere(todos, {id: todoId});

    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {                        //dan weet je zeker dat het een boolean is

            res.json(todo);

        } else {
            res.status(404).json({"errorMessage": "no todo found"});

        }
    }).catch(function (e) {
        res.status(500).json(e)
    })

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
    /*

     if (matchedToDo) {
     res.json(matchedToDo);
     } else {
     res.sendStatus(404); //.send("Todo " + todoID +" not found");
     }

     */

})

app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    db.sequelize.sync().then(function () {
        console.log("Everything is synced");

        /*je kan ook de hele body sturen aangezien het json is

         db.todo.create({
         description: body.description
         }).then(function (todo) {
         */
        db.todo.create(body).then(function (todo) {
            res.json(todo.toJSON());
        }).catch(function (e) {
            res.status(400).json(e)
        })

    })
})
//call create on db.todo
// respond with 200 and todo
// res.status(400).json(e)

/*
 if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
 return res.sendStatus(400);
 }
 body.id = todoNextId++
 body.description = body.description.trim();

 */

/*

 console.log('description: ' + body.description);
 var todo = {
 id: todoNextId,
 description: body.description,
 completed: body.completed,
 }
 todoNextId++
 */

//todos.push(body);
//res.json(body);


//DELETE
app.delete("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({error: "No todo with id"})
        } else {
            res.status(204).send();//json({message:"Todo " +todoID+ " deleted"});
        }

    }).catch(function (e) {
        res.status(400).json(e)
    })
    /*
     var matchedToDo = _.findWhere(todos, {id: todoId});

     if (matchedToDo) {
     todos = _.without(todos, matchedToDo)
     res.json(todos);
     } else {
     res.status(404).send(); //json({"Todo: " + todoId + " not found"});
     // res.sendStatus(404);//.json("Todo " + todoID +" not found"); ID moet zijn Id
     }

     */

})

app.put("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    /*
     var matchedToDo = _.findWhere(todos, {id: todoId});


     if (!matchedToDo) {
     return res.status(404).send(); //({"Todo: " + todoId + " not found"});
     }

     */


    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                    res.json(todo.toJSON())
                }, function (e) {
                    res.status(400).json(e);
                }
            );
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    })
// _.extend(matchedToDo, validAttributes);

// res.send(matchedToDo);

})

db.sequelize.sync().then(function () {
        app.listen(PORT, function () {
            console.log("Express listening on port " + PORT + "!")
        })
    }
)
