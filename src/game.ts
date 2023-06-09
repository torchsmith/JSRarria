import Block from './block';
import Stats from 'stats.js';
import Chunk from './chunk';
import Player from './player';
import Input from './input';
import Camera from './camera';
import Item from './item';
import UI from './ui';

export default class Game {
	/**
	 * Singleton instance.
	 */
	public static instance: Game;

	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;

	/**
	 * Camera.
	 */
	public camera: Camera = new Camera();

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

	/**
	 * Player.
	 * TODO: Add multiplayer support.
	 */
	private players: Player[] = [];

	/**
	 * Items
	 */
	private items: Item[] = [];

	/**
	 * Game loop.
	 * TODO: Add multiplayer support.
	 */
	private lastUpdate = 0;
	private updateRate = 60; // updates per second

	public stats: Stats | undefined;

	constructor(stats: boolean = false) {
		if (Game.instance) throw new Error('Game already exists!');

		Game.instance = this;

		// Init UI
		new UI();

		// Init Input
		new Input();

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
	}

	public getPlayer(id: number) {
		return this.players[id];
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

	public getWorldPointAtScreenPoint(
		x: number,
		y: number
	): [x: number, y: number] {
		const worldX =
			(x + this.camera.getX() * this.camera.zoom) / this.camera.zoom; // Times zoom because camera is centered
		const worldY =
			(y + this.camera.getY() * this.camera.zoom) / this.camera.zoom; // Times zoom because camera is centered

		return [worldX, worldY];
	}

	public getScreenPointAtWorldPoint(
		x: number,
		y: number
	): [x: number, y: number] {
		const screenX = (x - this.camera.getX()) * this.camera.zoom; // Times zoom because camera is centered
		const screenY = (y - this.camera.getY()) * this.camera.zoom; // Times zoom because camera is centered

		return [screenX, screenY];
	}

	public getBlockAtScreenPoint(x: number, y: number): Block | undefined {
		const worldX =
			(x + this.camera.getX() * this.camera.zoom) / this.camera.zoom; // Times zoom because camera is centered
		const worldY =
			(y + this.camera.getY() * this.camera.zoom) / this.camera.zoom; // Times zoom because camera is centered

		return this.getBlockAtWorldPoint(worldX, worldY);
	}

	public getBlockAtWorldPoint(x: number, y: number): Block | undefined {
		const blockX = Math.floor(x / Block.size);
		const blockY = Math.floor(y / Block.size);

		return this.getBlock(blockX, blockY);
	}

	/**
	 * Get blocks given an area in world points.
	 */
	public getBlocksInArea(
		x: number,
		y: number,
		width: number,
		height: number
	): Block[] {
		const blocks: Block[] = [];
		const blockCoords: { x: number; y: number }[] = [];

		// get blocks at world points, check every block size pixels to not waste performance
		for (let i = x; i < x + width; i += 1) {
			for (let j = y; j < y + height; j += 1) {
				const block = this.getBlockAtWorldPoint(i, j);

				if (
					block &&
					!blockCoords.find((b) => b.x === block.x && b.y === block.y)
				) {
					blockCoords.push({ x: block.x, y: block.y });
					blocks.push(block);
				}
			}
		}

		return blocks;
	}

	/**
	 * Initialize the game.
	 */
	private init(): void {
		for (let x = 0; x < this.worldWidth; ++x) {
			this.chunks.push([]);

			for (let y = 0; y < this.worldHeight; ++y) {
				this.chunks[x].push(new Chunk(this.chunkSize, x, y));
			}
		}

		this.players.push(new Player(1000, -10));

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
		for (let x = 0; x < this.chunks.length; ++x) {
			for (let y = 0; y < this.chunks[x].length; ++y) {
				this.chunks[x][y].render(this.ctx);
			}
		}

		// Render player
		this.players[0].render(this.ctx);

		for (let x = 0; x < this.items.length; ++x) {
			this.items[x].render(this.ctx);
		}

		this.stats?.end();

		// Render next frame
		requestAnimationFrame(() => {
			const now = Date.now();
			const deltaTime = now - this.lastUpdate;

			this.lastUpdate = now;

			this.update(deltaTime / 1000);
			this.render();
		});
	}

	/**
	 * Add item to the world
	 */
	public addItem(item: Item): void {
		this.items.push(item);
	}

	/**
	 * Delete item from the world
	 */
	public deleteItem(item: Item): void {
		const index = this.items.indexOf(item);

		if (index > -1) {
			this.items.splice(index, 1);
		}
	}

	/**
	 * Update the game. This contains all the game logic.
	 */
	private update(deltaTime: number): void {
		this.players[0].update(deltaTime);

		for (let x = 0; x < this.items.length; ++x) {
			this.items[x].update(deltaTime);
		}
	}

	/**
	 * Update the physics of the game. This contains all the physics logic.
	 * This is called at a fixed rate.
	 */
	private fixedUpdate(): void {}

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

		this.lastUpdate = Date.now();
		this.update(0);

		// Start update loop
		setInterval(() => {
			this.fixedUpdate();
		}, 1000 / this.updateRate);

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
