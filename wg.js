/* - - - G L O B A L S - - - */
window.M_COLOR="#5364a2";
window.M_BODY_POINTS="19.098,100 50,73.484 80.902,100 69.463,56.493 100,29.374 62.029,29 37.971,29 0,29.374 30.537,56.493";
window.M_HAIR_POINTS="29,11.803 71,11.803 59.185,3.278 40.815,3.278";
window.F_COLOR="#b14e87";
window.F_BODY_POINTS="19.098,100 50,100 80.902,100 69.463,56.493 100,49.374 62.029,29 37.971,29 0,49.374 30.537,56.493";
window.F_HAIR_POINTS="27,21.803 73,21.803 59.185,3.278 40.815,3.278";
window.GAME_MAX_X = 500;
window.GAME_MAX_Y = 500;

window.entityCounter = 0;

/* - - - C L A S S E S - - - */
/* - entities - */
function Entity() {}
Entity.prototype.init = function(xPos, yPos, alive) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.alive = alive;
    this.width = 0;
    this.height = 0;
    this.id = 'e_' + window.entityCounter;
    window.entityCounter += 1;
    }
Entity.prototype.setHitbox = function(width, height) {
    this.width = width;
    this.height = height;
    }
Entity.prototype.isAlive = function() {
    return this.alive;
    }
Entity.prototype.spawn = function() {
    game.entities.push(this);
    game.gameField.node.appendChild(this.node);
    this.node.style.position = 'absolute';
    console.log('spawned entity #' + this.id);
    }
Entity.prototype.deSpawn = function() {
    game.gameField.node.removeChild(this.node);
    game.entities.splice(game.entities.indexOf(this), 1);
    console.log('despawned entity #' + this.id);
    }
Entity.prototype.tick = function() {
    // stay in level bounds
    var nextX = this.xPos + this.xSpeed;
    if (nextX>=0 && nextX+this.width<=window.GAME_MAX_X) {
        this.setXPos(nextX);
        }
    else {
        if (nextX<0) {
            this.setXPos(0);
            }
        if (nextX+this.width>window.GAME_MAX_X) {
            this.setXPos(window.GAME_MAX_X-this.width);
            }
        }
    var nextY = this.yPos + this.ySpeed;
    if (nextY>=0 && nextY+this.height<=window.GAME_MAX_Y) {
        this.setYPos(nextY);
        }
    else {
        if (nextY<0) {
            this.setYPos(0);
            }
        if (nextY+this.height>window.GAME_MAX_Y) {
            this.setYPos(window.GAME_MAX_Y-this.height);
            }
        }
    }
Entity.prototype.setXPos = function(x) {
    this.xPos = x;
    this.node.style.left = (this.xPos + 25) +'px';
    }
Entity.prototype.setYPos = function(y) {
    this.yPos = y;
    this.node.style.top = (this.yPos + 25) + 'px';
    }
Entity.prototype.accX = function(d) {
    this.xSpeed = this.xSpeed+d;
    }
Entity.prototype.accY = function(d) {
    this.ySpeed = this.ySpeed+d;
    }
Entity.prototype.decel = function() {
    this.xSpeed = this.xSpeed+(this.xSpeed==0 ? 0 : (this.xSpeed>0 ? -1 : 1));
    this.ySpeed = this.ySpeed+(this.ySpeed==0 ? 0 : (this.ySpeed>0 ? -1 : 1));
    }
Entity.prototype.decelXPos = function() {
    this.xSpeed = this.xSpeed - (this.xSpeed==0 ? 0 : 1);
    }
Entity.prototype.decelXNeg = function() {
    this.xSpeed = this.xSpeed + (this.xSpeed==0 ? 0 : 1);
    }
Entity.prototype.decelYPos = function() {
    this.ySpeed = this.ySpeed - (this.ySpeed==0 ? 0 : 1);
    }
