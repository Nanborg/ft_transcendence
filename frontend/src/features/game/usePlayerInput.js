import { useEffect, useRef } from 'react';
import { PLAYER_ACTION } from './gameProtocol';

const INITIAL_MOVEMENT = Object.freeze(
{
	up: false,
	down: false,
	left: false,
	right: false,
});

function mapKeyToMovement(code)
{
	// DECISION: Support arrows and WASD.
	switch (code)
	{
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

function mapKeyToAction(code)
{
	// DECISION: J/K/L map to abilities.
	switch (code)
	{
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

function areMovementsEqual(left, right)
{
	// PERF: Avoid duplicate movement emits.
	return (
		left.up === right.up &&
		left.down === right.down &&
		left.left === right.left &&
		left.right === right.right
	);
}

function getDirectionFromMovement(movement, fallbackDirection)
{
    // DECISION: Last direction is kept when idle.
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
    // WHY: Keep input state outside React renders.
    const movementRef = useRef(INITIAL_MOVEMENT);
    const actionRef = useRef(PLAYER_ACTION.NONE);
    const lastDirectionRef = useRef({ dirX: 1, dirY: 0 });

    useEffect(() => {
        if (!socket || !roomId || !enabled) {
            // SAFETY: Disabled input releases controls.
            movementRef.current = INITIAL_MOVEMENT;
            actionRef.current = PLAYER_ACTION.NONE;
            return undefined;
        }

        function emitMovement(nextMovement) {
            // PERF: Send only movement changes.
            if (areMovementsEqual(movementRef.current, nextMovement))
                return;

            movementRef.current = nextMovement;
            // SYNC: Actions reuse last movement direction.
            lastDirectionRef.current = getDirectionFromMovement(nextMovement, lastDirectionRef.current);
            socket.emit('player:input', {
                roomId,
                input: nextMovement,
            });
        }

        function emitAction(nextAction) {
            // PERF: Do not repeat same action state.
            if (actionRef.current === nextAction)
                return;

            actionRef.current = nextAction;
            socket.emit('player:input', {
                roomId,
                input: {
                    // REQUIRED: Backend validates action direction.
                    action: nextAction,
                    ...lastDirectionRef.current,
                },
            });
        }

        function handleKeyDown(event) {
            const movementKey = mapKeyToMovement(event.code);

            if (movementKey) {
                // DECISION: Game keys should not scroll page.
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
                // SAFETY: Hold key should not spam attacks.
                emitAction(action);
        }

        function handleKeyUp(event) {
            const movementKey = mapKeyToMovement(event.code);

            if (movementKey) {
                // SYNC: Keyup releases one direction.
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
                // SYNC: Action keyup returns to idle.
                emitAction(PLAYER_ACTION.NONE);
        }

        function releaseAllInputs() {
            // SAFETY: Window blur stops stuck movement.
            emitMovement(INITIAL_MOVEMENT);
            emitAction(PLAYER_ACTION.NONE);
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', releaseAllInputs);

        return () => {
            // SAFETY: Cleanup removes global listeners.
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', releaseAllInputs);
            releaseAllInputs();
        };
    }, [socket, roomId, enabled, actionsEnabled]);
}
