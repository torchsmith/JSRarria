import Block, { BlockType } from './block';
import Game from './game';

/**
 * Controls a chunk of blocks.
 */
export default class Chunk {
	public blocks: Block[][] = [];
	public x: number;
	public y: number;

	constructor(size: number, x: number, y: number) {
		this.x = x;
		this.y = y;

		for (let x = this.x * size; x < this.x * size + size; ++x) {
			this.blocks.push([]);

			const height = this.getHeight(x);

			for (let y = this.y * size; y < this.y * size + size; ++y) {
				// empty space above height
				// grass at height
				// dirt under height

				if (y < height)
					this.blocks[x - this.x * size].push(
						new Block(BlockType.Empty, x, y, this)
					);
				else if (y > height)
					this.blocks[x - this.x * size].push(
						new Block(BlockType.Dirt, x, y, this)
					);
				else
					this.blocks[x - this.x * size].push(
						new Block(BlockType.Grass, x, height, this)
					);
			}
		}
	}

	public getBlock(x: number, y: number): Block {
		return this.blocks?.[x]?.[y];
	}

	public render(ctx: CanvasRenderingContext2D): void {
		for (let x = 0; x < this.blocks.length; ++x) {
			for (let y = 0; y < this.blocks[x].length; ++y) {
				this.blocks[x][y].render(ctx);
			}
		}
	}

	public toString(): string {
		return `Chunk: ${this.blocks.length}x${this.blocks[0].length}`;
	}

	private getHeight(x: number): number {
		// Factor1 = -3.2
		// FactorPi = 1.9
		// FactorE = -1.2
		// FactorTotal = 0.3
		// Scale1 = -1.3
		// ScalePi = 0.8
		// ScaleE = 0.5
		// g(x)=FactorTotal (Factor1 sin(Scale1 x)+FactorE sin(ScaleE ℯ x)+FactorPi sin(ScalePi π x))

		// create height map for world
		// use whole numbers for height
		const factor1 = -3.2;
		const factorPi = 1.9;
		const factorE = -1.2;
		const factorTotal = 0.3;
		const scale1 = 0.1;
		const scalePi = 0.4;
		const scaleE = -1.1;

		let height =
			factorTotal *
			(factor1 * Math.sin(scale1 * x) +
				factorE * Math.sin(scaleE * Math.E * x) +
				factorPi * Math.sin(scalePi * Math.PI * x));

		height = Math.floor(height) + Game.instance.worldBaseHeight;

		return height;
	}

	public generate(): void {}
}
