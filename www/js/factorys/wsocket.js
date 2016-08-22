/**
 * Created by xiaodm on 2016/8/11.
 */
services
  .factory('Socket', function ($myutil) {
    var ws = new WebSocket('ws://' + $myutil.serverIp + ':3001');
    // 打开WebSocket
    ws.onopen = function (event) {
      var phoneInfo = {
        deviceNumber: $myutil.deviceNumber,
        name: $myutil.deviceNumber,
        isFromPhone: true
      };

      ws.send(JSON.stringify(phoneInfo));
    };
    ws.onerror = function (evt) {
      alert("WebSocketError!");
      console.log("WebSocketError!");
    };

    console.log("code to here1");
    return ws;
  });
