'use strict';

angular.module('noteapp').controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

    $scope.items = angular.copy(items);

    for (var i in $scope.items) {
        if ($scope.items[i].position.valueOf() === 0) {
            $scope.items.splice(i, 1);
        }
    }

    $scope.ok = function () {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
})
    .controller('ModalEditNoteInstanceCtrl', function ($scope, $modalInstance, items, del) {
        $scope.note = {};
        $scope.note._name = items;
        $scope.note._delete = false;
        $scope.displaydel = del;

        $scope.ok = function () {
            $modalInstance.close($scope.note);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
;