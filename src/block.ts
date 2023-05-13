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
	// block type
	public type: BlockType;

	public static blockTextureMap: CanvasImageSource;

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
			Block.blockTextureMap = new Image();
			Block.blockTextureMap.src = './assets/TileSheet.png';
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
			// Top left
			[
				// 0 = empty, 1 = block, //// one day maybe: 2 = same block
				[0, 1, 1, 0],
				// x, y texture offset in blocks
				[0, 0],
			],
			// Top middle
			[
				[0, 1, 1, 1],
				[1, 0],
			],
			// Top right
			[
				[0, 0, 1, 1],
				[2, 0],
			],
			// Middle left
			[
				[1, 1, 1, 0],
				[0, 1],
			],
			// Middle middle
			[
				[1, 1, 1, 1],
				[1, 1],
			],
			// Middle right
			[
				[1, 0, 1, 1],
				[2, 1],
			],
			// Bottom left
			[
				[1, 1, 0, 0],
				[0, 2],
			],
			// Bottom middle
			[
				[1, 1, 0, 1],
				[1, 2],
			],
			// Bottom right
			[
				[1, 0, 0, 1],
				[2, 2],
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
			Block.blockTextureMap,
			(this.type - 1) * 24 + coords[0] * 8,
			coords[1] * 8,
			8,
			8,
			this.x * 8 * Game.instance.zoom,
			this.y * 8 * Game.instance.zoom,
			8 * Game.instance.zoom,
			8 * Game.instance.zoom
		);
	}
}
