// WHY: Central enemy sprite barrel keeps canvas imports short in renderer files
// DECISION: Enemy sprite exports stay together so adding a new enemy has one obvious entrypoint
export { drawWalkingRobotSprite } from './enemies/walkingRobotSprite';
export { drawShootingRobotSprite } from './enemies/shootingRobotSprite';
export { drawTankSlamWave, drawTankRobotSprite } from './enemies/tankRobotSprite';
export { drawLordGoobSprite } from './enemies/lordGoobSprite';
// WHY: Enemy sprite registry maps entity types to their renderer config