Entity.prototype.decelYNeg = function() {
    this.ySpeed = this.ySpeed + (this.ySpeed==0 ? 0 : 1);
    }
Entity.prototype.collidesWith = function(e) {
    var sLeft = this.xPos;
    var sRight = this.xPos + this.width;
    var sTop = this.yPos;
    var sBottom = this.yPos + this.height;
    var eLeft = e.xPos;
    var eRight = e.xPos + e.width;
    var eTop = e.yPos;
    var eBottom = e.yPos + e.height;
    return ((sRight>=eLeft) && (sLeft<=eRight) && (sBottom>=eTop) && (sTop<=eBottom));
    }

Player.prototype = new Entity();
Player.prototype.constructor = Player;
function Player(xPos, yPos) {
    this.init(xPos, yPos, 1);
    this.node = this.createNode();
    this.maxSpeed = 8;
    this.setHitbox(35, 34);
    this.lastMorph = 0;
    this.makeMorphCooldown = 3000;
    }
Player.prototype.createNode = function() {
    img = document.createElement('img');
    img.setAttribute('id', this.id);
    img.setAttribute('src', 'img/player.png');
    img.setAttribute('style', 'display:block; width:35px; height:34px; z-index: 9999');
    return img;
    }
Player.prototype.walkX = function(d) {
    if(Math.abs(this.xSpeed)<this.maxSpeed) {
        this.accX(d);
        }
    }
Player.prototype.walkY = function(d) {
    if(Math.abs(this.ySpeed)<this.maxSpeed) {
        this.accY(d);
        }
    }
Player.prototype.makeMorph = function() {
    if (Date.now() - this.lastMorph < this.makeMorphCooldown) {
        return;
        }
    for (var i=0; i<game.entities.length; i++) {
        var e = game.entities[i];
        if (e instanceof NPC && this.collidesWith(e) && e.shape == 0) {
            observer = e.findNearestOther(1)
            dist = e.distTo(observer);
            if (dist <= 12) {
                observer.bust(e);
                e.getBusted();
                return;
                }
            else {
                e.morph();
                this.lastMorph = Date.now();
                return;
                }
            }
        }
    }

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;
NPC.size = 50;
function NPC(xPos, yPos, alive) {
    this.init(xPos, yPos, alive);
    this.shape = 0;
    this.node = this.createNode();
    this.setHitbox(NPC.size, NPC.size);
    this.morphing = 0;
    this.maxSpeed = 2;
    this.chaseMode = 0;
    this.toChase = null;
    this.busted = 0;
    }
NPC.prototype.morph = function() {
    if (this.morphing) return;
    this.morphing = 1;
    if (this.shape == 0) {  /* male */
        targetShape = 'Fem';
        }
    else {                  /* female */
        targetShape = 'Mal';
        }
    aniNode1 = document.querySelector('#' + this.id + '_morphTo' + targetShape + 'B');
    aniNode2 = document.querySelector('#' + this.id + '_morphTo' + targetShape + 'H');
    aniNode3 = document.querySelector('#' + this.id + '_morphTo' + targetShape + 'CB');
    aniNode4 = document.querySelector('#' + this.id + '_morphTo' + targetShape + 'CH');
    aniNode5 = document.querySelector('#' + this.id + '_morphTo' + targetShape + 'CF');
    aniNode1.beginElement();
    aniNode2.beginElement();
    aniNode3.beginElement();
    aniNode4.beginElement();
    aniNode5.beginElement();
    this.shape = 1 - this.shape;
    setTimeout((function(self) {return function() { self.morphing = 0; }})(this), 600);
    setTimeout((function(self) {return function() { if(self.shape==1)self.morph(); }})(this), 10000);
    }
NPC.prototype.aniNode = function(id, attrName, to) {
    node = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    node.setAttribute('id', id);
    node.setAttribute('begin', 'indefinite');
    node.setAttribute('fill', 'freeze');
    node.setAttribute('attributeName', attrName);
    node.setAttribute('dur', '500ms');
    node.setAttribute('to', to);
    return node;
    }
