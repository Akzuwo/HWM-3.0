import { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';
import { resolveApiBase } from '../../utils/js/api-client';

const today = new Date().toISOString().slice(0, 10);
const filters = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'done', label: 'Erledigt' }
];

async function apiFetch(path, options = {}) {
  const base = resolveApiBase();
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(payload?.message || 'request_failed');
  }
  return payload;
}

function createDraft() {
  return {
    beschreibung: '',
    datum: today,
    subtasks: [{ title: '', is_done: false }]
  };
}

function cleanSubtasks(subtasks) {
  return subtasks
    .map((subtask) => ({ title: (subtask.title || '').trim(), is_done: Boolean(subtask.is_done) }))
    .filter((subtask) => subtask.title);
}

function normalizeTodo(todo) {
  const subtasks = Array.isArray(todo.subtasks) ? todo.subtasks : [];
  const allSubtasksDone = subtasks.length > 0 && subtasks.every((subtask) => subtask.is_done);
  return {
    ...todo,
    beschreibung: todo.beschreibung || '',
    datum: todo.datum || today,
    is_done: Boolean(todo.is_done || allSubtasksDone),
    subtasks
  };
}

function todoPayload(todo) {
  return {
    beschreibung: todo.beschreibung,
    datum: todo.datum || today,
    enddatum: todo.datum || today,
    is_done: Boolean(todo.is_done),
    subtasks: cleanSubtasks(todo.subtasks || [])
  };
}

