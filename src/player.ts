import Block from './block';
import Collider from './collider';
import Game from './game';
import Input from './input';
import Item, { ItemType } from './item';
import { distance, lerp } from './utils';

export default class Player {
	public name = 'Player';
	public health = 0;
	public maxHealth = 100;

	private width = 16;
	private height = 32;

	public x;
	public y;

	get right(): number {
		return this.x + this.width;
	}

	get bottom(): number {
		return this.y + this.height;
	}

	get midX(): number {
		return this.x + this.width / 2;
	}

	get midY(): number {
		return this.y + this.height / 2;
	}

	public forceX = 0;
	public forceY = 0;

	private forceDrag = 0.9;
	private collider: Collider;

	private inventory: { [key: number]: number } = {};

	constructor(spawnX: number, spawnY: number) {
		this.x = spawnX;
		this.y = spawnY;

		this.collider = new Collider(this.x, this.y, this.width, this.height);

		this.init();
	}

	public addToInventory(item: ItemType, count: number) {
		if (!this.inventory[item]) {
			this.inventory[item] = count;
			return;
		}

		this.inventory[item] += count;

		let logInventory: any = {};
		for (const key in this.inventory) {
			logInventory[ItemType[key]] = this.inventory[key];
		}

		console.table(logInventory);
	}

	public removeFromInventory(item: ItemType, count: number) {
		if (!this.inventory[item]) {
			return false;
		}

		this.inventory[item] -= count;

		if (this.inventory[item] <= 0) delete this.inventory[item];

		let logInventory: any = {};
		for (const key in this.inventory) {
			logInventory[ItemType[key]] = this.inventory[key];
		}

		console.table(logInventory);

		return true;
	}

	private init(): void {
		this.health = this.maxHealth;

		Input.onKeyDown.push([' ', () => this.jump()]);
		Input.onMouseMove.push(this.onMouseMove.bind(this));
		Input.onMouseDown.push([0, this.onClick.bind(this)]);
	}

	private onMouseMove(x: number, y: number): void {
		const worldPoint = Game.instance.getWorldPointAtScreenPoint(x, y);
		const block = Game.instance.getBlockAtScreenPoint(x, y);

		if (
			block &&
			block.type !== ItemType.B_Empty &&
			distance(
				worldPoint[0],
				worldPoint[1],
				this.x + this.width / 2,
				this.y + this.height / 2
			) < 56
		) {
			Input.cursorElement.classList.add('can-mine');
		} else {
			Input.cursorElement.classList.remove('can-mine');
		}
	}

	private onClick(x: number, y: number): void {
		const worldPoint = Game.instance.getWorldPointAtScreenPoint(x, y);
		const block = Game.instance.getBlockAtScreenPoint(x, y);

		if (
			block &&
			distance(
				worldPoint[0],
				worldPoint[1],
				this.x + this.width / 2,
				this.y + this.height / 2
			) < 56
		) {
			if (block.type === ItemType.B_Empty) return;
			Game.instance.addItem(
				new Item(
					block.type,
					block.x + block.collider.width / 2 + Math.random() * 2 - 1,
					block.y + block.collider.height / 2
				)
			);
			block.setType(ItemType.B_Empty);
		}
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
					block.type !== ItemType.B_Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			this.collider.x -= xChange;
			this.collider.x = Math.round(this.collider.x / Block.size) * Block.size;
			this.forceX = 0; // reset forceX when hitting wall
		} else if (
			blocksRight.some(
				(block) =>
					block.type !== ItemType.B_Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
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
					block.type !== ItemType.B_Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
			this.collider.y -= yChange;

			// snap to block? (round to nearest block)
			// bad performance ? not sure
			// seems to work great though (no jittering)

			this.collider.y = Math.round(this.collider.y / Block.size) * Block.size;
			this.forceY = 0; // reset forceY when hitting ground
		} else if (
			blocksAbove.some(
				(block) =>
					block.type !== ItemType.B_Empty &&
					block.collider.isCollidingWith(this.collider)
			)
		) {
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
