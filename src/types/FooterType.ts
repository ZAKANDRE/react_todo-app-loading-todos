import { FilterBtn } from './Filter';
import type { Todo } from './Todo';

export type FooterType = {
  todosItemsList: Todo[];
  filtered: FilterBtn;
  onFiltred: (value: FilterBtn) => void;
  onDeleteAll: () => void;
};
