export default class Camera {
	public x = 0;
	public y = 0;

	public zoom = 2;
	private minZoom = 2;
	private maxZoom = 5;

	constructor() {
		document.addEventListener('wheel', (e) => {
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
	}

	/**
	 * Returns the render x coordinate based on the camera position and zoom.
	 */
	public getRenderX(x: number): number {
		return (x - this.x) * this.zoom;
	}

	/**
	 * Returns the render y coordinate based on the camera position and zoom.
	 */
	public getRenderY(y: number): number {
		return (y - this.y) * this.zoom;
	}

	/**
	 * Returns the render width based on the camera zoom.
	 */
	public getRenderWidth(width: number): number {
		return width * this.zoom;
	}

	/**
	 * Returns the render height based on the camera zoom.
	 */
	public getRenderHeight(height: number): number {
		return height * this.zoom;
	}

	public move(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	public zoomIn(): void {
		this.zoom = Math.min(this.zoom + 0.25, this.maxZoom);
	}

	public zoomOut(): void {
		this.zoom = Math.max(this.zoom - 0.25, this.minZoom);
	}
}
