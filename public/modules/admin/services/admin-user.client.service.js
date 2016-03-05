'use strict';

angular.module('admin').factory('AdminUser', ['$http',
	function($http) {
		// Admin user service logic
		// ...

		// Public API
		return {
			getAllUser: function () {
				return $http.get('/admin');
			}
		};
	}
]);