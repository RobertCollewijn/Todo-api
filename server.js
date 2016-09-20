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

app.use(bodyParser.json());


app.get("/", function (req, res) {
    res.send("Todo API root")
});

// get todos?completed&q= in the description
app.get("/todos", function (req, res) {
    var queryParams = req.query;
    var where = {};
    if (queryParams.hasOwnProperty('completed')) {
        var queryCompleted = queryParams.completed;
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
});

// get specific id  todos/:id
app.get("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {                        //dan weet je zeker dat het een boolean is

            res.json(todo);

        } else {
            res.status(404).json({"errorMessage": "no todo found"});

        }
    }).catch(function (e) {
        res.status(500).json(e)
    })

});

//CREATE
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
});

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

});

app.put("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

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
});

app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
  //  db.sequelize.sync().then(function () {
    //    console.log("Everything is synced");

        db.user.create(body).then(function (user) {
            res.json(user.toPublicJSON());
        }).catch(function (e) {
            res.status(400).json(e)
        });

  //  })
});


db.sequelize.sync().then(function () {
        app.listen(PORT, function () {
            console.log("Express listening on port " + PORT + "!")
        })
    }
);
