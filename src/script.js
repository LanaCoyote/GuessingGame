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
    getOutputElement().html( "You won in " + getCurrentGame().getNumberOfGuesses() + " shots!" );
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
}

$( document ).ready( function() {
    startNewGame();

    // add our jquery event handlers
    getGuessButton().click( guessValue );
    getHintButton().click( getHint );
    getResetButton().click( startNewGame );
} );
