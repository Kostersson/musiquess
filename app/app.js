var app = angular.module('musiQuessApp', ['ngRoute', 'btford.socket-io', 'facebook', 'ionic']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'mainController'
        })

}).config(function(FacebookProvider) {
    FacebookProvider.init('918570134876487');

}).config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position("bottom");
    $ionicConfigProvider.tabs.style("standard");
});

app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});

app.controller('mainController', function ($scope, socket, Facebook) {
    // Define user empty data :/
    $scope.user = {};

    // Defining user logged status
    $scope.logged = false;

    // And some fancy flags to display messages upon user status change
    $scope.byebye = false;
    $scope.salutation = false;

    /**
     * Watch for Facebook to be ready.
     * There's also the event that could be used
     */
    $scope.$watch(
        function() {
            return Facebook.isReady();
        },
        function(newVal) {
            if (newVal)
                $scope.facebookReady = true;
        }
    );

    var userIsConnected = false;

    Facebook.getLoginStatus(function(response) {
        if (response.status == 'connected') {
            userIsConnected = true;
            $scope.logged = true;
            getUserData();
        }
    });

    /**
     * IntentLogin
     */
    $scope.IntentLogin = function() {
        if(!userIsConnected) {
            $scope.login();
        }
    };

    /**
     * Login
     */
    $scope.login = function() {
        Facebook.login(function(response) {
            if (response.status == 'connected') {
                $scope.logged = true;
                getUserData();
            }

        });
    };

    function getUserData() {
        Facebook.api('/me', {fields: "id,name,picture"}, function(response) {
            $scope.$apply(function() {
                $scope.user = response;
                Facebook.api('/me/picture?width=200&height=200', function(response){
                    $scope.user["image"] = response.data["url"];
                    emitUser();
                });
            });
        });

    };

    /**
     * Logout
     */
    $scope.logout = function() {
        Facebook.logout(function() {
            $scope.$apply(function() {
                $scope.user   = {};
                $scope.logged = false;
                socket.emit('removeUser');
            });
        });
    }

    /**
     * Taking approach of Events :D
     */
    $scope.$on('Facebook:statusChange', function(ev, data) {
        console.log('Status: ', data);
        if (data.status == 'connected') {
            $scope.$apply(function() {
                $scope.salutation = true;
                $scope.byebye     = false;
            });
        } else {
            $scope.$apply(function() {
                $scope.salutation = false;
                $scope.byebye     = true;

                // Dismiss byebye message after two seconds
                $timeout(function() {
                    $scope.byebye = false;
                }, 2000)
            });
        }


    });

    function emitUser(){
        socket.emit("connectUser", $scope.user);
    }

    $scope.emitSongsRefresh = function(){
        socket.emit("newSongs")
    }

    $scope.disableButtons = false;

    $scope.addPoints = function(){
        console.log("points!");
        socket.emit('addPoints', 3);
    }

    $scope.songs = [];

    socket.on('songs', function (songs) {
        console.log(songs);
        $scope.disableButtons = false;
        $scope.songs = songs;
    });

    $scope.sendQuess = function(title, rightChoise){
        $scope.disableButtons = true;
        socket.emit('guess', {user: $scope.user, title: title, rightChoise: rightChoise});
    }

});