function formatDueDate(value) {
  if (!value) return 'Heute';
  try {
    return new Intl.DateTimeFormat('de-CH', { day: '2-digit', month: '2-digit' }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
}

function sortTodos(a, b) {
  return String(a.datum || '').localeCompare(String(b.datum || '')) || String(a.beschreibung || '').localeCompare(String(b.beschreibung || ''));
}

export function TodoListsPage() {
  usePageSetup({ bodyClass: 'todo-lists-page' });

  const [todos, setTodos] = useState([]);
  const [draft, setDraft] = useState(createDraft);
  const [filter, setFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const subtaskRefs = useRef([]);

  const stats = useMemo(() => {
    const openTodos = todos.filter((todo) => !todo.is_done).length;
    const openSteps = todos.reduce((sum, todo) => {
      if (!todo.subtasks.length) return sum + (todo.is_done ? 0 : 1);
      return sum + todo.subtasks.filter((subtask) => !subtask.is_done).length;
    }, 0);
    return { total: todos.length, openTodos, openSteps };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (filter === 'open') return !todo.is_done;
        if (filter === 'done') return todo.is_done;
        return true;
      })
      .toSorted(sortTodos);
  }, [filter, todos]);

  async function loadTodos() {
    setStatus('loading');
    try {
      const payload = await apiFetch('/api/todos');
      setTodos((payload.data || []).map(normalizeTodo));
      setMessage('');
      setStatus('ready');
    } catch (error) {
      setMessage('Bitte melde dich an, um deine ToDo-Listen zu sehen.');
      setStatus('error');
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateDraftSubtask(index, value) {
    setDraft((current) => ({
      ...current,
      subtasks: current.subtasks.map((subtask, currentIndex) =>
        currentIndex === index ? { ...subtask, title: value } : subtask
      )
    }));
  }

  function removeDraftSubtask(index) {
    setDraft((current) => ({
      ...current,
      subtasks: current.subtasks.length > 1
        ? current.subtasks.filter((_, currentIndex) => currentIndex !== index)
        : [{ title: '', is_done: false }]
    }));
  }

  function handleDraftSubtaskKeyDown(event, index) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    setDraft((current) => {
      const next = [...current.subtasks];
      if (!next[index]?.title.trim()) return current;
      next.splice(index + 1, 0, { title: '', is_done: false });
      return { ...current, subtasks: next };
    });
    window.setTimeout(() => subtaskRefs.current[index + 1]?.focus(), 0);
  }

  function patchTodoLocal(todoId, updater) {
    let nextTodo = null;
    setTodos((current) =>
      current.map((todo) => {
        if (todo.id !== todoId) return todo;
        const patched = normalizeTodo(typeof updater === 'function' ? updater(todo) : { ...todo, ...updater });
        nextTodo = patched;
        return patched;
      })
    );
    return nextTodo;
  }

  async function persistTodo(todo) {
    await apiFetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify(todoPayload(todo))
    });
  }

  async function updateTodoOptimistic(todoId, updater) {
    const previous = todos;
    const nextTodo = patchTodoLocal(todoId, updater);
    if (!nextTodo) return;
    try {
      await persistTodo(nextTodo);
      setMessage('');
    } catch {
      setTodos(previous);
      setMessage('Änderung konnte nicht gespeichert werden.');
    }
  }

  async function submitTodo(event) {
    event.preventDefault();
    const title = draft.beschreibung.trim();
    if (!title) {
      setMessage('Bitte gib deinem ToDo einen Titel.');
      return;
    }

    const subtasks = cleanSubtasks(draft.subtasks);
    const optimisticTodo = normalizeTodo({
      id: `tmp-${Date.now()}`,
      beschreibung: title,
      datum: draft.datum || today,
      is_done: false,
      subtasks
    });

    setTodos((current) => [optimisticTodo, ...current]);
    setDraft(createDraft());
    setStatus('saving');
    try {
      const payload = await apiFetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoPayload(optimisticTodo))
      });
      setTodos((current) => current.map((todo) => (todo.id === optimisticTodo.id ? { ...optimisticTodo, id: payload.id } : todo)));
      setStatus('ready');
      setMessage('');
    } catch {
      setTodos((current) => current.filter((todo) => todo.id !== optimisticTodo.id));
      setStatus('ready');
      setMessage('ToDo konnte nicht erstellt werden.');
    }
  }

  function toggleExpanded(todoId) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(todoId)) next.delete(todoId);
      else next.add(todoId);
      return next;
    });
  }

  function startTitleEdit(todo) {
    setEditingTitleId(todo.id);
    setTitleDraft(todo.beschreibung);
  }

  async function saveTitle(todo) {
    const title = titleDraft.trim();
    setEditingTitleId(null);
    if (!title || title === todo.beschreibung) return;
    await updateTodoOptimistic(todo.id, { beschreibung: title });
  }

  async function toggleTodo(todo) {
    const nextDone = !todo.is_done;
    await updateTodoOptimistic(todo.id, {
      is_done: nextDone,
      subtasks: todo.subtasks.map((subtask) => ({ ...subtask, is_done: nextDone }))
    });
  }

  async function toggleSubtask(todo, subtaskIndex) {
    await updateTodoOptimistic(todo.id, (current) => {
      const subtasks = current.subtasks.map((subtask, index) =>
        index === subtaskIndex ? { ...subtask, is_done: !subtask.is_done } : subtask
      );
      return {
        ...current,
        subtasks,
        is_done: subtasks.length > 0 && subtasks.every((subtask) => subtask.is_done)
      };
    });
  }

  async function deleteTodo(todoId) {
    const previous = todos;
    setTodos((current) => current.filter((todo) => todo.id !== todoId));
    try {
      await apiFetch(`/api/todos/${todoId}`, { method: 'DELETE' });
      setMessage('');
    } catch {
      setTodos(previous);
      setMessage('ToDo konnte nicht gelöscht werden.');
    }
  }

  return (
    <AppLayout>
      <main className="todo-lists todo-lists--compact" id="main">
        <header className="todo-lists__header todo-lists__header--compact">
          <div>
            <h1 className="todo-lists__title">ToDo Listen</h1>
            <p className="todo-lists__lead">Aufgaben schnell erfassen, abhaken und im Blick behalten.</p>
          </div>
          <div className="todo-lists__stats" aria-label="ToDo Übersicht">
            <span>{stats.total} ToDos</span>
            <span>{stats.openSteps} offene Schritte</span>
          </div>
        </header>

        <section className="todo-lists__grid todo-lists__grid--compact">
          <form className="todo-panel todo-form todo-form--compact" onSubmit={submitTodo}>
            <div className="todo-panel__header">
              <h2>Neues ToDo</h2>
            </div>

            <label className="todo-field">
              <span>Titel</span>
              <input
                required
                value={draft.beschreibung}
                onChange={(event) => updateDraft('beschreibung', event.target.value)}
                placeholder="Aufgabe eingeben"
              />
            </label>

            <label className="todo-field">
              <span>Fälligkeitsdatum</span>
              <input type="date" value={draft.datum} onChange={(event) => updateDraft('datum', event.target.value)} />
            </label>

            <div className="todo-subtask-editor">
              <span className="todo-subtask-editor__label">Subtasks</span>
              {draft.subtasks.map((subtask, index) => (
                <div className="todo-subtask-row todo-subtask-row--draft" key={index}>
                  <input
                    ref={(node) => {
                      subtaskRefs.current[index] = node;
                    }}
                    value={subtask.title}
                    onChange={(event) => updateDraftSubtask(index, event.target.value)}
                    onKeyDown={(event) => handleDraftSubtaskKeyDown(event, index)}
                    placeholder={index === 0 ? 'Schritt eingeben, Enter für nächsten' : 'Nächster Schritt'}
                  />
                  <button type="button" aria-label="Subtask entfernen" onClick={() => removeDraftSubtask(index)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button className="todo-lists__primary" type="submit" disabled={status === 'saving'}>
              Erstellen
            </button>
            {message ? <p className="todo-lists__message">{message}</p> : null}
          </form>

          <section className="todo-panel todo-list-panel todo-list-panel--compact" aria-live="polite">
            <div className="todo-list-toolbar">
              <div className="todo-filters" aria-label="ToDo Filter">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={filter === item.id ? 'is-active' : ''}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="todo-sort-label">Nach Datum</span>
            </div>

            {status === 'loading' ? <p className="todo-lists__empty">ToDos werden geladen...</p> : null}
            {status !== 'loading' && visibleTodos.length === 0 ? <p className="todo-lists__empty">Keine passenden ToDos.</p> : null}

            <div className="todo-cards todo-cards--compact" role="list">
              {visibleTodos.map((todo) => {
                const done = todo.subtasks.filter((subtask) => subtask.is_done).length;
                const isExpanded = expandedIds.has(todo.id);
                return (
                  <article
                    className={`todo-card todo-card--compact${todo.is_done ? ' is-done' : ''}${isExpanded ? ' is-expanded' : ''}`}
                    key={todo.id}
                    role="listitem"
                    onClick={() => toggleExpanded(todo.id)}
                  >
                    <div className="todo-card__main">
                      <button
                        className="todo-check"
                        type="button"
                        aria-label={todo.is_done ? 'ToDo wieder öffnen' : 'ToDo erledigen'}
                        aria-pressed={todo.is_done}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleTodo(todo);
                        }}
                      >
                        <span aria-hidden="true">{todo.is_done ? '✓' : ''}</span>
                      </button>

                      <div className="todo-card__content">
                        {editingTitleId === todo.id ? (
                          <input
                            className="todo-title-input"
                            value={titleDraft}
                            autoFocus
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            onBlur={() => saveTitle(todo)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') saveTitle(todo);
                              if (event.key === 'Escape') setEditingTitleId(null);
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="todo-card__title"
                            onClick={(event) => {
                              event.stopPropagation();
                              startTitleEdit(todo);
                            }}
                          >
                            {todo.beschreibung}
                          </button>
                        )}
                        <span className="todo-card__progress">{done}/{todo.subtasks.length || 1} Schritte</span>
                      </div>

                      <time className="todo-card__date" dateTime={todo.datum}>
                        {formatDueDate(todo.datum)}
                      </time>
                      <button
                        className="todo-card__delete"
                        type="button"
                        aria-label="ToDo löschen"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteTodo(todo.id);
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div className="todo-card__subtask-wrap" aria-hidden={!isExpanded}>
                      {todo.subtasks.length ? (
                        <ul className="todo-card__subtasks todo-card__subtasks--compact">
                          {todo.subtasks.map((subtask, index) => (
                            <li className={subtask.is_done ? 'is-done' : ''} key={subtask.id || `${subtask.title}-${index}`}>
                              <button
                                type="button"
                                className="todo-subcheck"
                                aria-label={subtask.is_done ? 'Subtask wieder öffnen' : 'Subtask erledigen'}
                                aria-pressed={subtask.is_done}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSubtask(todo, index);
                                }}
                              >
                                <span aria-hidden="true">{subtask.is_done ? '✓' : ''}</span>
                              </button>
                              <span>{subtask.title}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="todo-card__empty">Keine Subtasks</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </AppLayout>
  );
}
