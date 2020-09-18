const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// using webpack-dev-server and middleware in development environment
if (process.env.NODE_ENV !== 'production') {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack = require('webpack');
  const config = require('./webpack.config');
  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/dist/index.html')
});

io.on('connection', function(client) {
  client.on('bid', function({ item, data, amount }) {
    // store information in db
    console.log(item, data, amount);
    io.emit('bid', { item, person, amount })
  });
});

server.listen(PORT, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.', PORT, PORT);
  }
});
