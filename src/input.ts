export default class Input {
	public static instance: Input;
	public static keys: { [key: string]: boolean } = {};
	public static mouse: { x: number; y: number } = { x: 0, y: 0 };
	public static mouseDown: boolean = false;
	public static mouseUp: boolean = false;

	// onKeyDown delegate function
	public static onKeyDown: [string, () => void][] = [];

	// onKeyUp delegate function
	public static onKeyUp: [string, () => void][] = [];

	constructor() {
		if (Input.instance) {
			return Input.instance;
		}

		Input.instance = this;

		this.init();
	}

	private init(): void {
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
