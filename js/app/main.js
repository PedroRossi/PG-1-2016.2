// Constante values for the program colors
const colors = {
  background: 'grey',
  lines: '',
  curve: ''
}
// Control points array based on the user clicks
var points = [];
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
background.attr('fillColor', 'grey');
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
    .stroke('red',1);
  stage.children([background, path, bezier, touchScreen]);
}

/**
 * Draws the line based on the control points
 */
function drawLine() {
  path = new Path(points)
    .stroke('white',1);
  casteljau();
}

// When clicked generates new control point and
// draws the line if it has more than 2 points
touchScreen.on('pointerup', function(evt) {
  points.push(evt.x);
  points.push(evt.y);
  if(points.length>4)
    drawLine();
});
