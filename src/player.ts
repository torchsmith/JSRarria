import Block from './block';
import Game from './game';
import Input from './input';
import { lerp } from './utils';

export default class Player {
	public name = 'Player';
	public health = 0;
	public maxHealth = 100;

	public x;
	public y;

	public forceX = 0;
	public forceY = 0;

	private forceDrag = 0.9;

	constructor(spawnX: number, spawnY: number) {
		this.x = spawnX;
		this.y = spawnY;

		this.init();
	}

	private init(): void {
		this.health = this.maxHealth;

		Input.onKeyDown.push([' ', () => this.jump()]);
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = 'black';

		ctx.fillRect(
			(this.x - Game.instance.camera.x) * Game.instance.camera.zoom,
			(this.y - Game.instance.camera.y) * Game.instance.camera.zoom,
			16 * Game.instance.camera.zoom,
			32 * Game.instance.camera.zoom
		);
	}

	public toString(): string {
		return this.name;
	}

	public update(deltaTime: number): void {
		this.move();

		this.x += this.forceX * deltaTime;
		this.y += this.forceY * deltaTime;

		// gravity
		this.forceY = lerp(this.forceY, 20, deltaTime);

		this.forceX *= this.forceDrag;

		Game.instance.camera.x = this.x;
		Game.instance.camera.y = this.y;
	}

	public move(): void {
		if (Input.keys['d']) {
			this.forceX = Math.min(this.forceX + 3, 10);
		} else if (Input.keys['a']) {
			this.forceX = Math.max(this.forceX - 3, -10);
		}
	}

	public jump(): void {
		this.forceY = -20;
	}

	public attack(): void {}
}
