var TIME_BETWEEN_FRAMES = 16.6666666;
var DELTA_TIME = 1000 / TIME_BETWEEN_FRAMES;
var DRAG = 0.985;
var x = 2.8575;

// 0 is White Ball
var balls = [
	ball(50, 55.5, "#FFF"),
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
	line(0, 4, 0, 96),
	line(0, 4, -10, -3),
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
	var l = length({ x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 });
	var a = length({ x: ball.x, y: ball.y }, { x: wall.x2, y: wall.y2 });
	var b = length({ x: wall.x1, y: wall.y1 }, { x: ball.x, y: ball.y });
	return b * Math.sin(Math.acos(
		(Math.pow(a, 2) - Math.pow(b, 2) - Math.pow(l, 2)) / (-2 * l * b))) <= ball.r;
}

function simulateVelocityFrame(ball) { 
	ball.x += (ball.dx * 100) / DELTA_TIME;	
	ball.y += (ball.dy * 100) / DELTA_TIME;
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
				
			}
		}
	}
}

function update() { 
	updateBalls();
}

$(document).ready(function () {
	$(document).click(function () { 

		balls[0].dx += 2;
	});
});
setInterval(update, TIME_BETWEEN_FRAMES);