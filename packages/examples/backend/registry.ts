import { actor, setup } from "rivetkit"

interface Todo {
	id: string
	title: string
	done: boolean
}

export const counter = actor({
	state: { count: 0, countDouble: 3 },
	onStateChange: (c, newState) => {
		console.log("state changed", JSON.stringify(newState))
		console.log("previous state", JSON.stringify(c.state))
	},
	actions: {
		increment: (c, x: number) => {
			console.log("incrementing by", x)
			c.state.count += x
			c.broadcast("newCount", c.state.count)
			return c.state.count
		},
		getCount: (c) => {
			return c.state.count
		},
		getCountDouble: (c) => {
			return c.state.countDouble
		},
		reset: (c) => {
			c.state.count = 0
			c.state.countDouble = 3
			c.broadcast("newCount", c.state.count)
			c.broadcast("newDoubleCount", c.state.countDouble)
			return c.state.count
		},
		doubleIncrement: (c, y: number) => {
			console.log('incrementing by ', y)
			c.state.countDouble += y
			c.broadcast("newDoubleCount", c.state.countDouble)
			return c.state.countDouble
		},
	},
})

export const todoList = actor({
	state: { todos: [] as Todo[], nextId: 1 },
	actions: {
		getTodos: (c) => c.state.todos,
		addTodo: (c, title: string) => {
			const todo: Todo = {
				id: String(c.state.nextId++),
				title,
				done: false,
			}
			c.state.todos.push(todo)
			c.broadcast("todoListUpdate", { data: todo, type: "created" })
			return todo
		},
		toggleTodo: (c, id: string) => {
			const todo = c.state.todos.find((t) => t.id === id)
			if (!todo) throw new Error("Todo not found")
			todo.done = !todo.done
			c.broadcast("todoListUpdate", { data: { ...todo }, type: "updated" })
			return todo
		},
		removeTodo: (c, id: string) => {
			const idx = c.state.todos.findIndex((t) => t.id === id)
			if (idx === -1) throw new Error("Todo not found")
			const [removed] = c.state.todos.splice(idx, 1)
			c.broadcast("todoListUpdate", { data: removed, type: "deleted" })
			return removed
		},
	},
})

export const registry = setup({
	use: { counter, todoList },
})

export type Registry = typeof registry
export type CounterActor = typeof counter