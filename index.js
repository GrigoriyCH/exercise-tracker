const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];
const exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST /api/users - створення нового користувача
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const userId = Date.now().toString();
  const newUser = { _id: userId, username };
  users.push(newUser);
  res.json(newUser);
});

// GET /api/users - отримання списку всіх користувачів
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises - додавання вправи для користувача
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };
  exercises.push(newExercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date
  });
});

// GET /api/users/:_id/logs - отримання журналу вправ користувача
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(ex => ex.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});