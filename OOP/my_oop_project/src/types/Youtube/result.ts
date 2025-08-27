export type Ok<T> = {
    ok: true;
    value: T;
}

export type Err<E> = {
    ok: false;
    error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
    return { ok: false, error };
}
