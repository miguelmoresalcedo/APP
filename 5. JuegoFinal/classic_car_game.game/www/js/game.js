var juego;
var autos = [];
var colores = [0xff0000, 0x0000ff, 0x00ff00];
var autoVelocidadGiro = 250;
var grupoAutos = [];
var grupoObstaculos = [];
var grupoObjetivos = [];
var obstaculoVelocidad = 150;
var puntaje = 0;
var puntajeTexto;
var cursores;
var txtPausa;
var txtEstilo = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
var detectarAgitacion = true;

function iniciar() {

  vigilaSensores();
  
  juego = new Phaser.Game(320,480,Phaser.AUTO,"");
  juego.state.add("Jugar", playGame);
  juego.state.start("Jugar");

  window.onkeydown = function(e) {
    if (e.key === "Enter"){
      pausarJuego();
    }
  }

}


var playGame = {

  preload: function() {
    juego.load.image("carretera", "img/carretera.png");
    juego.load.image("auto", "img/auto.png");
    juego.load.image("obstaculo", "img/auto.png");
    juego.load.image("objetivo", "img/objetivo.png");
  },

  create: function() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.add.image(0, 0, "carretera");

    for (var i = 0; i < 2; i++) {

      grupoAutos[i] = juego.add.group();
      grupoObstaculos[i] = juego.add.group();
      grupoObjetivos[i] = juego.add.group();
      
      autos[i] = juego.add.sprite(0, juego.height - 80, "auto");
      autos[i].positions = [juego.width * (i * 4 + 1) / 8, juego.width * (i * 4 + 3) / 8];
      autos[i].anchor.set(0.5);
      autos[i].tint = colores[i];
      autos[i].canMove = true;
      autos[i].side = i;
      autos[i].x = autos[i].positions[autos[i].side];
      juego.physics.enable(autos[i], Phaser.Physics.ARCADE);
      autos[i].body.allowRotation = true;
      autos[i].body.moves = false;
      grupoAutos[i].add(autos[i]);

    }

    crearObstaculo(0);
    crearObstaculo(1);

    puntajeTexto = juego.add.text(10, juego.height - 25, 'Puntaje: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    txtPausa = juego.add.text(juego.width/2, juego.height/2, "PAUSA", txtEstilo);
    txtPausa.anchor.set(0.5);
    txtPausa.visible = false;

    juego.input.onDown.add(moverAuto);

    cursores = juego.input.keyboard.createCursorKeys();
    enterKey = juego.input.keyboard.addKey(Phaser.Keyboard.ENTER);

  },

  update: function() {
    for (var i = 0; i < 2; i++) {
      juego.physics.arcade.collide(grupoAutos[i], grupoObstaculos[i], function(c, t) {
        t.destroy();
        actualizarPuntaje(-10);
        resentirse(i);
        crearObstaculo(i);
      });
      juego.physics.arcade.collide(grupoAutos[i], grupoObjetivos[i], function(c, t){
        t.destroy();
        actualizarPuntaje(+5);
        crearObstaculo(i);
      });
    }

    if (cursores.left.isDown) {
      moverAuto({position:{x:10}});
    } else if (cursores.right.isDown) {
      moverAuto({position:{x:juego.width - 10}});
    }
    
  }

}

function moverAuto(e) {

  var lado = Math.floor(e.position.x / (juego.width / 2));
  
  if (autos[lado].canMove) {

    autos[lado].canMove = false;
    var steerTween = juego.add.tween(autos[lado]).to({
      angle: 20 - 40 * autos[lado].side
    }, autoVelocidadGiro / 2, Phaser.Easing.Linear.None, true);
    steerTween.onComplete.add(function() {
      var steerTween = juego.add.tween(autos[lado]).to({
        angle: 0
      }, autoVelocidadGiro / 2, Phaser.Easing.Linear.None, true);
    })
    autos[lado].side = 1 - autos[lado].side;
    var moveTween = juego.add.tween(autos[lado]).to({
      x: autos[lado].positions[autos[lado].side],
    }, autoVelocidadGiro, Phaser.Easing.Linear.None, true);
    moveTween.onComplete.add(function() {
      autos[lado].canMove = true;
    })

  }

}

