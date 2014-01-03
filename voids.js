//void motion based on Prof. Gleicher's Boids tutorial here: http://graphics.cs.wisc.edu/Courses/Games12/Tutorial1/Phase13/
 
window.onload = function() {
	var reqFrame =window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function( callback, element){
	    window.setTimeout(callback, 1000 / 60);
	};
				
	var theCanvas = document.getElementById("mycanvas");
	var theContext = theCanvas.getContext("2d");

	var speed = 6.0;
	var radius = 130;
	var wallPad = 150;
	var numBalls = 7;
	
	// create a prototype ball
	var aBall = {
		"x" : 100,
		"y" : 100,
		"vX" : 10,
		"vY" : 10,

		draw : function() {
		    var radial = theContext.createRadialGradient(this.x, this.y, 1, this.x, this.y, radius);
		    radial.addColorStop(0, 'rgba(0,0,0,0)');
		    radial.addColorStop(1, 'rgba(0,0,0,1)');
		    theContext.fillStyle = radial;
		    theContext.fill();
		    theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);
		    theContext.globalCompositeOperation = "destination-in";
		},
		
		// bounce at edge
		move: function() {
			this.x += this.vX;
			this.y += this.vY;
			if (this.x > theCanvas.width-wallPad) {
				if (this.vX > 0) {
					this.vX = -this.vX;
				}
			}
			if (this.y > theCanvas.height-wallPad) {
				if (this.vY > 0) {
					this.vY = -this.vY;
				}
			}
			if (this.x < wallPad) {
				if (this.vX < 0) {
					this.vX = -this.vX;
				}
			}
			if (this.y < wallPad) {
				if (this.vY < 0) {
					this.vY = -this.vY;
				}
			}
		},
		
		// normalize the velocity to the given speed
		// if your velocity is zero, make a random velocity
		norm: function () {
			var z = Math.sqrt(this.vX * this.vX + this.vY * this.vY );
			if (z<.001) {
				this.vX = (Math.random() - .5) * speed;
				this.vY = (Math.random() - .5) * speed;
				this.norm();
			} else {
				z = speed / z;
				this.vX *= z;
				this.vY *= z;
			}
		}
	};
	
	function makeBall(x,y) {
		Empty = function () {};
		Empty.prototype = aBall;
		ball = new Empty();
		ball.x = x;
		ball.y = y;
		return ball;
	}
	
	// make an array of balls
	theBalls = [];
	for (var i=0; i<numBalls; i++) {
		b = makeBall( 500+Math.random()*500, 200+Math.random()*300 );
		theBalls.push(b)
	}
	
	function drawBalls() {
		// clear the window
		theCanvas.width = theCanvas.width;
		// draw the balls
		for (var i=0; i<theBalls.length; i++) {
   			theBalls[i].draw();
   		}; 
	}
	
	// repulsion behavior
	function bounce(ballList) {	
		var rad = 2 * radius;
		for(var i=ballList.length-1; i>=0; i--) {
			var bi = ballList[i];	
			var bix = bi.x;
			var biy = bi.y;
			for(var j=i-1; j>=0; j--) {
				var bj = ballList[j];
				var bjx = bj.x;
				var bjy = bj.y;
				// get distance between
				var dx = bjx - bix;
				var dy = bjy - biy;
				var dist = Math.sqrt(dx*dx+dy*dy);
				// if touching
				if (dist < rad-80) {
               bj.vX = dx;
					bj.vY = dy;
					bi.vX = -dx;
					bi.vY = -dy;
				}
			}
		}
	}

	// Reynold's like alignment
	// each boid tries to make it's velocity to be similar to its neighbors
	// recipricol falloff in weight (allignment parameter + d
	// this assumes the velocities will be renormalized
	function align(ballList){
		var ali = 5; // alignment parameter
		var newVX = new Array(ballList.length);
		var newVY = new Array(ballList.length);
		
		// do the n^2 loop over all pairs, and sum up the contribution of each
		for(var i=ballList.length-1; i>=0; i--) {
			var bi = ballList[i];
			var bix = bi.x;
			var biy = bi.y;
			newVX[i] = 0;
			newVY[i] = 0;
			
			for(var j=ballList.length-1; j>=0; j--) {
				var bj = ballList[j];
				// compute the distance for falloff
				var dx = bj.x - bix;
				var dy = bj.y - biy;
				var d = Math.sqrt(dx*dx+dy*dy);
				// add to the weighted sum
				newVX[i] += (bj.vX / (d+ali));
				newVY[i] += (bj.vY / (d+ali));			
			}
		}
		for(var i=ballList.length-1; i>=0; i--) {
			ballList[i].vX = newVX[i];
			ballList[i].vY = newVY[i];
		}		
	}

	// move the balls
	function moveBalls() {
		align(theBalls);
		bounce(theBalls);
		for (var i=0; i<theBalls.length; i++) {
			theBalls[i].norm();
			theBalls[i].move();
		}
	}

	function drawLoop() {
		// new position
		moveBalls();
		drawBalls();
		// call us again in 20ms
		reqFrame(drawLoop);	
	}
	drawLoop();
}