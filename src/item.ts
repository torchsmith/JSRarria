import Block from './block';
import Collider from './collider';
import Game from './game';
import UI from './ui';
import { distance, lerp } from './utils';

// DO NOT CHANGE THESE NUMBERS
// WHEN ADDING BE SURE NOT TO CHANGE THE ORDER
// DO NOT INSERT ITEMS INTO MISSING SPACES (NUMBERS)
// MISSING SPACES (NUMBERS) = DELETED ITEMS THAT SHOULD NOT BE REPLACED WITH NEW ITEMS

// B = Block
// T = Tool

export const ItemType = {
	B_Empty: 0,
	B_Grass: 1,
	B_Dirt: 2,
	B_Wood: 3,
	T_WoodenPickaxe: 4,
} as const;

type ValueOf<T> = T[keyof T];

export type ItemTypeEnum = ValueOf<typeof ItemType>;

export function getItemTypeKeyById(id: number): string | false {
	switch (id) {
		case ItemType.B_Empty:
			return 'B_Empty';
		case ItemType.B_Grass:
			return 'B_Grass';
		case ItemType.B_Dirt:
			return 'B_Dirt';
		case ItemType.B_Wood:
			return 'B_Wood';
		case ItemType.T_WoodenPickaxe:
			return 'T_WoodenPickaxe';
		default:
			return false;
	}
}

export function getItemTypeName(itemType: ItemTypeEnum) {
	switch (itemType) {
		case ItemType.B_Empty:
			return 'Empty';
		case ItemType.B_Grass:
			return 'Grass';
		case ItemType.B_Dirt:
			return 'Dirt';
		case ItemType.B_Wood:
			return 'Wood';
		case ItemType.T_WoodenPickaxe:
			return 'Wooden Pickaxe';
		default:
			return 'Unknown';
	}
}

/**
 * A dropped entity in the world
 */
export default class Item {
	// item type
	public type: ItemTypeEnum;

	public collider: Collider;

	get x(): number {
		return this.collider.x;
	}

	get y(): number {
		return this.collider.y;
	}

	set x(x: number) {
		this.collider.x = x;
	}

	set y(y: number) {
		this.collider.y = y;
	}

	get width(): number {
		return this.collider.width;
	}

	get height(): number {
		return this.collider.height;
	}

	set width(width: number) {
		this.collider.width = width;
	}

	set height(height: number) {
		this.collider.height = height;
	}

	constructor(type: ItemTypeEnum, x: number, y: number) {
		this.type = type;

		const size = Block.size * 0.7;
		const halfSize = size / 2;

		this.collider = new Collider(x - halfSize, y - halfSize, size, size);
	}

	public toString(): string {
		return `Item: ${this.type} X: ${this.x} Y: ${this.y}`;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		// const matrix = [
		// 	[
		// 		// 0 = empty, 1 = block, //// one day maybe: 2 = same block
		// 		[0,0,0,0],
		// 		// x, y texture offset in blocks
		// 		[9, 3],
		// 	],
		// ];

		// in block tileset this is the coords for block with nothing around it
		const coords = [9, 3];

		const center = Game.instance.camera.getScreenPointAtWorldPoint(
			this.x + this.width / 2,
			this.y + this.height / 2
		);

		const degToRad = Math.PI / 180;

		const degs = 45;

		const rotateInRadians = degs * degToRad;

		ctx.save();

		ctx.translate(center[0], center[1]);
		ctx.rotate(rotateInRadians);
		ctx.translate(-center[0], -center[1]);

		ctx.drawImage(
			Block.blockTextureMap[this.type],
			coords[0] * 9,
			coords[1] * 9,
			Block.size,
			Block.size,

			Game.instance.camera.getRenderX(this.x),
			Game.instance.camera.getRenderY(this.y),
			Game.instance.camera.getRenderWidth(this.width),
			Game.instance.camera.getRenderHeight(this.height)
		);

		ctx.restore();
	}

	public update(deltaTime: number): void {
		const player = Game.instance.getPlayer(0);
		const distanceToPlayer = distance(player.midX, player.midY, this.x, this.y);
		if (distanceToPlayer < 100) {
			if (distanceToPlayer < 6) {
				const posAtScreenPoint = Game.instance.getScreenPointAtWorldPoint(
					this.x,
					this.y
				);

				UI.instance.spawnText(
					`+1 ${getItemTypeName(this.type)}`,
					posAtScreenPoint[0],
					posAtScreenPoint[1],
					'#ffffff'
				);
				player.addToInventory(this.type, 1);
				Game.instance.deleteItem(this);
				return;
			}
			this.x = lerp(this.x, player.midX, deltaTime * 10);
			this.y = lerp(this.y, player.midY, deltaTime * 10);
		} else {
			// gravity
			this.y += 40 * deltaTime;
		}

		// collision
		const blockBelow = Game.instance.getBlockAtWorldPoint(
			this.x + this.width / 2,
			this.y + this.height + 1
		);

		if (blockBelow && blockBelow.type !== ItemType.B_Empty) {
			this.y = blockBelow.y - this.height;
		}
	}
}
