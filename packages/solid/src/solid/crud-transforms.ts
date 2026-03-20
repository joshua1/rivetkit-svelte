/**
 * Generic CRUD transform factories for use with `useQuery` and `useRivetQuery`.
 *
 * These produce `transform` functions that handle incoming create/update/delete
 * events against a list of items, keyed by an identifier field.
 *
 * @example
 * ```ts
 * const tasks = useRivetQuery<Task[]>({
 *   actor: "taskList",
 *   key: ["my-list"],
 *   action: "getTasks",
 *   event: ["taskCreated", "taskUpdated", "taskDeleted"],
 *   transform: crudTransform<Task>({ key: "id" }),
 * });
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** An incoming event payload that carries a CRUD operation type. */
export interface CrudEvent<T> {
	type: "created" | "updated" | "deleted"
	data: T
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

function isCrudEvent<T>(value: unknown): value is CrudEvent<T> {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		"data" in value &&
		typeof (value as CrudEvent<T>).type === "string"
	)
}

// ---------------------------------------------------------------------------
// Individual transforms
// ---------------------------------------------------------------------------

/**
 * Transform for a **create** event — appends the incoming item to the list.
 * Duplicates (same key) are ignored.
 */
export function createTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: unknown) => T[] {
	const keyProp = opts.key ?? ("id" as keyof T)
	return (current, incoming) => {
		const item = incoming as T
		const id = getKey(item, keyProp)
		if (current.some((c) => getKey(c, keyProp) === id)) return current
		return [...current, item]
	}
}

/**
 * Transform for an **update** event — replaces the matching item in-place.
 * If no match is found the list is returned unchanged.
 */
export function updateTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: unknown) => T[] {
	const keyProp = opts.key ?? ("id" as keyof T)
	return (current, incoming) => {
		const item = incoming as T
		const id = getKey(item, keyProp)
		const idx = current.findIndex((c) => getKey(c, keyProp) === id)
		if (idx === -1) return current
		const next = [...current]
		next[idx] = item
		return next
	}
}

/**
 * Transform for a **delete** event — removes the matching item.
 * `incoming` can be the full item or just the key value.
 */
export function deleteTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: unknown) => T[] {
	const keyProp = opts.key ?? ("id" as keyof T)
	return (current, incoming) => {
		// Accept either a full object or a raw key value (string, number, etc.)
		const id =
			typeof incoming === "object" && incoming !== null
				? getKey(incoming as T, keyProp)
				: incoming
		return current.filter((c) => getKey(c, keyProp) !== id)
	}
}

// ---------------------------------------------------------------------------
// Unified CRUD transform
// ---------------------------------------------------------------------------

/**
 * A single transform that handles create, update, and delete events.
 *
 * Incoming payloads must be wrapped in a `CrudEvent<T>`:
 * ```ts
 * { type: "created", data: item }
 * { type: "updated", data: item }
 * { type: "deleted", data: item }  // or { type: "deleted", data: id }
 * ```
 *
 * @example
 * ```ts
 * const users = useRivetQuery<User[]>({
 *   actor: "userList",
 *   key: ["all"],
 *   action: "getUsers",
 *   event: "userChanged",
 *   transform: crudTransform<User>({ key: "id" }),
 * });
 * ```
 */
export function crudTransform<T>(
	opts: CrudTransformOptions<T> = {},
): (current: T[], incoming: unknown) => T[] {
	const create = createTransform<T>(opts)
	const update = updateTransform<T>(opts)
	const del = deleteTransform<T>(opts)

	return (current, incoming) => {
		if (!isCrudEvent<T>(incoming)) {
			// Fall back: treat as an upsert (update if exists, create otherwise)
			const keyProp = opts.key ?? ("id" as keyof T)
			const item = incoming as T
			const id = getKey(item, keyProp)
			const exists = current.some((c) => getKey(c, keyProp) === id)
			return exists ? update(current, incoming) : create(current, incoming)
		}

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
	}
}
