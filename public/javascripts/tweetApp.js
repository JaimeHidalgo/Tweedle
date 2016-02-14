var app = angular.module('tweedleApp', ['ngRoute', 'ngResource']).run(function($rootScope,$http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id');
});

app.controller('mainController', function(postService, $scope, $rootScope,$interval){
		
	$scope.timerDisplay = 40;
	var promise;
	var pointsTotal = 0;
	$scope.truefalse = true;
	$scope.start = function(){
		$scope.truefalse = false;

		 promise = $interval(function(){

			if ($scope.timerDisplay > 0) {
				$scope.timerDisplay--;
			}else{
				$scope.truefalse = true;
				alert("game over");
				$scope.post();
				$scope.stop();

			}
		},1000);
		

	};

    $scope.countOf = function(text){
    	   	var s =  text.split(/\s+/);
			var sLenght = 1;
			sLenght = s.length; 
			var points = 0;	
			if(sLenght == 1){
				points = 0;
				return points;
			}else{
				
				if(sLenght <= 5){
					return points += 10;
				}else if (sLenght <= 10) {
					return points += 40;
				}else if (sLenght < 20) {
					pointsTotal = points;
					return points += 100;
				}else if (sLenght >= 20) {
					pointsTotal += points;
					return points += 200;
				}
				

			}
	};

 	$scope.stop = function(){
 		if(angular.isDefined(promise)){
 		 $interval.cancel(promise);
 		 promise = undefined;
 		}
 	};
 	$scope.reset = function(){
 		$scope.timerDisplay = 40;
 	};
 	
 

	$scope.$on('$destroy', function(){
 		$scope.stop();
 	});

	//posting things to mongodb

	$scope.posts = postService.query();

	$scope.newPost = {created_by: '', text: '', created_at: '', points: 0};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  $scope.newPost.points = $scope.countOf($scope.newPost.text);

	  console.log("before the save"+$scope.newPost.points );
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: '', points: 0};
	  });
	  $scope.reset();
	  $scope.stop();
	  $scope.truefalse = true;
	};
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});