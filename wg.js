/* - - - G L O B A L S - - - */
document.HAT_COLOR="#53B848";
document.HAT_POINTS="19.098,95.106 50,95.106 80.902,95.106 89.463,58.897 80.000,36.327 62.028,16.017 50,8 37.971,16.017 20,36.327 10.537,58.897";
document.STAR_COLOR="#FFD41D";
document.STAR_POINTS="19.098,95.106 50,73.038 80.902,95.106 69.463,58.897 100,36.327 62.028,36.017 50,0 37.971,36.017 0,36.327 30.537,58.897";
document.entityCounter = 0;

/* - - - C L A S S E S - - - */
/* - entities - */
function Entity() {}
Entity.prototype.init = function(xPos, yPos, alive) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.alive = alive;
    this.id = 'e_' + document.entityCounter;
    document.entityCounter += 1;
    console.log('created entity #' + this.id);
    }
Entity.prototype.isAlive = function() {
    return this.alive;
    }
Entity.prototype.spawn = function(gameField) {
    gameField.node.appendChild(this.node);
    }

Player.prototype = new Entity();
Player.prototype.constructor = Player;
function Player(xPos, yPos) {
    }

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;
function NPC(xPos, yPos, alive) {
    this.init(xPos, yPos, alive);
    this.shape = 0;
    this.node = this.createNode();
    }
NPC.prototype.morph = function() {
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
    }
NPC.prototype.createNode = function() {
    id = this.id;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', id);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('style', 'width: 50px; height: 50px;');
    poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('fill', document.HAT_COLOR);
    poly.setAttribute('points', document.HAT_POINTS);
    ani1 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani1.setAttribute('id', id+'_morphToStar');
    ani1.setAttribute('begin', 'indefinite');
    ani1.setAttribute('fill', 'freeze');
    ani1.setAttribute('attributeName', 'points');
    ani1.setAttribute('dur', '500ms');
    ani1.setAttribute('to', document.STAR_POINTS);
    ani2 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani2.setAttribute('id', id+'_morphToHat');
    ani2.setAttribute('begin', 'indefinite');
    ani2.setAttribute('fill', 'freeze');
    ani2.setAttribute('attributeName', 'points');
    ani2.setAttribute('dur', '500ms');
    ani2.setAttribute('to', document.HAT_POINTS);
    ani3 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani3.setAttribute('id', id+'_morphToYellow');
    ani3.setAttribute('begin', 'indefinite');
    ani3.setAttribute('fill', 'freeze');
    ani3.setAttribute('attributeName', 'fill');
    ani3.setAttribute('dur', '500ms');
    ani3.setAttribute('to', document.STAR_COLOR);
    ani4 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    ani4.setAttribute('id', id+'_morphToGreen');
    ani4.setAttribute('begin', 'indefinite');
    ani4.setAttribute('fill', 'freeze');
    ani4.setAttribute('attributeName', 'fill');
    ani4.setAttribute('dur', '500ms');
    ani4.setAttribute('to', document.HAT_COLOR);
    svg.appendChild(poly);
    poly.appendChild(ani1);
    poly.appendChild(ani2);
    poly.appendChild(ani3);
    poly.appendChild(ani4);
    return svg;
}

/* - not entities - */
function Game() {
    this.gameField = new GameField();
    }

Game.prototype.start = function() {
    test = new NPC(0, 0, 1);
    test.spawn(this.gameField);
    this.intvID = self.setInterval((function(self) {return function() {test.morph();}})(this), 1000);
    }

function GameField() {
    this.node = document.querySelector('#gameField');
    this.width = 500;
    this.height = 500;
    }

document.game = new Game();
document.game.start();
