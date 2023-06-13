import type { Accessor, Component, Signal } from 'solid-js';
import { Inventory } from '../player';
import { ItemTypeEnum, getItemTypeName } from '../item';

const UIView: Component<{ inventory: Accessor<Inventory> }> = ({
	inventory,
}) => {
	console.log(inventory());
	return (
		<div>
			<div
				id='inventory'
				class='open'
			>
				{Object.keys(inventory()).map((key, index, arr) => {
					const keyAsItemTypeEnum = Number(key) as ItemTypeEnum;

					return (
						<div>
							<button class={`item ${index === 0 ? 'selected' : ''}`}>
								{getItemTypeName(keyAsItemTypeEnum)}:{' '}
								{inventory()[keyAsItemTypeEnum]}
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
