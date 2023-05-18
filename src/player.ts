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

		const xChange = this.forceX * deltaTime;

		this.collider.x += xChange;

		const blocksHorizontal = Game.instance
			.getBlocksInArea(this.collider.x - 1, this.y, 2, this.height)
			.concat(
				Game.instance.getBlocksInArea(
					this.collider.x + this.width - 1,
					this.y,
					2,
					this.height
				)
			);

		// if any blocksHorizontal are colliding with player, revert movement
		if (
			blocksHorizontal.some(
				(block) =>
					block.type !== BlockType.Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			this.collider.x -= xChange;
			this.collider.x = Math.round(this.collider.x);
		}

		const yChange = this.forceY * deltaTime;

		// console.log('player y+h', this.y + this.height);
		// console.log(yChange, this.collider.y);dd
		this.collider.y += yChange;

		const blocksVertical = Game.instance
			.getBlocksInArea(this.x, this.collider.y - 1, this.width, 2)
			.concat(
				Game.instance.getBlocksInArea(
					this.x,
					this.collider.y + this.height - 1,
					this.width,
					2
				)
			);

		// if any blocksAbove are colliding with player, revert movement
		if (
			blocksVertical.some(
				(block) =>
					block.type !== BlockType.Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			this.collider.y -= yChange;
			this.collider.y = Math.floor(this.collider.y);
		}

		// gravity
		this.forceY = lerp(this.forceY, 60, deltaTime * 2);

		// console.log(this.collider.y);

		this.x = this.collider.x;
		this.y = this.collider.y;

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
