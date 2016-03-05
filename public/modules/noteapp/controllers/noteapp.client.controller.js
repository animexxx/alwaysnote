'use strict';

angular.module('noteapp').controller('NoteappController', ['$scope', '$stateParams', '$location', 'Authentication',
    'Notes', 'Notecolumn', 'Notevalue', '$anchorScroll', '$timeout', '$rootScope', '$modal',
    function ($scope, $stateParams, $location, Authentication, Notes, Notecolumn, Notevalue, $anchorScroll, $timeout, $rootScope, $modal) {
        $scope.authentication = Authentication;
        $scope.time = 'H:mm:ss';
        $scope.c10cln = false;
        $scope.c2cln = true;
        $scope.allowaddnote = false;
        $scope.hideifsubmiting = false;
        $scope.date = {startDate: new Date(), endDate: new Date()};
        $scope.date.startDate.setHours(0, 0, 0, 0);
        $scope.date.endDate.setHours(23, 59, 59, 59);
        $rootScope.loading_note = false;
        $scope.isupdate = false;
        $scope.timeinsert = '';

        $scope.openload = function () {
            $rootScope.loading_note = true;
        };
        $scope.closeload = function () {
            $rootScope.loading_note = false;
        };

        $scope.create = function () {
            $scope.openload();
            if ($scope.notes.length < 20) {
                var note = new Notes({
                    notename: 'New note'
                });
                note.$save(function (response) {
                    $scope.notes.unshift(response);
                    //load table
                    $scope.notechoice(response._id);
                    $scope.closeload();
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
                $scope.allowaddnote = false;
            }
            else {
                $scope.allowaddnote = true;
            }

        };

        $scope.deletenote = function (note_id) {
            if (typeof note_id !== 'undefined') {
                var note = new Notes({
                    _id: note_id
                });
                note.$delete(function (response) {
                    $location.path('/');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

            }
        };

        $scope.notechoice = function (note_id) {
            if ($scope.note_id_choice === note_id) {

                var value = {};
                for (var i in $scope.notes) {
                    if ($scope.notes[i]._id === note_id) {
                        value = $scope.notes[i];
                        break;
                    }
                }
                //edit

                $scope.openeditnotemodal(value);
            }
            else {
                $scope.note_id_choice = note_id;
                $scope.loadnote(note_id);

            }
        };

        $scope.find = function () {
            $scope.notes = Notes.query(function (response) {
                //load first note on load
                if (typeof response[0] !== 'undefined')
                    $scope.notechoice(response[0]._id);

            });
        };

        $scope.loadnote = function (note_id) {
            $scope.openload();
            $scope.newnotecl = [];
            $scope.timecolid = 0;
            //load table note
            $scope.ncl = Notecolumn.query({
                noteId: note_id
            }, function (response) {

                //define new form input object
                $scope.timecolid = response[0]._id;
                for (var item in response) {
                    if (response[item].position) {
                        $scope.newnotecl[response[item].position] = {};
                        $scope.newnotecl[response[item].position]._id = response[item]._id;
                        $scope.newnotecl[response[item].position]._value = '';
                    }
                }

                if (response.length > 10) {
                    $scope.c10cln = true;
                } else {
                    $scope.c10cln = false;
                }

                if (response.length > 2) {
                    $scope.c2cln = false;
                } else {
                    $scope.c2cln = true;
                }

                $scope.newnotecl.shift();

                //load value
                $scope.loadnotevalue();
            });

        };

        $scope.loadnotevalue = function () {
            $scope.openload();
            var colid = [];
            for (var i in $scope.newnotecl) {
                colid[i] = $scope.newnotecl[i]._id;
            }
            colid.unshift($scope.timecolid);
            var data = {
                colid: colid,
                daterange: $scope.date
            };

            var loadnvl = Notevalue.loadnotevalue(data);
            loadnvl.success(function (res) {
                $scope.noteclvl = res;
                $scope.closeload();
            });
        };


        $scope.addcolm = function () {
            $scope.openload();
            //add to db
            var position = $scope.ncl.length;
            var notecl = new Notecolumn({
                columnname: 'New column',
                position: position,
                note: $scope.note_id_choice
            });
            notecl.$save(function (response) {
                $scope.loadnote($scope.note_id_choice);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });

        };


        $scope.addcolmval = function () {


            var continuet = false;

            if ($scope.newnotecl.length > 1) {
                for (var i in $scope.newnotecl) {
                    if ($scope.newnotecl[i]._value.trim() !== '') {
                        continuet = true;
                    }
                }
            } else {
                if ($scope.newnotecl[0]._value.trim() !== '') {
                    continuet = true;
                }
            }


            if (continuet === true) {
                $scope.hideifsubmiting = true;
                $scope.openload();
                var data = {};
                data.time = new Date();
                data.data = angular.copy($scope.newnotecl);
                data.isupdate = $scope.isupdate;
                if (data.isupdate === true)
                    data.time = $scope.timeinsert;

                var timedt = {
                    _id: $scope.timecolid,
                    _value: data.time
                };
                data.data.unshift(timedt);
                var sto = Notevalue.addvalue(data);
                sto.success(function (response) {
                    $scope.isupdate = false;
                    $scope.closeload();
                    var newvl = {};

                    if (data.isupdate === true)
                        for (var i in data.data) {
                            if (typeof data.data[i].notevalueid !== 'undefined' && data.data[i].notevalueid.trim() !== '') {

                                for (var j in $scope.noteclvl) {

                                    if ($scope.noteclvl[j]._id === data.data[i].notevalueid) {
                                        $scope.noteclvl[j].columnvalue = data.data[i]._value;
                                    }
                                }

                            }
                        }

                    for (var x in response) {
                        newvl = {
                            _id: response[x]._id,
                            columnvalue: response[x].columnvalue,
                            created: response[x].created,
                            notecolumn: {
                                _id: response[x].notecolumn,
                                position: x
                            }
                        };
                        $scope.noteclvl.push(newvl);
                    }
                    //clear submit input
                    for (var jj in $scope.newnotecl) {
                        $scope.newnotecl[jj]._value = '';
                        $scope.newnotecl[jj].notevalueid = '';
                    }
                    $timeout(function () {
                        $scope.hideifsubmiting = false;
                    }, 1000);
                });

            }
        };

        $scope.editrow = function (timeinsert) {

            for (var i in $scope.noteclvl) {
                if ($scope.noteclvl[i].created === timeinsert) {
                    for (var j in $scope.newnotecl) {
                        if ($scope.newnotecl[j]._id === $scope.noteclvl[i].notecolumn._id) {
                            $scope.newnotecl[j]._value = ($scope.noteclvl[i].columnvalue);
                            $scope.newnotecl[j].notevalueid = ($scope.noteclvl[i]._id);
                        }
                    }
                }
            }
            $location.hash('bottom');
            $anchorScroll();
            $scope.isupdate = true;
            $scope.timeinsert = timeinsert;
        };

        $scope.deleterow = function (timeinsert) {
            $scope.openload();

            var dl = Notevalue.deleterow(timeinsert);
            dl.success(function () {
                $scope.closeload();
                $scope.noteclvl = $scope.noteclvl.filter(function (value) {
                    return value.created !== timeinsert;
                });

            });

        };

        $scope.opensortmodal = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'sm',
                resolve: {
                    items: function () {
                        return $scope.ncl;
                    }
                }
            });

            modalInstance.result.then(function (items) {
                $scope.openload();
                var temp = angular.copy(items);
                temp.unshift($scope.ncl[0]);
                for (var i in temp) {
                    if (i === 0) continue;
                    temp[i].position = i;
                }

                var sort = Notevalue.sortcolumn(temp);
                sort.success(function () {
                    $scope.closeload();
                    $scope.ncl = angular.copy(temp);
                });

            });
        };


        $scope.openeditnotemodal = function (value) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'editnote.html',
                controller: 'ModalEditNoteInstanceCtrl',
                size: 'sm',
                resolve: {
                    items: function () {
                        return value.notename;
                    },
                    del: function () {
                        return true;
                    }
                }
            });

            modalInstance.result.then(function (items) {
                if (items._delete === true) {
                    $scope.deletenote($scope.note_id_choice);
                } else {
                    var noteedit = new Notes({
                        _id: $scope.note_id_choice,
                        notename: items._name
                    });
                    noteedit.$update(function () {
                        value.notename = items._name;
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }

            });
        };

        $scope.changeclname = function (column_id) {
            var value = '';
            for (var i in $scope.ncl) {
                if ($scope.ncl[i]._id === column_id) {
                    value = $scope.ncl[i];
                    break;
                }
            }

            var del = true;
            if (value.position === 0) {
                del = false;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'editnote.html',
                controller: 'ModalEditNoteInstanceCtrl',
                size: 'sm',
                resolve: {
                    items: function () {
                        return value.columnname;
                    },
                    del: function () {
                        return del;
                    }
                }
            });

            modalInstance.result.then(function (items) {
                if (items._delete === true) {
                    $scope.removecolm(column_id);
                } else {

                    var notecledit = new Notecolumn({
                        _id: $scope.note_id_choice,
                        columnid: column_id,
                        columnname: items._name
                    });
                    notecledit.$update(function () {
                        value.columnname = items._name;
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }

            });

        };

        $scope.removecolm = function (column_id) {
            $scope.openload();
            var rmvl = Notevalue.removecl({_id: column_id});
            rmvl.success(function () {

                //remove deleted column before sort
                for (var x in $scope.ncl) {
                    if ($scope.ncl[x]._id === column_id) {
                        $scope.ncl.splice(x, 1);
                    }
                }
                //resort potion after delete
                for (var i in $scope.ncl) {
                    $scope.ncl[i].position = i;
                }

                var sort = Notevalue.sortcolumn($scope.ncl);
                sort.success(function () {
                    $scope.loadnote($scope.note_id_choice);
                });


            });
        };
    }
]);