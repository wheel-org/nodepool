var TIME_BETWEEN_FRAMES = 1;
var DELTA_TIME = 1000 / TIME_BETWEEN_FRAMES;
var PREV_TIME = Date.now();
var DRAG = 0.995;
var BALL_RADIUS = 2.8575;
var MAX_CUE_BALL_VEL = 5;

var COLOR_BLUE = "#3465a4";
var COLOR_BLACK = "#000000";
var COLOR_YELLOW = "#fce94f";
var COLOR_GREEN = "#8ae234";
var COLOR_RED = "#ef2929";
var COLOR_MAROON = "#a40000";
var COLOR_ORANGE = "#f57900";
var COLOR_PURPLE = "#5c3566";

// 0 is White Ball
var balls = [
	ball(50, 51.5, "#FFF", 0),
	ball(152.5, 51.5, COLOR_YELLOW, 1), // Front (1)

	ball(158, 55, COLOR_RED, 3), // Second Row
	ball(158, 48, COLOR_RED, 11),  

	ball(163.5, 51.5, COLOR_BLACK, 8), // Center (8/Black)
	ball(163.5, 44.5, COLOR_GREEN, 6), // Surrounding Third Row
	ball(163.5, 58.5, COLOR_GREEN, 14),  

	ball(169, 41, COLOR_YELLOW, 2),
	ball(169, 48, COLOR_PURPLE, 4), // Fourth Row
	ball(169, 55, COLOR_MAROON, 15),  
	ball(169, 62, COLOR_ORANGE, 13),

	ball(174.5, 37.5, COLOR_PURPLE, 12), // Fifth Row Corner 1

	ball(174.5, 44.5, COLOR_ORANGE, 5), 
	ball(174.5, 51.5, COLOR_BLUE, 10), 
	ball(174.5, 58.5, COLOR_BLUE, 2),  

	ball(174.5, 65.5, COLOR_MAROON, 7) // Fifth Row Corner 2
];

var collidingWalls = [
	line(0, 94, 0, 6),
	line(0, 6, -10, -3),
	line(-3, -10, 6, 0),
	line(6, 0, 94, 0),
	line(94, 0, 95, -6),
	line(105, -6, 106, 0),
	line(106, 0, 194, 0),
	line(194, 0, 203, -10),
	line(210, -3, 200, 6),
	line(200, 6, 200, 94),
	line(200, 94, 210, 103),
	line(203, 110, 194, 100),
	line(194, 100, 106, 100),
	line(106, 100, 105, 106),
	line(95, 106, 94, 100),
	line(94, 100, 6, 100),
	line(6, 100, -3, 110),
	line(-10, 103, 0, 94)
];

function line(x1, y1, x2, y2) { 
	return {
		x1: x1,
		y1: y1,
		x2: x2,
		y2: y2,
		nx:  - (y2 - y1),
		ny: x2 - x1
	};
}
function ball(x, y, color, value) { 
	return {
		// X and y in cm
		x: x,
		y: y,
		// Rates are in m/s
		// Mass in kg
		dx: 0,
		dy: 0,
		r: BALL_RADIUS,
		mass: 0.160,
		color: color,
		value: value
	};
}

function areBallsTouching(a, b) { 
	if (a.x + a.r + b.r > b.x
		&& a.x < b.x + a.r + b.r
		&& a.y + a.r + b.r > b.y
		&& a.y < b.y + a.r + b.r) {
		return length(a, b) <= a.r + b.r;
	}
	else { 
		return false;
	}
}

function length(a, b) { 
	return Math.sqrt(Math.pow(a.y - b.y, 2) + Math.pow(a.x - b.x, 2));
}

function isBallTouchingWall(ball, wall) {
	var d = [wall.x2 - wall.x1, wall.y2 - wall.y1];
	var f = [wall.x1 - ball.x + BALL_RADIUS, wall.y1 - ball.y + BALL_RADIUS];
	var a = dotProduct(d, d);
	var b = 2 * dotProduct(f, d);
	var c = dotProduct(f, f) - BALL_RADIUS * BALL_RADIUS;
	var dis = b * b - 4 * a * c;

	if (dis >= 0) {
		dis = Math.sqrt(dis);
		var t1 = (-b - dis) / (2 * a);
		var t2 = (-b + dis) / (2 * a);

		if (t1 >= 0 && t1 <= 1) {
			return true;
		}

		if (t2 >= 0 && t2 <= 1) {
			return true;
		}

		return false;
	}
	return false;
}

