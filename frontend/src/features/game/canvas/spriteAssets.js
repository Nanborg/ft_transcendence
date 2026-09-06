import { ENTITY_TYPE } from '../gameProtocol';
import playerWalkSpriteUrl from '../../../assets/game/player/player-walk.png';
import playerMeleeAttackSpriteUrl from '../../../assets/game/player/player-melee-attack.png';
import playerRangedAttackSpriteUrl from '../../../assets/game/player/player-ranged-attack.png';
import walkingRobotSpriteUrl from '../../../assets/game/enemies/walking-robot.png';
import shootingRobotSpriteUrl from '../../../assets/game/enemies/shooting-robot.png';
import tankRobotIdleSpriteUrl from '../../../assets/game/enemies/tank-robot-idle.png';
import tankRobotFlySpriteUrl from '../../../assets/game/enemies/tank-robot-fly.png';
import tankRobotSlamSpriteUrl from '../../../assets/game/enemies/tank-robot-slam.png';
import playerIdleSpriteUrl from '../../../assets/game/player/player-idle.png';
import walkingRobotIdleSpriteUrl from '../../../assets/game/enemies/walking-robot-idle.png';
import shootingRobotIdleSpriteUrl from '../../../assets/game/enemies/shooting-robot-idle.png';
import shootingRobotAttackSpriteUrl from '../../../assets/game/enemies/shooting-robot-attack.png';
import lordGoobIdleSpriteUrl from '../../../assets/game/enemies/lord-goob-idle.png';
import lordGoobPhaseOneSpriteUrl from '../../../assets/game/enemies/lord-goob-phase-1.png';
import lordGoobPhaseTwoSpriteUrl from '../../../assets/game/enemies/lord-goob-phase-2.png';
import lordGoobPhaseThreeSpriteUrl from '../../../assets/game/enemies/lord-goob-phase-3.png';
import walkingRobotChargeSpriteUrl from '../../../assets/game/enemies/walking-robot-charge.png';
import checkpointPlatformSpriteUrl from '../../../assets/game/checkpoint/checkpoint-platform.png';

