import classNames from 'classnames';
import filters from '../../api/filtered.json';
import { FilterBtn } from '../../types/Filter';
import { FooterType } from '../../types/FooterType';

export const Footer = ({
  todosItemsList,
  filtered,
  onFiltred,
  onDeleteAll,
}: FooterType) => {
  return (
    <>
      {todosItemsList.length > 0 && (
        <footer className="todoapp__footer" data-cy="Footer">
          <span className="todo-count" data-cy="TodosCounter">
            {todosItemsList.filter(item => !item.completed).length} items left
          </span>

          {/* Active link should have the 'selected' class */}
          <nav className="filter" data-cy="Filter">
            {filters.map(item => (
              <a
                key={item.id}
                href={`#/${item.useFulName}`}
                className={classNames('filter__link', {
                  selected: filtered === (item.name as FilterBtn),
                })}
                data-cy={`${item.test}`}
                onClick={() => onFiltred(item.name as FilterBtn)}
              >
                {item.name as FilterBtn}
              </a>
            ))}
          </nav>
          {/* this button should be disabled if there are no completed todos */}
          <button
            type="button"
            className="todoapp__clear-completed"
            data-cy="ClearCompletedButton"
            disabled={
              todosItemsList.filter(item => item.completed).length === 0
            }
            onClick={() => onDeleteAll()}
          >
            Clear completed
          </button>
        </footer>
      )}
    </>
  );
};
