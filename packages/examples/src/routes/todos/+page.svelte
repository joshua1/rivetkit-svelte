<script lang="ts">
  import { useActor } from '$/lib';
  import { crudTransform } from '@blujosi/rivetkit-svelte';

  interface Todo {
    id: string;
    title: string;
    done: boolean;
  }

  const todoActor = useActor?.({
    name: 'todoList',
    key: ['demo-todos'],
  });

  const todosQuery = todoActor?.useQuery<Todo[]>({
    action: 'getTodos',
    event: 'todoListUpdate',
    initialValue: [],
    transform: crudTransform<Todo>({ key: 'id' }),
  });

  const todos = $derived(todosQuery?.value ?? []);

  let newTitle = $state('');

  const addTodo = async () => {
    const title = newTitle.trim();
    if (!title) return;
    newTitle = '';
    await todoActor?.current?.connection?.addTodo(title);
  };

  const toggleTodo = async (id: string) => {
    await todoActor?.current?.connection?.toggleTodo(id);
  };

  const removeTodo = async (id: string) => {
    await todoActor?.current?.connection?.removeTodo(id);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };
</script>

<h2>Todo List (CRUD Transform Demo)</h2>
<p>
  <em
    >Uses <code>crudTransform</code> to incrementally update the list via actor events.</em
  >
</p>

<div class="add-form">
  <input
    type="text"
    placeholder="What needs to be done?"
    bind:value={newTitle}
    onkeydown={handleKeydown}
  />
  <button onclick={addTodo} disabled={!newTitle.trim()}>Add</button>
</div>

{#if todosQuery?.isLoading}
  <p>Loading...</p>
{:else if todos.length === 0}
  <p class="empty">No todos yet. Add one above!</p>
{:else}
  <ul class="todo-list">
    {#each todos as todo (todo.id)}
      <li class:done={todo.done}>
        <label>
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => toggleTodo(todo.id)}
          />
          <span>{todo.title}</span>
        </label>
        <button class="remove" onclick={() => removeTodo(todo.id)}>✕</button>
      </li>
    {/each}
  </ul>
{/if}

{#if todosQuery?.error}
  <p style="color: red">Error: {todosQuery.error.message}</p>
{/if}

<style>
  .add-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .add-form input {
    flex: 1;
    padding: 0.5rem;
    font-size: 1rem;
  }
  .add-form button {
    padding: 0.5rem 1rem;
  }
  .todo-list {
    list-style: none;
    padding: 0;
  }
  .todo-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  .todo-list li.done span {
    text-decoration: line-through;
    opacity: 0.6;
  }
  .todo-list label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #c00;
    padding: 0.25rem 0.5rem;
  }
  .empty {
    color: #888;
    font-style: italic;
  }
</style>
