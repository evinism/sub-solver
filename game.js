(function(){

/*  
    Everything is javascript, giving you ample opportunity to cheat.
    Happy Hacking,
    - Evin
*/

function stripString(str){
    return str.replace(/<[^>]*>/g,"")
              .replace(/-/g," ").replace(/\s/g, " ")
              .replace(/[^a-zA-Z\s]/g,"")
              .toLowerCase();
}

var helpText = "<p>The objective is to obtain the encoded English phrase by swapping letters in the ciphertext, from which all punctuation has been removed. Swapping two letters swaps them globally-- that is, every instance of letter 1 is replaced by letter 2 and vice versa. To swap letters, type in any two letters.</p><p><b>Example:</b> To swap T and D, type \"<b>td</b>\" and press <b>enter</b>.</p><p>If you are sure of a letter, you can lock it in by typing that letter, followed by a space. A locked letter cannot be swapped. A previously locked letter can be unlocked with the same command.</p><p><b>Example:</b> To lock in T, type in \"<b>t </b>\" and press <b>Enter</b></p><p>To bring up a list of commands, type in <b>commands</b> and press enter.</p><p>For those looking already beginning to count letter frequencies, worry not, the naive frequency analysis portion of the puzzle has been done for you. Even so, this is not meant to be an easy puzzle.</p>";

var commandText = "\
Commands:<br><br>\
<table>\
 <tr><td>[Two letters]</td><td>Swaps two letters in the current game. See <b>help</b> for an example</td></tr>\
 <tr><td>[Letter, followed by space]</td><td>Locks/unlocks a letter in the current game. See <b>help</b> for an example</td></tr>\
 <tr><td><b>random</b></td><td>Begins a random game from the list of unsolved games</td></tr>\
 <tr><td><b>load [id]</b></td><td>Begins a game with the specified id.</td></tr>\
 <tr><td><b>clear</b></td><td>Clears the screen</td></tr>\
 <tr><td><b>reset</b></td><td>Returns the current game to the initial state(where the game was when it began)</td></tr>\
 <tr><td><b>expunge</b></td><td>Deletes your current saved game</td></tr>\
 <tr><td><b>help</b></td><td>Displays the help text</td></tr>\
 <tr><td><b>commands</b></td><td>Displays the command list</td></tr>\
</table>\
";


function orderStringByFreq(str){
    var order = "etaoinshrdlcumwfgypbvkjxqz";
    var replacement_list = [];
    var replacement_map = {};
    replacement_map[" "] = " ";
    for(var i=0; i<order.length; i++){
        var c = order[i];
        var re = new RegExp(c,"g");
        var matches = str.match(re);
        if( matches )
            num = matches.length;
        else
            num = 0;
        //console.log(num);
        replacement_list.push( {count:num, letter:c} );     
    }
    //replacement_list = shuffle(replacement_list);
    replacement_list.sort(function(a,b){return (a.count-b.count)});
    replacement_list.reverse();
    for(var i=0; i<replacement_list.length; i++){
        replacement_map[replacement_list[i].letter] = order[i]; 
    }
    var retlist = [];
    for(var i=0; i<str.length; i++){
        retlist.push(replacement_map[str[i]]);
    }
    return retlist.join("");
}

//From stackoverflow
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


Game = function(){
    $('#input_dialog').keypress(this.onKeypress(this));
    //initial game values:
    this.ciphertext = "";
    this.lockedLetters = [];
    this.inputStack = [];
    this.stackPos = -1;
    this.started = false;
    //Load the saved progress.
    this.retrieveState();
    this.updateCounter();

    //Extract unsolved games
    this.session_plaintext_list = [];
    for (var i=0; i<plaintext_list.length; i++){
        var elem = plaintext_list[i]
        var gameId = elem.id;
        if ($.inArray(gameId, this.solvedIdList) < 0){
            this.session_plaintext_list.push(elem);
        }
    }
    this.session_plaintext_list = shuffle(this.session_plaintext_list);

    this.displayCipherText();
}


//Save your progress to cookies--
Game.prototype.retrieveState = function(){
    var cookieVal = $.cookie("solvedIdList");
    if (!cookieVal){
        this.solvedIdList = [];
    }else{
        this.solvedIdList = cookieVal.split(",");
    }
}

Game.prototype.saveState = function(){
    var cookieVal = this.solvedIdList.join(",");
    $.cookie("solvedIdList", cookieVal, { expires : 60 });
}

Game.prototype.onKeypress = function(game){
    return function(e){
        if (e.keyCode == 13) {
            game.stackPos = -1;//-1 means a new input.
            game.inputStack.push(this.value);
            game.parse_input(this.value.toLowerCase());
            this.value = "";
        }
        if (e.keyCode == 38){
            if (game.inputStack.length>game.stackPos+1){
                game.stackPos++;
                this.value = game.inputStack[game.inputStack.length - game.stackPos - 1];
            }
        }
        if (e.keyCode == 40){
            if (game.stackPos>0){
                game.stackPos--;
                this.value = game.inputStack[game.inputStack.length - game.stackPos - 1];
            }
        }
    };
}

Game.prototype.swapLetters = function(first, second){
    this.ciphertext = this.ciphertext.split("").map(function(letter){
        if ( letter==first ){ return second; }
        if ( letter==second ){ return first; }
        return letter;
    }).join("");
}

Game.prototype.toggleLockByList = function(list){
    // Err towards locking rather than unlocking the list.
    // ie, if some letters are locked and some are unlocked, lock them all.

    //Lock all elements and keep track (needs refactoring)
    var lockedElemsExist = false;
    var unlockedElemsExist = false;
    for (var i in list){
        var elem = list[i];
        if (!this.isLocked(elem)){
            unlockedElementsExist = true;
            this.toggleLock(elem);
        }else{
            lockedElemsExist = true;
        }
    }
    if (lockedElemsExist && !unlockedElemsExist){
        for (var i in list){
            var elem = list[i];
            this.toggleLock(elem);
        }
    }
}

Game.prototype.toggleLock = function(letter){
    var index = $.inArray(letter, this.lockedLetters);
    if (index > -1){
        this.lockedLetters.splice(index, 1);
    }else{
        this.lockedLetters.push(letter);
    }
}

Game.prototype.isLocked = function(letter) {
    return $.inArray(letter, this.lockedLetters) > -1;
};

Game.prototype.parse_input = function(input){
    //For standard inputs.
    if (input=="random"){
        this.startNewGame();
    }else if(input.match(/load.*/)){
        var id = input.split(" ").slice(1).join(" ");
        if(id.length<1){
            this.append("Usage: <b>load [id]</b>");
        }else{
            this.loadGame(id);
        }
    }else if (input=="clear"){
        this.displayCipherText();
    }else if (input=="reset"){
        this.resetGame();
    }else if (input=="expunge"){
        this.solvedIdList = [];
        this.updateCounter();
        this.saveState();
        this.append("Savegame deleted");
    }else if (input=="help"){
        this.append(helpText);
    }else if (input=="commands"){
        this.append(commandText);
    //For standard swaps:
    }else if (input.match(/^[a-zA-Z]{2}$/)){
        if (this.isLocked(input[0]) || this.isLocked(input[1])){
            this.displayCipherText();
            this.append("Can't swap; one or more of the letters is locked.");
        }else{
            this.swapLetters(input[0], input[1]);
            if (this.ciphertext == this.strippedItem){
                this.triggerWin();
            }else{
                this.displayCipherText();
            }
        }
    //For locking letters
    }else if (input.match(/^\w $/)){
        //var list = input.split("");
        //list.pop();//remove the whitespace
        //this.toggleLockByList(list);
        this.toggleLock(input[0]);
        this.displayCipherText();
    }else{
        this.displayCipherText();
        this.append("<b>Invalid Input</b>: "+input);
    }
}

Game.prototype.displayCipherText = function(){
    if(!this.started){
        this.display("Type in <b>help</b> for a brief introduction, or <b>random</b> to begin<hr>");
        return;
    }

    baseStr = []
    baseStr.push("<span id=\"ctext\">");
    for (var i=0; i<this.ciphertext.length; i++){
        if (this.isLocked(this.ciphertext[i])){
            baseStr.push("<span class=\"hlight\">"+this.ciphertext[i]+"</span>");
        }else{
            baseStr.push(this.ciphertext[i]);
        }
    }
    baseStr.push("</span>");
    baseStr.push("<hr>");
    this.display(baseStr.join(""));
}


Game.prototype.display = function(output){
    $("#response").html(output);
}

Game.prototype.append = function(output){
    $("#response").append(output+"<br>");
}

Game.prototype.updateCounter = function(){
    $("#counter").html(this.solvedIdList.length+"/"+plaintext_list.length+" solved");
}

Game.prototype.clear = function(){
    this.display("cleared");
}

Game.prototype.resetGame = function(){
    if (this.started){
        this.ciphertext = this.orig;
        this.lockedLetters = []
        this.displayCipherText();
    }
}

Game.prototype.loadGame = function(id){
    this.started = true;
    curText = plaintext_list.filter(function(i){return i.id == id});
    if(curText.length<1){
        this.append("Game with id "+id+" couldn't be found.");
        return;
    }
    this.currentItem = curText[0];
    this.lockedLetters = [];
    this.strippedItem = stripString(this.currentItem.plaintext);
    this.orig = orderStringByFreq(this.strippedItem);
    this.ciphertext = this.orig;
    this.cur_spacing = -1;
    this.displayCipherText();
}

Game.prototype.startNewGame = function(){
    this.started = true;
    this.currentItem = this.session_plaintext_list.pop();
    if(!this.currentItem){
        if (this.solvedIdList.length == plaintext_list.length){
            this.display("Congratulations! All games solved. Type in the command <b>expunge</b> to destroy your saved game.<hr>");
        }else{
            this.display("No more games remain. Refresh the page to start from the beginning, or type in the command <b>expunge</b> to destroy your saved game.<hr>");
        }
        return;
    }
    this.lockedLetters = [];
    this.strippedItem = stripString(this.currentItem.plaintext);
    this.orig = orderStringByFreq(this.strippedItem);
    this.ciphertext = this.orig;
    this.cur_spacing = -1;
    this.displayCipherText();
}

Game.prototype.triggerWin = function(){
    this.lockedLetters = [];
    if ($.inArray(this.currentItem.id, this.solvedIdList) < 0){
        this.solvedIdList.push(this.currentItem.id);
    }
    this.saveState();
    this.updateCounter();
    this.displayCipherText();
    this.max_spacing = 0;
    this.cur_spacing = -1;
    var newText = this.currentItem.plaintext;
    var g = this;
    $('#ctext').animate({'opacity': 0}, 1000, function () {
            $(this).html(newText);
    }).animate({'opacity': 1}, 1000, function () {
        g.append("<div style=\"width: 100%;text-align: right;\"><b> - "+g.currentItem.author+"</b><br>"+g.currentItem.origin+"</div>Type in <b>Random</b> for another game.");
        g.started = false;
        
    });
}


$(document).ready(function(){
    window.game = new Game();
    console.log("loaded");
});

})();