var Obstaculo = function(juego, lado) {

  this.lado = lado;
  var position = juego.rnd.between(0, 1) + 2 * lado;
  Phaser.Sprite.call(this, juego, juego.width * (position * 2 + 1) / 8, -20, "obstaculo");
  juego.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5);
  this.tint = colores[2];

};

Obstaculo.prototype = Object.create(Phaser.Sprite.prototype);
Obstaculo.prototype.constructor = Obstaculo;
Obstaculo.prototype.update = function() {
  this.body.velocity.y = obstaculoVelocidad + puntaje;
  if (this.y > juego.height) {
    this.destroy();
    actualizarPuntaje(+1);
    crearObstaculo(this.lado);
  }
};

var Objetivo = function (juego, lado) {
  this.lado = lado;
  var position = juego.rnd.between(0, 1) + 2 * lado;
  Phaser.Sprite.call(this, juego, juego.width * (position * 2 + 1) / 8, -20, "objetivo");
  juego.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5);
  this.tint = colores[Math.floor(position / 2)];
};

Objetivo.prototype = Object.create(Phaser.Sprite.prototype);
Objetivo.prototype.constructor = Objetivo;
Objetivo.prototype.update = function() {
  this.body.velocity.y = obstaculoVelocidad + puntaje;
  if (this.y > juego.height - this.height / 2){
    this.destroy();
    actualizarPuntaje(-5);
    crearObstaculo(this.lado);
  }
};

function crearObstaculo(lado){
    var aleatorio = juego.rnd.between(0,1);
    if (aleatorio === 0) {;
      var obstaculo = new Obstaculo(juego, lado);
      juego.add.existing(obstaculo);
      grupoObstaculos[lado].add(obstaculo);
    } else {
      var objetivo = new Objetivo(juego, lado);
      juego.add.existing(objetivo);
      grupoObjetivos[lado].add(objetivo);        
    }
  }

function actualizarPuntaje(n){
  puntaje += n;
  puntajeTexto.text = "Puntaje: " + puntaje;
}

function resentirse(lado){
  var steerTween = juego.add.tween(autos[lado]).to({
    angle: 20 - 40 * autos[lado].side
  }, autoVelocidadGiro / 2, Phaser.Easing.Linear.None, true);
  steerTween.onComplete.add(function() {
    var steerTween = juego.add.tween(autos[lado]).to({
      angle: lado
    }, autoVelocidadGiro / 2, Phaser.Easing.Linear.None, true);
  })
  
}

function vigilaSensores() {
  function onError(error){console.log("Error: " + error)};
  function onSuccess(datosAceleracion) {
    detectaAgitacion(datosAceleracion);
    registraDireccion(datosAceleracion);
  }
  navigator.accelerometer.watchAcceleration(onSuccess, onError, {
    frequency: 10
  });
}

function detectaAgitacion(datosAceleracion) {
  if (detectarAgitacion) {
    agitacionX = datosAceleracion.x > 12;
    agitacionY = datosAceleracion.y > 12;
    agitacionZ = datosAceleracion.z > 12;
    if (agitacionX || agitacionY || agitacionZ) {
      detectarAgitacion = false;
      setTimeout(pausarJuego, 100);
    }
  }
}

function pausarJuego() {
  juego.paused = !juego.paused;
  txtPausa.visible = !txtPausa.visible;
  setTimeout(function(){detectarAgitacion = true;}, 1000);
}

function registraDireccion(datosAceleracion) {
  velocidadX = datosAceleracion.x;
  velocidadY = datosAceleracion.y;
}

window.onload = function() {
  document.addEventListener('deviceready', function() {
    console.log("iniciar");
    iniciar();
  }, false);
}