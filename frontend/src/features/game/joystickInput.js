export const IDLE_MOVEMENT = Object.freeze({
    up: false,
    down: false,
    left: false,
    right: false,
});

export function isTypingTarget(target)
{
    return Boolean(target?.isContentEditable ||
        target?.closest?.('input, textarea, select, [role="textbox"]'));
}

export function getJoystickInput(dx, dy, radius)
{
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || !(radius > 0))
        return {x: 0, y: 0, movement: IDLE_MOVEMENT};

    const distance = Math.hypot(dx, dy);
    const ratio = distance > radius ? radius / distance : 1;
    const x = dx * ratio;
    const y = dy * ratio;
    if (distance < radius * 0.18)
        return {x, y, movement: IDLE_MOVEMENT};

    const angle = Math.atan2(dy, dx);
    const sector = (Math.round(angle / (Math.PI / 4)) + 8) % 8;
    return {
        x,
        y,
        movement: {
            up: sector >= 5 && sector <= 7,
            down: sector >= 1 && sector <= 3,
            left: sector >= 3 && sector <= 5,
            right: sector === 7 || sector === 0 || sector === 1,
        },
    };
}
