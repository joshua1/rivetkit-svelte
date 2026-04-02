/**
 * Generic CRUD transform factories for use with `useQuery` and `rivetLoad`.
 *
 * These produce `transform` functions that handle incoming create/update/delete
 * events against a collection of items (`T[]`), keyed by an identifier field.
 * `T` is always the **item** type; the state is always `T[]`.
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
	key?: keyof T | ((item: T) => string) | string | number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getKey<T>(item: T, key: keyof T | ((item: T) => unknown) | string | number): unknown {
	if (typeof key === "function") {
		return key(item)
	} else if (typeof key === "string" || typeof key === "number") {
		return (item as any)[key]
	} else {
		return item[key]
	}
}

function resolveId<T>(item: T, key?: keyof T | ((item: T) => string) | string | number): unknown {
	return key != null ? getKey(item, key) : (item as any).id
}

// ---------------------------------------------------------------------------
// Individual transforms
// ---------------------------------------------------------------------------

/**
 * Transform for a **create** event.
 * Appends the incoming item to the collection; duplicates (same key) are ignored.
 */
export function createTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: CrudEvent<T>) => T[] {
	const keyProp = opts.key
	return (current: T[], incoming: CrudEvent<T>): T[] => {
		const item = incoming.data
		const id = resolveId(item, keyProp)
		if (current.some((c) => resolveId(c, keyProp) === id)) return current
		return [...current, item]
	}
}

/**
 * Transform for an **update** event.
 * Replaces the matching item in the collection; returns unchanged if no match.
 */
export function updateTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: CrudEvent<T>) => T[] {
	const keyProp = opts.key
	return (current: T[], incoming: CrudEvent<T>): T[] => {
		const item = incoming.data
		const id = resolveId(item, keyProp)
		const idx = current.findIndex((c) => resolveId(c, keyProp) === id)
		if (idx === -1) return current
		const next = [...current]
		next[idx] = item
		return next
	}
}

/**
 * Transform for a **delete** event.
 * Removes the matching item from the collection. `incoming.data` can be the full item or just the key value.
 */
export function deleteTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: CrudEvent<T>) => T[] {
	const keyProp = opts.key
	return (current: T[], incoming: CrudEvent<T>): T[] => {
		const id =
			typeof incoming.data === "object" && incoming.data !== null
				? resolveId(incoming.data as T, keyProp)
				: incoming.data
		return current.filter((c) => resolveId(c, keyProp) !== id)
	}
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
 * const users = todoActor?.useQuery<User>({
 *   action: "getUsers",
 *   event: "userListUpdate",
 *   initialValue: [],
 *   transform: crudTransform<User>({ key: "id" }),
 * });
 * ```
 */
export function crudTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: CrudEvent<T>) => T[] {
	const create = createTransform<T>(opts)
	const update = updateTransform<T>(opts)
	const del = deleteTransform<T>(opts)

	return (current: T[], incoming: CrudEvent<T>): T[] => {
		switch (incoming.type) {
			case "created":
				return create(current, incoming)
			case "updated":
				return update(current, incoming)
			case "deleted":
				return del(current, incoming)
			default:
				return current
		}
	}
}
