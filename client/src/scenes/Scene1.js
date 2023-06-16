import Phaser from 'phaser';
import Beam from '../components/Beam';
import Explosion from '../components/Explosion';

class Scene1 extends Phaser.Scene {
    shipScale = 3;
    playerVelocity = 200;
    shipAnim;
    score = 0;

    constructor() {
        super('playGame');
    }

    create() {
        const createGameObj = this.createBackground;
        createGameObj();

        this.ship1 = this.add.sprite(window.innerWidth / 2 - 50 * 3, window.innerHeight / 4, "ship");
        this.ship1.setScale(this.shipScale);

        this.ship2 = this.add.sprite(window.innerWidth / 2, window.innerHeight / 4, "ship2");
        this.ship2.setScale(this.shipScale);

        this.ship3 = this.add.sprite(256 / 2 + 50, window.innerHeight / 4, "ship3");
        this.ship3.setScale(this.shipScale);

        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);

        this.player = this.physics.add.sprite(window.innerWidth / 2 - 8, window.innerHeight - 256, "player");
        this.player.setScale(this.shipScale);

        this.player.play("thrust");

        this.ship1.play('ship1_anim');
        this.ship2.play('ship2_anim');
        this.ship3.play('ship3_anim');

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);

        this.powerUps = this.physics.add.group();

        const maxObjects = 4;
        for (let i = 0; i <= maxObjects; i++) {
            const powerUp = this.physics.add.sprite(16, 16, "power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, window.innerWidth, window.innerHeight);
            powerUp.setScale(2);

            // set random animation
            if (Math.random() > 0.5) {
                powerUp.play("red");
            } else {
                powerUp.play("gray");
            }

            // setVelocity
            powerUp.setVelocity(100, 100);
            // make object bounce
            powerUp.setCollideWorldBounds(true);
            // set bounce rate
            powerUp.setBounce(1);

        }

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.projectiles = this.add.group();

        this.physics.add.collider(this.projectiles, this.powerUps, (projectile, powerUp) => {
            projectile.destroy();
        });

        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);

        this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE 000000", 16);
        this.scoreLabel.setScale(3);

        this.beamSound = this.sound.add("audio_beam");
        this.explosionSound = this.sound.add("audio_explosion");
        this.pickupSound = this.sound.add("audio_pickup");
    }

    update() {
        if (this.ship1 && this.ship2 && this.ship3) {
            this.moveShip(this.ship1, 1);
            this.moveShip(this.ship2, 2);
            this.moveShip(this.ship3, 3);
        }

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            if (this.player.active) {
                this.shootBeam();
            }
        }

        for (let beam of this.projectiles.getChildren()) {
            beam.update();
        }
    }

    createBackground = () => {
        this.background = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background');
        this.background.setOrigin(0, 0);
        this.background.setScale(4.8);
    }

    shootBeam() {
        const beam = new Beam(this);
        if (!beam) {
            console.log("Beam not loaded");
            return;
        }
        this.beamSound.play();
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
        this.pickupSound.play();
    }

    hurtPlayer(player, enemy) {
        this.resetShipPos(enemy);

        if (this.player.alpha < 1) {
            return;
        }

        const explosion = new Explosion(this, player.x, player.y);
        if (!explosion) {
            console.log("Explosion not loaded!")
        }
        player.disableBody(true, true);
        player.x = window.innerWidth / 2 - 8;
        player.y = window.innerHeight - 64
        this.explosionSound.play();

        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        });

        this.resetPlayer();
    }

    hitEnemy(projectile, enemy) {

        const explosion = new Explosion(this, enemy.x, enemy.y);
        if (!explosion) {
            console.log("Explosion not loaded!")
        }
        projectile.destroy();
        this.resetShipPos(enemy);
        this.score += 15;
        const formattedScore = this.zeroPad(this.score, 6);
        this.scoreLabel.text = `SCORE ${formattedScore}`;
        this.explosionSound.play();
    }

    moveShip(ship, speed) {
        ship.y += speed;
        if (ship.y > window.innerHeight) {
            this.resetShipPos(ship);
        }
    }

    resetPlayer() {
        const x = window.innerWidth / 2 - 8;
        const y = window.innerHeight + 64;
        this.player.enableBody(true, x, y, true, true);

        this.player.alpha = 0.5;

        const tween = this.tweens.add({
            targets: this.player,
            y: window.innerHeight - 64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function() {
                this.player.alpha = 1;
            },
            callbackScope: this
        });

        if(!tween) {
            console.log("Wheres tween");
        }
    }

    resetShipPos(ship) {
        ship.y = 0;
        let randomX = Phaser.Math.Between(0, window.innerWidth);
        ship.x = randomX;
    }

    destroyShip(pointer, gameObject) {
        gameObject.setTexture("explosion");
        gameObject.setScale(2);
        gameObject.play("explode");
    }

    movePlayerManager() {
        this.player.setVelocity(0);

        if (this.cursorKeys.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursorKeys.right.isDown) {
            this.player.setVelocityX(this.playerVelocity);
        }

        if (this.cursorKeys.up.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursorKeys.down.isDown) {
            this.player.setVelocityY(200);
        }
    }

    zeroPad(number, size) {
        let numberDisplay = String(number);
        while (numberDisplay.length < (size || 2)) {
            numberDisplay = "0" + numberDisplay;
        }
        return numberDisplay;
    }
}

export default Scene1;