NPC.prototype.createNode = function() {
    id = this.id;
    div = document.createElement('div');
    div.setAttribute('id', id);
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('style', 'width: '+NPC.size+'px; height: '+NPC.size+'px;');
    polyB = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyB.setAttribute('fill', window.M_COLOR);
    polyB.setAttribute('points', window.M_BODY_POINTS);
    polyH = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyH.setAttribute('fill', window.M_COLOR);
    polyH.setAttribute('points', window.M_HAIR_POINTS);
    circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circ.setAttribute('cx', 50);
    circ.setAttribute('cy', 14.5);
    circ.setAttribute('r', 14.5);
    circ.setAttribute('fill', window.M_COLOR);
    aniToFemB = this.aniNode(id+'_morphToFemB', 'points', window.F_BODY_POINTS);
    aniToFemH = this.aniNode(id+'_morphToFemH', 'points', window.F_HAIR_POINTS);
    aniToFemCB = this.aniNode(id+'_morphToFemCB', 'fill', window.F_COLOR);
    aniToFemCH = this.aniNode(id+'_morphToFemCH', 'fill', window.F_COLOR);
    aniToFemCF = this.aniNode(id+'_morphToFemCF', 'fill', window.F_COLOR);
    aniToMalB = this.aniNode(id+'_morphToMalB', 'points', window.M_BODY_POINTS);
    aniToMalH = this.aniNode(id+'_morphToMalH', 'points', window.M_HAIR_POINTS);
    aniToMalCB = this.aniNode(id+'_morphToMalCB', 'fill', window.M_COLOR);
    aniToMalCH = this.aniNode(id+'_morphToMalCH', 'fill', window.M_COLOR);
    aniToMalCF = this.aniNode(id+'_morphToMalCF', 'fill', window.M_COLOR);
    div.appendChild(svg);
    svg.appendChild(polyB);
    polyB.appendChild(aniToFemB);
    polyB.appendChild(aniToMalB);
    polyB.appendChild(aniToMalCB);
    polyB.appendChild(aniToFemCB);
    svg.appendChild(polyH);
    polyH.appendChild(aniToFemH);
    polyH.appendChild(aniToMalH);
    polyH.appendChild(aniToMalCH);
    polyH.appendChild(aniToFemCH);
    svg.appendChild(circ);
    circ.appendChild(aniToFemCF);
    circ.appendChild(aniToMalCF);
    return div;
}
NPC.prototype.distTo = function(o) {
    return Math.sqrt(Math.abs(o.xPos - this.xPos) + Math.abs(o.yPos - this.yPos));
    }
NPC.prototype.xDirTo = function(o) {
    return (o.xPos - this.xPos < 0 ? -1 : 1);
    }
NPC.prototype.yDirTo = function(o) {
    return (o.yPos - this.yPos < 0 ? -1 : 1);
    }
NPC.prototype.findNearestOther = function(mode) {
    // mode 0 = any, mode 1 = only NPCs
    var nearest = null;
    var min_dist = 9001;
    for (var i=0; i<game.entities.length; i++) {
        var o = game.entities[i];
        if (o == this) continue;
        if (mode == 1 && !(o instanceof NPC)) continue;
        var dist = this.distTo(o);
        if (dist < 1) {
            o.accX(Math.round((Math.random()-.5)*2))
            o.accY(Math.round((Math.random()-.5)*2))
            }
        if (dist < min_dist) {
            nearest = o;
            min_dist = dist;
            }
        }
    return nearest;
    }

