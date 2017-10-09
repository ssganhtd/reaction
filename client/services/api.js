angular.module('Reactions')
    .factory('API', function($http) {
      return {
        getListAccount: function() {
          return $http.get('accounts');
        }
      }

    });