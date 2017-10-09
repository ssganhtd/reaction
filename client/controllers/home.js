angular.module('Reactions')
.controller('HomeCtrl', function($scope, $window, $rootScope, $auth, API, $http) {
	if ($auth.isAuthenticated() && ($rootScope.currentUser && $rootScope.currentUser.username)) {
		API.getListAccount().success(function(data) {
			$scope.accounts = data;
		});

		$scope.removeAccount = function($scope, $auth, $http){
			$http.post('/accounts/delete', {id:$scope}).then(function(response){
				if(response.data.status == true){
					window.reload();
				}else{
					alert(response.data.msg);
				}
			});
		}
	}

	

	$scope.isAuthenticated = function() {
		return $auth.isAuthenticated();
	};
});