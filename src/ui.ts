import {
	ItemType,
	getItemTypeName,
	getItemTypeKeyById,
	ItemTypeEnum,
} from './item';
import { Inventory } from './player';

export default class UI {
	public static instance: UI;

	private ui = document.getElementById('ui')!;
	private inventory = document.getElementById('inventory')!;

	constructor() {
		if (UI.instance) throw new Error('UI is a singleton');

		UI.instance = this;
	}

	public spawnText(
		text: string,
		x: number,
		y: number,
		color: string = 'white',
		duration: number = 500
	): void {
		// text fades up and then fades out
		const textElement = document.createElement('div');
		textElement.classList.add('text');
		textElement.style.color = color;
		textElement.style.left = `${x}px`;
		textElement.style.top = `${y}px`;
		textElement.innerText = text;

		this.ui.appendChild(textElement);

		setTimeout(() => {
			textElement.classList.add('fade-in');
			textElement.classList.add('slide-up');
		}, 0);

		setTimeout(() => {
			textElement.classList.add('fade-out');
		}, duration);

		setTimeout(() => {
			this.ui.removeChild(textElement);
		}, duration + 250);
	}

	public updateInventory(inventory: Inventory): void {
		this.inventory.innerHTML = '';

		for (const key in inventory) {
			const item = document.createElement('div');
			item.classList.add('item');

			const keyAsItemTypeEnum = Number(key) as ItemTypeEnum;

			item.innerText = `${getItemTypeName(keyAsItemTypeEnum)}: ${
				inventory[keyAsItemTypeEnum]
			}`;

			this.inventory.appendChild(item);
		}
	}
}
