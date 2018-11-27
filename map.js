var ctx = null;

var gameMap = [];

//0  1  2  3  4  5  6  7
//8  9  10 11 12 13 14 15
//16 17 18 19 20 21 22 23
//24 25 26 27 28 29 30 31

var tileW = 8,
    tileH = 8;

var mapW = 60,
    mapH = 60;

for (var i = 0; i < (mapW * mapH) + 1; i++) {
  gameMap.push({el:0, state:"ground", i:i});
}

var colors = {
  ground: [
    0,
    "#0A0000",
    "#1A1111",
    "#2A2222",
    "#3A3333",
    "#444141",
    "#555151",
    "#666161",
    "#777777",
    "#888888",
    "#999999",
    "#AAAAAA",
    "#BBBBBB",
    "#CACACC",
    "#DADADD",
    "#EAEAEE",
    "#FAFAFF"
  ],
  water: [
    0,
    "#0000B0",
    "#1111B8",
    "#2222BF",
    "#3333C0",
    "#4444C8",
    "#5555CF",
    "#6666D0",
    "#7777D8",
    "#8888DF",
    "#9999E0",
    "#AAAAE8",
    "#BBBBEF",
    "#BBBBF0",
    "#CCCCF8",
    "#DDDDFC",
    "#EEEEFF"
  ],
  plants: [
    0,
    "#008800",
    "#118811",
    "#229922",
    "#339933",
    "#44AA44",
    "#55AA55",
    "#66BB66",
    "#77BB77",
    "#88CC88",
    "#99CC99",
    "#AADDAA",
    "#BBDDBB",
    "#CCEECC",
    "#DDEEDD",
    "#EEFFEE",
    "#FFFFFF"
  ]
};

var waterTable = 4;
var treeLine = 9;
var tolerance = 2;
var viability = 18;

var peaks = [];
var valleys = [];
var lakes = [];

window.onload = function(){
  ctx = document.getElementById('game').getContext("2d");
  requestAnimationFrame(drawGame);

  waterTable = document.getElementById('waterTable').value;
  treeLine = document.getElementById('treeLine').value;
  tolerance = document.getElementById('tolerance').value;
  viability = document.getElementById('viability').value;
};

function apply(){
  waterTable = document.getElementById('waterTable').value;
  treeLine = document.getElementById('treeLine').value;
  tolerance = document.getElementById('tolerance').value;
  viability = document.getElementById('viability').value;
}

function worldGen(){

  earthquake();

  for (var i = 0; i < 4; i++) {
    smooth();
  }

  earthquake();

  for (var i = 0; i < 20; i++) {
    smooth();
  }

  for (var i = 0; i < 20; i++) {
    refine();
  }
}

function smooth(){
  // loop over all tiles
  var tempMap = {};
  for (var i = 0; i < gameMap.length; i++) {

    if (!gameMap[i].el) {

      // get this tile's adjacents
      var thisAdj = adjacentTiles(i);

      // array of the adjacent tile positions
      closest = Object.values(thisAdj.all);

      // loop over this tile's cardinal adjacents
      for (var j = 0; j < closest.length; j++) {

        // if the adjacent is set on the game map
        if (gameMap[closest[j]].el){
          var rng = Math.floor(Math.random() * 100);

          // same:          40%
          // slight delta:  60%

          if (rng <= 40){
            tempMap[i] = gameMap[closest[j]].el;
          } 
          else {
            var delta = Math.floor(Math.random() * 100);
            if (rng <= 50){
              if ((gameMap[closest[j]].el - 1) < 2) {
                tempMap[i] = (gameMap[closest[j]].el + 1);
              } 
              else {
                tempMap[i] = (gameMap[closest[j]].el - 1);
              }
            }
            else{
              if ((gameMap[closest[j]] + 1) > 6) {
                tempMap[i] = (gameMap[closest[j]].el - 1);
              } 
              else {
                tempMap[i] = (gameMap[closest[j]].el + 1);
              }
            }
          }
        }
      }
    }
  }

  mergeTempMap(tempMap);
  requestAnimationFrame(drawGame);
}

