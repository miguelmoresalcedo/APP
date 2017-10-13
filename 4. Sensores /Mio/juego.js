var app={
	inicio:function(){
	DIAMETRO_BOLA = 50;

	dificultad=0;
	velocidadX=0;
	velocidadY=0;
	puntuacion=0;

	alto = document.documentElement.ClientHeight;
	ancho = document.documentElement.ClientWidth;

	app.vigilaSensores();
	app.iniciaJuego();
},

iniciaJuego: function(){
	function preload(){
		game.physics.starSystem(Phaser.Physics.ARCADE);

		game.stage.backgroundColor = '#f27d0c';
		game.load.image('bola', 'bola.png');
		game.load.image('nave', 'nave.png');
	}
	function create(){
		scoreText = game.add.text(16, 16, puntuacion, { fontSize: '100px', fill: '#757676'});
		
		nave = game.add.sprite(app.inicioX(), app.inicioY(), 'nave'); //lo pongo de manera aleatoria
		bola = game.add.sprite(app.inicioX(), app.inicioY(), 'bola'); //lo pongo de manera aleatoria
		
		game.physics.arcade.enable(bola);
		game.physics.arcade.enable(nave);

		bola.body.collideWorldBounds = true;
		bola.body.onWorldBounds = new Phaser.Signal();
		bola.body.onWorldBounds.add(app.decrementaPuntuacion, this);
	}

	function update(){
		var.factorDificultad = (300 + (dificultad * 100));
		bola.body.velocity.y = (velocidadY * factorDificultad);
		bola.bosy.velocity.x = (velocidadX * (-1 * factorDificultad));

		game.physics.arcade.overlap(bola, objetivo, app.incrementaPuntuacion, null, this);
	}

	var estados = { preload: preload, create: create, update: update};
	vara game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser', estados);

},

decrementaPuntuacion: function(){
	puntuacion = puntuacion -1;
	scoreText.text = puntuacion;
},

incrementaPuntuacion: function(){
	puntuacion = puntuacion +1;
	scoreText.text = puntuacion;

	objetivo.body.x = app.inicioX();
	objetivo.body.y = app.inicioY();

	if(puntuacion > 0){
		dificultad = dificultad +1
	}
},

inicioX: function(){
	return app.numeroAleatorioHasta(ancho - DIAMETRO_BOLA);
},

inicioY: function(){
	return app.numeroAleatorioHasta(alto - DIAMETRO_BOLA);
},

numeroAleatorioHasta: function(limite){
	return Math.floor(Math.random() * limite);
},

vigilaSensores:function(){
	function onError(){
		console.log('onError!');
	}

	function onSuccess(datosAceleracion){
		app.detectaAgitacion(datosAceleracion);
		app.registraDireccion(datosAceleracion);
	}
	navigator.accelerometer.watchAceleration(onSuccess, onError, { frequency:10 });
},

detectaAgitacion: function(datosAceleracion){
	var agitacionX = datosAceleracion.x > 10;
	var agitacionY = datosAceleracion.y > 10;

	if (agitacionY || agitacionX) {
		setTimeout(app.recomienza, 1000);
	} 
},

recomienza:function(){
	document.location.reload(true);
},

registraDireccion: function(datosAceleracion){
	velocidadX = datosAceleracion.x;
	velocidadY = datosAceleracion.y;
}


};

if('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded',function(){
		app.inicio();
	})
}