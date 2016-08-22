var app = angular.module('chat', ['ionic', 'chat.controllers', 'chat.services', 'ngCordova']);
var services = angular.module('chat.services', []);
var controllers = angular.module('chat.controllers', []);
app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.chatlist', {
        url: '/chatlist',
        views: {
          'tab-users': {
            templateUrl: 'templates/tab-chatlist.html',
            controller: 'ChatListCtrl'
          }
        }
      })
      .state('chats', {
        url: '/chats',
        cache: 'false',
        params: {obj: {}},
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatCtrl'
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

  });
