angular.module('starter.controllers', [])

.controller('SignInCtrl', function($scope, $state, $q, UserService, $ionicLoading, $User, $localstorage, $ionicPopup) {

// This is the success callback from the login method
  var fbLoginSuccess = function(response) {

    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
	  $ionicPopup.alert({
		 title: 'Oppss!',
		 template: 'Cannot find the authResponse'
	   });	  
	  
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
		// For the purpose of this example I will store user data on local storage
		var fbdata = {
			authResponse: authResponse,
			userID: profileInfo.id,
			name: profileInfo.name,
			first_name: (profileInfo.first_name) ? profileInfo.first_name : '',
			last_name: (profileInfo.last_name) ? profileInfo.last_name : '',
			email: profileInfo.email,
			picture : "http://graph.facebook.com/" + profileInfo.id + "/picture?type=large" //authResponse.userID
		};
		
		profileInfo.picture = "http://graph.facebook.com/" + profileInfo.id + "/picture?type=large";
		profileInfo.authResponse = authResponse;
		
//		$ionicPopup.alert({
//			title: 'Profile info fail!',
//			template: JSON.stringify(profileInfo)
//		});	  
		
		
		$localstorage.setObject('profileInfo', profileInfo);
		$localstorage.setObject('fbdata', fbdata);
		UserService.setUser(fbdata);
		
		$scope.checkUser(profileInfo.id, profileInfo);
		
	    //$ionicLoading.hide();
        //$state.go('tab.dash');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
	  $ionicPopup.alert({
		 title: 'Profile info fail!',
		 template: fail
	   });	  
	  
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();
		
    facebookConnectPlugin.api('/me?fields=email,name,about,first_name,last_name,birthday,location,locale,link,middle_name,quotes,timezone,verified,cover&access_token=' + authResponse.accessToken, null,
      function (response) {
		console.log(response);
        info.resolve(response);
      },
      function (response) {
		console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

	//connect to server
	$scope.checkUser = function(fb_id, fb_data){
		var _loginCallback = function(data){
	 	    console.log(data);
			if(data.status == 'fail') {
				   //$scope.errors.push('Wrong username or password!');
			   	   console.log('fail');
				   	
			} else {
				console.log('true');
				$ionicLoading.hide();
				$state.go('tab.dash');
				
			}
		};
		$User.checkFb(fb_id, fb_data, _loginCallback);
	
	};
	

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
//	$scope.checkUser('123', {'userID': 'adf'});
//	return;
	
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

    		// Check if we have our user saved
    		var user = UserService.getUser('facebook');

    		if(!user.userID){
				$ionicLoading.show({
					template: 'Logging in...'
				});

				getFacebookProfileInfo(success.authResponse)
					.then(function(profileInfo) {
						// For the purpose of this example I will store user data on local storage
						var fbdata = {
							authResponse: success.authResponse,
							userID: profileInfo.id,
							name: profileInfo.name,
							first_name: (profileInfo.first_name) ? profileInfo.first_name : '',
							last_name: (profileInfo.last_name) ? profileInfo.last_name : '',
							email: profileInfo.email,
							picture : "http://graph.facebook.com/" + profileInfo.id + "/picture?type=large"
						};
						
						profileInfo.picture = "http://graph.facebook.com/" + profileInfo.id + "/picture?type=large";
						profileInfo.authResponse = success.authResponse;
						
						$localstorage.setObject('profileInfo', profileInfo);
						$localstorage.setObject('fbdata', fbdata);
						UserService.setUser(fbdata);
						
						$scope.checkUser(profileInfo.id, profileInfo);
						//$state.go('tab.dash');
					}, function(fail){
						// Fail get profile info
						console.log('profile info fail', fail);
				});
			}else{
				$ionicPopup.alert({
					title: 'Logged in as '+user.name,
					template: '<img src="'+user.picture+'" width="100%" />'
				});					
				$state.go('tab.dash');
			}
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
				// but has not authenticated your app
        // Else the person is not logged into Facebook,
		// so we're not sure if they are logged into this app or not.

		console.log('getLoginStatus', success.status);

		$ionicLoading.show({
		  template: 'Logging in..'
		});

		// Ask the permissions you need. You can learn more about
		// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };  
  
  
})

.controller('DashCtrl', function($scope, $timeout, $Uri) {
  $scope.items = [];
	
	console.log($Uri.base_url, $Uri.api);

  //pull to refresh
  $scope.doRefresh = function() {
    
    console.log('Refreshing!');
    $timeout( function() {
      //simulate async response
	  $scope.items.unshift({
			id: $scope.items.length,
			time: '2015.04.25 22:00:15',
			meeting: '2016.04.15 18:00:15',
			hour: '2016-02-15 18:00:15'
	 	 });

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    
    }, 1000);
      
  };
  
  //infinite scroll
  $scope.noMoreItemsAvailable = false;
  
  $scope.loadMore = function() {
    $timeout( function() {
	
		$scope.items.push({
			id: $scope.items.length,
			time: '2015.04.25 22:00:15',
			meeting: '2016.02.15 18:00:15',
			hour: '2016-02-15 18:00:15'
		});
	   
		if ( $scope.items.length == 99 ) {
		  $scope.noMoreItemsAvailable = true;
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
		
    }, 1000);
  };

    
	
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $state, $q, UserService, $ionicLoading, $ionicActionSheet, $timeout) {
	$scope.user = UserService.getUser();

	$scope.showLogOutMenu = function() {
		var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout?',
			cancelText: 'Cancel',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
				  template: 'Logging out...'
				});
				

				// Facebook logout
				facebookConnectPlugin.logout(function(){},
				function(fail){
				  $ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Log out '+user.name,
						template: fail
					});					
				});
				
				
				$timeout(function(){
				  window.localStorage.removeItem('starter_facebook_user');
				  $ionicLoading.hide();
				  $state.go('signin');
				}, 2500);
				
				
			}
		});
	};  
  
});
