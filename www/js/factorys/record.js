/**
 * Created by xiaodm on 2016/8/4.
 * 暂未使用此类，后续提取
 */
services.factory('$record', [

  '$rootScope',
  '$cordovaMedia',
  'Socket',

  function ($rootScope, $cordovaMedia, Socket) {

    var enumerator = 0;
    var recordName = 'record-' + enumerator + '.mp3';
    var mediaRec = null;
    var OnCallback = null;
    var OnAppendData = {};

    /**
     * Start a record
     *
     * @method startRecord
     */
    function startRecord() {
      enumerator++;
      recordName = 'record-' + enumerator + '.mp3';
      //mediaRec = new Media(recordName,
      //  function () {
      //  },
      //  function (err) {
      //  });
      mediaRec = $cordovaMedia.newMedia(recordName);
      mediaRec.startRecord();
    }

    /**
     * Stop record
     *
     * @method stopRecord
     */
    function stopRecord() {
      mediaRec.stopRecord();
    }

    /**
     * Stop record
     *
     * @method stopRecord
     */
    function playRecord() {
      mediaRec.play();
    }

    /**
     * Get the name of the record
     *
     * @method getRecord
     */
    function getRecord() {
      return recordName;
    }

    /**
     * Save the recorded file to the server
     *
     * @method save
     */
    function save(callback, appendData) {
      OnCallback = callback;
      OnAppendData = appendData;
      //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, OnFileSystem, fail);
    }


    /**
     * Play record
     *
     * @method playRecord
     */
    function playRecord() {
      var mediaFile = new Media(recordName,
        function () {
          console.log("playAudio():Audio Success");
        },
        function (err) {
          console.log("playAudio():Audio Error: " + err);
        }
      );
      // Play audio
      mediaFile.play();
    }

    return {
      start: startRecord,
      stop: stopRecord,
      play: playRecord,
      name: getRecord,
      save: save
    };
  }]);

