const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body
  const currentUser = users.find( user => user.username === username)
  
  if(!currentUser) return response.status(404).json({ error: "User Not Exists"})

  request.body.currentUser = currentUser
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body 
  const userAlreadyExists = users.find( user => user.username === username)

  if(userAlreadyExists) return response.status(400).json({ error: "User Already Exists"})

  const user = { 
    name, 
    username,
    todos: [],
    id: uuidv4()
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { currentUser } = request.body

  return response.json(currentUser.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { currentUser, title, deadLine } = request.body
  
  const todo = {
    title,
    done: false,
    deadLine: new Date().toISOString(),
    create_at: new Date().toISOString(),
    id: uuidv4()
  }
  
  const userIndex = users.findIndex( user => user.username == currentUser.username)
  if(userIndex != -1) users[userIndex].todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { currentUser, title, deadLine } = request.body
  const { id: todoId } = request.params

  const todos = currentUser.todos
  const todoIndex = todos.findIndex( todo => todo.id === todoId)
  const todo = todos.find( todo => todo.id === todoId) 

  if(todoIndex != -1) todos[todoIndex] = {
    ...todo,
    deadLine: deadLine ?? todo.deadLine,
    title: title ?? todo.title
  }

  const userIndex = users.findIndex( user => user.username == currentUser.username)
  if(userIndex != -1) users[userIndex].todos = todos

  return response.status(200).json(todos)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { currentUser, title, deadLine } = request.body
  const { id: todoId } = request.params

  const todos = currentUser.todos
  const todoIndex = todos.findIndex( todo => todo.id === todoId)
  const todo = todos.find( todo => todo.id === todoId) 

  if(todoIndex != -1) todos[todoIndex] = {
    ...todo,
    done: true
  }

  const userIndex = users.findIndex( user => user.username == currentUser.username)
  if(userIndex != -1) users[userIndex].todos = todos

  return response.status(200).json(todos)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { currentUser, title, deadLine } = request.body
  const { id: todoId } = request.params

  const todos = currentUser.todos
  const todoIndex = todos.findIndex( todo => todo.id === todoId)
  const todo = todos.find( todo => todo.id === todoId) 

  if(todoIndex != -1) todos.splice(todoIndex, 1) 

  const userIndex = users.findIndex( user => user.username == currentUser.username)
  if(userIndex != -1) users[userIndex].todos = todos

  return response.status(200).send()
});

module.exports = app;