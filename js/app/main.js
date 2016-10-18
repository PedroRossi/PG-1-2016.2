// Color values
var color = {
  background: 'grey',
  curve: 'red',
  line: 'white',
  circle: 'blue',
  text: 'black'
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
  return (Math.round((c1 - ((c1 - c2)*pos))*100))/100;
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
  var paths = [];
  var blossomTextPoints = [];
  // TODO PD later
  // console.log(paths[0]._segments);
  // console.log(paths);
  for (var i = 0; i <= 1; i+=precision) {
    i = (Math.round(i*100))/100;
    var np = points;
    do {
      np = getNewPath(i, np);
      if(i == 0.5) {
        var p = new Path(np).stroke('yellow',1);
        paths.push(p);
      }
    } while(np.length>4);
    bezierPoints.push(getNewPoint(i, np[0], np[2]));
    bezierPoints.push(getNewPoint(i, np[1], np[3]));
  }
  // TODO Point numering system
  // paths.forEach(function(p) {
  //   for (var i = 0; i < p._segments.length; i++) {
  //     var str = 'P'+i+(i+1);
  //     var t = new Text(str).attr({
  //       x: p._segments[i][1]-7,
  //       y: p._segments[i][2]-7
  //     });
  //     blossomTextPoints.push(t);
  //   }
  // });
  bezierPoints.push(points[points.length-2]);
  bezierPoints.push(points[points.length-1]);
  bezier = new Path(bezierPoints)
    .stroke(color.curve,1);

  var stageObjects = [background, path, bezier, touchScreen];
  circles.forEach(function(c) {
    stageObjects.push(c);
  });
  paths.forEach(function(p) {
    stageObjects.push(p);
  });
  textPoints.forEach(function(t) {
    stageObjects.push(t);
  });
  blossomTextPoints.forEach(function(b) {
    stageObjects.push(b);
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
touchScreen.on('pointerup', function(evt) {
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

  t.index = c.index = circles.length;
  circles.push(c);
  textPoints.push(t);



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
    textPoints[index].attr({
      x: evt.x-7,
      y: evt.y-7
    });
    if(points.length>2) {
      // precision = 0.1;
      drawLine();
      // precision = 0.01;
      // drawLine();
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


// var text = new Text('Hi');
// text.attr({
//   fontFamily: 'Arial, sans-serif',
//   fontSize: 20,
//   textFillColor: 'red',
//   textStrokeColor: 'yellow',
//   textStrokeWidth: 1,
//   x: 50,
//   y: 50
// });
// text.addTo(stage);
