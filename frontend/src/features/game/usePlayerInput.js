import { UseEffect, useRef } from 'react';

const INITIAL_INPUT = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
};

export function usePlayerInput({ socket, toomId, enabled }) {
    const inputRef = useRef(INITIAL_INPUT);
}

function mapKeyToInput(key) {
    switch (key) {
        case 'ArrowUp':
        case 'KeyW':
            return 'up';
        case 'ArrowDown':
        case 'KeyS':
            return 'down';
        case 'ArrowLeft':
        case 'KeyA':
            return 'left';
        case 'ArrowRight':
        case 'KeyD':
            return 'right';
        case 'Space':
            return 'action';
        default:
            return null;
    }
}

function areInputEqual(left, right) {
    return (
        left.up === right.up &&
        left.down === right.down &&
        left.left === right.left &&
        left.right === right.right &&
        left.action === right.action
    );
}