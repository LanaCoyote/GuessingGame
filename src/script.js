// definitions of a GuessingGame object
var NUMBER_OF_LIVES = 10;

function GuessingGame( max, on_output, on_win, on_lose ) {
    this.value          = this.generateRandomValue( max );
    this.guesses        = [];

    this.onOutput       = on_output;
    this.onWin          = on_win;
    this.onLose         = on_lose;
}

GuessingGame.prototype.generateRandomValue = function( max ) {
    return Math.ceil( Math.random() * max );
}

GuessingGame.prototype.getValue = function() {
    return this.value;
}

GuessingGame.prototype.hasGuessesLeft = function() {
    return Boolean( this.shotsLeft() );
}

GuessingGame.prototype.hasBeenGuessed = function( n ) {
    if ( this.guesses.indexOf( n ) != -1 ) { // is n in the array?
        return true;
    }

    return false;
}

GuessingGame.prototype.getLastGuess = function() {
    if ( this.guesses.length == 0 ) { 
        // return -1 if this is the first guess
        return -1;
    }

    return this.guesses[this.guesses.length - 1];
}

GuessingGame.prototype.getNumberOfGuesses = function() {
    return this.guesses.length;
}

GuessingGame.prototype.shotsLeft = function() {
    return NUMBER_OF_LIVES - this.getNumberOfGuesses();
}

GuessingGame.prototype.validateGuess = function( n ) {
    if ( !Boolean( n ) ) {  // Numbers convert to true as booleans
        return "Please guess a number between 1 and 100";
    } else if ( n < 1 || n > 100 ) { // check if we're outside the range
        return "Please guess a number between 1 and 100";
    } else if ( this.hasBeenGuessed( n ) ) { // only unique guesses
        return "You already guessed that number!";
    }

    return undefined;
}

GuessingGame.prototype.warmOrCold = function( guess ) {
    var last_guess = this.getLastGuess();
    if ( last_guess == -1 ) {
        // give a generic response if we haven't guessed anything yet
        return "Drat! You missed!";
    }

    // compute the difference in distances
    var old_distance = Math.abs( this.getValue() - last_guess );
    var new_distance = Math.abs( this.getValue() - guess );

    var change = old_distance - new_distance;

    // figure out if we're warmer or colder
    if ( change > 0 ) {
        return "Getting warmer!";
    } else if ( change < 0 ) {
        return "Getting colder...";
    } else {
        return "Just as far as before!";
    }
}

GuessingGame.prototype.guessValue = function( guess ) {
    // check that we have enough guesses left
    if ( !this.hasGuessesLeft() ) {
        // we're out of guesses!
        return;
    }

    // validate our guess value
    guess = Number( guess );
    var err = this.validateGuess( guess );
    if ( err ) {
        this.onOutput( err );
        return;
    }

    // check how close we were
    if ( guess == this.getValue() ) {
        // right on the money!
        this.onWin();
        return;
    } 
    
    // we're off, but by how far?
    var output = this.warmOrCold( guess ) + "<br>You have " + ( this.shotsLeft() - 1 ) + " shots remaining";
    this.onOutput( output );
    
    // push our guess to the previous guess array
    this.guesses.push( guess );

    if ( !this.hasGuessesLeft() ) {
        this.onLose();
    }
}

// sprite object definition
function Sprite ( element ) {
    this.element = element;
}

Sprite.prototype.setPosition = function( x, y ) {
    this.element.offset( { left:x, top:y } );
}

Sprite.prototype.getPosition = function() {
    return this.element.offset();
}

Sprite.prototype.setX = function( x ) {
    this.setPosition( x, this.getY() );
}

Sprite.prototype.getX = function() {
    return this.getPosition().left;
}

Sprite.prototype.setY = function( y ) {
    this.setPosition( this.getX(), y );
}

Sprite.prototype.getY = function() {
  return this.getPosition().top;
}

Sprite.prototype.setSrc = function( src ) {
    this.attr( "src", src );
}

// golfball object defs
function Golfball ( element ) {
    this.element = element;
    this.sprite = new Sprite( element );
    this.anim_time = 0;
    this.dest_x = 0;
    this.init_pos = this.sprite.getPosition();
}