function refine(){
  // loop over all tiles
  var tempMap = {};
  for (var i = 0; i < gameMap.length; i++) {

    var thisAdj = adjacentTiles(i);
    var edges = Object.values(thisAdj.all);

    for (var j = 0; j < edges.length; j++) {

      var diff = Math.abs(gameMap[edges[j]].el - gameMap[i].el);

      if (diff > tolerance){
        if (gameMap[edges[j]].el > gameMap[i].el){
          var newVal = gameMap[i].el + 1;
          if (newVal > colors.ground.length - 1) {
            tempMap[i] = colors.ground.length - 1;
          }
          else {
            tempMap[i] = newVal;
          }
        }
        else {
          var newVal = gameMap[i].el - 1;
          if (newVal < 1) {
            tempMap[i] = 1;
          }
          else {
            tempMap[i] = newVal;
          }
        }
      }
    }
  }

  mergeTempMap(tempMap);
  requestAnimationFrame(drawGame);
}

function mergeTempMap(tempMap){
  var tempMapVals = Object.values(tempMap);
  var tempMapKeys = Object.keys(tempMap);

  for (var i = 0; i < tempMapVals.length; i++) {
    gameMap[tempMapKeys[i]].el = tempMapVals[i];
  }
}

function earthquake(){

  mountain(16);
  valley(1);

  mountain(9);
  valley(3);

  valley(3);

  requestAnimationFrame(drawGame);
}

function mountain(height){
  var highPos = Math.floor(Math.random() * gameMap.length);
  var mount = adjacentTiles(highPos);

  // Set Highest Values
  gameMap[highPos].el = height;
  peaks.push(highPos);

  var mountCloseVals = Object.values(mount.close);
  var mountFarVals = Object.values(mount.far);

  for (var i = 0; i < mountCloseVals.length; i++) {
    gameMap[mountCloseVals[i]].el = height - 2;
  }
  for (var i = 0; i < mountFarVals.length; i++) {
    gameMap[mountFarVals[i]].el = height - 3;
  }
}

function valley(depth){
  var lowPos = Math.floor(Math.random() * gameMap.length);
  var pit = adjacentTiles(lowPos);

  // Set Lowest Values
  gameMap[lowPos].el = depth;
  valleys.push(lowPos);

  var pitCloseVals = Object.values(pit.close);
  var pitFarVals = Object.values(pit.far);

  for (var i = 0; i < pitCloseVals.length; i++) {
    gameMap[pitCloseVals[i]].el = depth + 1;
  }
  for (var i = 0; i < pitFarVals.length; i++) {
    gameMap[pitFarVals[i]].el = depth + 2;
  }
}

function water(){
  // Peak position
  var startPeak = Math.floor(Math.random() * peaks.length);
  var flowDir = adjacentTiles(peaks[startPeak]);

  // Random tile off peak
  var flowDirFarVals = Object.values(flowDir.far);
  var startFlowDir = Math.floor(Math.random() * flowDirFarVals.length);

  flow(flowDirFarVals[startFlowDir]);
  requestAnimationFrame(drawGame);
  for (var i = 0; i < 4; i++) {
    refine();
  }
}

function flow(source){
  var sourceEl = gameMap[source].el;
  var next = lowestAdjacent(source);

  if (next.thisEl > sourceEl) {
    gameMap[next.thisTile].el = sourceEl - 1;
  }
  wetTile(next.thisTile);

  if(next.thisEl > waterTable){
    flow(next.thisTile);
  }
  else{
    pool(next.thisTile);
  }
}

function pool(tile){
  var adj = adjacentTiles(tile);
  var allAdj = Object.values(adj.all);

  var elevation = 0;
  var heighest;
  var found = false;

  for (var i = 0; i < allAdj.length; i++) {
    if (gameMap[allAdj[i]].state != "water" && gameMap[allAdj[i]].el <= waterTable){
      wetTile(allAdj[i]);
      if (gameMap[allAdj[i]].el > elevation) {
        elevation = gameMap[allAdj[i]].el;
        heighest = allAdj[i];
        found = true;
      }
    }
  }
  if (found) {
    pool(heighest);
  }
  else{
    lakes.push(tile);
  }
}

