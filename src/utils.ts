export function lerp(a: number, b: number, alpha: number) {
	return a + alpha * (b - a);
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
