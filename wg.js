/* - - - G L O B A L S - - - */
window.HAT_COLOR="#53B848";
window.HAT_POINTS="19.098,95.106 50,95.106 80.902,95.106 89.463,58.897 80.000,36.327 62.028,16.017 50,8 37.971,16.017 20,36.327 10.537,58.897";
window.STAR_COLOR="#FFD41D";
window.STAR_POINTS="19.098,95.106 50,73.038 80.902,95.106 69.463,58.897 100,36.327 62.028,36.017 50,0 37.971,36.017 0,36.327 30.537,58.897";
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
    if (this.shape == 0) {  /* hat */
        targetShape = 'Star';
        targetColor = 'Yellow';
        }
    else {                  /* star */
        targetShape = 'Hat';
        targetColor = 'Green';
        }
    aniNode1 = document.querySelector('#' + this.id + '_morphTo' + targetShape);
    aniNode2 = document.querySelector('#' + this.id + '_morphTo' + targetColor);
    aniNode1.beginElement();
    aniNode2.beginElement();
    this.shape = 1 - this.shape;
    setTimeout((function(self) {return function() { self.morphing = 0; }})(this), 600);
    setTimeout((function(self) {return function() { if(self.shape==1)self.morph(); }})(this), 10000);
    }
NPC.prototype.createNode = function() {
    id = this.id;
    div = document.createElement('div');
    div.setAttribute('id', id);
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('style', 'width: '+NPC.size+'px; height: '+NPC.size+'px;');
    poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('fill', window.HAT_COLOR);
    poly.setAttribute('points', window.HAT_POINTS);
    ani1 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani1.setAttribute('id', id+'_morphToStar');
    ani1.setAttribute('begin', 'indefinite');
    ani1.setAttribute('fill', 'freeze');
    ani1.setAttribute('attributeName', 'points');
    ani1.setAttribute('dur', '500ms');
    ani1.setAttribute('to', window.STAR_POINTS);
    ani2 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani2.setAttribute('id', id+'_morphToHat');
    ani2.setAttribute('begin', 'indefinite');
    ani2.setAttribute('fill', 'freeze');
    ani2.setAttribute('attributeName', 'points');
    ani2.setAttribute('dur', '500ms');
    ani2.setAttribute('to', window.HAT_POINTS);
    ani3 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani3.setAttribute('id', id+'_morphToYellow');
    ani3.setAttribute('begin', 'indefinite');
    ani3.setAttribute('fill', 'freeze');
    ani3.setAttribute('attributeName', 'fill');
    ani3.setAttribute('dur', '500ms');
    ani3.setAttribute('to', window.STAR_COLOR);
    ani4 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani4.setAttribute('id', id+'_morphToGreen');
    ani4.setAttribute('begin', 'indefinite');
    ani4.setAttribute('fill', 'freeze');
    ani4.setAttribute('attributeName', 'fill');
    ani4.setAttribute('dur', '500ms');
    ani4.setAttribute('to', window.HAT_COLOR);
    div.appendChild(svg);
    svg.appendChild(poly);
    poly.appendChild(ani1);
    poly.appendChild(ani2);
    poly.appendChild(ani3);
    poly.appendChild(ani4);
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
            game.entities.push(child);
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
    }

Game.prototype.start = function() {
    this.player = new Player(250, 250);
    this.player.spawn();

    adam = new NPC(0, 200, 1);
    eve = new NPC(500, 40, 1);
    adam.spawn();
    eve.spawn();

    //this.intvID = self.setInterval((function(self) {return function() {test.morph();}})(this), 1000);
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
    debugstr = '';
    population = 0;
    for (var i=0; i<this.entities.length; i++) {
        var e = this.entities[i];
        e.tick();
        if (e instanceof NPC) {
            population += 1;
            e.socialize();
            e.reproduce();
            }
        if (e instanceof Player) {
            for (var j=0; j<this.entities.length; j++) {
                var f = this.entities[j];
                if (f instanceof NPC && e.collidesWith(f)) {
                    debugstr += 'collision';
                    }
                }
            }
        }
    // info
    debugstr += '<br>' + game.currKeyCodes.toString();
    debNode = this.infoFieldNode.querySelector('#debug');
    debNode.innerHTML = debugstr + '';
    popNode = this.infoFieldNode.querySelector('#pop');
    popNode.innerHTML = population + '';
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
    game.start();
    gc = document.querySelector('#gameContainer');
    gc.setAttribute('onClick', '');
    }

var fps = 60;
function draw() {
    setTimeout(function() {
        requestAnimationFrame(draw);
        //game logic
        }, 1000 / fps);
        game.tick();
    }