function lowestAdjacent(tile){
  var flowDir = adjacentTiles(tile);

  // Start flow off lowest adjacent
  var flowAllVals = Object.values(flowDir.all);
  var lowestEl = 99999;
  var flowIt;

  for (var i = 0; i < flowAllVals.length; i++) {
    if (gameMap[flowAllVals[i]].state != "water") {
      var thisEl = gameMap[flowAllVals[i]].el;
      if (thisEl < lowestEl) {
        flowIt = flowAllVals[i];
        lowestEl = thisEl;
      }
    }
  }

  var obj = {
    thisEl: lowestEl,
    thisTile: flowIt
  };
  return obj;
}

function wetTile(tile){
  gameMap[tile].state = "water";
}

function life(){
  // lake position
  var randLake = Math.floor(Math.random() * lakes.length);
  var lakeAdj = adjacentTiles(lakes[randLake]);
  var allLakeAdj = Object.values(lakeAdj.all);

  for (var i = 0; i < allLakeAdj.length; i++) {
    var possible = supportsLife(allLakeAdj[i]);
    if (possible) {
      gameMap[allLakeAdj[i]].state = "plants";
    }
  }

  grow();

  requestAnimationFrame(drawGame);
}

function grow(){
  // loop over all tiles
  var tempMap = {};
  for (var i = 0; i < gameMap.length; i++) {

    var lifeScore = supportsLife(i);
    // console.log("id: " + gameMap[i] + ", life: " + lifeScore);

    if (lifeScore) {

      // get this tile's adjacents
      var thisAdj = adjacentTiles(i);

      // array of the adjacent tile positions
      closest = Object.values(thisAdj.all);

      // loop over this tile's adjacents
      for (var j = 0; j < closest.length; j++) {

        if (gameMap[closest[j]].state == "plants"){
          var rng = Math.floor(Math.random() * 100);
          var chances = lifeScore * viability;

          if (rng <= chances){
            tempMap[i] = "plants";
          } 
          else {
            tempMap[i] = "ground";
          }
        }
      }
    }
  }

  mergeStateMap(tempMap);
  requestAnimationFrame(drawGame);
}

function mergeStateMap(tempMap){
  var tempMapVals = Object.values(tempMap);
  var tempMapKeys = Object.keys(tempMap);

  for (var i = 0; i < tempMapVals.length; i++) {
    gameMap[tempMapKeys[i]].state = tempMapVals[i];
  }
}

function supportsLife(tile){
  var life = 0;
  if (gameMap[tile].state != "water" && gameMap[tile].el >= waterTable - 1 && gameMap[tile].el < treeLine) {
    life = 1;

    var adj = adjacentTiles(tile);
    var allAdj = Object.values(adj.all);

    for (var i = 0; i < allAdj.length; i++) {
      if (gameMap[allAdj[i]].state == "water") {
        life++;
      }
    }

    if (gameMap[tile].el >= waterTable + 1 && gameMap[tile].el < treeLine - 2){
      life++;
    }
  }
  return life;
}

function adjacentTiles(tile){

  var obj = { "far":{}, "close":{}, "all":{} };

  var adj = {
    nw: (tile - (mapW + 1)),
    ne: (tile - (mapW - 1)),
    sw: (tile + (mapW - 1)),
    se: (tile + (mapW + 1)),
    n: (tile - mapW),
    e: (tile - 1),
    w: (tile + 1),
    s: (tile + mapW)
  };

  var bounds = Object.values(adj);
  var dir = Object.keys(adj);

  for (var i = 0; i < bounds.length; i++) {
    if (bounds[i] > -1 && bounds[i] <= (mapW * mapH)) {
      if (dir[i].length > 1) {
        obj["far"][dir[i]] = bounds[i];
      }
      else{
        obj["close"][dir[i]] = bounds[i];
      }
      obj["all"][dir[i]] = bounds[i];
    }
  }

  return obj;
}

function drawGame(){
  if(ctx==null) { return; }
  for(var y = 0; y < mapH; ++y){
    for(var x = 0; x < mapW; ++x){
      var currentPos = ((y*mapW)+x);
      if(gameMap[currentPos].el){
        ctx.fillStyle = colors[gameMap[currentPos]["state"]][gameMap[currentPos]["el"]];
      }
      else{
        ctx.fillStyle = colors["ground"][Math.floor(colors["ground"].length / 2)]; 
      }
      ctx.fillRect( x*tileW, y*tileH, tileW, tileH);
    }
  }
  requestAnimationFrame(drawGame);
}