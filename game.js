function stripString(str){
    return str.replace(/[^a-zA-Z\s]/g,"").toLowerCase();
}


//---DON'T LOOK AT THISSs----------------------
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


function Game(){
    $('#input_dialog').keypress(function(game){ 
        return function(e){
            if (e.keyCode == 13) {
                game.stackPos = -1;//-1 means a new input.
                game.inputStack.push(this.value);
                game.parse_input(this.value);
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
        }
    }(this));
    this.lockedLetters = [];
    this.inputStack = [];
    this.stackPos = -1;
    this.started = false;
    plaintext_list = shuffle(plaintext_list);
    this.display("Type in <b>random</b> to begin, or <b>help</b> for a brief introduction<hr>");
}

Game.prototype.parse_input = function(input){
    //For standard inputs.
    if (input=="random"){
        this.startNewGame();
        return;
    }else if (input=="clear"){
        this.clear();
        return;
    }else if (input=="reset"){
        if (this.started){
            this.ciphertext = this.orig;
            this.lockedLetters = []
            this.displayCipherText();
        }
    }else if (input=="help"){
        this.append("<p>The objective is to obtain the encoded English phrase by swapping letters in the ciphertext, from which all punctuation and whitespace has been removed. To swap letters, type in two consecutive letters.</p><p><b>Example:</b> To swap T and D, type \"<b>tb</b>\" and press <b>enter</b>.</p><p>If you are sure of a letter, you can lock it in by typing a letter, followed by a space.</p><p><b>Example:</b> To lock in T, type in \"<b>t </b>\" and press <b>Enter</b></p>")
    //For standard swaps:
    }else if (input.length==2 && input.match(/\w\w/)){
        if (this.started){
            //console.log(input);
            var re = new RegExp("["+input+"]","g");
            if(this.lockedLetters.join("").search(re)>=0){
                this.displayCipherText();
                this.append("Can't swap; One or more of the letters is locked");
            }else{
                this.ciphertext = this.ciphertext.replace(re, function(x){if(x==input[0]) return input[1]; return input[0];});
                if(this.ciphertext == this.strippedItem)
                    this.triggerWin();
                this.displayCipherText();
            }         

        }
    //For locking letters
    }else if (input.length==2 && input.match(/\w\s/)){
        console.log("Locking letters");
        var toLock = input[0];
        pos = this.lockedLetters.join("").search(toLock);
        if( pos>=0 ){
            this.lockedLetters.splice(pos,"1");
        }else{
            this.lockedLetters.push(toLock);
        }
        this.displayCipherText();
    }else{
        this.displayCipherText();
        this.append("<b>Invalid Input</b>: "+input);
    }
}

Game.prototype.displayCipherText = function(){
    if(!this.started){
        this.display("Type in <b>random</b> to begin<br>");
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
    $("#ctext").css("word-spacing", this.cur_spacing + "ch");
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
    //alert("win!");
    this.spacing_timer = setInterval(function(g){
        return function(){
            if(g.max_spacing>g.cur_spacing){
                g.cur_spacing+=0.05;
                g.displayCipherText();
            }else{
                g.cur_spacing = g.max_spacing;
                clearInterval(g.spacing_timer);
                g.ciphertext = g.currentItem.plaintext;
                g.displayCipherText();
                g.append("<div style=\"width: 100%;text-align: right;\"><b> - "+g.currentItem.author+"</b><br>"+g.currentItem.origin+"</div>");
            }
        }
    }(this), 25);
}


$(document).ready(function(){
    game = new Game();
    console.log("loaded");
});


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