function simulateVelocityFrame(ball) { 
	ball.x += (ball.dx * 100) / DELTA_TIME;	
	ball.y += (ball.dy * 100) / DELTA_TIME;

	if (ball.x < BALL_RADIUS) ball.x = BALL_RADIUS;
	else if (ball.x > 210) ball.x = 210;

	if (ball.y < BALL_RADIUS) ball.y = BALL_RADIUS;
	else if (ball.y > 130 - BALL_RADIUS) ball.y = 130 - BALL_RADIUS;
}

function dotProduct(a, b) { 
	return a[0] * b[0] + a[1] * b[1];
}

function subVec(a, b) { 
	return [a[0] - b[0], a[1] - b[1]];
}

function multVec(a, b) { 
	return [a * b[0], a * b[1]];
}

function normalize(v) { 
	return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}

function normalizeBalls(a, b) { 
	// Ensures the two balls that are touching are exactly touching
	var touchingBy = a.r + b.r - length(a, b);
	if (touchingBy != 0) { 
		// Needs to be Normalized
		var eachMoveBy = touchingBy / 2;
		var v = subVec([a.x, a.y], [b.x, b.y]);
		var u = multVec(1 / normalize(v), v);
		// a moves in positive
		var slope = (a.y - b.y) / (a.x - b.x);
		a.x += eachMoveBy * u[0];
		a.y += eachMoveBy * u[1];
		b.x -= eachMoveBy * u[0];
		b.y -= eachMoveBy * u[1];
	}
}

function normalizeBallAndWall(b, l) { 

}

function updateBalls() { 
	for (var i = 0; i < balls.length; i++) {
		simulateVelocityFrame(balls[i]);
		balls[i].dx *= DRAG;
		balls[i].dy *= DRAG;		
		for (var j = i + 1; j < balls.length; j++) { 
			var a = balls[i];
			var b = balls[j];
			if (areBallsTouching(a, b)) {
				normalizeBalls(a, b);
				var coefA = ((2 * b.mass) / (a.mass + b.mass)) *
					(dotProduct(subVec([a.dx, a.dy], [b.dx, b.dy]), subVec([a.x, a.y], [b.x, b.y])) / 
						dotProduct(subVec([a.x, a.y], [b.x, b.y]), subVec([a.x, a.y], [b.x, b.y])));
				var coefB = ((2 * a.mass) / (a.mass + b.mass)) *
					(dotProduct(subVec([b.dx, b.dy], [a.dx, a.dy]), subVec([b.x, b.y], [a.x, a.y])) /
						dotProduct(subVec([b.x, b.y], [a.x, a.y]), subVec([b.x, b.y], [a.x, a.y])));
				var aNewX = a.dx - coefA * (a.x - b.x);
				var aNewY = a.dy - coefA * (a.y - b.y);
				var bNewX = b.dx - coefB * (b.x - a.x);
				var bNewY = b.dy - coefB * (b.y - a.y);				
				a.dx = aNewX;
				a.dy = aNewY;
				b.dx = bNewX;
				b.dy = bNewY;
				simulateVelocityFrame(balls[i]);
				simulateVelocityFrame(balls[j]);
			}
		}

		for (var j = 0; j < collidingWalls.length; j++) {
			var v = [balls[i].dx, balls[i].dy];
			var n = [collidingWalls[j].nx, collidingWalls[j].ny];
			if (isBallTouchingWall(balls[i], collidingWalls[j])) {
				var u = multVec(dotProduct(v, n) / dotProduct(n, n), n);
				var w = subVec(v, u);
				balls[i].dx = w[0] - u[0];
				balls[i].dy = w[1] - u[1];
				simulateVelocityFrame(balls[i]);
			}
		}
	}
}

function update() { 
	var now = Date.now();
	DELTA_TIME = 1000 / (now - PREV_TIME);
	updateBalls();
	PREV_TIME = now;
}

$(document).ready(function () {
	var prev;
	$(document).mousedown(function(e) {
		prev = [e.clientX, e.clientY];
	});
	$(document).mouseup(function(e) {
		var dx = e.clientX - prev[0];
		var dy = e.clientY - prev[1];
		var angle = Math.atan2(dy, dx);
		
		balls[0].dx += Math.min(normalize([dx, dy]) / 100, MAX_CUE_BALL_VEL) * Math.cos(angle);
		balls[0].dy += Math.min(normalize([dx, dy]) / 100, MAX_CUE_BALL_VEL) * Math.sin(angle);
	});
});
setInterval(update, TIME_BETWEEN_FRAMES);