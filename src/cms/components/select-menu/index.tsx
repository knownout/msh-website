import { SelectMenu } from "./select-menu";

export namespace SelectMenu {
	export interface IProps {
		children: JSX.Element[] | JSX.Element;

		/** Процедура обновления состояния активного элемента в родительском элементе */
		updateSelection?(selection: number): void;

		/** Обработчик события клика на элемент */
		onItemClick?(key: number, name?: string): void;

		/** Переключатель доступности выбора активного элемента в текущем списке */
		selectable?: boolean;

		/** Индекс изначально активного элемента */
		selection?: number;
	}

	export interface IState {
		/** Индекс (ключ) текущего активного элемента */
		selection: number;
	}

	export interface IItemProps {
		/** Иконка перед текстом элемента */
		icon?: string;

		/** Текст элемента */
		children: string;

		/** Дополнительный класс элемента */
		className?: string;

		/** Переключатель доступности элемента */
		readonly?: boolean;
	}
}

export default SelectMenu;
