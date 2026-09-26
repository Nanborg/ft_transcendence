import { useCallback, useEffect, useRef, useState } from 'react';
import { getJoystickInput, IDLE_MOVEMENT, isTypingTarget } from '../joystickInput';
import './mobileJoystick.css';

export function MobileJoystick({enabled, onMovement})
{
    const pointerRef = useRef(null);
    const thumbRef = useRef(null);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const reset = useCallback(() => {
        const pointer = pointerRef.current;
        pointerRef.current = null;
        if (pointer?.element.hasPointerCapture(pointer.id))
            pointer.element.releasePointerCapture(pointer.id);
        setOffset({x: 0, y: 0});
        onMovement(IDLE_MOVEMENT);
    }, [onMovement]);

    useEffect(() => {
        if (!enabled)
            reset();
    }, [enabled, reset]);

    useEffect(() => {
        const media = window.matchMedia('(any-pointer: coarse)');
        const handleVisibility = () => {
            if (document.hidden)
                reset();
        };
        const handleFocus = event => {
            if (isTypingTarget(event.target))
                reset();
        };
        window.addEventListener('blur', reset);
        window.addEventListener('resize', reset);
        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('focusin', handleFocus);
        media.addEventListener('change', reset);
        return () => {
            window.removeEventListener('blur', reset);
            window.removeEventListener('resize', reset);
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('focusin', handleFocus);
            media.removeEventListener('change', reset);
            reset();
        };
    }, [reset]);

    function updatePointer(event)
    {
        const bounds = event.currentTarget.getBoundingClientRect();
        const thumbSize = thumbRef.current?.offsetWidth ?? 44;
        const radius = Math.max(1, (Math.min(bounds.width, bounds.height) - thumbSize) / 2);
        const input = getJoystickInput(
            event.clientX - bounds.left - bounds.width / 2,
            event.clientY - bounds.top - bounds.height / 2,
            radius,
        );
        setOffset({x: input.x, y: input.y});
        onMovement(input.movement);
    }

    function handlePointerDown(event)
    {
        if (!enabled || pointerRef.current || event.button !== 0 ||
            isTypingTarget(document.activeElement))
            return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerRef.current = {id: event.pointerId, element: event.currentTarget};
        updatePointer(event);
    }

    function handlePointerMove(event)
    {
        if (!enabled || pointerRef.current?.id !== event.pointerId)
            return;
        event.preventDefault();
        updatePointer(event);
    }

    function handlePointerEnd(event)
    {
        if (pointerRef.current?.id === event.pointerId)
            reset();
    }

    if (!enabled)
        return null;

    return (
        <div
            className="mobile-joystick"
            role="group"
            aria-label="Movement joystick: drag to move"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
            onContextMenu={event => event.preventDefault()}
        >
            <span
                ref={thumbRef}
                className="mobile-joystick-thumb"
                aria-hidden="true"
                style={{transform: `translate(${offset.x}px, ${offset.y}px)`}}
            />
        </div>
    );
}
