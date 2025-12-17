import type { MainType } from '../../types/MainType';
import classNames from 'classnames';

export const Main = ({
  shownTodos,
  onUpdate,
  editFieldVal,
  onEditFieldVal,
  editInputVal,
  onEditInputVal,
  onEditHandle,
  onDelete,
  loadId,
  onLoadId,
  load,
  inputMainFocus,
}: MainType) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {/* This todo is an active todo */}
      {shownTodos.map(item => (
        <div
          data-cy="Todo"
          className={classNames('todo', {
            completed: item.completed,
            active: !item.completed,
          })}
          key={item.id}
        >
          {/* eslint-disable jsx-a11y/label-has-associated-control */}
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={item.completed}
              onChange={() => onUpdate({ ...item, completed: !item.completed })}
            />
          </label>

          {editFieldVal === item.id && (
            <input
              data-cy="TodoTitleField"
              ref={inputMainFocus}
              type="text"
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              value={editInputVal}
              onChange={e => {
                onEditInputVal(e.target.value);
              }}
              onBlur={async () => {
                await onEditHandle(item);
              }}
              onKeyUp={async e => {
                if (e.key === 'Enter') {
                  await onEditHandle(item);
                }

                if (e.key === 'Escape') {
                  onEditFieldVal(null);
                }
              }}
            />
          )}

          {editFieldVal !== item.id && (
            <span
              data-cy="TodoTitle"
              className="todo__title"
              onDoubleClick={() => {
                onEditFieldVal(item.id);
                onEditInputVal(item.title);
              }}
            >
              {item.title}
            </span>
          )}

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={async () => {
              onLoadId(item.id);
              try {
                await onDelete(item.id);
              } catch {
                // eslint-disable-next-line no-console
                console.error('Error delete');
              } finally {
                onLoadId(null);
              }
            }}
          >
            ×
          </button>
          <div
            data-cy="TodoLoader"
            className={classNames('modal overlay', {
              'is-active': loadId === item.id,
            })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      ))}

      {load && <div className="loader" />}
    </section>
  );
};
