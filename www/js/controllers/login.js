/**
 * Created by xiaodm on 2016/8/11.
 */
controllers
  .controller('LoginCtrl', function ($scope, $state, $myutil) {
    $scope.data = {showInvalid: false};

    $scope.login = function () {
      //console.log("LOGIN user: " + $scope.data.username + " - PW: " + $scope.data.password);
      $myutil.deviceNumber = $scope.data.username;
      if ($scope.data.password == $myutil.loginPwd) {
        $scope.data.showInvalid = false;
        $state.go("tab.chatlist");
      }
      else {
        $scope.data.showInvalid = true;
      }
    }
  });
