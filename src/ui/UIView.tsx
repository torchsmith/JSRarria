import type { Component } from 'solid-js';
import { ItemTypeEnum, getItemTypeName } from '../item';
import { SetStoreFunction } from 'solid-js/store';
import { InventoryStore } from '../ui';

type UIViewProps = {
	inventory: [get: InventoryStore, set: SetStoreFunction<InventoryStore>];
};

const UIView: Component<UIViewProps> = ({
	inventory: [{ inventory, open: inventoryOpen }],
}) => {
	console.log({ inventory, inventoryOpen });
	return (
		<div>
			<div
				id='inventory'
				class={`${inventoryOpen ? 'open' : ''}`}
			>
				{Object.keys(inventory).map((key, index, arr) => {
					const keyAsItemTypeEnum = Number(key) as ItemTypeEnum;

					return (
						<div>
							<button class={`item ${index === 0 ? 'selected' : ''}`}>
								{getItemTypeName(keyAsItemTypeEnum)}:{' '}
								{inventory[keyAsItemTypeEnum]}
							</button>
							{index !== arr.length - 1 && <div class='divider'></div>}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default UIView;
