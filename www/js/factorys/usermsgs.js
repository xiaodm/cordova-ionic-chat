/**
 * Created by xiaodm on 2016/8/11.
 */

services
  .factory('Users', function (Chat) {
    var userMessages = [];

    var getUserMessages = function () {
      userMessages = [];
      var allMessages = Chat.getAllMessages();
      allMessages.forEach(function (item, index) {
        var userMsg = userMessages.filter(function (uMsg) {
          return uMsg.orgPersonId == item.orgPersonId && uMsg.incidentId == item.incidentId;
        });
        if (!userMsg || userMsg.length == 0) {
          var uMsg = {
            from: item.from,
            incidentId: item.incidentId,
            resourceId: item.resourceId,
            incidentNumber: item.incidentNumber,
            orgPersonId: item.orgPersonId,
            seatIp: item.seatIp,
            noReadCount: 1
          };
          userMessages.push(uMsg);
        }
        else {
          if (!item.hasRead) {
            userMsg[0].noReadCount += 1;
          }
        }
      });

      return userMessages;
    };

    return {
      getUserMessages: function () {
        return getUserMessages();
      }
    };
  }
);
