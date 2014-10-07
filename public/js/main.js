// GAME CONSTANTS
var PUTER_FALL_SPEED = 4;

// GAME VARIABLES
var gameCanvas;
var stage, renderer;
var gameWidth, gameHeight;

// Score
var score = 0;

// Player
var touchX, touchY;
var hand_texture, hand_graphic;

var background_texture, background, background_sprite;

var mainContainer;

var puter_container;
var puter_texture;
var puter_width;
var puter_array = [];

var displacementMap;

var info_text, filter_text;

var current_filter_num = 0;

var randomOccurance;

// MAIN INITIALIZATION FUNCTION
var init = function() {
  var assetsToLoad = ["public/img/putergrey.png", "public/img/puterorange.png", "public/img/starfield_small.jpg", "public/img/ship_frame_1.png"];

  // CREATE A NEW ASSET LOADER
  loader = new PIXI.AssetLoader(assetsToLoad);
  // USE CALLBACK
  loader.onComplete = onAssetsLoaded.bind(this);
  // BEGIN LOADING THE ASSETS
  loader.load();

  function onAssetsLoaded() {
    // FETCH THE CANVAS ELEMENT
    gameCanvas = document.getElementById("myCanvas");

    // SET THE GAME WIDTH AND HEIGHT
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;

    // CREATE A NEW PIXI.JS STAGE AND SET THE AUTOMATIC RENDERER DETECTION (WEBGL OR CANVAS)
    stage = new PIXI.Stage(0x000000);
    renderer = PIXI.autoDetectRenderer(gameWidth, gameHeight, gameCanvas);

    // ------------ PREPARE THE BACKGROUND IMAGE OF THE GAME --------------
    background_texture = PIXI.Texture.fromImage("public/img/starfield_small.jpg");
    background_sprite = new PIXI.Sprite(background_texture);
    background = new PIXI.DisplayObjectContainer();
    background.x = 0;
    background_sprite.anchor.x = 0;
    background_sprite.anchor.y = 0;
    background.position.y = BG_START_Y_POSITION;
    background.addChild(background_sprite);

    // ------------ ACQUIRE THE SHIPS TEXTURES FROM PNG IMAGES AND BUILD FROM THEM A PIXI.JS MOVIECLIP --------------------
    hand_texture = [PIXI.Texture.fromImage("public/img/ship_frame_1.png")];
    hand_graphic = new PIXI.MovieClip(hand_texture);

    // var ship_texture = [PIXI.Texture.fromImage("public/img/ship_frame_1.png"), PIXI.Texture.fromImage("public/img/ship_frame_2.png"), PIXI.Texture.fromImage("public/img/ship_frame_3.png"), PIXI.Texture.fromImage("public/img/ship_frame_2.png")];
    // ship_graphic = new PIXI.MovieClip(ship_texture);

    // ship_graphic.animationSpeed = 0.5; // DEFAULT IS 1
    // ship_graphic.loop = true;
    hand_graphic.play();

    // ------------ CENTER THE HANDS' ANCHOR POINT ---------------
    hand_graphic.anchor.x = 0.5;
    hand_graphic.anchor.y = 0.5;

    hand_graphic.width = 100;
    hand_graphic.height = 100;

    // ------------ SET THE HAND IN THE DOWN-MIDDLE PART OF THE SCREEN AT THE START OF THE GAME ---------
    hand_graphic.position.x = gameWidth * 0.5;
    hand_graphic.position.y = gameHeight * 0.65;

    // ------------ ACQUIRE THE ENEMY SHIP TEXTURE -------------
    puter_texture = PIXI.Texture.fromImage("public/img/puterorange.png");
    puter_width = puter_texture.width;

    function Puter(_x, _y) {
      this.xPos = _x;
      this.yPos = _y;

      this.isSlapped = false;
      this.angle = 0;

      this.texture = puter_texture;
      this.puter_graphic = new PIXI.Sprite(this.texture);

      this.puter_graphic.position.x = this.xPos;
      this.puter_graphic.position.y = this.yPos;

      puter_container.addChild(this.puter_graphic);

      this.getX = function() {
        return this.puter_graphic.position.x;
      }

      this.getY = function() {
        return this.puter_graphic.position.y;
      }

      this.getWidth = function() {
        return this.puter_graphic.width;
      }

      this.getHeight = function() {
        return this.puter_graphic.height;
      }
    }

    Puter.prototype.fall = function(_speed) {
      if (!this.isSlapped) {
        this.puter_graphic.position.y += _speed;
        // this.puter_graphic.position.x = this.xPos + Math.sin(this.angle) * 20;
        // this.angle += 0.1;
        if (this.puter_graphic.position.y > gameHeight) {
          this.isSlapped = true;
          this.killPuter();
        }
      }
    }

    Puter.prototype.killPuter = function() {
      puter_container.removeChild(this.puter_graphic);
      var puterArrPos = puter_array.indexOf(this);
      puter_array.splice(puterArrPos, 1);
    }

    // ------------- ADD THE SPRITES TO THE GAME STAGE (WE ARE BUILDING HERE THE LAYERS OF OUR GAME) STARTING FROM THE BOTTOM TO THE TOP -------------
    mainContainer = new PIXI.DisplayObjectContainer();
    stage.addChild(mainContainer);
    mainContainer.addChild(background);
    mainContainer.addChild(hand_graphic);
    puter_container = new PIXI.DisplayObjectContainer();
    mainContainer.addChild(puter_container);

    // ********* THE MAIN GAME LOOP STARTS HERE *********
    draw(); // START UP THE DRAWING OF OUR GAME

    function draw() {
      // Update hand position.
      hand_graphic.position.x = stage.getMousePosition().x;
      hand_graphic.position.y = stage.getMousePosition().y;
      // CHECK IF THE PLAYERS SHIP DOESN'T GO OUT OF THE BORDERS OF THE SCREEN
      if (hand_graphic.position.x > gameWidth)
        hand_graphic.position.x = gameWidth;
      if (hand_graphic.position.y > gameHeight)
        hand_graphic.position.y = gameHeight;
      if (hand_graphic.position.x < 0)
        hand_graphic.position.x = 0;
      if (hand_graphic.position.y < 0) // we want the ship to move only on the lower half of the screen
        hand_graphic.position.y = 0;

      // GENERATE NEW ENEMY SHIP PSEUDO RANDOMLY IN A PSEUDO RANDOM X POSITION WITHIN THE GAMEWIDTH = window.innerWidth;
      randomOccurance = Math.round(Math.random() * 100);

      if (randomOccurance == 50) {
        var random_puter = Math.round(Math.random() * (gameWidth - puter_width)); // generate a pseudo random X starting point
        var puter = new Puter(random_puter, -100); // generate an enemy ship above the visible game area (-100)

        puter_array.push(puter);
      }
      // move all puters
      for (var i = 0; i < puter_array.length; i++) {
        puter_array[i].fall(PUTER_FALL_SPEED);
      }

      // Check collisions.
      for (var i = 0; i < puter_array.length; i++) {
        if (puter_array[i].getX() != null) x1 = puter_array[i].getX();
        if (puter_array[i].getY() != null) y1 = puter_array[i].getY();
        if (puter_array[i].getWidth() != null) w1 = puter_array[i].getWidth();
        if (puter_array[i].getHeight() != null) h1 = puter_array[i].getHeight();
        x2 = hand_graphic.position.x;
        y2 = hand_graphic.position.y;
        w2 = hand_graphic.width;
        h2 = hand_graphic.height;
        if (hitTest(x1,y1,w1,h1,x2,y2,w2,h2)) {
          if (puter_array[i] != null) puter_array[i].killPuter();
        }
      }

      renderer.render(stage); // RENDER THE Pixi.js STAGE
      requestAnimationFrame(draw); // CALL AGAIN THE draw() FUNCTION IN ORDER TO DRAW THE NEXT FRAME OF OUR GAME
    }

    mainContainer.setInteractive(true); // YOU NEED TO SET THIS TO TRUE IF YOU WANT INTERACTIVITY (tapping, clicking, etc...)



    // mainContainer.tap = function(tapData) {
    //   var localCoords = tapData.getLocalPosition(mainContainer); // RETRIEVE THE TAPPING COORDINATES FROM THE DEVICE ON THE mainContainer DisplayObject

    //   touchY = localCoords.y;

    //   if (touchY < gameHeight - bar_sprite.height) { // WE ONLY WANT TO BE ABLE TO TAP (SHOOT) ABOVE THE BAR WITH FILTERS
    //     var fired_projectile = new Projectile(ship_graphic.position.x - 5, ship_graphic.position.y - 40);
    //     projectiles_array.push(fired_projectile);
    //   }
    // }

    // *************** HELPER FUNCTIONS *****************

    // A DEGREES TO RADIAN CONVERTER FUNCTION
    function deg2rad(_deg) {
      var pi = Math.PI;
      var de_ra = (_deg) * (pi / 180);

      return de_ra;
    }

    // A FUNCTION TO CHECK OBJECT HITTEST BY SIMPLE BOUNDING BOX OVERLAPPING
    function hitTest(x1, y1, w1, h1, x2, y2, w2, h2) {
      if (x1 + w1 > x2)
        if (x1 < x2 + w2)
          if (y1 + h1 > y2)
            if (y1 < y2 + h2)
              return true;

      return false;
    }
  };
};

// WINDOW.ONLOAD IS ASSIGNING OUR MAIN INIT FUNCTION TO THE ONLOAD EVENT
window.onload = init;