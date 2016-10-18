// Color values
var color = {
  background: 'grey',
  curve: 'red',
  line: 'white',
  circle: 'blue'
}
// Control points array based on the user clicks
var points = [];
// Circles representing user clicks
var circles = [];
// The radius of the circle
var circleSize = 10;
// The real background with color
var background = {};
// The touchScreen for receiving the user click's
var touchScreen = {};
// The line path
var path = {};
// The bezier curve
var bezier = {};
// Precision value
var precision = 0.01;
// Background setup
background = new Rect(0, 0, stage.options.width, stage.options.height);
background.attr('fillColor', color.background);
background.addTo(stage);
// TouchScreen setup for ensuring
// that the paths do not overleap
touchScreen = new Rect(0, 0, stage.options.width, stage.options.height);
touchScreen.addTo(stage);

/**
 * Returns new coordenate between c1 and c2 based on pos
 * @param pos is the position of the vector
 * @param c1 is the first x or y
 * @param c2 is the second x or y
 */
function getNewPoint(pos, c1, c2) {
  return c1 - ((c1 - c2)*pos);
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
  var bezierPoints = [];
  for (var i = 0; i <= 1; i+=precision) {
    var t = getNewPath(i, points);
    while(t.length>4) {
      t = getNewPath(i, t);
    }
    bezierPoints.push(getNewPoint(i, t[0], t[2]));
    bezierPoints.push(getNewPoint(i, t[1], t[3]));
  }
  bezierPoints.push(points[points.length-2]);
  bezierPoints.push(points[points.length-1]);
  bezier = new Path(bezierPoints)
    .stroke(color.curve,1);

  var stageObjects = [background, path, bezier, touchScreen];
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
    circles.forEach(function(circle) {
      stageObjects.push(circle);
    });
    stage.children(stageObjects);
  }
}

// When clicked generates new control point and
// draws the line if it has more than 1 point
touchScreen.on('pointerup', function(evt) {
  points.push(evt.x);
  points.push(evt.y);
  var c = new Circle(evt.x, evt.y, circleSize)
    .fill(color.circle);

  c.index = circles.length;
  circles.push(c);

  // When the circle is dragged around, the stage
  // lower its precision for rendering real time
  // the changes and after returns the precision
  // to it's normal state and draw the new curve
  c.on('multi:drag', function(evt) {
    var index = this.index;
    circles[index]._attributes.x = evt.x;
    circles[index]._attributes.y = evt.y;
    points[index*2] = evt.x;
    points[(index*2)+1] = evt.y;
    if(points.length>2) {
      precision = 0.1;
      drawLine();
      precision = 0.01;
      drawLine();
    }
  });

  // When the circle is doubleclicked, the circle and its
  // respective point is removed from their array's of origin,
  // we re-index the circles left and draw the lines
  c.on('doubleclick', function(evt) {
    for (var i = this.index+1; i < circles.length; i++) {
      circles[i].index--;
    }
    circles.splice(this.index,1);
    points.splice(2*this.index,2);
    if(points.length>2)
      drawLine();
    else
      stage.children([background, touchScreen, circles[0]]);
  });

  if(points.length>2)
    drawLine();
  else
    stage.addChild(c);
});
