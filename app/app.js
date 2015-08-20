var app = angular.module('musiQuessApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'mainController'
        })

});

app.controller('mainController', function ($scope) {
    // create a message to display in our view
    $scope.message = 'Everyone come and see how good I look!';
});

app.run(['$rootScope', '$window', 'srvAuth',
    function($rootScope, $window, sAuth) {

        $rootScope.user = {};

        $window.fbAsyncInit = function() {

            FB.init({
                appId      : '918570134876487',
                channelUrl : 'app/channel.html',
                status     : true,
                cookie     : true,
                xfbml      : true,
                version    : 'v2.4'
            });

            sAuth();

        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

    }]);

app.factory('srvAuth', [function() {
    return watchLoginChange = function() {

        var _self = this;

        FB.Event.subscribe('auth.authResponseChange', function(res) {

            if (res.status === 'connected') {



                 console.log(res.authResponse);
            }
            else {

                console.log("foo");

            }

        });

    }
}]);