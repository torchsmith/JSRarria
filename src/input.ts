import { BlockType } from './block';
import Game from './game';

export default class Input {
	public static keys: { [key: string]: boolean } = {};
	public static mouse: { x: number; y: number } = { x: 0, y: 0 };
	public static mouseDown: { [key: number]: boolean } = {};

	// onMouseDown delegate function
	public static onMouseDown: [number, () => void][] = [];

	// onMouseUp delegate function
	public static onMouseUp: [number, () => void][] = [];

	// onKeyDown delegate function
	public static onKeyDown: [string, () => void][] = [];

	// onKeyUp delegate function
	public static onKeyUp: [string, () => void][] = [];

	private static cursorElement: HTMLDivElement;

	constructor() {
		Input.cursorElement = document.getElementById('cursor') as HTMLDivElement;

		this.init();
	}

	private init(): void {
		document.addEventListener('mousemove', (e) => {
			Input.mouse.x = e.clientX;
			Input.mouse.y = e.clientY;

			Input.cursorElement.style.left = `${e.clientX}px`;
			Input.cursorElement.style.top = `${e.clientY}px`;

			// TODO: Should I move this logic somewhere else? (below)
			// TODO: this can't be fast getting a block every frame.
			// TODO: maybe only do it when the mouse moves a certain distance?
			// TODO: Make the cursor smooth (saw some examples using GSAP, maybe look into that)

			const block = Game.instance.getBlockAtScreenPoint(e.clientX, e.clientY);

			if (block && block.type !== BlockType.Empty) {
				Input.cursorElement.classList.add('can-mine');
			} else {
				Input.cursorElement.classList.remove('can-mine');
			}
		});

		document.addEventListener('mousedown', (e) => {
			// does not repeat like keydown :)
			Input.mouseDown[e.button] = true;

			for (let i = 0; i < Input.onMouseDown.length; ++i) {
				if (Input.onMouseDown[i][0] === e.button) {
					Input.onMouseDown[i][1]();
				}
			}
		});

		document.addEventListener('mouseup', (e) => {
			Input.mouseDown[e.button] = false;

			for (let i = 0; i < Input.onMouseUp.length; ++i) {
				if (Input.onMouseUp[i][0] === e.button) {
					Input.onMouseUp[i][1]();
				}
			}
		});

		document.addEventListener('keydown', (e) => {
			// Don't fire keydown events if the key is being held down
			if (e.repeat) return;
			Input.keys[e.key] = true;

			for (let i = 0; i < Input.onKeyDown.length; ++i) {
				if (Input.onKeyDown[i][0] === e.key) {
					Input.onKeyDown[i][1]();
				}
			}
		});

		document.addEventListener('keyup', (e) => {
			// Don't fire keyup events if the key is being held down
			if (e.repeat) return;

			Input.keys[e.key] = false;

			for (let i = 0; i < Input.onKeyUp.length; ++i) {
				if (Input.onKeyUp[i][0] === e.key) {
					Input.onKeyUp[i][1]();
				}
			}
		});
	}
}
