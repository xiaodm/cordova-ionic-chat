/**
 * Created by xiaodm on 2016/8/11.
 */
controllers.
  controller('ChatListCtrl', function ($scope, $state, Socket, Chat, Users, $myutil) {
    $scope.data = Users.getUserMessages();
    $scope.newestMessage = "";
    $scope.goChat = function (userMessage) {
      userMessage.noReadCount = 0;
      $state.go("chats", {obj: userMessage}, {reload: true});
    };


    $scope.$on($myutil.messageComeNotice, function (event, args) {
      // $scope.data = Users.getUserMessages();
      var message = args.msg;
      var newestMessage = buildNewMsg(message);
      var userMsg = $scope.data.filter(function (msg) {
        return msg.orgPersonId == message.orgPersonId && msg.incidentId == message.incidentId;
      });
      if (!userMsg || userMsg.length == 0) {
        var uMsg = {
          from: message.from,
          incidentId: message.incidentId,
          resourceId: message.resourceId,
          incidentNumber: message.incidentNumber,
          orgPersonId: message.orgPersonId,
          orgPersonName:message.orgPersonName,
          seatIp: message.seatIp,
          newestMessage: newestMessage,
          noReadCount: 1
        };
        $scope.data.push(uMsg);
      }
      else {
        userMsg[0].newestMessage = newestMessage;
        if (!message.hasRead) {
          userMsg[0].noReadCount += 1;
        }
      }
    });


    var buildNewMsg = function (message) {
      if (message.messageType == 0) {
        return message.message.length > 20 ? message.message.substring(0, 20) + "..." : message.message.substring(0, 20);
      }
      if (message.messageType == 1) {
        return "image:" + message.fileName;
      }
      if (message.messageType == 2) {
        return "voice:" + message.fileName;
      }
    }
  });
