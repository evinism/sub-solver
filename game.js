(function(){

/*  For those of you looking at my javascript trying to see how this works:
    This was made VERY QUICKLY with very little foresight or planning
    It is uniformly terrible code. Proceed at your own risk.
    
    Happy Hacking,
    - Evin
*/


function stripString(str){
    return str.replace(/[^a-zA-Z]\s/g,"").toLowerCase();
}

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
    this.ciphertext = "";
    this.lockedLetters = [];
    this.inputStack = [];
    this.stackPos = -1;
    this.started = false;
    plaintext_list = shuffle(plaintext_list);
    this.displayCipherText();
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
    }else if (input=="clear"){
        this.clear();
    }else if (input=="reset"){
        this.resetGame();
    }else if (input=="help"){
        this.append("<p>The objective is to obtain the encoded English phrase by swapping letters in the ciphertext, from which all punctuation has been removed. To swap letters, type in any two letters.</p><p><b>Example:</b> To swap T and D, type \"<b>tb</b>\" and press <b>enter</b>.</p><p>If you are sure of a letter, you can lock it in by typing a letter, followed by a space.</p><p><b>Example:</b> To lock in T, type in \"<b>t </b>\" and press <b>Enter</b></p><p>For those looking already beginning to count letter frequencies, worry not, the naive frequency analysis portion of the puzzle has been done for you. Even so, this is not meant to be an easy puzzle.</p>")
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
        this.toggleLock(input[0]);
        this.displayCipherText();
    }else{
        this.displayCipherText();
        this.append("<b>Invalid Input</b>: "+input);
    }
}

Game.prototype.displayCipherText = function(){
    if(!this.started){
        this.display("Type in <b>random</b> to begin, or <b>help</b> for a brief introduction<hr>");
        return;
    }

    baseStr = []
    baseStr.push("<span id=\"ctext\">");
    for (var i=0; i<this.ciphertext.length; i++){
        if (this.lockedLetters !=[] && (this.lockedLetters.join("").search(this.ciphertext[i])>= 0)){
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

Game.prototype.startNewGame = function(){
    this.started = true;
    this.currentItem = plaintext_list.pop();
    if(!this.currentItem){
        this.display("No more games remain. Refresh to start from the beginning.<hr>");
        return;
    }
    this.strippedItem = stripString(this.currentItem.plaintext);
    this.orig = orderStringByFreq(this.strippedItem);
    this.ciphertext = this.orig;
    this.cur_spacing = -1;
    this.displayCipherText();
}

Game.prototype.triggerWin = function(){
    this.lockedLetters = [];
    this.displayCipherText();
    this.max_spacing = 0;
    this.cur_spacing = -1;
    var newText = this.currentItem.plaintext;
    var g = this;
    $('#ctext').animate({'opacity': 0}, 1000, function () {
            $(this).text(newText);
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
