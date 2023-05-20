import Block, { BlockType } from './block';
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

		// Horizontal movement

		const xChange = this.forceX * deltaTime;

		this.collider.x += xChange;

		const blocksLeft = Game.instance.getBlocksInArea(
			Math.round(this.collider.x) - 1,
			this.y,
			2,
			this.height
		);
		const blocksRight = Game.instance.getBlocksInArea(
			Math.round(this.collider.x) + this.width - 1,
			this.y,
			2,
			this.height
		);

		// if any horizontal blocks are colliding with player, revert movement
		if (
			blocksLeft.some(
				(block) =>
					block.type !== BlockType.Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			// console.log(
			// 	'left',
			// 	blocksLeft.find(
			// 		(block) =>
			// 			block.type !== BlockType.Empty &&
			// 			block.collider.isCollidingWith(this.collider)
			// 	)
			// );
			this.collider.x -= xChange;
			this.collider.x = Math.round(this.collider.x / Block.size) * Block.size;
			this.forceX = 0; // reset forceX when hitting wall
		} else if (
			blocksRight.some(
				(block) =>
					block.type !== BlockType.Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			// console.log(
			// 	'right',
			// 	blocksRight.find(
			// 		(block) =>
			// 			block.type !== BlockType.Empty &&
			// 			block.collider.isCollidingWith(this.collider)
			// 	)
			// );
			this.collider.x -= xChange;
			this.collider.x = Math.round(this.collider.x / Block.size) * Block.size;
			this.forceX = 0; // reset forceX when hitting wall
		}

		// Vertical movement

		const yChange = this.forceY * deltaTime;

		this.collider.y += yChange;

		const blocksAbove = Game.instance.getBlocksInArea(
			this.x,
			Math.round(this.collider.y) - 1,
			this.width,
			2
		);
		const blocksBelow = Game.instance.getBlocksInArea(
			this.x,
			Math.round(this.collider.y) + this.height - 1,
			this.width,
			2
		);

		// if any vertical blocks are colliding with player, revert movement
		if (
			blocksBelow.some(
				(block) =>
					block.type !== BlockType.Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			// console.log(
			// 	'below',
			// 	blocksBelow.find(
			// 		(block) =>
			// 			block.type !== BlockType.Empty &&
			// 			block.collider.isCollidingWith(this.collider)
			// 	)
			// );
			this.collider.y -= yChange;

			// snap to block? (round to nearest block)
			// bad performance ? not sure
			// seems to work great though (no jittering)

			this.collider.y = Math.round(this.collider.y / Block.size) * Block.size;
			this.forceY = 0; // reset forceY when hitting ground
		} else if (
			blocksAbove.some(
				(block) =>
					block.type !== BlockType.Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			// console.log(
			// 	'above',
			// 	blocksAbove.find(
			// 		(block) =>
			// 			block.type !== BlockType.Empty &&
			// 			block.collider.isCollidingWith(this.collider)
			// 	)
			// );
			this.collider.y -= yChange;
			this.collider.y = Math.round(this.collider.y / Block.size) * Block.size;
			this.forceY = 0; // reset forceY when hitting ceiling

			// gravity
			this.forceY = lerp(this.forceY, 60, deltaTime * 2);
		} else {
			// gravity
			this.forceY = lerp(this.forceY, 60, deltaTime * 2);
		}

		// set player position after all collider calculations
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
		this.forceY = -150;
	}

	public attack(): void {}
}
