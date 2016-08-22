/**
 * Created by xiaodm on 2016/8/11.
 */
controllers
  .controller('ChatCtrl', function ($scope, $stateParams, $ionicPopup, $timeout,
                                    $cordovaCamera, $cordovaMedia, $cordovaFile,
                                    $cordovaImagePicker, $ionicPopover, Socket, Chat, $myutil) {

    $scope.data = {};

    $scope.showTextInput = true;
    $scope.showVoicePopover = false;

    $scope.deviceNumber = $myutil.deviceNumber;//环境变量

    //激活当前会话窗体时的值
    var userMessage = $stateParams.obj;
    $scope.incidentId = userMessage.incidentId;
    $scope.resourceId = userMessage.resourceId;
    $scope.incidentNumber = userMessage.incidentNumber;
    $scope.orgPersonId = userMessage.orgPersonId;
    $scope.orgPersonName = userMessage.orgPersonName;
    $scope.seatIp = userMessage.seatIp || $myutil.testSeatIp;

    $scope.messages = Chat.getMessagesForUser(userMessage);

    setPopoverTemplate();

    Chat.scrollBottom();

    $scope.messageIsMine = function (from) {
      return $scope.deviceNumber === from;
    };

    $scope.getBubbleClass = function (username, messageType) {

      if ($scope.messageIsMine(username)) {
        classname = 'from-me';
        if (messageType == 1) {
          classname = 'from-meimg';
        }
      }
      else {
        var classname = 'from-them';
        if (messageType == 1) {
          classname = 'from-themimg';
        }
      }
      return classname;
    };

    //查看图片消息
    $scope.bigImage = false;    //初始默认大图是隐藏的
    $scope.hideBigImage = function () {
      $scope.bigImage = false;
    };
    //点击图片放大
    $scope.showBigImage = function (imageName) {  //传递一个参数（图片的URl）
      $scope.Url = imageName;                   //$scope定义一个变量Url，这里会在大图出现后再次点击隐藏大图使用
      $scope.bigImage = true;                   //显示大图
    };


    //subscribe to receive msg notification
    $scope.$on($myutil.messageComeNotice, function (event, args) {
      var message = args.msg;
      if (message.incidentId == $scope.incidentId && message.orgPersonId == $scope.orgPersonId) {
        message.hasRead = true;
        $scope.messages.push(message);
      }
    });

    $scope.sendMessage = function (msg) {
      sendMessageCore(0, msg, null, 0);
      $scope.data.message = "";
    };

    var recordMedia;
    var voiceFileName;
    var startTime;
    /**
     * 开始录音事件
     * @param $event 事件源
     */
    $scope.voiceDown = function ($event) {
      startTime = new Date();
      // $scope.addFileActionPopover.show($event);
      $scope.showVoicePopover = true;

      try {
        voiceFileName = new Date().Format("yyyyMMddHHmmss") + ".wav";

        recordMedia = $cordovaMedia.newMedia(voiceFileName);
        // 开始录音
        recordMedia.startRecord();
      }
      catch (e) {
        alert("voiceDown startRecord error:" + e.message);
        console.log(e);
      }
    };

    /**
     * 停止录音事件
     */
    $scope.voiceUp = function () {
      // $scope.addFileActionPopover.hide();
      $scope.showVoicePopover = false;
      if (!voiceFileName) {
        return;
      }
      try {
        // 停止录音
        recordMedia.stopRecord();


        recordMedia.play();
        // recordMedia.release();

        //正确应该要获取到int型的，但实际没取到，返回的是"$$state":{"status":0}}，待解决
        var mediaDuration = Math.ceil((new Date() - startTime) / 1000);//10;//recordMedia.getDuration();
        //recordMedia.getDuration().then(function (duration) {
        //  alert(duration);
        //});
        var recordFileName = voiceFileName;
        $cordovaFile.readAsDataURL(cordova.file.externalRootDirectory, recordFileName)
          .then(function (base64Data) {
            // success
            // alert('read file success:' + result);
            sendMessageCore(2, base64Data, recordFileName, mediaDuration);
          }, function (error) {
            // error
            alert("$cordovaFile.readAsDataURL coice error:" + error.code);
            console.log(error);
          });

        releaseMedia();
      }
      catch (e) {
        alert("voiceUp error:" + e.message);
        console.log(e);
      }
    };

    /**
     * 释放录音对象
     */
    var releaseMedia = function () {
      if (recordMedia) {
        // recordMedia.release();
        //recordMedia = null;
        voiceFileName = "";
      }
    };

    /**
     * 播放语音
     * @param voiceFileName 语音文件名
     */
    $scope.voicePlay = function (voiceFileName) {
      var palyMedia = $cordovaMedia.newMedia(voiceFileName);
      palyMedia.play();
    };

    /**
     * 显示添加附件的弹窗
     * @param $event
     */
    $scope.showActions = function ($event) {
      $scope.actionPopover.show($event);
    };


    /**
     * 选择图片发送
     */
    $scope.sendImgs = function () {
      var options = {
        maximumImagesCount: 10,
        width: 800,
        height: 800,
        quality: 90
      };

      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          for (var i = 0; i < results.length; i++) {
            //alert('Image URI: ' + results[i]);
            //console.log('Image URI: ' + results[i]);
            var lastSplit = results[i].lastIndexOf("/");
            var fileName = results[i].substring(lastSplit + 1);
            var folderName = results[i].substring(0, lastSplit);

            $cordovaFile.readAsDataURL(folderName, fileName)
              .then(function (fileDataUrls) {
                // success
                // alert('read file success:'+fileDataUrls);
                sendMessageCore(1, fileDataUrls, fileName, 0);
              }, function (error) {
                // error
                alert("$cordovaFile.readAsDataURL error:" + error.code);
                console.log(error);
              });


          }
        }, function (error) {
          // error getting photos
        });
    };


    /**
     * 发送相机拍摄图片
     */
    $scope.sendCameraImg = function () {
      var options = {
        quality: 90,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 800,
        targetHeight: 800,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true,
        correctOrientation: true
      };

      $cordovaCamera.getPicture(options).then(function (imageData) {
        var fileDataUrls = "data:image/jpeg;base64," + imageData;
        //随机生成一个文件名
        var fileName = new Date().Format("yyyyMMddHHmmss") + ".jpeg";
        sendMessageCore(1, fileDataUrls, fileName, 0);
      }, function (err) {
        // error
      });
    };

    /**
     * 发送短视频 （暂未实现）
     */
    $scope.sendVideocamera = function () {

    };

    /**
     * 弹层模板设置
     */
    function setPopoverTemplate() {
      //语音长按时遮罩模板
      $ionicPopover.fromTemplateUrl('voice-popover.html', {
        scope: $scope
      }).then(function (addFilePopover) {
        $scope.addFileActionPopover = addFilePopover;
      });


      //操作按钮弹层
      $ionicPopover.fromTemplateUrl('addFileAction-popover.html', {
        scope: $scope
      }).then(function (acPopover) {
        $scope.actionPopover = acPopover;
      });
    };

    /**
     * 发送消息，消息存储
     * @param messageType
     * @param message
     * @param fileName
     * @param mediaDuration
     */
    var sendMessageCore = function (messageType, messageSource, fileName, mediaDuration) {
      $scope.actionPopover.hide();

      var message = messageSource;
      if (messageType == 1) {
        message = messageSource.replace(/^data:image\/(jpg|png|jpeg);base64,/, "");
      }
      if (messageType == 2) {
        message = messageSource.replace(/^data:audio\/(mpeg|x-wav);base64,/, "");
      }

      var sendMsg = {};
      sendMsg.targetProName = "ip";
      sendMsg.targetProValues = $scope.seatIp;
      sendMsg.isRegisterInfoPro = false;
      sendMsg.messageType = 4;
      var messageInfo = {
        msgId: $myutil.getGuid(),
        from: $scope.deviceNumber,
        to: $scope.orgPersonId,
        mobileConnId: "",
        deviceNumber: $scope.deviceNumber,
        messageType: messageType,
        message: message,
        fileName: fileName,
        mediaDuration: mediaDuration,
        sendTime: new Date().Format("yyyy-MM-dd HH:mm:ss"),
        incidentId: $scope.incidentId,
        resourceId: $scope.resourceId,
        incidentNumber: $scope.incidentNumber,
        orgPersonId: $scope.orgPersonId,
        seatIp: $scope.seatIp
      };
      sendMsg.message =
      {
        callbackId: "",
        hub: "DispatchCommunicateHub",
        method: "OnGetPhoneMessage",
        args: messageInfo
      };
      //发送消息
      Socket.send(JSON.stringify(sendMsg));

      //本地存储
      //本地时，图片音频还是base64格式数据
      messageInfo.message = messageSource;
      $scope.messages.push(messageInfo);
      Chat.getAllMessages().push(messageInfo);
      Chat.scrollBottom();
    }
  }
);
