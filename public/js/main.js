(function() {

  // GAME VARIABLES
  var gameCanvas;
  var stage, renderer;
  var gameWidth, gameHeight;

  // Score
  var score = 0;
  var missed = 0;
  var start_time = moment();
  var timer = 0; // measured in seconds
  var frequency_of_puters = 2;

  // Text
  var score_text;
  var missed_text;
  var timer_text;

  // Player
  var hand_texture, hand_graphic;

  var background_texture, background, background_sprite;

  var mainContainer;

  var puter_container;
  var puter_texture;
  var puter_width;
  var puter_array = [];

  var power_up = {
    timeLeft: 0,
    isTrue: false
  };

  var explosion_container;
  var explosion_textures = [];
  var explosion_array = [];
  var explosion_frames = [];

  var displacementMap;

  var info_text, filter_text;

  var current_filter_num = 0;

  var randomOccurance;

  // Sound effects
  var explosion_sfx;
  var upgrade_sfx;

  // MAIN INITIALIZATION FUNCTION
  var init = function() {
    var assetsToLoad = ["public/img/putergrey.png", "public/img/puterorange.png", "public/img/wood.png", "public/img/hand.png", "public/img/explosionspritesheet.json"];

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
      background_texture = PIXI.Texture.fromImage("public/img/wood.png");
      background_sprite = new PIXI.Sprite(background_texture);
      background = new PIXI.DisplayObjectContainer();
      background.x = 0;
      background_sprite.anchor.x = 0;
      background_sprite.anchor.y = 0;
      background.position.y = 0;
      background.addChild(background_sprite);

      // ------------ ACQUIRE THE SHIPS TEXTURES FROM PNG IMAGES AND BUILD FROM THEM A PIXI.JS MOVIECLIP --------------------
      hand_texture = [PIXI.Texture.fromImage("public/img/hand.png")];
      hand_graphic = new PIXI.MovieClip(hand_texture);

      hand_graphic.play();

      // ------------ CENTER THE HANDS' ANCHOR POINT ---------------
      hand_graphic.anchor.x = 0.5;
      hand_graphic.anchor.y = 0.5;

      hand_graphic.width = 100;
      hand_graphic.height = 100;

      // ------------ SET THE HAND IN THE DOWN-MIDDLE PART OF THE SCREEN AT THE START OF THE GAME ---------
      hand_graphic.position.x = gameWidth * 0.5;
      hand_graphic.position.y = gameHeight * 0.65;

      // ------------ ACQUIRE THE PUTER TEXTURE -------------
      puter_texture = PIXI.Texture.fromImage("public/img/puterorange.png");
      puter_width = puter_texture.width;

      powerup_texture = PIXI.Texture.fromImage("public/img/putergrey.png");
      powerup_width = powerup_texture.width;

      explosion_frames = ['explosion1.png', 'explosion2.png', 'explosion3.png',
                         'explosion4.png', 'explosion5.png', 'explosion6.png',
                         'explosion7.png', 'explosion8.png', 'explosion9.png',
                         'explosion10.png', 'explosion11.png', 'explosion12.png',
                         'explosion13.png', 'explosion14.png'];
      for (var i = 0; i < explosion_frames.length; i ++) {
        explosion_textures.push(PIXI.Texture.fromImage(explosion_frames[i]));
      }

      // TEXT.
      var text_style = {
        font: '20px ariel',
        fill: 'red'
      };
      var text_y = gameHeight - 30;

      timer_text = new PIXI.Text(timer, text_style);
      missed_text = new PIXI.Text(missed, text_style);
      timer_text.position.y = text_y;
      timer_text.position.x = 30;
      missed_text.position.y = text_y;
      missed_text.position.x = 5;

      // Sound effects!
      explosion_sfx = new Audio("public/img/Explosion10.wav"); // buffers automatically when created
      upgrade_sfx = new Audio("public/img/Powerup26.wav");


      function Puter(_x, _y, isPowerUp) {
        this.isPowerUp = isPowerUp || false;
        this.xPos = _x;
        this.yPos = _y;

        this.fallSpeed = Math.floor(Math.random() * 6) + 4;

        this.isSlapped = false;

        if (isPowerUp) {
          this.texture = powerup_texture;
        } else {
          this.texture = puter_texture;
        }

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

      Puter.prototype.fall = function() {
        if (!this.isSlapped) {
          this.puter_graphic.position.y += this.fallSpeed;
          if (this.puter_graphic.position.y > gameHeight) {
            if (!this.isPowerUp) {
              missed += 1;
            }
            this.killPuter();
          }
        }
      }

      Puter.prototype.killPuter = function() {
        if (this.isSlapped && this.isPowerUp) {
          // Powerup woohoo!
          poweringUp();
          upgrade_sfx.play();
        } else if (this.isSlapped && !this.isPowerUp) {
          explosion_sfx.play();
        }
        puter_container.removeChild(this.puter_graphic);
        var puterArrPos = puter_array.indexOf(this);
        puter_array.splice(puterArrPos, 1);
      }

      function poweringUp() {
        // this lasts only 3 seconds.
        power_up.timeLeft += 5;
        power_up.isTrue = true;
        hand_graphic.width = hand_graphic.width * 2;
        hand_graphic.height = hand_graphic.height * 2;
      }

      function Explosion(_x, _y) {
        this.xPos = _x;
        this.yPos = _y;
        this.isAlive = true;
        this.texture = explosion_textures;
        this.explosion_graphic = new PIXI.MovieClip(this.texture);
        this.explosion_graphic.anchor.x = 0.5;
        this.explosion_graphic.anchor.y = 0.5;
        this.explosion_graphic.position.x = this.xPos;
        this.explosion_graphic.position.y = this.yPos;
        this.explosion_graphic.animationSpeed = 0.5; // DEFAULT IS 1
        this.explosion_graphic.loop = false;
        this.explosion_graphic.play();
        explosion_container.addChild(this.explosion_graphic);

        // >>>>>>>> a workaround using setTimeout method to destroy explosion animations <<<<<<<<<
        var explosion = this.explosion_graphic;
        var that = this;
        setTimeout(function() {
          explosion_container.removeChild(explosion);
          var explosionPos = explosion_array.indexOf(that);
          explosion_array.splice(explosionPos, 1);
        }, 500);
        this.getX = function() {
          return this.explosion_graphic.position.x;
        }
        this.getY = function() {
          return this.explosion_graphic.position.y;
        }
        this.getWidth = function() {
          return this.explosion_graphic.width;
        }
        this.getHeight = function() {
          return this.explosion_graphic.height;
        }
      }

      // ------------- ADD THE SPRITES TO THE GAME STAGE (WE ARE BUILDING HERE THE LAYERS OF OUR GAME) STARTING FROM THE BOTTOM TO THE TOP -------------
      mainContainer = new PIXI.DisplayObjectContainer();
      stage.addChild(mainContainer);
      mainContainer.addChild(background);
      mainContainer.addChild(hand_graphic);
      puter_container = new PIXI.DisplayObjectContainer();
      mainContainer.addChild(puter_container);
      explosion_container = new PIXI.DisplayObjectContainer();
      mainContainer.addChild(explosion_container);
      mainContainer.addChild(missed_text);
      mainContainer.addChild(timer_text);

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

        if (randomOccurance < frequency_of_puters) {
          var random_puter = Math.round(Math.random() * (gameWidth - puter_width)); // generate a pseudo random X starting point
          var puter = new Puter(random_puter, -100, false); // generate an enemy ship above the visible game area (-100)

          puter_array.push(puter);
        }

        var newRandom = Math.random() * 1000;
        // Generate a powerup.
        if (newRandom < 2) {
          var powerup = Math.round(Math.random() * (gameWidth - puter_width)); // generate a pseudo random X starting point
          var puter = new Puter(powerup, -100, true); // generate an enemy ship above the visible game area (-100)
          puter_array.push(puter);
        }

        // move all puters
        for (var i = 0; i < puter_array.length; i++) {
          puter_array[i].fall();
        }

        // Check collisions.
        var x2, y2, w2, h2;
        x2 = hand_graphic.position.x - hand_graphic.width/2;
        y2 = hand_graphic.position.y - hand_graphic.height/2;
        w2 = hand_graphic.width;
        h2 = hand_graphic.height;
        for (var i = 0; i < puter_array.length; i++) {
          if (puter_array[i].getX() != null) x1 = puter_array[i].getX();
          if (puter_array[i].getY() != null) y1 = puter_array[i].getY();
          if (puter_array[i].getWidth() != null) w1 = puter_array[i].getWidth();
          if (puter_array[i].getHeight() != null) h1 = puter_array[i].getHeight();
          if (hitTest(x1,y1,w1,h1,x2,y2,w2,h2)) {
            if (puter_array[i] != null) {
              puter_array[i].isSlapped = true;
              puter_array[i].killPuter();
            }
            var explosion = new Explosion(x2 + 40, y2 + 40); // add an explosion of the enemy ship to the explosions display object container
            explosion_array.push(explosion);
          }
        }

        timer = (moment() - start_time)/ 1000;
        frequency_of_puters = (0.02 * (timer * timer)) + 2;

        if (power_up.isTrue && (Math.floor(timer * 10) % 10 == 0) ) {
          power_up.timeLeft -= 1;
        }

        // reduce powerup timeLeft.
        if (power_up.timeLeft == 0) {
          hand_graphic.width = 100;
          hand_graphic.height = 100;
          power_up.isTrue = false;
        }


        timer_text.setText(timer);
        missed_text.setText(missed);


        if (missed < 10) {
          renderer.render(stage); // RENDER THE Pixi.js STAGE
          requestAnimationFrame(draw); // CALL AGAIN THE draw() FUNCTION IN ORDER TO DRAW THE NEXT FRAME OF OUR GAME
        } else {
          endGame();
        }
      }

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


  var endGame = function endGame () {
    // modal:
    // Game over. You lasted X seconds.
    // Tweet about it.
    // press button to call init();
    //
    for (var i = stage.children.length - 1; i >= 0; i--) {
      stage.removeChild(stage.children[i]);
    };
    renderer.render(stage);

    $('#myCanvas').addClass('hide');
    $('#gameover').removeClass('hide');
    $('#score').text(timer);
    $('.twitter-share-button').attr('data-text', 'I lasted ' + timer + ' seconds in Puter Slap! Check out the game at http://puterslap.herokuapp.com');

    $('#playagain').off();  // remove previous bindings.
    $('#playagain').on('click', function() {
      // another function that resets all variables.
      init();
    });
  }

  // Start game.
  init();

}());