NPC.prototype.socialize = function() {
    /* TODO:
        make this function just choose whom to chase or run from
        and then use the chase function
    */
    if (this.chaseMode == 1) {
        this.chase(this.toChase);
        return;
        }
    candidate = this.findNearestOther(0);
    minDist = (candidate.shape == 0 ? 10 : 0);
    modifier = 1;
    if (this.distTo(candidate) < 9 && candidate.shape == 0 && this.shape == 0) {
        modifier = -1;
        }
    if (this.distTo(candidate) > minDist || modifier == -1) {
        if(Math.abs(this.xSpeed)<this.maxSpeed) {
            this.accX(modifier * this.xDirTo(candidate));
            }
        else {
            this.decel();
            }
        if(Math.abs(this.ySpeed)<this.maxSpeed) {
            this.accY(modifier * this.yDirTo(candidate));
            }
        else {
            this.decel();
            }
        }
    else {
        if (this.shape == 0) {
            this.xSpeed = 0;
            this.ySpeed = 0;
            }
        }
    }
NPC.prototype.chase = function(target) {
    if (game.entities.indexOf(target) == -1) {
        this.chaseMode = 0;
        this.maxSpeed = 2;
        return;
        }
    if(Math.abs(this.xSpeed)<this.maxSpeed) {
        this.accX(this.xDirTo(target));
        }
    else {
        this.decel();
        }
    if(Math.abs(this.ySpeed)<this.maxSpeed) {
        this.accY(this.yDirTo(target));
        }
    else {
        this.decel();
        }
    }

NPC.prototype.reproduce = function() {
    if (this.chaseMode == 1) return; // busting
    for (var i=0; i<game.entities.length; i++) {
        var o = game.entities[i];
        if (o == this) continue;
        if (!(o instanceof NPC)) continue;
        if (this.distTo(o) > 1) continue;
        if (this.busted == 1) {
            this.die();
            }
        if (this.shape != o.shape) { // one star, one hat
            if (this.shape == 1) this.morph();
            else {
                o.morph();
                }
            child = new NPC(this.xPos, o.yPos, 1);
            child.spawn();
            }
        }
    }

NPC.prototype.bust = function(busted) {
    this.maxSpeed = 4;
    this.chaseMode = 1;
    this.toChase = busted;
    setTimeout((function(self) {return function() { self.maxSpeed = 2; self.chaseMode = 0; }})(this), 20000);
    }

NPC.prototype.getBusted = function() {
    this.busted = 1;
    this.node.style["background-repeat"] = 'no-repeat';
    this.node.style["background-image"] = "url('img/player.png')";
    }

NPC.prototype.die = function() {
    this.deSpawn();
    }

/* - not entities - */
function Game() {
    this.gameField = new GameField();
    this.infoFieldNode = document.querySelector('#infoField');
    this.entities = [];
    this.currKeyCodes = [];
    this.state = 0; // 0 = intro, 1 = game, 2 = end
    this.win = 0;
    this.hoursLeft = 24;
    this.countDownInvID = null;
    this.populationGoal = 15;
    this.bgm = null;
    }

Game.prototype.start = function() {
    this.player = new Player(250, 250);
    this.player.spawn();

    adam = new NPC(0, 200, 1);
    evan = new NPC(500, 40, 1);
    adam.spawn();
    evan.spawn();

    this.countDownInvID = self.setInterval((function(self) {return function() {self.countDown();}})(this), 5000);

    draw();
    }

