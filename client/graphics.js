var canvas, context, screenWidth, screenHeight;
var PHYSICAL_SCALE = 4;

/* Can't figure out how to auto scale these by PHYSICAL SCALE */ 
var TABLE_WIDTH = PHYSICAL_SCALE * 			230;
var TABLE_HEIGHT = PHYSICAL_SCALE * 		130;
var TABLE_RADIUS = PHYSICAL_SCALE * 		5;
var TABLE_WOOD_WIDTH = PHYSICAL_SCALE * 	10;
var TABLE_CUSHION_WIDTH = PHYSICAL_SCALE * 	5;
var TABLE_HOLE_RADIUS = PHYSICAL_SCALE * 	5.3;
var TABLE_HOLE_OFFSET = TABLE_WOOD_WIDTH;
var BALL_DRAW_RADIUS = PHYSICAL_SCALE *			BALL_RADIUS;
var TABLE_CIRCLE_MARKER = PHYSICAL_SCALE * 1;

var DRAW_BARRIER = false;
var DRAW_NORMALS = false;

$(document).ready(function () {
	canvas = $("canvas")[0];
	context = canvas.getContext("2d");
	setInterval(draw, 16.6666666);
});

function createGradient(x, y, width, height, color1, color2) { 
	var grd = context.createLinearGradient(x, y, width, height);
	grd.addColorStop(0, color1);
	grd.addColorStop(1, color2);
	return grd;
}

function drawBackground() { 
	context.fillStyle = createGradient(0, 0, screenWidth, screenHeight, "#AAA", "#333");
	context.fillRect(0, 0, screenWidth, screenHeight);
}

function drawCircle(x, y, r) { 
	context.beginPath();
	context.arc(x, y, r, 0, 2 * Math.PI);
	context.fill();
	context.closePath();
}

function drawTableAndBalls() { 
	var table_x = (screenWidth - TABLE_WIDTH) / 2;
	var table_y = (screenHeight - TABLE_HEIGHT) / 2;
	var table_wood_and_cushion = TABLE_WOOD_WIDTH + TABLE_CUSHION_WIDTH;
	// Table Wood 
	context.fillStyle = createGradient(table_x, table_y, TABLE_WIDTH, TABLE_HEIGHT, "#670A0A", "#51150d");
	context.roundRect(table_x, table_y, TABLE_WIDTH, TABLE_HEIGHT, TABLE_RADIUS).fill();
	// Table Green + Cushion
	context.fillStyle = createGradient(0, 0, screenWidth, screenHeight, "#0a6c03", "#064f01");
	context.fillRect(table_x + TABLE_WOOD_WIDTH, table_y + TABLE_WOOD_WIDTH,
		TABLE_WIDTH - 2 * TABLE_WOOD_WIDTH, TABLE_HEIGHT - 2 * TABLE_WOOD_WIDTH);
	// Table Green No Cushion
	context.fillStyle = createGradient(0, 0, screenWidth, screenHeight, "#288200", "#216d00");
	context.fillRect(table_x + table_wood_and_cushion, table_y + table_wood_and_cushion,
		TABLE_WIDTH - 2 * table_wood_and_cushion, TABLE_HEIGHT - 2 * table_wood_and_cushion);
	TABLE_CUSHION_WIDTH
	// Draw Holes, Centered on Wood + Cuahion
	context.fillStyle = "#000";
	drawCircle(table_x + TABLE_HOLE_OFFSET, table_y + TABLE_HOLE_OFFSET, TABLE_HOLE_RADIUS);
	drawCircle(table_x + TABLE_WIDTH - TABLE_HOLE_OFFSET, table_y + TABLE_HEIGHT - TABLE_HOLE_OFFSET, TABLE_HOLE_RADIUS);
	drawCircle(table_x + TABLE_HOLE_OFFSET, table_y + TABLE_HEIGHT - TABLE_HOLE_OFFSET, TABLE_HOLE_RADIUS);
	drawCircle(table_x + TABLE_WIDTH - TABLE_HOLE_OFFSET, table_y + TABLE_HOLE_OFFSET, TABLE_HOLE_RADIUS);
	drawCircle(table_x + (TABLE_WIDTH / 2), table_y + TABLE_HEIGHT - TABLE_HOLE_OFFSET, TABLE_HOLE_RADIUS);
	drawCircle(table_x + (TABLE_WIDTH / 2), table_y + TABLE_HOLE_OFFSET, TABLE_HOLE_RADIUS);
	// White Line
	context.beginPath();
	context.strokeStyle = "#DDD";
	context.fillStyle = "#DDD";
	context.lineWidth = 1.5;
	context.moveTo(table_x + TABLE_CUSHION_WIDTH + TABLE_WIDTH / 4, table_y + table_wood_and_cushion);
	context.lineTo(table_x + TABLE_CUSHION_WIDTH + TABLE_WIDTH / 4, table_y + TABLE_HEIGHT - table_wood_and_cushion);
	context.stroke();
	context.strokeStyle = "#000";
	// White Dots
	drawCircle(table_x + (TABLE_WIDTH / 2), table_y + (TABLE_HEIGHT / 2), TABLE_CIRCLE_MARKER);
	drawCircle(table_x + TABLE_CUSHION_WIDTH + 3 * TABLE_WIDTH / 4, table_y + (TABLE_HEIGHT / 2), TABLE_CIRCLE_MARKER);
	for (var i = 0; i < balls.length; i++) { 
		var ball = balls[i];
		context.fillStyle = ball.color;
		drawCircle(table_x + table_wood_and_cushion + ball.x * PHYSICAL_SCALE - BALL_DRAW_RADIUS,
			table_y + table_wood_and_cushion + ball.y * PHYSICAL_SCALE - BALL_DRAW_RADIUS, BALL_DRAW_RADIUS);
	}
	// Colliding Walls
	if (DRAW_NORMALS || DRAW_BARRIER) {
		for (var i = 0; i < collidingWalls.length; i++) {
			var wall = collidingWalls[i];
			var ox = table_x + table_wood_and_cushion;
			var oy = table_y + table_wood_and_cushion;
			if (DRAW_BARRIER) {
				context.strokeStyle = "#000";
				context.beginPath();
				context.moveTo(ox + wall.x1 * PHYSICAL_SCALE, oy + wall.y1 * PHYSICAL_SCALE);
				context.lineTo(ox + wall.x2 * PHYSICAL_SCALE, oy + wall.y2 * PHYSICAL_SCALE);
				context.stroke();
			}	
			if (DRAW_NORMALS) {
				context.strokeStyle = "#FFF";
				var lineMidX = ((ox + wall.x1 * PHYSICAL_SCALE) + (ox + wall.x2 * PHYSICAL_SCALE)) / 2;
				var lineMidY = ((oy + wall.y1 * PHYSICAL_SCALE) + (oy + wall.y2 * PHYSICAL_SCALE)) / 2;
				context.beginPath();
				context.moveTo(lineMidX, lineMidY);
				context.lineTo(lineMidX + wall.nx, lineMidY + wall.ny);
				context.stroke();
			}
		}
	}	
}

function draw() { 
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	context.canvas.width = screenWidth;
	context.canvas.height = screenHeight;
	drawBackground();
	drawTableAndBalls();
}

