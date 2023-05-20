export default class Input {
	public static keys: { [key: string]: boolean } = {};
	public static mouse: { x: number; y: number } = { x: 0, y: 0 };
	public static mouseDown: { [key: number]: boolean } = {};

	// onMouseMove delegate function
	public static onMouseMove: ((x: number, y: number) => void)[] = [];

	// onMouseDown delegate function
	public static onMouseDown: [number, (x: number, y: number) => void][] = [];

	// onMouseUp delegate function
	public static onMouseUp: [number, (x: number, y: number) => void][] = [];

	// onKeyDown delegate function
	public static onKeyDown: [string, () => void][] = [];

	// onKeyUp delegate function
	public static onKeyUp: [string, () => void][] = [];

	public static cursorElement: HTMLDivElement;

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

			for (let i = 0; i < Input.onMouseMove.length; ++i) {
				Input.onMouseMove[i](e.clientX, e.clientY);
			}
		});

		document.addEventListener('mousedown', (e) => {
			// does not repeat like keydown :)
			Input.mouseDown[e.button] = true;

			for (let i = 0; i < Input.onMouseDown.length; ++i) {
				if (Input.onMouseDown[i][0] === e.button) {
					Input.onMouseDown[i][1](e.clientX, e.clientY);
				}
			}
		});

		document.addEventListener('mouseup', (e) => {
			Input.mouseDown[e.button] = false;

			for (let i = 0; i < Input.onMouseUp.length; ++i) {
				if (Input.onMouseUp[i][0] === e.button) {
					Input.onMouseUp[i][1](e.clientX, e.clientY);
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
