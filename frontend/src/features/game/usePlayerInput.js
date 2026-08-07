import { useEffect, useRef } from 'react';
import { PLAYER_ACTION } from './gameProtocol';

const INITIAL_MOVEMENT = Object.freeze({
    up: false,
    down: false,
    left: false,
    right: false,
});

function mapKeyToMovement(code) {
    switch (code) {
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
        default:
            return null;
    }
}

function mapKeyToAction(code) {
    switch (code) {
        case 'Space':
            return PLAYER_ACTION.MELEE;
        case 'KeyF':
            return PLAYER_ACTION.RANGED;
        case 'ShiftLeft':
        case 'ShiftRight':
            return PLAYER_ACTION.SHIELD;
        default:
            return null;
    }
}

function areMovementsEqual(left, right) {
    return (
        left.up === right.up &&
        left.down === right.down &&
        left.left === right.left &&
        left.right === right.right
    );
}

export function usePlayerInput({ socket, roomId, enabled }) {
    const movementRef = useRef(INITIAL_MOVEMENT);
    const actionRef = useRef(PLAYER_ACTION.NONE);

    useEffect(() => {
        if (!socket || !roomId || !enabled) {
            movementRef.current = INITIAL_MOVEMENT;
            actionRef.current = PLAYER_ACTION.NONE;
            return undefined;
        }

        function emitMovement(nextMovement) {
            if (areMovementsEqual(movementRef.current, nextMovement))
                return;

            movementRef.current = nextMovement;
            socket.emit('player:input', {
                roomId,
                input: nextMovement,
            });
        }

        function emitAction(nextAction) {
            if (actionRef.current === nextAction)
                return;

            actionRef.current = nextAction;
            socket.emit('player:input', {
                roomId,
                input: {
                    action: nextAction,
                },
            });
        }

        function handleKeyDown(event) {
            const movementKey = mapKeyToMovement(event.code);

            if (movementKey) {
                event.preventDefault();
                emitMovement({
                    ...movementRef.current,
                    [movementKey]: true,
                });
                return;
            }

            const action = mapKeyToAction(event.code);

            if (action === null)
                return;

            event.preventDefault();

            if (!event.repeat)
                emitAction(action);
        }

        function handleKeyUp(event) {
            const movementKey = mapKeyToMovement(event.code);

            if (movementKey) {
                event.preventDefault();
                emitMovement({
                    ...movementRef.current,
                    [movementKey]: false,
                });
                return;
            }

            const action = mapKeyToAction(event.code);

            if (action === null)
                return;

            event.preventDefault();

            if (actionRef.current === action)
                emitAction(PLAYER_ACTION.NONE);
        }

        function releaseAllInputs() {
            emitMovement(INITIAL_MOVEMENT);
            emitAction(PLAYER_ACTION.NONE);
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', releaseAllInputs);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', releaseAllInputs);
            releaseAllInputs();
        };
    }, [socket, roomId, enabled]);
}
