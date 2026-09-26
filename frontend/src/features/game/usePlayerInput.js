import { useCallback, useEffect, useRef } from 'react';
import { PLAYER_ACTION } from './gameProtocol';

import { IDLE_MOVEMENT as INITIAL_MOVEMENT, isTypingTarget } from './joystickInput';

function mapKeyToMovement(code)
{
	// DECISION: Support arrows and WASD
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
	// DECISION: J/K/L map to abilities
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
	// PERF: Avoid duplicate movement emits
	return (
		left.up === right.up &&
		left.down === right.down &&
		left.left === right.left &&
		left.right === right.right
	);
}

function getDirectionFromMovement(movement, fallbackDirection)
{
    // DECISION: Last direction is kept when idle
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
    // WHY: Keep input state outside React renders
    const movementRef = useRef(INITIAL_MOVEMENT);
    const actionRef = useRef(PLAYER_ACTION.NONE);
    const joystickHandlerRef = useRef(null);
    const actionHandlerRef = useRef(null);
    const pressAction = useCallback(action => actionHandlerRef.current?.press(action), []);
    const releaseAction = useCallback(action => actionHandlerRef.current?.release(action), []);
    const setJoystickMovement = useCallback(movement => {
        joystickHandlerRef.current?.(movement);
    }, []);
    const lastDirectionRef = useRef({ dirX: 1, dirY: 0 });

    useEffect(() => {
        if (!socket || !roomId || !enabled) {
            // SAFETY: Disabled input releases controls
            movementRef.current = INITIAL_MOVEMENT;
            actionRef.current = PLAYER_ACTION.NONE;
            return undefined;
        }

        let keyboardMovement = INITIAL_MOVEMENT;
        let joystickMovement = INITIAL_MOVEMENT;
        let keyboardAction = PLAYER_ACTION.NONE;
        let buttonAction = PLAYER_ACTION.NONE;

        function emitMovement(nextMovement) {
            // PERF: Send only movement changes
            if (areMovementsEqual(movementRef.current, nextMovement))
                return;

            movementRef.current = nextMovement;
            // SYNC: Actions reuse last movement direction
            lastDirectionRef.current = getDirectionFromMovement(nextMovement, lastDirectionRef.current);
            socket.emit('player:input', {
                roomId,
                input: nextMovement,
            });
        }

        function emitCombinedMovement() {
            emitMovement({
                up: keyboardMovement.up || joystickMovement.up,
                down: keyboardMovement.down || joystickMovement.down,
                left: keyboardMovement.left || joystickMovement.left,
                right: keyboardMovement.right || joystickMovement.right,
            });
        }

        joystickHandlerRef.current = movement => {
            joystickMovement = isTypingTarget(document.activeElement) || document.hidden
                ? INITIAL_MOVEMENT : movement;
            emitCombinedMovement();
        };

        function emitAction(nextAction) {
            // PERF: Do not repeat same action state
            if (actionRef.current === nextAction)
                return;

            actionRef.current = nextAction;
            socket.emit('player:input', {
                roomId,
                input: {
                    // REQUIRED: Backend validates action direction
                    action: nextAction,
                    ...lastDirectionRef.current,
                },
            });
        }

        actionHandlerRef.current = {
            press(action) {
                if (!actionsEnabled || document.hidden || isTypingTarget(document.activeElement) ||
                    ![PLAYER_ACTION.MELEE, PLAYER_ACTION.RANGED, PLAYER_ACTION.SHIELD].includes(action))
                    return;
                buttonAction = action;
                emitAction(buttonAction);
            },
            release(action) {
                if (buttonAction !== action)
                    return;
                buttonAction = PLAYER_ACTION.NONE;
                emitAction(keyboardAction);
            },
        };

        function handleKeyDown(event) {
            if (isTypingTarget(event.target))
                return;
            const movementKey = mapKeyToMovement(event.code);

            if (movementKey) {
                // DECISION: Game keys should not scroll page
                event.preventDefault();
                keyboardMovement = {...keyboardMovement, [movementKey]: true};
                emitCombinedMovement();
                return;
            }

            const action = mapKeyToAction(event.code);

            if (action === null || !actionsEnabled)
                return;

            event.preventDefault();

            if (!event.repeat) {
                keyboardAction = action;
                emitAction(buttonAction || keyboardAction);
            }
        }

        function handleKeyUp(event) {
            if (isTypingTarget(event.target))
                return;
            const movementKey = mapKeyToMovement(event.code);

            if (movementKey) {
                // SYNC: Keyup releases one direction
                event.preventDefault();
                keyboardMovement = {...keyboardMovement, [movementKey]: false};
                emitCombinedMovement();
                return;
            }

            const action = mapKeyToAction(event.code);

            if (action === null)
                return;

            event.preventDefault();

            if (keyboardAction === action) {
                keyboardAction = PLAYER_ACTION.NONE;
                emitAction(buttonAction);
            }
        }

        function releaseAllInputs() {
            // SAFETY: Window blur stops stuck movement
            keyboardMovement = INITIAL_MOVEMENT;
            joystickMovement = INITIAL_MOVEMENT;
            emitCombinedMovement();
            keyboardAction = PLAYER_ACTION.NONE;
            buttonAction = PLAYER_ACTION.NONE;
            emitAction(PLAYER_ACTION.NONE);
        }

        function handleVisibility() {
            if (document.hidden)
                releaseAllInputs();
        }

        function handleFocus(event) {
            if (isTypingTarget(event.target))
                releaseAllInputs();
        }

        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('focusin', handleFocus);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', releaseAllInputs);

        return () => {
            // SAFETY: Cleanup removes global listeners
            joystickHandlerRef.current = null;
            actionHandlerRef.current = null;
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('focusin', handleFocus);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', releaseAllInputs);
            releaseAllInputs();
        };
    }, [socket, roomId, enabled, actionsEnabled]);

    return {setJoystickMovement, pressAction, releaseAction};
}
