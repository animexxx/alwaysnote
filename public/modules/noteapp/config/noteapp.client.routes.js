'use strict';

//Setting up route
angular.module('noteapp').config(['$stateProvider',
    function ($stateProvider) {
        // Noteapp state routing
        $stateProvider.
            state('noteapp', {
                url: '/note',
                templateUrl: 'modules/noteapp/views/noteapp.client.view.html'
            }).
            state('noteappabout', {
                url: '/about',
                templateUrl: 'modules/noteapp/views/about.client.view.html'
            })
        ;
    }
]);