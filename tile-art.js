window.onload = function(){
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  var map = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 0, 1, 0, 0, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 0, 0, 1, 0,
    0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
    0, 1, 0, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
  var tiles = new Image();
  tiles.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAAAKCAYAAAAkasVsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAADxSURBVFhH7ZfBCcJQEESNZQhe9CJiJSrYjUXYjaBWIuJFL4JtKF/54ikzg5/sByfXTGZn398kbLO/Dx894loMboTqLZlf1q3aw3hDezF+SaN41pwPZSvdaz4Ill9UvkYZVBQyN1tKlw8F+bG6yHzMm5nyleqVqadqIvP11bDWm0AEAQ9qBHXXlAl4UGVkfiCCgAc1grprygSkZUp27/gBtIhELlPsVt0xsk85xI5dWBWd0qs0qKPtstX7utq97pfSJa/kifyyDsGOHNTz8QTPRemVYQILfgkmsymUe+uHiCz4dwLSF7V2WDV/Uf3r/216nslTmhyOBL3DAAAAAElFTkSuQmCC';

  var mTemp = [];
  for (var i = 0; i < map.length; i++)
    mTemp.push(0);

  for (var y = 0; y < 10; y++) {
    for (var x = 0; x < 10; x++) {
      if (map[y * 10 + x] == 1) {
        var val = 0;
        if (y > 0 && map[(y - 1) * 10 + x] == 1)
          val |= 1;
        if (x < 9 && map[y * 10 + x + 1] == 1)
          val |= 2;
        if (y < 9 && map[(y + 1) * 10 + x] == 1)
          val |= 4;
        if (x > 0 && map[y * 10 + x - 1] == 1)
          val |= 8;
        mTemp[y * 10 + x] = val + 1;
      } 
      else{
        mTemp[y * 10 + x] = map[y * 10 + x];
      }
    }
  }

  for (var y = 0; y < 10; y++) {
    for (var x = 0; x < 10; x++) {
      var tile = mTemp[y * 10 + x];
      ctx.drawImage(tiles, tile * 10, 0, 10, 10,
        x * 10, y * 10, 10, 10);
    }
  }
};