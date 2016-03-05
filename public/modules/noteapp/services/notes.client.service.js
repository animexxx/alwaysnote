'use strict';

angular.module('noteapp').factory('Notes', ['$resource',
        function ($resource) {
            return $resource('note/:noteId', {
                noteId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);