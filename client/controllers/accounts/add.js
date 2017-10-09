angular.module('Reactions')
.controller('AddAccountCtrl', function($scope, $auth, $http) {
  $scope.addacount = function() {
    var account = {
      token: $scope.access_token,
      reaction: $scope.reaction,
    };
    $http.post('/accounts/add', account)
    .then(function(response){
     $scope.PostDataResponse = response;
     if(response.data.status == true){
      $scope.access_token = "";
      alert(response.data.msg);
    }else{
      alert(response.data.msg);
    }
  });
  };
});