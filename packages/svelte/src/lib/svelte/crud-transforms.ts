/**
 * Generic CRUD transform factories for use with `useQuery` and `rivetLoad`.
 *
 * These produce `transform` functions that handle incoming create/update/delete
 * events against a list of items, keyed by an identifier field.
 *
 * @example
 * ```ts
 * const tasks = await rivetLoad(client, {
 *   actor: "taskList",
 *   key: ["my-list"],
 *   action: "getTasks",
 *   event: "taskChanged",
 *   transform: crudTransform<Task>({ key: "id" }),
 * });
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * An incoming event payload that carries a CRUD operation type.
 *
 * Actors should broadcast events in this shape:
 * ```ts
 * c.broadcast("todoListUpdate", { data: todo, type: "created" })
 * ```
 */
export interface CrudEvent<T> {
	data: T
	type: "created" | "updated" | "deleted"
}

/** Options shared by all CRUD transform factories. */
export interface CrudTransformOptions<T> {
	/**
	 * Property name (or accessor) used to uniquely identify items.
	 * Defaults to `"id"`.
	 */
	key?: keyof T | ((item: T) => unknown)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getKey<T>(item: T, key: keyof T | ((item: T) => unknown)): unknown {
	return typeof key === "function" ? key(item) : item[key]
}

// ---------------------------------------------------------------------------
// Individual transforms
// ---------------------------------------------------------------------------

/**
 * Transform for a **create** event.
 * - **Array:** appends the incoming item; duplicates (same key) are ignored.
 * - **Single item:** replaces the current value with the incoming item.
 */
export function createTransform<T>(
	opts: CrudTransformOptions<T> = {},
): <C extends T[] | T>(current: C, incoming: unknown) => C {
	const keyProp = opts.key ?? ("id" as keyof T)
	return ((current: T[] | T, incoming: unknown): T[] | T => {
		const item = incoming as T
		if (Array.isArray(current)) {
			const id = getKey(item, keyProp)
			if (current.some((c) => getKey(c, keyProp) === id)) return current
			return [...current, item]
		}
		return item
	}) as <C extends T[] | T>(current: C, incoming: unknown) => C
}

/**
 * Transform for an **update** event.
 * - **Array:** replaces the matching item in-place; returns unchanged if no match.
 * - **Single item:** replaces the current value with the incoming item.
 */
export function updateTransform<T>(
	opts: CrudTransformOptions<T> = {},
): <C extends T[] | T>(current: C, incoming: unknown) => C {
	const keyProp = opts.key ?? ("id" as keyof T)
	return ((current: T[] | T, incoming: unknown): T[] | T => {
		const item = incoming as T
		if (Array.isArray(current)) {
			const id = getKey(item, keyProp)
			const idx = current.findIndex((c) => getKey(c, keyProp) === id)
			if (idx === -1) return current
			const next = [...current]
			next[idx] = item
			return next
		}
		return item
	}) as <C extends T[] | T>(current: C, incoming: unknown) => C
}

/**
 * Transform for a **delete** event.
 * - **Array:** removes the matching item. `incoming` can be the full item or just the key value.
 * - **Single item:** returns the current value unchanged (cannot delete a scalar).
 */
export function deleteTransform<T>(
	opts: CrudTransformOptions<T> = {},
): <C extends T[] | T>(current: C, incoming: unknown) => C {
	const keyProp = opts.key ?? ("id" as keyof T)
	return ((current: T[] | T, incoming: unknown): T[] | T => {
		if (Array.isArray(current)) {
			const id =
				typeof incoming === "object" && incoming !== null
					? getKey(incoming as T, keyProp)
					: incoming
			return current.filter((c) => getKey(c, keyProp) !== id)
		}
		return current
	}) as <C extends T[] | T>(current: C, incoming: unknown) => C
}

// ---------------------------------------------------------------------------
// Unified CRUD transform
// ---------------------------------------------------------------------------

/**
 * A single transform that handles create, update, and delete events.
 *
 * Incoming payloads must be a `CrudEvent<T>` with `{ data, type }`:
 * ```ts
 * { data: item, type: "created" }
 * { data: item, type: "updated" }
 * { data: item, type: "deleted" }
 * ```
 *
 * Actors should broadcast in this shape:
 * ```ts
 * c.broadcast("todoListUpdate", { data: todo, type: "created" })
 * ```
 *
 * @example
 * ```ts
 * const users = todoActor?.useQuery({
 *   action: "getUsers",
 *   event: "userListUpdate",
 *   initialValue: [],
 *   transform: crudTransform<User>({ key: "id" }),
 * });
 * ```
 */
export function crudTransform<T>(
	opts: CrudTransformOptions<T> = {},
): <C extends T[] | T>(current: C, incoming: CrudEvent<T>) => C {
	const create = createTransform<T>(opts)
	const update = updateTransform<T>(opts)
	const del = deleteTransform<T>(opts)

	return ((current: T[] | T, incoming: CrudEvent<T>): T[] | T => {
		switch (incoming.type) {
			case "created":
				return create(current, incoming.data)
			case "updated":
				return update(current, incoming.data)
			case "deleted":
				return del(current, incoming.data)
			default:
				return current
		}
	}) as <C extends T[] | T>(current: C, incoming: CrudEvent<T>) => C
}