Game.prototype.tick = function() {
    // keyboard input
    for(var i=0; i<this.currKeyCodes.length; i++) {
        switch(this.currKeyCodes[i]) {
            case 16: //shift
                game.player.makeMorph();
                break;
            case 32: //space bar
                //game.player.infect();
                break;
            case 37: //left
                game.player.walkX(-1);
                break;
            case 38: //up
                game.player.walkY(-1);
                break;
            case 39: //right
                game.player.walkX(1);
                break;
            case 40: //down
                game.player.walkY(1);
                break;
            }
        }
    if(this.currKeyCodes.indexOf(37) == -1 && game.player.xSpeed < 0) { //left
        game.player.decelXNeg();
        }
    if(this.currKeyCodes.indexOf(38) == -1 && game.player.ySpeed < 0) { //up
        game.player.decelYNeg();
        }
    if(this.currKeyCodes.indexOf(39) == -1 && game.player.xSpeed > 0) { //right
        game.player.decelXPos();
        }
    if(this.currKeyCodes.indexOf(40) == -1 && game.player.ySpeed > 0) { //down
        game.player.decelYPos();
        }
    // entities
    population = 0;
    for (var i=0; i<this.entities.length; i++) {
        var e = this.entities[i];
        e.tick();
        if (e instanceof NPC) {
            population += 1;
            e.socialize();
            e.reproduce();
            }
        }
    if (this.state == 2) {
        for (var i=0; i<this.entities; i++) {
            this.entities[i].deSpawn();
            }
        if (this.win == 1) {
            this.gameField.node.innerHTML = '<div style="margin: 0px auto; width: 140px; padding-top: 140px"><p style="text-align: center;">G&thinsp;A&thinsp;M&thinsp;E&emsp;O&thinsp;V&thinsp;E&thinsp;R</p><img src="img/sad_obake.gif"><p style="text-align: center; color: #555;">click to restart</p></div>';
            }
        else {
            this.gameField.node.innerHTML = '<div style="margin: 0px auto; width: 193px; padding-top: 140px"><p style="text-align: center;">S&thinsp;U&thinsp;C&thinsp;C&thinsp;E&thinsp;S&thinsp;S</p><img src="img/happy_obake.gif"><p style="text-align: center; color: #555;">Score: '+population+'<br><br>click to restart</p></div>';
            this.infoFieldNode.innerHTML = '<h3>E P I L O G U E</h3><p>Shortly after Takashi\'s spirit ascended into the plain of high heaven, a wave of migration brought new people to the village. With the dire need for new variation in the gene pool this was a godsend.<br><br>Over the years, Adam and Evan grew into the role of village elders and became known among the kids for their creepy stories about shape shifters and the mysterious origin of the villages “first '+population+' men“.<br><br>Takashi hopes to meet their spirits some day to tell the story of how he finally was useful and rescued the village from extinction.</p>';
            }
        return;
        }
    if (population < 2) {
        this.end(0);
        }
    if (this.hoursLeft < 1) {
        if (population < this.populationGoal) this.end(0);
        else this.end(1);
        }
    // info
    popNode = this.infoFieldNode.querySelector('#pop');
    popNode.innerHTML = population + '';
    hleftNode = this.infoFieldNode.querySelector('#hleft');
    hleftNode.innerHTML = this.hoursLeft + '';
    }

Game.prototype.end = function(win) {
    clearInterval(this.countDownInvID);
    this.state = 2;
    this.win = win;
    gc = document.querySelector('#gameField');
    gc.setAttribute('onClick', 'location.reload()');
    }

Game.prototype.countDown = function() {
    this.hoursLeft -= 1;
    }

function GameField() {
    this.node = document.querySelector('#gameField');
    this.width = window.GAME_MAX_X;
    this.height = window.GAME_MAX_Y;
    }

document.onkeydown = function(e) {
    var keyCode = (window.event) ? event.keyCode : e.keyCode;
    if(game.currKeyCodes.indexOf(keyCode) == -1) {
        game.currKeyCodes.push(keyCode);
        }
    }
document.onkeyup = function(e) {
    var keyCode = (window.event) ? event.keyCode : e.keyCode;
    var index = game.currKeyCodes.indexOf(keyCode);
    game.currKeyCodes.splice(index, 1);
    }

var game = new Game();

function begin() {
    gc = document.querySelector('#gameField');
    gc.setAttribute('onClick', '');
    game.gameField.node.innerHTML = '';
    game.start();
    var bgm = new Audio('bgm/bgm.ogg');
    bgm.play();
    }

var fps = 60;
function draw() {
    setTimeout(function() {
        requestAnimationFrame(draw);
        //game logic
        }, 1000 / fps);
        game.tick();
    }
