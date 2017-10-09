angular.module('Reactions', ['ngRoute', 'ngMessages', 'satellizer'])
  .config(function($routeProvider, $authProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/accounts/add', {
        templateUrl: 'views/accounts/add.html',
        controller: 'AddAccountCtrl'
      })
      .otherwise('/');

    $authProvider.loginUrl = '/users/login';
    $authProvider.signupUrl = '/users/register';
    $authProvider.addaccountUrl = '/accounts/add';
  })
  .run(function($rootScope, $window, $auth) {
    if ($auth.isAuthenticated()) {
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    }
  });
