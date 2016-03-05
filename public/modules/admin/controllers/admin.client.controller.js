'use strict';

angular.module('admin').controller('AdminController', ['$scope', 'Authentication', '$http', 'AdminUser',
    function ($scope, Authentication, $http, AdminUser) {
        $scope.authentication = Authentication;
        // Controller Logic
        // ...

        $scope.list = function () {
            AdminUser.getAllUser().success(function(res){
                $scope.users = res;
            });
        };
    }
]);