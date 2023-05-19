import Chunk from './chunk';
import Collider from './collider';
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

	// Texture map for all block types
	public static blockTextureMap: HTMLImageElement[];

	// block type
	public type: BlockType;

	public collider: Collider;

	// block position in the block grid (not world position)
	public gridX: number;
	public gridY: number;
	public x: number;
	public y: number;

	public chunk: Chunk;

	constructor(type: BlockType, x: number, y: number, chunk: Chunk) {
		this.type = type;
		this.gridX = x;
		this.gridY = y;

		this.x = x * Block.size;
		this.y = y * Block.size;

		this.chunk = chunk;
		this.collider = new Collider(this.x, this.y, Block.size, Block.size);

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
		return this.gridX;
	}

	public getY(): number {
		return this.gridY;
	}

	public setX(x: number): void {
		this.gridX = x;
	}

	public setY(y: number): void {
		this.gridY = y;
	}

	public toString(): string {
		return `Block: ${this.type} X: ${this.gridX} Y: ${this.gridY}`;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		if (this.type === BlockType.Empty) return;

		const blockAbove = Game.instance.getBlock(this.gridX, this.gridY - 1);
		const blockBelow = Game.instance.getBlock(this.gridX, this.gridY + 1);
		const blockLeft = Game.instance.getBlock(this.gridX - 1, this.gridY);
		const blockRight = Game.instance.getBlock(this.gridX + 1, this.gridY);

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

			Math.floor(Game.instance.camera.getRenderX(this.x)),
			Math.floor(Game.instance.camera.getRenderY(this.y)),
			Game.instance.camera.getRenderWidth(Block.size),
			Game.instance.camera.getRenderHeight(Block.size)
		);
	}
}
