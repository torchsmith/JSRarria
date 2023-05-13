import Block, { BlockType } from './block';
import Stats from 'stats.js';
import Chunk from './chunk';

export default class Game {
	/**
	 * Singleton instance.
	 */
	public static instance: Game;

	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;

	/**
	 * Camera zoom.
	 */
	public zoom = 2;
	private minZoom = 2;
	private maxZoom = 5;

	/**
	 * World width and height in chunks.
	 */
	private worldWidth = 10;
	private worldHeight = 2;
	public chunkSize = 30;

	/**
	 * Offset ground base height.
	 */
	public worldBaseHeight = 10;

	/**
	 * Only loaded chunks.
	 *
	 * Unloaded chunks are not stored in this array. They are generated on the fly when needed and the array is updated.
	 * This is to save memory.
	 *
	 * Chunks that are loaded are in view of the player. Chunks that are not loaded are not in view of the player.
	 *
	 */
	private chunks: Chunk[][] = [];

	public stats: Stats | undefined;

	constructor(stats: boolean = false) {
		if (Game.instance) throw new Error('Game already exists!');

		Game.instance = this;

		if (stats) {
			this.stats = new Stats();
			this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
			this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
			this.stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
			document.body.appendChild(this.stats.dom);
		}

		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

		this.resize();

		window.addEventListener('resize', this.resize.bind(this));

		window.addEventListener('wheel', (e) => {
			if (e.deltaY > 0 && this.zoom > this.minZoom) {
				this.zoom -= 0.25;
			} else if (e.deltaY < 0 && this.zoom < this.maxZoom) {
				this.zoom += 0.25;
			}

			// TODO: Generate new chunks if needed when zooming in/out (and moving) to fill the screen and some extra (so there is no empty space)

			// how many blocks are fully visible
			// const blocksX = Math.floor(this.canvas.width / (8 * this.zoom));
			// const blocksY = Math.floor(this.canvas.height / (8 * this.zoom));

			// // how many chunks
			// const chunksX = Math.ceil(blocksX / this.chunkSize);
			// const chunksY = Math.ceil(blocksY / this.chunkSize);

			// // how many blocks are visible in the last chunk
			// const lastChunkBlocksX = blocksX % this.chunkSize;
			// const lastChunkBlocksY = blocksY % this.chunkSize;

			// // if more than half of the last chunk is visible, add one more chunk
			// if (lastChunkBlocksX > this.chunkSize / 2) {
			// 	// Generate new chunks
			// 	// Figure out if needed on left or right
			// }

			// if (lastChunkBlocksY > this.chunkSize / 2) {
			// 	// Generate new chunks
			// 	// Figure out if needed on left or right
			// }

			// IMPORTANT: Make logic reusable for when moving as well as zooming

			console.log('new zoom', this.zoom);
		});

		this.canvas.addEventListener('click', this.onClick.bind(this));
	}

	private onClick(e: MouseEvent): void {
		const x = Math.floor(e.offsetX / (8 * this.zoom));
		const y = Math.floor(e.offsetY / (8 * this.zoom));

		const block = this.getBlock(x, y);

		if (block) {
			block.setType(BlockType.Empty);
		}

		console.log('click', x, y);
	}

	public getChunk(x: number, y: number): Chunk | undefined {
		const chunk =
			this.chunks?.[Math.floor(x / this.chunkSize)]?.[
				Math.floor(y / this.chunkSize)
			];

		return chunk;
	}

	public getBlock(x: number, y: number): Block | undefined {
		const chunk = this.getChunk(x, y);

		return chunk?.getBlock(
			x - chunk.x * this.chunkSize,
			y - chunk.y * this.chunkSize
		);
	}

	/**
	 * Initialize the game.
	 */
	private init(): void {
		for (let x = 0; x < this.worldWidth; x++) {
			this.chunks.push([]);

			for (let y = 0; y < this.worldHeight; y++) {
				this.chunks[x].push(new Chunk(this.chunkSize, x, y));
			}
		}
		// Keep things pixelated
		this.ctx.imageSmoothingEnabled = false;
	}

	/**
	 * Render the game. This contains all the rendering logic.
	 */
	private render(): void {
		this.stats?.begin();

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Render visible chunks
		for (let x = 0; x < this.chunks.length; x++) {
			for (let y = 0; y < this.chunks[x].length; y++) {
				this.chunks[x][y].render(this.ctx);
			}
		}

		this.stats?.end();

		// Render next frame
		requestAnimationFrame(() => {
			this.render();
		});
	}

	/**
	 * Update the game. This contains all the game logic.
	 */
	private update(): void {}

	/**
	 * Start the game. This will initialize the game and start the update and render loops.
	 * This should only be called once.
	 * If you want to stop the game, call the stop method.
	 * @see stop
	 * @see init
	 * @see update
	 * @see render
	 */
	public start(): void {
		this.init();
		this.update();
		this.render();
	}

	/**
	 * Stop the game. This will stop the update and render loops and remove the canvas from the DOM.
	 * This should only be called once.
	 * If you want to start the game, call the start method.
	 * @see start
	 */
	public stop(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		cancelAnimationFrame(0);

		this.canvas.remove();

		Game.instance = undefined as any;

		console.log('Game stopped');
	}

	/**
	 * Resize the canvas to the window size.
	 * This should be called when the window is resized.
	 */
	public resize(): void {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		// Keep things pixelated when resizing
		this.ctx.imageSmoothingEnabled = false;
	}
}
