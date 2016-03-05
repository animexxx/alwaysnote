'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
    // Init module configuration options
    var applicationModuleName = 'notes';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate',
        'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularMoment',
        'angular.filter', 'daterangepicker'];

    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('noteapp');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
//		Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
//		Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
//		Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
	}
]);
'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {
		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
    function ($scope, Authentication, $location) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        if ($scope.authentication.user !== '') {
            $location.path('/note');
        }
    }
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
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
'use strict';

angular.module('noteapp').controller('NoteappController', ['$scope', '$stateParams', '$location', 'Authentication',
    'Notes', 'Notecolumn', 'Notevalue', '$anchorScroll', '$timeout',
    function ($scope, $stateParams, $location, Authentication, Notes, Notecolumn, Notevalue, $anchorScroll, $timeout) {
        $scope.authentication = Authentication;
        $scope.time = 'H:mm:ss';
        $scope.c10cln = false;
        $scope.c2cln = true;
        $scope.allowaddnote = false;
        $scope.hideifsubmiting = false;
        $scope.date = {startDate: new Date(), endDate: new Date()};
        $scope.date.startDate.setHours(0, 0, 0, 0);
        $scope.date.endDate.setHours(23, 59, 59, 59);

        $scope.create = function () {
            if ($scope.notes.length < 20) {
                var note = new Notes({
                    notename: 'New note'
                });
                note.$save(function (response) {
                    $scope.notes.unshift(response);
                    //load table
                    $scope.notechoice(response._id);
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
                if (confirm('Are you sure want to delete this note?') === true) {
                    var note = new Notes({
                        _id: note_id
                    });
                    note.$delete(function (response) {
                        $location.path('/');
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });

                }
            }
        };
        $scope.changeclname = function (column_id) {
            var value = '';
            for (var i in $scope.ncl) {
                if ($scope.ncl[i]._id === column_id) {
                    value = $scope.ncl[i];
                    break;
                }
            }
            //edit
            var person = prompt('Please enter column name', value.columnname);

            if (person !== null) {
                var notecledit = new Notecolumn({
                    _id: $scope.note_id_choice,
                    columnid: column_id,
                    columnname: person
                });
                notecledit.$update(function () {
                    value.columnname = person;
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };
        $scope.notechoice = function (note_id) {
            if ($scope.note_id_choice === note_id) {

                var value = '';
                for (var i in $scope.notes) {
                    if ($scope.notes[i]._id === note_id) {
                        value = $scope.notes[i];
                        break;
                    }
                }
                //edit
                var person = prompt('Please enter note name', value.notename);

                if (person !== null) {
                    var noteedit = new Notes({
                        _id: note_id,
                        notename: person
                    });
                    noteedit.$update(function () {
                        value.notename = person;
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }
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
            });
        };


        $scope.addcolm = function () {
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

        $scope.removecolm = function () {
            if (confirm('Are you sure want to remove column?') === true) {
                var notecl = new Notecolumn({
                    _id: $scope.note_id_choice
                });
                notecl.$delete(function (response) {
                    $scope.loadnote($scope.note_id_choice);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        $scope.addcolmval = function () {
            $scope.hideifsubmiting = true;
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

            var data = {};
            data.time = new Date();


            if (typeof $scope.lastinserttime !== 'undefined' && $scope.lastinserttime.getTime() === data.time.getTime()) {
                continuet = false;
                alert('You enter too fast!!!');
            }

            if (continuet === true) {

                $scope.lastinserttime = data.time;

                data.data = angular.copy($scope.newnotecl);

                var timedt = {
                    _id: $scope.timecolid,
                    _value: data.time
                };
                data.data.unshift(timedt);
                var sto = Notevalue.addvalue(data);
                sto.success(function (res) {

                    var newvl = {};
                    //flag to ensure it is edited action or created ?
                    var flag = false;
                    for (var i in data.data) {
                        if (typeof data.data[i].notevalueid !== 'undefined' && data.data[i].notevalueid.trim() !== '') {

                            for (var j in $scope.noteclvl) {

                                if ($scope.noteclvl[j]._id === data.data[i].notevalueid) {
                                    $scope.noteclvl[j].columnvalue = data.data[i]._value;
                                }
                            }

                            flag = true;
                        }
                    }

                    //if created
                    if (flag === false) {
                        for (var x in data.data) {
                            newvl = {
                                columnvalue: data.data[x]._value,
                                created: data.time,
                                notecolumn: {
                                    _id: data.data[x]._id,
                                    position: x
                                }
                            };
                            $scope.noteclvl.push(newvl);
                        }
                    }

                    for (var jj in $scope.newnotecl) {
                        $scope.newnotecl[jj]._value = '';
                        $scope.newnotecl[jj].notevalueid = '';
                    }
                    $timeout(function () {
                        $scope.hideifsubmiting = false;
                    }, 1000);
                });
                continuet = false;
            }
        };

        $scope.editrow = function (timeinsert) {

            for (var i in $scope.noteclvl) {
                if ($scope.noteclvl[i].created === timeinsert) {
                    for (var j in $scope.newnotecl) {
                        if ($scope.newnotecl[j]._id === $scope.noteclvl[i].notecolumn._id) {
                            $scope.newnotecl[j]._value = $scope.noteclvl[i].columnvalue;
                            $scope.newnotecl[j].notevalueid = $scope.noteclvl[i]._id;
                        }
                    }
                }
            }
            $location.hash('bottom');
            $anchorScroll();
        };

        $scope.deleterow = function (timeinsert) {
            if (confirm('Are you sure want to delete this row?') === true) {
                var dl = Notevalue.deleterow(timeinsert);
                dl.success(function () {

                    $scope.noteclvl = $scope.noteclvl.filter(function (value) {
                        return value.created !== timeinsert;
                    });

                });
            }

        };

    }
]);
'use strict';

angular.module('noteapp').directive('currentTime', ['$interval', 'dateFilter',
    function ($interval, dateFilter) {
        // return the directive link function. (compile function not needed)
        return function (scope, element, attrs) {
            var format,  // date format
                stopTime; // so that we can cancel the time updates

            // used to update the UI
            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }

            // watch the expression, and update the UI on change.
            scope.$watch(attrs.currentTime, function (value) {
                format = value;
                updateTime();
            });

            stopTime = $interval(updateTime, 1000);

            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating time after the DOM element was removed.
            element.on('$destroy', function () {
                $interval.cancel(stopTime);
            });
        };
    }]);
'use strict';

angular.module('noteapp').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
'use strict';

angular.module('noteapp').filter('clfilter', [
    function () {
        return function (input) {
            if (moment(input).isValid() === true) {
                input = moment(input).format('H:mm:ss MM-DD-YY');
            }
            else {
                var replacedText, replacePattern1, replacePattern2, replacePattern3;
                //URLs starting with http://, https://, or ftp://
                replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
                replacedText = input.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

                //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
                replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

                //Change email addresses to mailto:: links.
                replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
                input = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
            }
            return input;
        };
    }
]);
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
            }
        };
    }
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);