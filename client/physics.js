var TIME_BETWEEN_FRAMES = 1;
var DELTA_TIME = 1000 / TIME_BETWEEN_FRAMES;
var DRAG = 0.995;
var BALL_RADIUS = 2.8575;

// 0 is White Ball
var balls = [
	ball(50, 51.5, "#FFF"),
	ball(152.5, 51.5, "rgba(255, 0, 0, 1)"), // Front (1)

	ball(158, 48, "rgba(255, 0, 0, 1)"), // Second Row
	ball(158, 55, "rgba(255, 0, 0, 1)"),  

	ball(163.5, 51.5, "rgba(255, 0, 0, 1)"), // Center (8/Black)
	ball(163.5, 44.5, "rgba(255, 0, 0, 1)"), // Surrounding Third Row
	ball(163.5, 58.5, "rgba(255, 0, 0, 1)"),  

	ball(169, 41, "rgba(255, 0, 0, 1)"),
	ball(169, 48, "rgba(255, 0, 0, 1)"), // Fourth Row
	ball(169, 55, "rgba(255, 0, 0, 1)"),  
	ball(169, 62, "rgba(255, 0, 0, 1)"),

	ball(174.5, 37.5, "rgba(255, 0, 0, 1)"), // Fifth Row
	ball(174.5, 44.5, "rgba(255, 0, 0, 1)"), 
	ball(174.5, 51.5, "rgba(255, 0, 0, 1)"), 
	ball(174.5, 58.5, "rgba(255, 0, 0, 1)"),  
	ball(174.5, 65.5, "rgba(255, 0, 0, 1)")
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
		y2: y2
	};
}
function ball(x, y, color) { 
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
		color: color
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
	var dis = b*b - 4*a*c;

	if (dis >= 0) {
		dis = Math.sqrt(dis);
		var t1 = (-b - dis) / (2*a);
		var t2 = (-b + dis) / (2*a);

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
	else if (ball.x > 200) ball.x = 200;

	if (ball.y < BALL_RADIUS) ball.y = BALL_RADIUS;
	else if (ball.y > 130 - BALL_RADIUS) ball.y = 130 - BALL_RADIUS;
}

function dotProduct(a, b) { 
	return a[0] * b[0] + a[1] * b[1];
}

function subVec(a, b) { 
	return [a[0] - b[0], a[1] - b[1]];
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
			if (isBallTouchingWall(balls[i], collidingWalls[j])) {
				var lenx = collidingWalls[j].x2 - collidingWalls[j].x1;
				var leny = collidingWalls[j].y2 - collidingWalls[j].y1;
				var angle = Math.atan2(leny, lenx);
				balls[i].dx *= -0.9;
				balls[i].dy *= -0.9;
			}
		}
	}
}

function update() { 
	updateBalls();
}

$(document).ready(function () {
	$(document).click(function () { 

		balls[0].dx += 10;
	});
});
setInterval(update, TIME_BETWEEN_FRAMES);