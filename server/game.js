class Ball {
	constructor(x, y, color, value) {
		this.x = x;
		this.y = y;
		// Rates are in m/s
		// Mass in kg
		this.dx = 0;
		this.dy = 0;
		this.r = BALL_RADIUS;
		this.mass = 0.160;
		this.color = color;
		this.value = value;
	}
};

module.exports = {
	balls: [
		new Ball(50, 51.5, "#FFF", 0),
		new Ball(152.5, 51.5, COLOR_YELLOW, 1), // Front (1)

		new Ball(158, 55, COLOR_RED, 3), // Second Row
		new Ball(158, 48, COLOR_RED, 11),  

		new Ball(163.5, 51.5, COLOR_BLACK, 8), // Center (8/Black)
		new Ball(163.5, 44.5, COLOR_GREEN, 6), // Surrounding Third Row
		new Ball(163.5, 58.5, COLOR_GREEN, 14),  

		new Ball(169, 41, COLOR_YELLOW, 9),
		new Ball(169, 48, COLOR_PURPLE, 4), // Fourth Row
		new Ball(169, 55, COLOR_MAROON, 15),  
		new Ball(169, 62, COLOR_ORANGE, 13),

		new Ball(174.5, 37.5, COLOR_PURPLE, 12), // Fifth Row Corner 1

		new Ball(174.5, 44.5, COLOR_ORANGE, 5), 
		new Ball(174.5, 51.5, COLOR_BLUE, 10), 
		new Ball(174.5, 58.5, COLOR_BLUE, 2),  

		new Ball(174.5, 65.5, COLOR_MAROON, 7) // Fifth Row Corner 2
	],
	currentTurn: undefined
};
