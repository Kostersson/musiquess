var app = angular.module('musiQuessApp', ['ngRoute', 'ngAudio', 'timer', 'angular-toArrayFilter']);

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

app.controller('mainController', function ($scope, $timeout, socket, ngAudio) {
    $scope.users = {};
    $scope.songs = [];
    $scope.rightSongFilename = "";
    socket.emit('getUsers');
    socket.emit('newSongs');
    socket.emit('getAddress');
    $scope.showCountdown = false;
    $scope.sound = undefined;
    $scope.countdownDuration = 5;
    $scope.showRoundWinner = false;
    $scope.serverAddress = "";

    socket.on('round-winner', function (winner) {
        console.log("foo");
        console.log(winner);
        $scope.winner = winner;
        $scope.showRoundWinner = true;
        if(winner.user != undefined){
            $scope.winnerText = "Round winner: " + winner.user.name;
        }
        else {
            $scope.winnerText = "No right answers"
        }
        $timeout(function() {
            $scope.showRoundWinner = false;
            socket.emit('newSongs');
        }, 3000);
    });

    socket.on('server-address', function (addr) {
        console.log(addr);
        $scope.serverAddress = addr;
    });

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
        if(Object.keys(users).length > 0){
            $scope.sound = ngAudio.load($scope.rightSongFilename);
            $scope.$broadcast('timer-set-countdown-seconds', $scope.countdownDuration);
            $scope.$broadcast('timer-resume');
            $scope.showCountdown = true;
        }
    });

    function findRightSong(){
        $scope.songs.forEach(function(song){
           if(song.rightChoise){
               $scope.rightSongFilename = song.filename;
           }
        });
    }
    $scope.startSong = function () {
        if($scope.sound != undefined){
            $scope.sound.play();
        }
        $scope.showCountdown = false;
    }
});
