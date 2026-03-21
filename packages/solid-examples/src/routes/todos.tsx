import { Show, For } from "solid-js"
import { useRivetQuery } from "@blujosi/rivetkit-solid/solidstart"
import { useActorFromContext, crudTransform } from "@blujosi/rivetkit-solid"
import { useAuth } from "~/lib/auth-context"

interface Todo {
	id: string
	title: string
	done: boolean
}

export default function TodosPage() {
	const { session, token, user } = useAuth()

	return (
		<div>
			<h2>CRUD Transform Demo</h2>
			<p>
				<em>
					Uses <code>crudTransform</code> to handle create, update, and delete
					events on a list.
				</em>
			</p>

			<Show when={session()?.isPending}>
				<p>Loading session...</p>
			</Show>

			<Show when={!session()?.isPending && !session()?.data}>
				<p>
					<a href="/auth">Sign in</a> to access your todo list.
				</p>
			</Show>

			<Show when={user() && token()}>
				<p>
					Signed in as <strong>{user()!.email}</strong>
				</p>
				<TodoList userId={user()!.id} token={token()!} />
			</Show>
		</div>
	)
}

function TodoList(props: { userId: string; token: string }) {
	const todos = useRivetQuery<Todo[]>({
		actor: "todoList",
		key: ["user-todos", props.userId],
		action: "getTodos",
		event: "todoListUpdate",
		params: { token: props.token },
		transform: crudTransform<Todo>({ key: "id" }),
	})

	const todoActor = useActorFromContext({
		name: "todoList",
		key: ["user-todos", props.userId],
		params: { token: props.token },
	})

	let inputRef!: HTMLInputElement

	const addTodo = async () => {
		const title = inputRef.value.trim()
		if (!title) return
		await todoActor?.current?.connection?.addTodo(title)
		inputRef.value = ""
	}

	const toggle = async (id: string) => {
		await todoActor?.current?.connection?.toggleTodo(id)
	}

	const remove = async (id: string) => {
		await todoActor?.current?.connection?.removeTodo(id)
	}

	return (
		<div>
			<div style={{ display: "flex", gap: "0.5rem", "margin-bottom": "1rem" }}>
				<input
					ref={inputRef}
					type="text"
					placeholder="New todo..."
					onKeyDown={(e) => e.key === "Enter" && addTodo()}
				/>
				<button type="button" onClick={addTodo}>
					Add
				</button>
			</div>

			<Show when={!todos.isLoading()} fallback={<p>Loading todos...</p>}>
				<Show
					when={(todos.data() ?? []).length > 0}
					fallback={<p>No todos yet. Add one above!</p>}
				>
					<ul style={{ "list-style": "none", padding: 0 }}>
						<For each={todos.data()}>
							{(todo) => (
								<li
									style={{
										display: "flex",
										"align-items": "center",
										gap: "0.5rem",
										padding: "0.25rem 0",
									}}
								>
									<input
										type="checkbox"
										checked={todo.done}
										onChange={() => toggle(todo.id)}
									/>
									<span
										style={{
											"text-decoration": todo.done ? "line-through" : "none",
											flex: "1",
										}}
									>
										{todo.title}
									</span>
									<button type="button" onClick={() => remove(todo.id)}>
										×
									</button>
								</li>
							)}
						</For>
					</ul>
				</Show>
			</Show>
		</div>
	)
}
