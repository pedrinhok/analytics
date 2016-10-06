var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.js');

var visitors = {};

app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname, 'public/')));

app.use('scripts/', express.static(path.join(__dirname, 'node_modules/')));

app.get(/\/(about|contact)?$/, function(req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

io.on('connection', function(socket) {

  if (socket.handshake.headers.host === config.host
  && socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {
    io.emit('updated-stats', computeStats());
  }

  socket.on('visitor-data', function(data) {
    visitors[socket.id] = data;

    io.emit('updated-stats', computeStats());
  });

  socket.on('disconnect', function() {
    delete visitors[socket.id];

    io.emit('updated-stats', computeStats());
  });

});

function computeStats(){
  return {
    activePages: computePageCounts(),
    activeUsers: getActiveUsers()
  };
}

function computePageCounts() {
  var pageCounts = {};
  for (var key in visitors) {
    var page = visitors[key].page;
    if (page in pageCounts) {
      pageCounts[page]++;
    } else {
      pageCounts[page] = 1;
    }
  }
  return pageCounts;
}

function getActiveUsers() {
  return Object.keys(visitors).length;
}

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});
