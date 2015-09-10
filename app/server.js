var app = angular.module('musiQuessApp', ['ngRoute', 'ngAudio']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/server/home.html',
            controller: 'mainController'
        })

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

app.controller('mainController', function ($scope, socket, ngAudio) {
    $scope.users = {};
    $scope.songs = []
    $scope.rightSongFilename = "";
    socket.emit('getUsers');
    socket.emit('newSongs');

    socket.on('users', function (users) {
        console.log($scope.users);
        $scope.users = users;
    });

    socket.on('songs', function (songs) {
        console.log(songs);
        $scope.songs = songs;
        findRightSong();
        $scope.sound = ngAudio.load($scope.rightSongFilename).play();
    });

    function findRightSong(){
        $scope.songs.forEach(function(song){
           if(song.rightChoise){
               $scope.rightSongFilename = song.filename;
               return;
           }
        });
    }
});
