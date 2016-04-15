angular.module('starter.services', [])

.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
	removeItem: function(key){
      $window.localStorage.removeItem(key);
	}
  }
}])

.service('$Uri', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var base_url = 'http://funbit.riskmonitor.com.au/'; //http://192.168.254.104/nguyen/funbit/';
  var api = base_url+ 'api/';


  return {
    base_url: base_url,
    api: api
  };
})


.factory('$User', function($http, $q, $Uri) {
	console.log(123);
	var siteUrl = $Uri.api;
	var service = {

		islogin: window.islogin,

		apikey: window.apikey,

		username: '',

		signup: function(username, password, callback){
			$http({
				method: 'post',
				data: $.param({username: username, password: password}),
				url: siteUrl + 'user/login',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(callback)
			.error(function(){});
		},
		
		checkFb: function(fb_id, fb_data, callback){
			$http({
				method: 'post',
				data: $.param({fb_id: fb_id, fb_data: fb_data}),
				url: siteUrl + 'user/fb',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(callback)
			.error(function(){});

		},

		login: function(username, password, callback){
			$http({
				method: 'post',
				data: $.param({username: username, password: password}),
				url: siteUrl + 'user/login',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(callback)
			.error(function(){});

			// .post(siteUrl + '/REST/user/login', {username: username, password: password})
		},

		logout: function(callback){
			$http.get(siteUrl + '/REST/user/logout')
				.success(function(){
					service.islogin = false;
					callback();
				})
				.error(function(){

				});
		},

		checkAuth: function(callback){
			var d = $q.defer();

			$http.get(siteUrl + '/REST/user/login')
				.success(function(data){
					if(data.status === 'true'){
						service.islogin = true;
						callback();
						d.resolve();
					}else{
						service.islogin = false;
					}
				})
				.error(function(){
					d.reject();
				});

		}

	};
	return service;
})


.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
