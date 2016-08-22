
controllers
  .controller('AccountCtrl', function ($scope, Chat) {
    $scope.username = Chat.getUsername();
  }, true);
