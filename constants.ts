

import { PartName, Pose, Vector2D, JointLimits } from './types';

export const SCALE_FACTOR = 1; // This remains for overall SVG viewport scaling to maintain visual size.
export const BASE_HEAD_UNIT = 50; // The base unit for the internal anatomy proportions. 'H' from walking engine will substitute this.

// ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT: These are the *proportions* of each part
// relative to a single BASE_HEAD_UNIT (or the H from the walking engine).
export const ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT = {
  HEAD: 1.0,
  HEAD_WIDTH: 0.8,
  HEAD_NECK_GAP_OFFSET: 0.1,
  COLLAR: 0.4, 
  COLLAR_WIDTH: (2 / 3), 
  TORSO: 1.2,
  TORSO_WIDTH: 0.65, 
  WAIST: 1.0,
  WAIST_WIDTH: 0.85, 
  UPPER_ARM: 1.8,
  LOWER_ARM: 1.4,
  HAND: 0.8,
  LEG_UPPER: 2.2,
  LEG_LOWER: 1.8,
  FOOT: 1.0,
  SHOULDER_WIDTH: 1.2,
  HIP_WIDTH: 1.0,
  ROOT_SIZE: 0.25,
  LIMB_WIDTH_ARM: 0.22,
  LIMB_WIDTH_FOREARM: 0.18,
  LIMB_WIDTH_THIGH: 0.35,
  LIMB_WIDTH_CALF: 0.28,
  HAND_WIDTH: 0.2,
  FOOT_WIDTH: 0.25,
  EFFECTOR_WIDTH: 0.15,
};

// RIGGING values now reference ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT values directly.
export const RIGGING = {
  L_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER: -ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR_WIDTH / 2.1,
  R_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR_WIDTH / 2.1,
  SHOULDER_Y_OFFSET_FROM_COLLAR_END: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR,
  COLLAR_OFFSET_Y: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR * 0.15,
};

// The actual Y position for the floor in the mannequin's local coordinate system (before overall translation).
// This is the sum of leg segments below the hip.
export const MANNEQUIN_LOCAL_FLOOR_Y = 
    ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER + 
    ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER + 
    ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT;

export const GROUND_STRIP_HEIGHT_RAW_H_UNIT = 0.4; // Height of the visual ground strip in H units
export const GROUND_STRIP_COLOR = '#252525'; // Slightly lighter very dark grey for the ground strip


// BASE_ROTATIONS, RESET_POSE, and JOINT_LIMITS are no longer directly used by the walking engine's physics.
// Keeping them for potential future reference or if other parts of the system still rely on the Pose type structure.
type RotationValues = Omit<Pose, 'root' | 'offsets'>;

export const BASE_ROTATIONS: RotationValues = {
  bodyRotation: 0,
  torso: 0,
  waist: 0,
  collar: 0,
  head: 0,
  lShoulder: 0,
  lForearm: 0,
  lWrist: 0,
  rShoulder: 0,
  rForearm: 0,
  rWrist: 0,
  lThigh: 0,
  lCalf: 0,
  lAnkle: 0,
  rThigh: 0,
  rCalf: 0,
  rAnkle: 0,
};

export const RESET_POSE: Pose = {
  root: { x: 0, y: 0 }, 
  ...BASE_ROTATIONS,
  offsets: {
    [PartName.Collar]: {x: 0, y: RIGGING.COLLAR_OFFSET_Y}
  },
};

// Define joint rotation limits in degrees
export const JOINT_LIMITS: JointLimits = {
  // Spine (relative to parent)
  [PartName.Waist]: { min: -180, max: 180 }, 
  [PartName.Torso]: { min: -180, max: 180 },
  [PartName.Collar]: { min: -180, max: 180 },
  [PartName.Head]: { min: -180, max: 180 },

  // Right Arm (relative to parent)
  [PartName.RShoulder]: { min: -180, max: 180 }, 
  rForearm: { min: -180, max: 180 },         
  [PartName.RWrist]: { min: -180, max: 180 }, 

  // Left Arm (relative to parent)
  [PartName.LShoulder]: { min: -180, max: 180 }, 
  lForearm: { min: -180, max: 180 },          
  [PartName.LWrist]: { min: -180, max: 180 }, 

  // Right Leg (relative to parent)
  [PartName.RThigh]: { min: -180, max: 180 }, 
  rCalf: { min: -180, max: 180 },           
  [PartName.RAnkle]: { min: -180, max: 180 }, 
  // Left Leg (relative to parent)
  [PartName.LThigh]: { min: -180, max: 180 },
  lCalf: { min: -180, max: 180 },
  [PartName.LAnkle]: { min: -180, max: 180 },
};
