import Chunk from './chunk';
import Game from './game';

export enum BlockType {
	Empty = 0,
	Grass = 1,
	Dirt = 2,
	Wood = 3,
}

/**
 * Controls an individual block.
 */
export default class Block {
	public static readonly size = 8;

	// block type
	public type: BlockType;

	public static blockTextureMap: HTMLImageElement[];

	// block position
	public x: number;
	public y: number;

	public chunk: Chunk;

	constructor(type: BlockType, x: number, y: number, chunk: Chunk) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.chunk = chunk;

		if (!Block.blockTextureMap) {
			Block.blockTextureMap = [];
			// Loop through all block types
			for (let i = 1; i < Object.keys(BlockType).length / 2; ++i) {
				Block.blockTextureMap.push(new Image());
				Block.blockTextureMap[i - 1].src = `./assets/blocks/block-${i}.png`;
			}
		}
	}

	public getType(): BlockType {
		return this.type;
	}

	public setType(type: BlockType): void {
		this.type = type;
	}

	public getX(): number {
		return this.x;
	}

	public getY(): number {
		return this.y;
	}

	public setX(x: number): void {
		this.x = x;
	}

	public setY(y: number): void {
		this.y = y;
	}

	public toString(): string {
		return `Block: ${this.type} X: ${this.x} Y: ${this.y}`;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		if (this.type === BlockType.Empty) return;

		const blockAbove = Game.instance.getBlock(this.x, this.y - 1);
		const blockBelow = Game.instance.getBlock(this.x, this.y + 1);
		const blockLeft = Game.instance.getBlock(this.x - 1, this.y);
		const blockRight = Game.instance.getBlock(this.x + 1, this.y);

		const matrix = [
			[
				// 0 = empty, 1 = block, //// one day maybe: 2 = same block
				[1, 1, 1, 0],
				// x, y texture offset in blocks
				[0, 0],
			],
			[
				[0, 1, 1, 1],
				[1, 0],
			],
			[
				[1, 0, 1, 1],
				[4, 0],
			],
			[
				[1, 1, 0, 1],
				[1, 2],
			],
			[
				[1, 1, 1, 1],
				[1, 1],
			],
			[
				[0, 1, 1, 0],
				[0, 3],
			],
			[
				[0, 0, 1, 1],
				[1, 3],
			],
			[
				[1, 1, 0, 0],
				[0, 4],
			],
			[
				[1, 0, 0, 1],
				[1, 4],
			],
			[
				[1, 0, 1, 0],
				[5, 0],
			],
			[
				[0, 0, 1, 0],
				[6, 0],
			],
			[
				[1, 0, 0, 0],
				[6, 3],
			],
			[
				[0, 1, 0, 0],
				[9, 0],
			],
			[
				[0, 0, 0, 0],
				[9, 3],
			],
			[
				[0, 0, 0, 1],
				[12, 0],
			],
			[
				[0, 1, 0, 1],
				[6, 4],
			],
		];

		let coords = matrix.find((mat) => {
			return mat[0].every((val, i) => {
				switch (i) {
					case 0:
						return val === (blockAbove?.type !== BlockType.Empty ? 1 : 0);
					case 1:
						return val === (blockRight?.type !== BlockType.Empty ? 1 : 0);
					case 2:
						return val === (blockBelow?.type !== BlockType.Empty ? 1 : 0);
					case 3:
						return val === (blockLeft?.type !== BlockType.Empty ? 1 : 0);
				}

				return false;
			});
		})?.[1] || [0, 0];

		ctx.drawImage(
			Block.blockTextureMap[this.type],
			coords[0] * 9,
			coords[1] * 9,
			Block.size,
			Block.size,
			(this.x - Game.instance.camera.x) *
				Block.size *
				Game.instance.camera.zoom,
			(this.y - Game.instance.camera.y) *
				Block.size *
				Game.instance.camera.zoom,
			Block.size * Game.instance.camera.zoom,
			Block.size * Game.instance.camera.zoom
		);
	}
}
