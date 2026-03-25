const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')));

// Explicitly handle the route requested by the user
app.get(['/Main/Home', '/main/home'], (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// The standard fix for SPA routing: serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
