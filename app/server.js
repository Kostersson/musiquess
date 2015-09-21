var app = angular.module('musiQuessApp', ['ngRoute', 'ngAudio', 'timer']);

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
    $scope.showCountdown = false;
    $scope.sound = undefined;
    $scope.countdownDuration = 5;

    socket.on('users', function (users) {
        console.log($scope.users);
        $scope.users = users;
    });

    socket.on('songs', function (songs) {
        console.log(songs);
        $scope.songs = songs;
        findRightSong();
        if($scope.sound != undefined){
            $scope.sound.stop();
        }
        $scope.sound = ngAudio.load($scope.rightSongFilename);
        $scope.$broadcast('timer-set-countdown-seconds', $scope.countdownDuration);
        $scope.$broadcast('timer-resume');
        $scope.showCountdown = true;
    });

    function findRightSong(){
        $scope.songs.forEach(function(song){
           if(song.rightChoise){
               $scope.rightSongFilename = song.filename;
               return;
           }
        });
    }
    $scope.startSong = function () {
        $scope.sound.play();
        $scope.showCountdown = false;
    }
});
