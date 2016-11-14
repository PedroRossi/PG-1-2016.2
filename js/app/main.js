// Color values
var color = {
  background: 'grey',
  curve: 'red',
  line: 'white',
  circle: 'blue',
  text: 'black',
  casteljau: {
    line: 'red',
    area: 'yellow',
    smooth: 'yellow'
  }
}
// Initial area parameter
var initial = 0;
// Final area parameter
var final = 1;
// Control points array based on the user clicks
var points = [];
// Text points array representing the blossoming
var textPoints = [];
// Circles representing user clicks
var circles = [];
// The radius of the circle
var circleSize = 5;
// The bossom area paths
var paths = [];
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
// Used for noticing when drag is done
var time = Date.now();
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
function deCasteljau(pos, points) {
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
function getBezierCurve(points, precision, initial, final) {
  var bezierPoints = [];
  paths = [];
  for (var i = 0; i <= 1; i+=precision) {
    i = (Math.round(i*100))/100;
    var np = deCasteljau(i, points);
    while(np.length>2) {
      var p = new Path(np).stroke(color.casteljau.area, 0.1);
      if(i>=initial && i<=final)paths.push(p);
      np = deCasteljau(i, np);
    }
    bezierPoints.push(np[0]);
    bezierPoints.push(np[1]);
  }
  bezier = new Path(bezierPoints).stroke(color.casteljau.line,1);
}

/**
 * Organize stage objects for better view
 */
function organizeStage() {
  var stageObjects = [background, path];
  paths.forEach(function(p) {
    stageObjects.push(p);
  });
  textPoints.forEach(function(t) {
    stageObjects.push(t);
  });
  stageObjects.push(bezier);
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
  if(points.length>4) {
    getBezierCurve(points, precision, initial, final);
    organizeStage();
  } else {
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

  // When the circle is dragged around, the stage
  // lower its precision for rendering real time
  // the changes
  c.on('multi:drag', function(evt) {
    var index = this.index;
    circles[index]._attributes.x = evt.x;
    circles[index]._attributes.y = evt.y;
    textPoints[index]._attributes.x = evt.x - 7;
    textPoints[index]._attributes.y = evt.y - 7;
    points[index*2] = evt.x;
    points[(index*2)+1] = evt.y;
    if(points.length>2) {
      precision = 0.05;
      drawLine();
    }
  });

  // After drag state for re rendering the line
  // with normal precision
  c.on('pointerup', function() {
    precision = 0.01;
    drawLine();
  });

  if(points.length>2)
    drawLine();
  else
    stage.children([t, c, touchScreen]);
});

// Gets initial and final parameter from user
stage.on('message:setParameters', function(data) {
  initial = data.data.initial;
  final = data.data.final;
  if(points.length>2)
    drawLine();
});

/**
 * Set n arbitrary points and draws the line
 * (Used for debuggin)
 */
function customPoints() {
  points = [
    //  80, 353,
    // 429, 117,
    // 467, 521,
    // 789, 255
  ];
  var n = 50;
  while(n--) {
    points.push(Math.random()*(Math.random()>0.5?100:1000));
    points.push(Math.random()*(Math.random()>0.5?100:1000));
  }
  for (var i = 0; i < points.length; i+=2) {
    var c = new Circle(points[i],points[i+1],circleSize);
    c.fill(color.circle);
    circles.push(c);
  }
  drawLine();
}
// customPoints();
