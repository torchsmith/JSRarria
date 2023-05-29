import Block, { BlockType } from './block';
import Collider from './collider';
import Game from './game';

export enum ItemType {
	Block,
	Weapon,
}

// Right now an "item" is just a dropped entity in the world.

/**
 * Controls an individual block.
 */
export default class Item {
	// item type
	public type: ItemType;
	public subtype: BlockType; // this can become a union type later. // try to base what this is on type (above)

	public collider: Collider;

	get x(): number {
		return this.collider.x;
	}

	get y(): number {
		return this.collider.y;
	}

	set x(x: number) {
		this.collider.x = x;
	}

	set y(y: number) {
		this.collider.y = y;
	}

	get width(): number {
		return this.collider.width;
	}

	get height(): number {
		return this.collider.height;
	}

	set width(width: number) {
		this.collider.width = width;
	}

	set height(height: number) {
		this.collider.height = height;
	}

	constructor(type: ItemType, subtype: BlockType, x: number, y: number) {
		this.type = type;
		this.subtype = subtype;

		const size = Block.size * 0.7;
		const halfSize = size / 2;

		this.collider = new Collider(x - halfSize, y - halfSize, size, size);
	}

	public toString(): string {
		return `Item: ${this.type}, ${this.subtype} X: ${this.x} Y: ${this.y}`;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		// const matrix = [
		// 	[
		// 		// 0 = empty, 1 = block, //// one day maybe: 2 = same block
		// 		[0,0,0,0],
		// 		// x, y texture offset in blocks
		// 		[9, 3],
		// 	],
		// ];

		// in block tileset this is the coords for block with nothing around it
		const coords = [9, 3];

		const center = Game.instance.camera.getScreenPointAtWorldPoint(
			this.x + this.width / 2,
			this.y + this.height / 2
		);

		const degToRad = Math.PI / 180;

		const degs = 45;

		const rotateInRadians = degs * degToRad;

		ctx.save();

		ctx.translate(center[0], center[1]);
		ctx.rotate(rotateInRadians);
		ctx.translate(-center[0], -center[1]);

		ctx.drawImage(
			Block.blockTextureMap[this.subtype],
			coords[0] * 9,
			coords[1] * 9,
			Block.size,
			Block.size,

			Game.instance.camera.getRenderX(this.x),
			Game.instance.camera.getRenderY(this.y),
			Game.instance.camera.getRenderWidth(this.width),
			Game.instance.camera.getRenderHeight(this.height)
		);

		ctx.restore();
	}

	public update(deltaTime: number): void {
		// gravity
		this.y += 40 * deltaTime;

		// collision
		const blockBelow = Game.instance.getBlockAtWorldPoint(
			this.x + this.width / 2,
			this.y + this.height + 1
		);

		if (blockBelow && blockBelow.type !== BlockType.Empty) {
			this.y = blockBelow.y - this.height;
		}
	}
}
