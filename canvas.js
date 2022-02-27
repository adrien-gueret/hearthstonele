(function() {
	var cachedCanvas = {};
	
	function getCanvas(cardImage, cardTypeId) {
		if (cachedCanvas[cardImage.src]) {
			return cachedCanvas[cardImage.src];
		}
		
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		
		var deltaX = 0;
		var deltaY = 0;
		
		switch (cardTypeId) {
			case 3: // Hero
				canvas.width = 180;
				canvas.height = 194;
				
				deltaX = 99;
				deltaY = 61;
				
				ctx.beginPath();
				ctx.moveTo(0, 194);
				ctx.lineTo(0, 105);
				ctx.bezierCurveTo(5, -30, 175, -30, 180, 105);
				ctx.lineTo(180, 194);
			break;
			
			case 4: // Minion
				canvas.width = 192;
				canvas.height = 210;
				deltaX = 84;
				deltaY = 50;
				
				ctx.beginPath();
				ctx.ellipse(96, 130, 95, 130, 0, 0, 2 * Math.PI);
			break;
			
			case 5: // Spell
				canvas.width = 244;
				canvas.height = 169;
				deltaX = 55;
				deltaY = 87;
			
				ctx.beginPath();
				ctx.moveTo(0, 169);
				ctx.lineTo(0, 30);
				ctx.bezierCurveTo(38, 0, 206, 0, 244, 30);				
				ctx.lineTo(244, 169);
			break;
			
			case 7: // Weapon
				canvas.width = 213;
				canvas.height = 190;
				
				deltaX = 77;
				deltaY = 70;
				
				ctx.beginPath();
				ctx.ellipse(106, 106, 105, 105, 0, 0, 2 * Math.PI);
			break;
		}
		
		ctx.closePath();
				
		ctx.clip();
		ctx.drawImage(cardImage, -deltaX, -deltaY);	
		
		cachedCanvas[cardImage.src] = canvas;
		
		return canvas;
	}
	
	var Canvas = {
		blurCanvas: function (canvas, squareSize) {
			var width = canvas.width;
			var height = canvas.height;
			var ctx = canvas.getContext('2d');
			var pixels = ctx.getImageData(0, 0, width, height).data;
			
			var blurryCanvas = document.createElement('canvas');
			
			var totalPixelsOnWidth = Math.ceil(width / squareSize);
			var totalPixelsOnHeight = Math.ceil(height / squareSize);
			
			blurryCanvas.width = squareSize * totalPixelsOnWidth;
			blurryCanvas.height = squareSize * totalPixelsOnHeight;
			
			var blurryCtx = blurryCanvas.getContext('2d');
			
			for (var y = 0; y < height; y += squareSize) {
			  for (var x = 0; x < width; x += squareSize) {
				let pixelIndex = (x + (y * width)) * 4;
				let pixelIndexToUse = pixelIndex;
				
				do {
					blurryCtx.fillStyle = 'rgba(' +
						pixels[pixelIndexToUse] + ',' +
						pixels[pixelIndexToUse + 1] + ','+
						pixels[pixelIndexToUse + 2] + ',' +
						pixels[pixelIndexToUse + 3] +
					')';
					
					pixelIndexToUse++;
				} while(pixels[pixelIndexToUse + 3] === 0 && pixelIndexToUse < pixelIndex + 3);
					
				blurryCtx.fillRect(x, y, squareSize, squareSize);
			  }
			}
			
			return blurryCanvas;
		},
		extractCardIllustration: function (card) {	
			var cardArt = new Image();
			cardArt.crossOrigin = 'Anonymous';
			cardArt.src = 'https://www.mariouniversalis.fr/proxy.php?url=' + card.image;
					
			return new Promise(function (resolve) {
				if (!cardArt.complete) {
					cardArt.onload = function () {
						resolve(getCanvas(cardArt, card.cardTypeId));
					};
				} else {
					resolve(getCanvas(cardArt, card.cardTypeId));
				}
			});
		},
	};
	
	window.Canvas = Canvas;
})();