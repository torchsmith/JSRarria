export default class Collider {
	public x: number;
	public y: number;
	public width: number;
	public height: number;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;

		this.width = width;
		this.height = height;
	}

	public getLeft(): number {
		return this.x;
	}

	public getRight(): number {
		return this.x + this.width;
	}

	public getTop(): number {
		return this.y;
	}

	public getBottom(): number {
		return this.y + this.height;
	}

	public isCollidingWith(other: Collider, axis?: 'x' | 'y'): boolean {
		if (axis === 'x') {
			return (
				this.getLeft() < other.getRight() && this.getRight() > other.getLeft()
			);
		} else if (axis === 'y') {
			return (
				this.getTop() < other.getBottom() && this.getBottom() > other.getTop()
			);
		}

		return (
			this.getLeft() < other.getRight() &&
			this.getRight() > other.getLeft() &&
			this.getTop() < other.getBottom() &&
			this.getBottom() > other.getTop()
		);
	}
}
