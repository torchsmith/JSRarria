import { getItemTypeName, getItemTypeKeyById, ItemTypeEnum } from './item';
import Player, { Inventory } from './player';

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
		textElement.style.webkitTextFillColor = color;
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

	public updateInventory(inventory: Inventory, player: Player): void {
		this.inventory.innerHTML = '';

		Object.keys(inventory).forEach((key, index, arr) => {
			const item = document.createElement('button');
			item.classList.add('item');

			if (player.selectedItem === Number(key)) item.classList.add('selected');

			const keyAsItemTypeEnum = Number(key) as ItemTypeEnum;

			item.innerText = `${getItemTypeName(keyAsItemTypeEnum)}: ${
				inventory[keyAsItemTypeEnum]
			}`;

			this.inventory.appendChild(item);

			if (index !== arr.length - 1) {
				const divider = document.createElement('div');
				divider.classList.add('divider');
				this.inventory.appendChild(divider);
			}

			item.addEventListener('click', () => {
				const itemType = getItemTypeKeyById(keyAsItemTypeEnum);

				if (!itemType) return;

				player.selectItem(keyAsItemTypeEnum);
			});
		});
	}

	public selectItem(item: ItemTypeEnum | false): void {
		const items = document.querySelectorAll('.item');

		items.forEach((itemElement) => {
			itemElement.classList.remove('selected');
		});

		if (!item) return;

		const itemElement = document.querySelector(`.item:nth-of-type(${item})`);

		if (!itemElement) return;

		itemElement.classList.add('selected');
	}

	public openInventory(): void {
		this.inventory.classList.add('open');
	}

	public closeInventory(): void {
		this.inventory.classList.remove('open');
	}

	public toggleInventory(): void {
		this.inventory.classList.toggle('open');
	}
}
