/**
 * Created by xiaodm on 2016/8/11.
 */
services
  .factory('Chat', function ($ionicScrollDelegate, $rootScope, Socket, $cordovaFile, $cordovaMedia, $myutil) {
    var messages = [];
    var Notification = function (username, message) {
      var notification = {};
      notification.username = username;
      notification.message = message;
      notification.notification = true;
      return notification;
    };

    //监听消息
    Socket.onmessage = function (event) {
      console.log(event.data);
      // alert(event.data);
      var msgObj = JSON.parse(event.data);
      if (msgObj.from && msgObj.message) {
        $rootScope.$apply(function () {
          var msg = {
            msgId: $myutil.getGuid(),
            from: msgObj.from,
            to: $myutil.deviceNumber,
            message: msgObj.message,
            messageType: msgObj.messageType,
            deviceNumber: msgObj.deviceNumber,
            fileName: msgObj.fileName,
            mediaDuration: msgObj.mediaDuration,
            sendTime: msgObj.sendTime,
            incidentId: msgObj.incidentId,
            resourceId: msgObj.resourceId,
            incidentNumber: msgObj.incidentNumber,
            seatIp: msgObj.seatIp,
            orgPersonId: msgObj.orgPersonId,
            orgPersonName: msgObj.from,
            hasRead: false,
            notification: false
          };


          if (msgObj.messageType == 1) {

            msg.saveFolderPath = cordova.file.externalCacheDirectory;
            var imageType = msgObj.fileName.substring(msgObj.fileName.lastIndexOf(".") + 1);
            var blobMsg = b64toBlob(msgObj.message, "image/" + imageType);
            saveFile(msg.saveFolderPath, msgObj.fileName, blobMsg);

            msg.message = "data:image/" + imageType + ";base64," + msg.message; //将图片转为 Base64DataUrl数据
          }
          if (msgObj.messageType == 2) {
            //alert("get voice msg:" + msgObj.fileName);
            msg.saveFolderPath = cordova.file.externalRootDirectory;
            var blobMsg = b64toBlob(msgObj.message, "audio/x-wav");
            saveFile(msg.saveFolderPath, msgObj.fileName, blobMsg);
          }

          addMessage(msg);
          $rootScope.$broadcast($myutil.messageComeNotice, {msg: msg});
        });
      }
    };

    var saveFile = function (foldName, fileName, blobMsg) {
      // WRITE
      $cordovaFile.writeFile(foldName, fileName, blobMsg, true)
        .then(function (success) {
          //alert('writeFile success');
          //var recordMedia = $cordovaMedia.newMedia(fileName);
          //recordMedia.play();
          // success
        }, function (error) {
          // error
          alert('error:' + error);
        });

    };

    var b64toBlob = function (b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
    };

    var scrollBottom = function () {
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollBottom(true);
    };

    var addMessage = function (msg) {
      msg.notification = msg.notification || false;
      messages.push(msg);
      scrollBottom();
    };

    return {
      getAllMessages: function () {
        return messages;
      },
      getMessagesForUser: function (userMessage) {
        var userMsgs = messages.filter(function (userMsg) {
          return userMsg.orgPersonId == userMessage.orgPersonId
            && userMsg.incidentId == userMessage.incidentId;
        });
        userMsgs.forEach(function (item) {
          item.hasRead = true;
        });
        return userMsgs;
      },
      scrollBottom: function () {
        scrollBottom();
      }
    };
  });

