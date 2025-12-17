import classNames from 'classnames';
import type { HeaderType } from '../../types/HeaderType';

import { USER_ID } from '../../api/todos';

export const Header = ({
  onVal,
  todosItemsList,
  onAllItems,
  onChangeVal,
  onTodoList,
  onUpdate,
  onAdd,
  onError,
}: HeaderType) => {
  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      <button
        type="button"
        className={classNames('todoapp__toggle-all', {
          active: onAllItems,
        })}
        data-cy="ToggleAllButton"
        onClick={() => {
          const selected = !onAllItems;

          onTodoList(
            todosItemsList.map(item => ({
              ...item,
              completed: selected,
            })),
          );

          todosItemsList.forEach(todo => {
            if (todo.completed !== selected) {
              onUpdate({ ...todo, completed: selected });
            }
          });
        }}
      />

      {/* Add a todo on form submit */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (onVal === '') {
            onError('Title should not be empty');
          } else {
            onAdd({
              completed: false,
              title: onVal,
              userId: USER_ID,
            });
          }
        }}
      >
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={onVal}
          onChange={e => {
            onChangeVal(e.target.value);
          }}
        />
      </form>
    </header>
  );
};
