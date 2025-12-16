/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID, getTodos } from './api/todos';
import type { Todo } from './types/Todo';
import * as postService from './api/todos';
import classNames from 'classnames';

export const App: React.FC = () => {

  const [todosList, setTodosList] = useState<Todo[]>([]);
  const [value, setValue] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [editField, setEditField] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    getTodos()
      .then(setTodosList)
      .catch(() => {
        setLoadingError('Unable to load todos');
      });
  }, []);

  useEffect(() => {
    if (editField !== null) {
      inputRef.current?.focus();
    }
  }, [editField]);

  useEffect(() => {
    if(loadingError === null){
      return;
    }

    const timer = setTimeout(() => {
      setLoadingError(null);
    },3000)
    return () =>  clearTimeout(timer);
  },[loadingError])

  if (!USER_ID) {
    return <UserWarning />;
  }

  function deleteTodo(todoId: number) {
    return postService
      .deleteTodo(todoId)
      .then(() => {
        setTodosList(currentTodo =>
          currentTodo.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => setLoadingError('Unable to delete a todo'));
  }

  function addTodo({ completed, title, userId }: Omit<Todo, 'id'>) {
    setLoading(true);

    return postService
      .createTodo({ completed, title, userId })
      .then(newTodo => {
        setTodosList(currentTodos => [...currentTodos, newTodo]);
        setValue('');
      })
      .catch(() => {
        setLoadingError('Unable to add a todo');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function updateTodo(updateTodoData: Todo) {
    return postService
      .updateTodo(updateTodoData)
      .then(updatedPost => {
        setTodosList(currentTodo => {
          const newTodos = [...currentTodo];
          const index = newTodos.findIndex(
            post => post.id === updateTodoData.id,
          );

          newTodos.splice(index, 1, updatedPost);

          return newTodos;
        });
      })
      .catch(() => setLoadingError('Unable to update a todo'));
  }

  const displayedTodos =
    filter === 'active'
      ? todosList.filter(item => !item.completed)
      : filter === 'completed'
        ? todosList.filter(item => item.completed)
        : todosList;

  const allCompleted =
    todosList.length > 0 && todosList.every(item => item.completed);

  function deleteCompletedTodos(): void {
    displayedTodos
      .filter(item => item.completed)
      .forEach(item => deleteTodo(item.id));
  }

  const handleSave = async (item: Todo) => {
    setEditField(null);

    return updateTodo({ ...item, title: editValue });
  };

  const editHandle = async (item: Todo) => {
    if (editField === item.id) {
      setLoadingId(item.id);
      try {
        if (editValue.trim() !== '') {
          await handleSave(item);
        } else {
          await deleteTodo(item.id);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: allCompleted,
            })}
            data-cy="ToggleAllButton"
            onClick={() => {
              const selected = !allCompleted;

              setTodosList(
                todosList.map(item => ({
                  ...item,
                  completed: selected,
                })),
              );

              todosList.forEach(todo => {
                if (todo.completed !== selected) {
                  updateTodo({ ...todo, completed: selected });
                }
              });
            }}
          />

          {/* Add a todo on form submit */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (value === '') {
                setLoadingError('Title should not be empty');
              } else {
                addTodo({
                  completed: false,
                  title: value,
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
              value={value}
              onChange={e => {
                setValue(e.target.value);
              }}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {/* This todo is an active todo */}
          {displayedTodos.map(item => (
            <div
              data-cy="Todo"
              className={classNames('todo', {
                completed: item.completed,
                active: !item.completed,
              })}
              key={item.id}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={item.completed}
                  onChange={() =>
                    updateTodo({ ...item, completed: !item.completed })
                  }
                />
              </label>

              {editField === item.id && (
                <input
                  data-cy="TodoTitleField"
                  ref={inputRef}
                  type="text"
                  className="todo__title-field"
                  placeholder="Empty todo will be deleted"
                  value={editValue}
                  onChange={e => {
                    setEditValue(e.target.value);
                  }}
                  onBlur={async () => {
                    await editHandle(item);
                  }}
                  onKeyUp={async e => {
                    if (e.key === 'Enter') {
                      await editHandle(item);
                    }

                    if (e.key === 'Escape') {
                      setEditField(null);
                    }
                  }}
                />
              )}

              {editField !== item.id && (
                <span
                  data-cy="TodoTitle"
                  className="todo__title"
                  onDoubleClick={() => {
                    setEditField(item.id);
                    setEditValue(item.title);
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
                  setLoadingId(item.id);
                  try {
                    await deleteTodo(item.id);
                  } catch {
                    // eslint-disable-next-line no-console
                    console.error('Error delete');
                  } finally {
                    setLoadingId(null);
                  }
                }}
              >
                ×
              </button>
              <div
                data-cy="TodoLoader"
                className={classNames('modal overlay', {
                  'is-active': loadingId === item.id,
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}

          {loading && <div className="loader" />}
        </section>

        {/* Hide the footer if there are no todos */}
        {todosList.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todosList.length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filter === 'all',
                })}
                data-cy="FilterLinkAll"
                onClick={() => setFilter('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filter === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => {
                  setFilter('active');
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filter === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => {
                  setFilter('completed');
                }}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={todosList.filter(item => item.completed).length === 0}
              onClick={() => {
                deleteCompletedTodos();
              }}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: loadingError === null,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setLoadingError(null)}
        />
        {/* show only one message at a time */}
        {loadingError}
      </div>
    </div>
  );
};
