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
        case 'KeyJ':
            return PLAYER_ACTION.MELEE;
        case 'KeyK':
            return PLAYER_ACTION.RANGED;
        case 'KeyL':
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

function getDirectionFromMovement(movement, fallbackDirection)
{
    const dirX = Number(movement.right) - Number(movement.left);
    const dirY = Number(movement.down) - Number(movement.up);

    if (dirX === 0 && dirY === 0)
        return fallbackDirection;
    if (Math.abs(dirX) > Math.abs(dirY))
        return { dirX: Math.sign(dirX), dirY: 0 };
    if (Math.abs(dirY) > Math.abs(dirX))
        return { dirX: 0, dirY: Math.sign(dirY) };
    return { dirX: Math.sign(dirX), dirY: Math.sign(dirY) };
}

export function usePlayerInput({ socket, roomId, enabled, actionsEnabled = true }) {
    const movementRef = useRef(INITIAL_MOVEMENT);
    const actionRef = useRef(PLAYER_ACTION.NONE);
    const lastDirectionRef = useRef({ dirX: 1, dirY: 0 });

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
            lastDirectionRef.current = getDirectionFromMovement(nextMovement, lastDirectionRef.current);
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
                    ...lastDirectionRef.current,
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

            if (action === null || !actionsEnabled)
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
    }, [socket, roomId, enabled, actionsEnabled]);
}
