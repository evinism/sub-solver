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
    this.display("Type in <b>random</b> to begin");
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
    //For standard swaps:
    }else if (input.length==2 && input.match(/\w\w/)){
        if (this.started){
            //console.log(input);
            re = new RegExp("["+input+"]","g");
            if(this.lockedLetters.join("").search(re)>=0){
                this.displayCipherText();
                this.append("Can't swap; One or more of the letters is locked");
            }else{
                this.ciphertext = this.ciphertext.replace(re, function(x){if(x==input[0]) return input[1]; return input[0];});
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
    baseStr = []
    for (var i=0; i<this.ciphertext.length; i++){
        if ((this.lockedLetters.join("").search(this.ciphertext[i])>= 0)){
            baseStr.push("<span class=\"hlight\">"+this.ciphertext[i]+"</span>");
        }else{
            baseStr.push(this.ciphertext[i]);
        }
    }
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

Game.prototype.startNewGame = function(){
    this.started = true;
    this.orig = "trefekesnornhteseotisaloeuittremeetnhgwpcegsiooeoticedassawasiteuiontyiowptreotitlettenoedraeunhtreolwoexlehtdasseobahuehdeaftraoeyraittehueuictralgrodihtmehtnahaddlsonhtrefasmicblwcnditnahoaftreoadnetpdiltnahnotrefnsotdiseaftraoeiddlotameutafideaddionahicdriscitihspihunmbaotlsecegsiooefasoametnmecehttrenmigetabsafeooasyewwwltittrecittesoueitrntyiosetlsheutarnmihuseminhonhrnobaooeoonahyresenkneyeunthatcahgigantnotslcpitessnwcetrnhgihulhmnotiviwcpivnhtatreuseimodlcbtlseafpalhgyncdaj"
    this.ciphertext = this.orig;
    this.displayCipherText();
}

$(document).ready(function(){
    game = new Game();
    console.log("loaded");
});
