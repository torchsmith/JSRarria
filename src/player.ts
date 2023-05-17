import { BlockType } from './block';
import Collider from './collider';
import Game from './game';
import Input from './input';
import { lerp } from './utils';

export default class Player {
	public name = 'Player';
	public health = 0;
	public maxHealth = 100;

	private width = 16;
	private height = 32;

	public x;
	public y;

	public forceX = 0;
	public forceY = 0;

	private forceDrag = 0.9;
	private collider: Collider;

	constructor(spawnX: number, spawnY: number) {
		this.x = spawnX;
		this.y = spawnY;

		this.collider = new Collider(this.x, this.y, this.width, this.height);

		this.init();
	}

	private init(): void {
		this.health = this.maxHealth;

		Input.onKeyDown.push([' ', () => this.jump()]);
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = 'black';

		ctx.fillRect(
			Game.instance.camera.getRenderX(this.x),
			Game.instance.camera.getRenderY(this.y),
			Game.instance.camera.getRenderWidth(this.width),
			Game.instance.camera.getRenderHeight(this.height)
		);
	}

	public toString(): string {
		return `${this.name} (${this.health}/${this.maxHealth}) at (${this.x}, ${this.y})`;
	}

	public update(deltaTime: number): void {
		this.move();

		// TODO: get closest tile above, below, left, and right of player.
		// add collider class to tiles.
		// check if player is colliding with any of those tiles using Collider class.
		// if player is colliding with any of those tiles revert movement.
		// do this for both x and y separately to allow for sliding on walls.

		const blockAbove = Game.instance.getBlockAtWorldPoint(this.x, this.y - 1);
		const blockBelowLeft = Game.instance.getBlockAtWorldPoint(
			this.x,
			this.y + this.height + 1
		);
		const blockBelowRight = Game.instance.getBlockAtWorldPoint(
			this.x + this.width,
			this.y + this.height + 1
		);
		const blockLeftTop = Game.instance.getBlockAtWorldPoint(this.x - 1, this.y);
		const blockRightTop = Game.instance.getBlockAtWorldPoint(
			this.x + this.width + 1,
			this.y
		);
		const blockLeftBottom = Game.instance.getBlockAtWorldPoint(
			this.x - 1,
			this.y + this.height
		);
		const blockRightBottom = Game.instance.getBlockAtWorldPoint(
			this.x + this.width + 1,
			this.y + this.height
		);

		const xChange = this.forceX * deltaTime;

		this.collider.x += xChange;

		if (blockLeftBottom && blockLeftBottom.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockLeftBottom.collider)) {
				console.log(
					'X colliding with block Left',
					blockLeftBottom,
					this.collider
				);
				this.collider.x -= xChange;
			}
		}

		if (blockRightBottom && blockRightBottom.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockRightBottom.collider)) {
				console.log(
					'X colliding with block Right',
					blockRightBottom,
					this.collider
				);
				this.collider.x -= xChange;
			}
		}
		if (blockLeftTop && blockLeftTop.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockLeftTop.collider)) {
				console.log('X colliding with block Left', blockLeftTop, this.collider);
				this.collider.x -= xChange;
			}
		}

		if (blockRightTop && blockRightTop.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockRightTop.collider)) {
				console.log(
					'X colliding with block Right',
					blockRightTop,
					this.collider
				);
				this.collider.x -= xChange;
			}
		}

		const yChange = this.forceY * deltaTime;

		this.collider.y += yChange;

		if (blockAbove && blockAbove.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockAbove.collider)) {
				console.log('Y colliding with block Above', blockAbove, this.collider);
				this.collider.y -= yChange;
			}
		}

		if (blockBelowLeft && blockBelowLeft.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockBelowLeft.collider)) {
				console.log(
					'Y colliding with block Below',
					blockBelowLeft,
					this.collider
				);
				this.collider.y -= yChange;
			}
		}
		if (blockBelowRight && blockBelowRight.type !== BlockType.Empty) {
			if (this.collider.isCollidingWith(blockBelowRight.collider)) {
				console.log(
					'Y colliding with block Below',
					blockBelowRight,
					this.collider
				);
				this.collider.y -= yChange;
			}
		}

		this.x = this.collider.x;
		this.y = this.collider.y;

		// gravity
		this.forceY = lerp(this.forceY, 60, deltaTime * 2);

		// Slow down horizontal movement
		this.forceX *= this.forceDrag;

		// Move camera to center of player
		Game.instance.camera.setX(
			this.x +
				this.width / 2 -
				Game.instance.canvas.width / Game.instance.camera.zoom / 2
		);
		Game.instance.camera.setY(
			this.y - Game.instance.canvas.height / Game.instance.camera.zoom / 2
		);
	}

	public move(): void {
		if (Input.keys['d']) {
			this.forceX = Math.min(this.forceX + 10, 50);
		} else if (Input.keys['a']) {
			this.forceX = Math.max(this.forceX - 10, -50);
		}
	}

	public jump(): void {
		this.forceY = -100;
	}

	public attack(): void {}
}