export const CANVAS_WIDTH = 800;
export const MIN_CANVAS_HEIGHT = 450;
export const MAX_CANVAS_HEIGHT = 800;
export const VIEW_WIDTH_IN_TILES = 20;
export const INTERPOLATION_DURATION_MS = 100;
export const STATIC_MAP_ENTITY_TYPES = new Set([
    ENTITY_TYPE.WALL,
    ENTITY_TYPE.CHECKPOINT,
    ENTITY_TYPE.SPAWN_POINT,
]);
export const checkpointPlatformSprite = new Image();
checkpointPlatformSprite.src = checkpointPlatformSpriteUrl;
export const PLAYER_WALK_FRAME_COUNT = 4;
export const PLAYER_WALK_FRAME_DURATION_MS = 125;
export const PLAYER_IDLE_FRAME_COUNT = 4;
export const PLAYER_IDLE_FRAME_DURATION_MS = 240;
export const playerIdleSprite = new Image();
playerIdleSprite.src = playerIdleSpriteUrl;
export const PLAYER_ATTACK_FRAME_COUNT = 4;
export const PLAYER_MELEE_FRAME_DURATION_MS = 90;
export const PLAYER_RANGED_FRAME_DURATION_MS = 75;
export const playerWalkSprite = new Image();
playerWalkSprite.src = playerWalkSpriteUrl;
export const playerMeleeAttackSprite = new Image();
playerMeleeAttackSprite.src = playerMeleeAttackSpriteUrl;
export const playerRangedAttackSprite = new Image();
playerRangedAttackSprite.src = playerRangedAttackSpriteUrl;
export const WALKING_ROBOT_FRAME_COUNT = 4;
export const WALKING_ROBOT_FRAME_DURATION_MS = 140;
export const walkingRobotSprite = new Image();
walkingRobotSprite.src = walkingRobotSpriteUrl;
export const WALKING_ROBOT_IDLE_FRAME_DURATION_MS = 260;
export const walkingRobotIdleSprite = new Image();
walkingRobotIdleSprite.src = walkingRobotIdleSpriteUrl;
export const walkingRobotChargeSprite = new Image();
walkingRobotChargeSprite.src = walkingRobotChargeSpriteUrl;
export const SHOOTING_ROBOT_FRAME_COUNT = 4;
export const SHOOTING_ROBOT_FRAME_DURATION_MS = 140;
export const shootingRobotSprite = new Image();
shootingRobotSprite.src = shootingRobotSpriteUrl;
export const SHOOTING_ROBOT_WALK_COLUMNS = Object.freeze([
    { x: 125, width: 162 },
    { x: 412, width: 160 },
    { x: 689, width: 167 },
    { x: 963, width: 163 },
]);
export const SHOOTING_ROBOT_WALK_ROWS = Object.freeze([
    { y: 85, height: 217 },
    { y: 361, height: 220 },
    { y: 653, height: 216 },
    { y: 924, height: 213 },
]);
export const SHOOTING_ROBOT_IDLE_FRAME_DURATION_MS = 260;
export const shootingRobotIdleSprite = new Image();
shootingRobotIdleSprite.src = shootingRobotIdleSpriteUrl;
export const shootingRobotAttackSprite = new Image();
shootingRobotAttackSprite.src = shootingRobotAttackSpriteUrl;
export const TANK_ROBOT_FRAME_COUNT = 4;
export const TANK_ROBOT_FRAME_DURATION_MS = 220;
export const TANK_ROBOT_SOURCE_ROWS = Object.freeze([
    { y: 0, height: 308 },
    { y: 308, height: 313 },
    { y: 621, height: 308 },
    { y: 929, height: 349 },
]);
export const TANK_ROBOT_SOURCE_COLUMNS = Object.freeze([
    { x: 0, width: 320 },
    { x: 320, width: 308 },
    { x: 628, width: 299 },
    { x: 927, width: 303 },
]);
export const SOURCE_GRID_1254_COLUMNS = Object.freeze([
    { x: 0, width: 314 },
    { x: 314, width: 313 },
    { x: 627, width: 314 },
    { x: 941, width: 313 },
]);
export const SOURCE_GRID_1254_ROWS = Object.freeze([
    { y: 0, height: 314 },
    { y: 314, height: 313 },
    { y: 627, height: 314 },
    { y: 941, height: 313 },
]);
export const TANK_ROBOT_FLY_COLUMNS = Object.freeze([
    { x: 2, width: 310 },
    { x: 316, width: 309 },
    { x: 629, width: 310 },
    { x: 943, width: 309 },
]);
export const TANK_ROBOT_FLY_ROWS = Object.freeze([
    { y: 2, height: 310 },
    { y: 316, height: 309 },
    { y: 629, height: 275 },
    { y: 914, height: 338 },
]);
export const TANK_ROBOT_SLAM_COLUMNS = Object.freeze([
    { x: 2, width: 310 },
    { x: 316, width: 309 },
    { x: 629, width: 310 },
    { x: 943, width: 309 },
]);
export const TANK_ROBOT_SLAM_ROWS = Object.freeze([
    { y: 2, height: 310 },
    { y: 316, height: 309 },
    { y: 629, height: 310 },
    { y: 943, height: 309 },
]);
export const TANK_ROBOT_FLY_FRAME_DURATION_MS = 120;
export const WALKING_ROBOT_IDLE_COLUMNS = Object.freeze([
    { x: 0, width: 315 },
    { x: 315, width: 316 },
    { x: 631, width: 315 },
    { x: 946, width: 315 },
]);
export const WALKING_ROBOT_IDLE_ROWS = Object.freeze([
    { y: 0, height: 312 },
    { y: 312, height: 312 },
    { y: 624, height: 311 },
    { y: 935, height: 312 },
]);
export const SHOOTING_ROBOT_IDLE_COLUMNS = Object.freeze([
    { x: 72, width: 207 },
    { x: 376, width: 206 },
    { x: 675, width: 209 },
    { x: 967, width: 206 },
]);
export const SHOOTING_ROBOT_IDLE_ROWS = Object.freeze([
    { y: 46, height: 254 },
    { y: 335, height: 262 },
    { y: 631, height: 257 },
    { y: 924, height: 263 },
]);
export const SHOOTING_ROBOT_ATTACK_COLUMNS = Object.freeze([
    { x: 111, width: 169 },
    { x: 377, width: 204 },
    { x: 663, width: 213 },
    { x: 977, width: 165 },
]);
export const SHOOTING_ROBOT_ATTACK_ROWS = Object.freeze([
    { y: 68, height: 207 },
    { y: 369, height: 204 },
    { y: 663, height: 201 },
    { y: 898, height: 274 },
]);
export const PLAYER_WALK_ANCHOR_X = Object.freeze([
    [0.6499, 0.5378, 0.4552, 0.3688],
    [0.6463, 0.5391, 0.4398, 0.3738],
    [0.6302, 0.5247, 0.4322, 0.3585],
    [0.6253, 0.5207, 0.4148, 0.3671],
]);
export const PLAYER_WALK_ANCHOR_Y = Object.freeze([
    [0.6074, 0.6059, 0.6099, 0.6070],
    [0.4883, 0.5090, 0.5099, 0.5107],
    [0.4227, 0.4383, 0.4345, 0.4337],
    [0.3048, 0.3099, 0.3130, 0.3027],
]);
export const PLAYER_IDLE_ANCHOR_X = Object.freeze([
    [0.4930, 0.4766, 0.4771, 0.4810],
    [0.4893, 0.4735, 0.4735, 0.4725],
    [0.5051, 0.4897, 0.4920, 0.4880],
    [0.4955, 0.4717, 0.4798, 0.4745],
]);
export const PLAYER_IDLE_ANCHOR_Y = Object.freeze([
    [0.5946, 0.5953, 0.5953, 0.5950],
    [0.4779, 0.4783, 0.4774, 0.4766],
    [0.4024, 0.4026, 0.4022, 0.4021],
    [0.2929, 0.2935, 0.2938, 0.2934],
]);
export const PLAYER_MELEE_ANCHOR_X = Object.freeze([
    [0.6651, 0.5489, 0.4963, 0.4163],
    [0.6521, 0.5087, 0.5327, 0.4815],
    [0.5600, 0.4548, 0.3737, 0.3509],
    [0.5938, 0.6068, 0.4298, 0.4247],
]);
export const PLAYER_MELEE_ANCHOR_Y = Object.freeze([
    [0.5776, 0.5871, 0.5776, 0.5776],
    [0.4448, 0.4576, 0.4352, 0.4384],
    [0.3673, 0.3832, 0.3577, 0.3577],
    [0.2151, 0.2311, 0.2087, 0.2151],
]);
export const PLAYER_RANGED_ANCHOR_X = Object.freeze([
    [0.6093, 0.5281, 0.4851, 0.4402],
    [0.6585, 0.5933, 0.5550, 0.5199],
    [0.5154, 0.4659, 0.4262, 0.3893],
    [0.5874, 0.5493, 0.4935, 0.4598],
]);
export const PLAYER_RANGED_ANCHOR_Y = Object.freeze([
    [0.5776, 0.5776, 0.5776, 0.5776],
    [0.4512, 0.4512, 0.4512, 0.4512],
    [0.3514, 0.3482, 0.3482, 0.3482],
    [0.2375, 0.2375, 0.2566, 0.2375],
]);
export const PLAYER_SPRITE_TINTS = Object.freeze([
    null,
    Object.freeze({
        id: 'violet',
        red: 124,
        green: 58,
        blue: 237,
        strength: 0.72,
    }),
    Object.freeze({
        id: 'green',
        red: 22,
        green: 163,
        blue: 74,
        strength: 0.68,
    }),
    Object.freeze({
        id: 'blue',
        red: 37,
        green: 99,
        blue: 235,
        strength: 0.72,
    }),
]);
export const WALKING_ROBOT_IDLE_ANCHOR_X = Object.freeze([
    [0.6059, 0.5500, 0.4853, 0.3886],
    [0.6114, 0.5658, 0.4994, 0.4390],
    [0.5802, 0.5498, 0.4711, 0.4088],
    [0.6024, 0.5529, 0.4590, 0.3916],
]);
export const WALKING_ROBOT_WALK_ANCHOR_X = Object.freeze([
    [0.6306, 0.5399, 0.4506, 0.4952],
    [0.4777, 0.5272, 0.5207, 0.4760],
    [0.5000, 0.5064, 0.4873, 0.4776],
    [0.5000, 0.5000, 0.5016, 0.4712],
]);
export const WALKING_ROBOT_WALK_ANCHOR_Y = Object.freeze([
    [0.5924, 0.5987, 0.5876, 0.5462],
    [0.5096, 0.4649, 0.4744, 0.4744],
    [0.5239, 0.5350, 0.5318, 0.5048],
    [0.5000, 0.5000, 0.5000, 0.4617],
]);
export const WALKING_ROBOT_IDLE_ANCHOR_Y = Object.freeze([
    [0.5481, 0.5769, 0.5481, 0.5481],
    [0.5048, 0.4856, 0.5256, 0.4696],
    [0.5064, 0.5129, 0.5000, 0.5064],
    [0.5000, 0.4728, 0.4551, 0.5000],
]);
export const WALKING_ROBOT_CHARGE_ANCHOR_X = Object.freeze([
    [0.5048, 0.4505, 0.5844, 0.3882],
    [0.5414, 0.6070, 0.5127, 0.5559],
    [0.4713, 0.5719, 0.4904, 0.4984],
    [0.5064, 0.5032, 0.4013, 0.4425],
]);
export const WALKING_ROBOT_CHARGE_ANCHOR_Y = Object.freeze([
    [0.5876, 0.7070, 0.5717, 0.7038],
    [0.4521, 0.4473, 0.4201, 0.4505],
    [0.5048, 0.5525, 0.5414, 0.5048],
    [0.4617, 0.4489, 0.5383, 0.4617],
]);
export const WALKING_ROBOT_AFTERIMAGES = Object.freeze([
    { distance: 0.25, opacity: 0.28 },
    { distance: 0.5, opacity: 0.16 },
    { distance: 0.75, opacity: 0.08 },
]);
export const SHOOTING_ROBOT_IDLE_ANCHOR_X = Object.freeze([
    [0.4887, 0.4934, 0.5182, 0.4953],
    [0.4767, 0.4936, 0.5158, 0.5372],
    [0.4948, 0.5026, 0.4907, 0.5244],
    [0.4971, 0.5052, 0.4858, 0.5053],
]);
export const SHOOTING_ROBOT_IDLE_ANCHOR_Y = Object.freeze([
    [0.9843, 0.9764, 0.9803, 0.9803],
    [0.9733, 0.9847, 0.9847, 0.9809],
    [0.9844, 0.9844, 0.9844, 0.9883],
    [0.9848, 0.9848, 0.9848, 0.9848],
]);
export const SHOOTING_ROBOT_WALK_ANCHOR_X = Object.freeze([
    [0.5370, 0.6022, 0.5848, 0.4473],
    [0.5358, 0.4926, 0.4329, 0.4533],
    [0.4929, 0.5047, 0.3839, 0.4010],
    [0.4531, 0.5441, 0.4218, 0.4429],
]);
export const SHOOTING_ROBOT_WALK_ANCHOR_Y = Object.freeze([
    [0.9724, 0.9770, 0.9770, 0.9770],
    [0.9818, 0.9818, 0.9818, 0.9818],
    [0.9815, 0.9815, 0.9769, 0.9815],
    [0.9812, 0.9812, 0.9765, 0.9812],
]);
export const SHOOTING_ROBOT_ATTACK_ANCHOR_X = Object.freeze([
    [0.5095, 0.5208, 0.4962, 0.5012],
    [0.5250, 0.5562, 0.5346, 0.5314],
    [0.4583, 0.4869, 0.4736, 0.4495],
    [0.4940, 0.5226, 0.5048, 0.4958],
]);
export const SHOOTING_ROBOT_ATTACK_ANCHOR_Y = Object.freeze([
    [0.9807, 0.9807, 0.9807, 0.9807],
    [0.9804, 0.9755, 0.9755, 0.9755],
    [0.9801, 0.9801, 0.9801, 0.9801],
    [0.9854, 0.9854, 0.9854, 0.9854],
]);
export const tankRobotIdleSprite = new Image();
tankRobotIdleSprite.src = tankRobotIdleSpriteUrl;
export const tankRobotFlySprite = new Image();
tankRobotFlySprite.src = tankRobotFlySpriteUrl;
export const tankRobotSlamSprite = new Image();
tankRobotSlamSprite.src = tankRobotSlamSpriteUrl;
export const LORD_GOOB_FRAME_COUNT = 4;
export const LORD_GOOB_PHASE_TWO_FRAME_COUNT = 6;
export const LORD_GOOB_PHASE_THREE_FRAME_COUNT = 6;
export const LORD_GOOB_FRAME_DURATION_MS = 260;
export const LORD_GOOB_SOURCE_COLUMNS = Object.freeze([
    { x: 0, width: 304 },
    { x: 304, width: 305 },
    { x: 609, width: 304 },
    { x: 913, width: 304 },
]);
export const LORD_GOOB_SOURCE_ROWS = Object.freeze([
    { y: 0, height: 323 },
    { y: 323, height: 324 },
    { y: 647, height: 323 },
    { y: 970, height: 323 },
]);
export const LORD_GOOB_IDLE_ANCHOR_X = Object.freeze([
    [0.5801, 0.5434, 0.5186, 0.4848],
    [0.5904, 0.5442, 0.5028, 0.4833],
    [0.5759, 0.5372, 0.4996, 0.4740],
    [0.5715, 0.5393, 0.5078, 0.4808],
]);
export const LORD_GOOB_PHASE_TWO_COLUMNS = Object.freeze([
    { x: 0, width: 256 },
    { x: 256, width: 256 },
    { x: 512, width: 256 },
    { x: 768, width: 256 },
    { x: 1024, width: 256 },
    { x: 1280, width: 256 },
]);
export const LORD_GOOB_PHASE_TWO_ROWS = Object.freeze([
    { y: 0, height: 256 },
    { y: 256, height: 256 },
    { y: 512, height: 256 },
    { y: 768, height: 256 },
]);
export const LORD_GOOB_PHASE_TWO_ANCHOR_Y = Object.freeze([
    [0.52, 0.52, 0.52, 0.52, 0.52, 0.52],
    [0.53, 0.53, 0.53, 0.53, 0.53, 0.53],
    [0.54, 0.54, 0.54, 0.54, 0.54, 0.54],
    [0.34, 0.34, 0.34, 0.34, 0.34, 0.34],
]);
export const LORD_GOOB_PHASE_TWO_SIZE_BY_ROW = Object.freeze([
    4.0,
    3.8,
    3.05,
    4.0,
]);
export const LORD_GOOB_PHASE_THREE_COLUMNS = Object.freeze([
    { x: 0, width: 284 },
    { x: 284, width: 284 },
    { x: 568, width: 284 },
    { x: 852, width: 285 },
    { x: 1137, width: 284 },
    { x: 1421, width: 284 },
]);
export const LORD_GOOB_PHASE_THREE_ROWS = Object.freeze([
    { y: 0, height: 231 },
    { y: 231, height: 231 },
    { y: 462, height: 230 },
    { y: 692, height: 231 },
]);
export const LORD_GOOB_PHASE_THREE_ANCHOR_Y = Object.freeze([
    [0.50, 0.50, 0.50, 0.50, 0.50, 0.50],
    [0.50, 0.50, 0.50, 0.50, 0.50, 0.50],
    [0.50, 0.50, 0.50, 0.50, 0.50, 0.50],
    [0.40, 0.40, 0.40, 0.40, 0.40, 0.40],
]);
export const LORD_GOOB_PHASE_THREE_SIZE_BY_ROW = Object.freeze([
    4.0,
    3.7,
    3.7,
    4.0,
]);
export const lordGoobIdleSprite = new Image();
lordGoobIdleSprite.src = lordGoobIdleSpriteUrl;
export const lordGoobPhaseOneSprite = new Image();
lordGoobPhaseOneSprite.src = lordGoobPhaseOneSpriteUrl;
export const lordGoobPhaseTwoSprite = new Image();
lordGoobPhaseTwoSprite.src = lordGoobPhaseTwoSpriteUrl;
export const lordGoobPhaseThreeSprite = new Image();
lordGoobPhaseThreeSprite.src = lordGoobPhaseThreeSpriteUrl;
export const SHIELD_BREAK_DURATION_MS = 400;
