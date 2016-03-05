'use strict';

angular.module('noteapp').factory('Notecolumn', ['$resource',
    function ($resource) {
        return $resource('notecolumn/:noteId', {
            noteId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            addvalue:{
                method:'POST'
            }
        });
    }
]);