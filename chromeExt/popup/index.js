var app = angular.module('ScrobblerPopUp', ['ui.router']);

// app.config(function ($urlRouterProvider, $locationProvider) {
//     // This turns off hashbang urls (/#about) and changes it to something normal (/about)
//     // $locationProvider.html5Mode(true);
//     // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
//     $urlRouterProvider.otherwise('/');
// });

// app.config(function ($stateProvider) {
//     $stateProvider.state("login", {
//         url: "/",
//         templateUrl: "popup/popup.html"
//     })
// });

app.controller('LoginCtrl', function ($scope, LoginFactory, $state) {
    $scope.login = {};
    $scope.error = null;
    $scope.sendLogin = function (loginInfo) {
        $scope.error = null;
        LoginFactory.login(loginInfo).then(function (user) {
            chrome.storage.sync.set({user: user}, function() {
                console.log('user saved!', user);
                chrome.storage.sync.get("user", function(user) {
                    console.log("user after storagearea.get", user);
                });
            });
            //replace $state.go('home') with something else
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});



// // This app.run is for controlling access to specific states.
// app.run(function ($rootScope, AuthService, $state) {

//     // The given state requires an authenticated user.
//     var destinationStateRequiresAuth = function (state) {
//         return state.data && state.data.authenticate;
//     };

//     // $stateChangeStart is an event fired
//     // whenever the process of changing a state begins.
//     $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

//         if (!destinationStateRequiresAuth(toState)) {
//             // The destination state does not require authentication
//             // Short circuit with return.
//             return;
//         }

//         if (AuthService.isAuthenticated()) {
//             // The user is authenticated.
//             // Short circuit with return.
//             return;
//         }

//         // Cancel navigating to new state.
//         event.preventDefault();

//         AuthService.getLoggedInUser().then(function (user) {
//             // If a user is retrieved, then renavigate to the destination
//             // (the second time, AuthService.isAuthenticated() will work)
//             // otherwise, if no user is logged in, go to "login" state.
//             if (user) {
//                 $state.go(toState.name, toParams);
//             } else {
//                 $state.go('login');
//             }
//         });

//     });

// });
