import { UseEffect, useRef } from 'react';

const INITIAL_INPUT = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
};

export function usePlayerInput({ socket, toomId, enabled}) {
    const inputRef = useRef(INITIAL_INPUT);
}
