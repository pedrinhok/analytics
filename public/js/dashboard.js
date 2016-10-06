var socket = io();

var vm = new Vue({
  el: '#app',
  data: {
    activePages: {},
		activeUsers: 0
  },
  created: function() {
    socket.on('updated-stats', function(data) {
			this.activePages = data.activePages;
			this.activeUsers = data.activeUsers;
    }.bind(this));
  }
});
