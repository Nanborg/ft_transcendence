import { ENTITY_TYPE } from './gameProtocol';

export const HITBOX_STYLES = [
	{label: 'Wall', color: '#94a3b8', types: [ENTITY_TYPE.WALL]},
	{label: 'Player', color: '#22c55e', types: [ENTITY_TYPE.PLAYER]},
	{label: 'Enemy', color: '#ef4444', types: [ENTITY_TYPE.WALKING_ROBOT, ENTITY_TYPE.SHOOTING_ROBOT, ENTITY_TYPE.TANK_ROBOT, ENTITY_TYPE.BOSS]},
	{label: 'Projectile', color: '#facc15', types: [ENTITY_TYPE.LASER_PROJECTILE, ENTITY_TYPE.ENEMY_PROJECTILE, ENTITY_TYPE.BOSS_PROJECTILE, ENTITY_TYPE.BOSS_LASER_PROJECTILE]},
	{label: 'Shield', color: '#38bdf8', types: [ENTITY_TYPE.LASER_SHIELD]},
	{label: 'Melee', color: '#e879f9', types: [ENTITY_TYPE.LASER_SLASH, ENTITY_TYPE.ENEMY_MELEE]},
];

const DEFAULT_STYLE = {label: 'Entity', color: '#ffffff'};

export function handleDebugHitboxKeyDown(event, debugHitboxesRef)
{
	if (
		event.key?.toLowerCase() !== 'h' || event.repeat || event.isComposing ||
		event.ctrlKey || event.metaKey || event.altKey ||
		event.target?.isContentEditable ||
		event.target?.closest?.('input, textarea, select, [role="textbox"]')
	)
		return false;

	debugHitboxesRef.current = !debugHitboxesRef.current;
	return true;
}

function getHitboxSize(entity, gameMap)
{
	const size = Number(entity.size);
	if (Number.isFinite(size) && size > 0)
		return size;

	const scale = gameMap?.scale > 0 ? gameMap.scale : 40;
	const type = entity.typeId ?? entity.entityTypeId;
	if (type === ENTITY_TYPE.LASER_PROJECTILE || type === ENTITY_TYPE.ENEMY_PROJECTILE)
		return Math.floor(scale * 0.5);
	if (type === ENTITY_TYPE.BOSS_LASER_PROJECTILE || type === ENTITY_TYPE.LASER_SHIELD)
		return Math.floor(scale * 1.5);
	return scale;
}

export function drawDebugHitboxes({context, entities, gameMap, camera, worldToScreen})
{
	context.save();
	context.lineWidth = 1.5;
	context.setLineDash([5, 4]);
	context.font = '11px monospace';
	context.textAlign = 'center';
	context.textBaseline = 'bottom';

	for (const entity of entities)
	{
		if (!entity || !Number.isFinite(entity.posX) || !Number.isFinite(entity.posY))
			continue;

		const type = entity.typeId ?? entity.entityTypeId;
		const style = HITBOX_STYLES.find(style => style.types.includes(type)) ?? DEFAULT_STYLE;
		const size = getHitboxSize(entity, gameMap);
		const radius = size * camera.scale / 2;
		const screen = worldToScreen({x: entity.posX, y: entity.posY}, camera);
		if (screen.x + radius < 0 || screen.y + radius < 0 ||
			screen.x - radius > context.canvas.width || screen.y - radius > context.canvas.height)
			continue;

		context.strokeStyle = style.color;
		context.fillStyle = `${style.color}20`;
		context.beginPath();
		context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
		context.fill();
		context.stroke();
		context.beginPath();
		context.moveTo(screen.x - 4, screen.y);
		context.lineTo(screen.x + 4, screen.y);
		context.moveTo(screen.x, screen.y - 4);
		context.lineTo(screen.x, screen.y + 4);
		context.stroke();

		const labels = [
			`${style.label} #${entity.entityId ?? '?'} size:${size}`,
			`x:${entity.posX} y:${entity.posY}`,
		];
		const labelWidth = Math.max(...labels.map(label => context.measureText(label).width)) + 8;
		const labelY = screen.y - radius - 4;
		context.fillStyle = 'rgba(0, 0, 0, 0.8)';
		context.fillRect(screen.x - labelWidth / 2, labelY - 28, labelWidth, 30);
		context.fillStyle = style.color;
		context.fillText(labels[0], screen.x, labelY - 14);
		context.fillText(labels[1], screen.x, labelY);
	}
	context.restore();
}
