angular.module('Reactions')
  .controller('SignupCtrl', function($scope, $auth) {
    $scope.signup = function() {
      // var user = {
      //   username: $scope.username,
      //   password: $scope.password,
      //   repassword: $scope.repassword
      // };
      // $auth.signup(user)
      //   .catch(function(response) {
      //     console.log(response.data);
      //   });
      alert('Đăng ký đang đóng');
    };

  });