Golfball.prototype.resetAnimation = function( dest_x ) {
    if ( dest_x != undefined ) this.dest_x = dest_x;
    this.sprite.setPosition( this.init_pos.left, this.init_pos.top );
    this.anim_time = 0;
}

Golfball.prototype.computeYAt = function( point ) {
    point = (point * 2) - 1; // since we're using a parabola here, we shift the point
    return getDave().getY() - this.element.height() + ( point * point ) * getDave().element.height();
}

Golfball.prototype.advanceAnim = function( dt ) {
    this.anim_time += dt;
    this.sprite.setPosition( this.init_pos.left + this.dest_x * this.anim_time, this.computeYAt( this.anim_time ) );
}

Golfball.prototype.parabolaAnimation = function( dest_x ) {
    this.resetAnimation( dest_x );
    
    var anim_ball = this;
    var anim_timer = setInterval( function() {
        anim_ball.advanceAnim( 0.01 );
        if ( anim_ball.anim_time >= 1 ) {
          clearInterval( anim_timer );
        }
    }, 10 );
}

// website logic
var current_game;

function getCurrentGame() {
    return current_game;
}

function getInputElement() {
    return $( "#guess_input" );
}

function clearInput() {
    getInputElement().val('');
}

function getGuessButton() {
    return $( "#guess_button" );
}

function getHintButton() {
    return $( "#hint_button" );
}

function getResetButton() {
    return $( "#reset_button" );
}

function getOutputElement() {
    return $( "#output" );
}

function getInstructions() {
    return $( "#instructions" );
}

var sprite_flag;
function getFlag() {
    return sprite_flag;
}

var sprite_dave;
function getDave() {
    return sprite_dave;
}

var sprite_ball;
function getBall() {
    return sprite_ball;
}

function toPlayAreaX( x ) {
    return getDave().getX() + 130 + ( x * 6 );
}

function clearOutput() {
    getOutputElement().html( '' );
}

function onOutput( output ) {
    getOutputElement().html( output );
}

function hideButtonsPostGame() {
    getInputElement().hide();
    getGuessButton().hide();
    getHintButton().hide();
    getInstructions().hide();

    getResetButton().val( "Start new game" );
}

function showButtonsPreGame() {
    getInputElement().show();
    getGuessButton().show();
    getHintButton().show();
    getInstructions().show();

    getResetButton().val( "Reset" );
    clearOutput();
    clearInput();
}

function onWin() {
    getOutputElement().html( "You won in " + ( getCurrentGame().getNumberOfGuesses() + 1 ) + " shots!" );
    hideButtonsPostGame();
}

function onLose() {
    getOutputElement().html( "You're out of shots!<br>You should have guessed " + getCurrentGame().getValue() );
    hideButtonsPostGame();
}

function guessValue() {
    // hide the instructions after the first guess
    getInstructions().hide();

    // do the guesswork (ha)
    var guess = getInputElement().val();
    getCurrentGame().guessValue( guess );
    clearInput();

    // do our cool golfball animation
    getBall().parabolaAnimation( guess * 6 );
}

function getHint() {
    getOutputElement().html( "Giving up already?<br>You should have guessed " + getCurrentGame().getValue() );
    hideButtonsPostGame();
}

function startNewGame() {
    // make sure all our inputs are showing and cleared
    showButtonsPreGame();

    current_game = new GuessingGame(
            100,            // maximum value to guess
            onOutput,       // onOutput function
            onWin,          // onWin function
            onLose          // onLose function
    )

    getFlag().setX( toPlayAreaX( getCurrentGame().getValue() ) - 8 );
    getBall().resetAnimation();
}

$( document ).ready( function() {
    // add our jquery event handlers
    getGuessButton().click( guessValue );
    getHintButton().click( getHint );
    getResetButton().click( startNewGame );

    // initialize our sprites
    sprite_dave = new Sprite( $( "#sprite_dave" ) );
    sprite_flag = new Sprite( $( "#sprite_flag" ) );
    sprite_ball = new Golfball( $( "#sprite_ball" ) );

    // start the game!
    startNewGame();
} );
