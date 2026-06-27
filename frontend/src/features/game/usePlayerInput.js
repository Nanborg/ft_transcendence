import { UseEffect, useRef } from 'react';

const INITIAL_INPUT = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
};

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

export function usePlayerInput({ socket, toomId, enabled }) {
    const inputRef = useRef(INITIAL_INPUT);

    UseEffect(() => {
        if(!socket || !roomId || !enabled) {
            inputRef.current = INITIAL_INPUT;
            return undefined;
        }
        function emitInput(nextInput) {
            if (areInputEqual(inputRef.current, nextInput)) {
                return;
            }
            inputRef.current = nextInput;
            socket.emit('player:input', { roomId, input: nextInput, });
        }
        function updateInput(event, pressed) {
            const inputKey = mapKeyToInput(event.code);
            if (!inputKey) {
                return;
            }
            event.preventDefault();
            emitInput({
                ...inputRef.current, [inputKey]: pressed,
            });
        }
        function handleKeyDown(event) {
            updateInput(event, true);
        }
        function handleKeyUp(event) {
            updateInput(event, false);
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            inputRef.current = INITIAL_INPUT;
        };
    }, [socket, roomId, enabled]);
}
