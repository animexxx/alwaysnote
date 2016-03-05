'use strict';

angular.module('noteapp').factory('Notevalue', ['$http',
    function ($http) {
        // Notevalue service logic
        // ...

        // Public API
        return {
            addvalue: function (data) {
                return $http.post('/notevalue/add', data);
            },
            loadnotevalue: function (data) {
                return $http.post('/notevalue', data);
            },
            deleterow: function (data) {
                return $http.delete('/notevalue/' + data);
            },
            sortcolumn: function (data) {
                return $http.post('/notecolumn/sort', data);
            },
            removecl: function (data) {
                return $http.post('/notecolumn/delcl', data);
            }
        };
    }
]);