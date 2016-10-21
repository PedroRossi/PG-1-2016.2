// Color values
var color = {
  background: 'grey',
  curve: 'red',
  line: 'white',
  circle: 'blue',
  text: 'black',
  casteljau: {
    circle: 'yellow',
    line: 'yellow'
  }
}
// Control points array based on the user clicks
var points = [];
// Text points array representing the blossoming
var textPoints = [];
// Circles representing user clicks
var circles = [];
// The radius of the circle
var circleSize = 5;
// The real background with color
var background = {};
// The screen for touching
var touchScreen = {};
var path = {};
// The line path
// The bezier curve
var bezier = {};
// Precision value
var precision = 0.007;
// Background setup
background = new Rect(0, 0, stage.options.width, stage.options.height);
background.attr('fillColor', color.background);
background.addTo(stage);

// TouchScreen setup
touchScreen = new Rect(0, 0, stage.options.width, stage.options.height);
touchScreen.addTo(stage);

/**
 * Returns new coordenate between c1 and c2 based on pos
 * @param pos is the position of the vector
 * @param c1 is the first x or y
 * @param c2 is the second x or y
 */
function getNewPoint(pos, c1, c2) {
  return (Math.round((c1 - ((c1 - c2)*pos))*1000))/1000;
}

/**
 * Returns the new points array based on the new starting
 * point. Ex.: pos = 0.5 makes the new points array start
 * from the middle of the first vector
 * @param pos is the starting position of each vector
 * @param points is the points array for reference
 */
function getNewPath(pos, points) {
  var newPoints = [];
  for (var i = 0; i < points.length-2; i+=2) {
    newPoints.push(getNewPoint(pos, points[i], points[i+2]));
    newPoints.push(getNewPoint(pos, points[i+1], points[i+3]));
  }
  return newPoints;
}

/**
 * Gets the bezier points and draws the bezier curve
 */
function casteljau() {
  var paths = [];
  // TODO PD later
  // console.log(paths[0]._segments);
  // console.log(paths);
  for (var i = 0; i <= 1; i+=precision) {
    i = (Math.round(i*1000))/1000;
    var np = points;
    do {
      np = getNewPath(Math.random(), np);
      var p = new Path(np).stroke(color.casteljau.line,10);
      paths.push(p);
    } while(np.length>4);
  }
  // Organizing the objects at the stage
  var stageObjects = [background, path];
  paths.forEach(function(p) {
    stageObjects.push(p);
  });
  textPoints.forEach(function(t) {
    stageObjects.push(t);
  });
  stageObjects.push(touchScreen);
  circles.forEach(function(c) {
    stageObjects.push(c);
  });
  stage.children(stageObjects);
}

/**
 * Draws the line based on the control points
 */
function drawLine() {
  path = new Path(points)
    .stroke(color.line,1);
  if(points.length>4)
    casteljau();
  else {
    var stageObjects = [background, path, touchScreen]
    circles.forEach(function(c) {
      stageObjects.push(c);
    });
    textPoints.forEach(function(t) {
      stageObjects.push(t);
    });
    stage.children(stageObjects);
  }
}

// When clicked generates new control point and
// draws the line if it has more than 1 point
touchScreen.on('click', function(evt) {
  points.push(evt.x);
  points.push(evt.y);

  var c = new Circle(evt.x, evt.y, circleSize)
    .fill(color.circle);

  var t = new Text('P'+circles.length)
    .attr({
      textFillColor: color.text,
      x: evt.x-7,
      y: evt.y-7
    });

  c.index = circles.length;
  circles.push(c);
  textPoints.push(t);

  // When the circle is doubleclicked, the circle and its
  // respective point is removed from their array's of origin,
  // we re-index the circles left and draw the lines
  c.on('doubleclick', function(evt) {
    for (var i = this.index+1; i < circles.length; i++) {
      circles[i].index--;
      textPoints[i].attr({
        text: 'P'+(i-1)
      });
    }
    circles.splice(this.index,1);
    textPoints.splice(this.index,1);
    points.splice(2*this.index,2);
    if(points.length>2)
      drawLine();
    else
      stage.children([background, touchScreen, circles[0], textPoints[0]]);
  });

  if(points.length>2)
    drawLine();
  else
    stage.children([t, c, touchScreen]);
});

// for (var i = 0; i < 100; i++) {
//   var x = Math.random()*(Math.random()>0.5?1000:100);
//   var y = (Math.random()*(Math.random()>0.5?1000:100));
//   // console.log(x + ' ' + y);
//   points.push(x);
//   points.push(y);
// }
// drawLine();
