
import React from 'react';
import { Bone, type BoneProps } from './Bone';
import { ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT, RIGGING, MANNEQUIN_LOCAL_FLOOR_Y } from '../constants';
import { PartName, WalkingEnginePose, WalkingEngineProportions } from '../types';

interface MannequinProps {
  pose: WalkingEnginePose;
  pivotOffsets: Record<string, number>;
  props: WalkingEngineProportions;
  showPivots: boolean;
  showLabels: boolean;
  baseUnitH: number; // The 'H' from the walking engine
}

export const Mannequin: React.FC<MannequinProps> = ({
  pose,
  pivotOffsets,
  props,
  showPivots,
  showLabels,
  baseUnitH,
}) => {
  const getRotation = (partKey: keyof WalkingEnginePose | 'waist', defaultVal: number = 0) => {
    // Map 'waist' to 0 as it's the figure's root for hip rotations.
    const partRotation = partKey === 'waist' ? 0 : (pose[partKey as keyof WalkingEnginePose] || defaultVal);
    const offset = pivotOffsets[partKey] || 0;
    return partRotation + offset;
  };

  // Helper to get scaled dimensions using baseUnitH and prop overrides
  const getScaledDimension = (
    rawAnatomyValue: number, 
    propKey: keyof WalkingEngineProportions, 
    axis: 'w' | 'h'
  ) => {
    const propScale = props[propKey]?.[axis] || 1;
    return rawAnatomyValue * baseUnitH * propScale;
  };

  const ROOT_X_TRANSLATION = 0; // The walking engine has its own x-position, we center here
  const ROOT_Y_OFFSET = pose.y_offset; // Direct y-offset from walking engine

  return (
    <g 
      className="mannequin-root fill-selection" // Apply default fill color - Changed from fill-mono-dark to fill-selection
      transform={`translate(${ROOT_X_TRANSLATION}, ${ROOT_Y_OFFSET})`}
    >
      {/* Root circle for visual center, but no interaction */}
      {showPivots && (
        <circle cx="0" cy="0" r={ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.ROOT_SIZE * baseUnitH * 0.7} fill="#5A5A5A" stroke="#D1D5DB" strokeWidth="1" data-no-export={true} />
      )}

      {/* Main Body (Torso -> Collar -> Head) */}
      {/* Waist is the base for the upper body (draws upwards) */}
      <Bone 
        rotation={0} // Waist doesn't have a direct rotation from walking engine in this context
        length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST, 'pelvis', 'h')}
        width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST_WIDTH, 'pelvis', 'w')}
        variant="waist-teardrop-pointy-up" 
        drawsUpwards 
        showPivots={showPivots} 
        visible={true} 
        colorClass="fill-selection" // Use fill-selection for bones
        showLabel={showLabels}
        label="Waist"
      >
        <Bone 
          rotation={getRotation('torso')} 
          length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TORSO, 'torso', 'h')}
          width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TORSO_WIDTH, 'torso', 'w')}
          variant="torso-teardrop-pointy-down" 
          drawsUpwards 
          showPivots={showPivots} 
          visible={true} 
          offset={undefined}
          colorClass="fill-selection" // Use fill-selection for bones
          showLabel={showLabels}
          label="Torso"
        >
          <Bone 
            rotation={getRotation('collar')} 
            length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR, 'collar', 'h')}
            width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR_WIDTH, 'collar', 'w')}
            variant="collar-horizontal-oval-shape" 
            drawsUpwards 
            showPivots={showPivots} 
            visible={true} 
            offset={RIGGING.COLLAR_OFFSET_Y !== 0 ? {x: 0, y: RIGGING.COLLAR_OFFSET_Y * baseUnitH} : undefined}
            colorClass="fill-selection" // Use fill-selection for bones
            showLabel={showLabels}
            label="Collar"
          >
            {/* HEAD */}
            <Bone 
              rotation={getRotation('neck')} 
              length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HEAD, 'head', 'h')}
              width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HEAD_WIDTH, 'head', 'w')}
              variant="head-tall-oval" 
              drawsUpwards 
              showPivots={showPivots} 
              visible={true} 
              offset={{x: 0, y: -ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HEAD_NECK_GAP_OFFSET * baseUnitH}}
              colorClass="fill-selection" // Use fill-selection for bones
              showLabel={showLabels}
              label="Head"
            />
            
            {/* RIGHT ARM */}
            <g transform={`translate(${RIGGING.R_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER * baseUnitH}, ${RIGGING.SHOULDER_Y_OFFSET_FROM_COLLAR_END * baseUnitH})`}>
              <Bone 
                rotation={getRotation('r_shoulder')} 
                length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, 'arms', 'h')} 
                width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_ARM, 'arms', 'w')} 
                variant="deltoid-shape" 
                showPivots={showPivots} 
                visible={true} 
                colorClass="fill-selection" // Use fill-selection for bones
                showLabel={showLabels}
                label="R.Bicep"
              >
                <Bone 
                  rotation={getRotation('r_elbow')} 
                  length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, 'arms', 'h')} 
                  width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_FOREARM, 'arms', 'w')} 
                  variant="limb-tapered" 
                  showPivots={showPivots} 
                  visible={true} 
                  colorClass="fill-selection" // Use fill-selection for bones
                  showLabel={showLabels}
                  label="R.Forearm"
                >
                  <Bone 
                    rotation={getRotation('r_hand')} 
                    length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND, 'hand', 'h')} 
                    width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND_WIDTH, 'hand', 'w')} 
                    variant="hand-foot-arrowhead-shape" 
                    showPivots={showPivots} 
                    visible={true} 
                    colorClass="fill-selection" // Use fill-selection for bones
                    showLabel={showLabels}
                    label="R.Hand"
                  />
                </Bone>
              </Bone>
            </g>

            {/* LEFT ARM */}
            <g transform={`translate(${RIGGING.L_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER * baseUnitH}, ${RIGGING.SHOULDER_Y_OFFSET_FROM_COLLAR_END * baseUnitH})`}>
              <Bone 
                rotation={getRotation('l_shoulder')} 
                length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, 'arms', 'h')} 
                width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_ARM, 'arms', 'w')} 
                variant="deltoid-shape" 
                showPivots={showPivots} 
                visible={true} 
                colorClass="fill-selection" // Use fill-selection for bones
                showLabel={showLabels}
                label="L.Bicep"
              >
                <Bone 
                  rotation={getRotation('l_elbow')} 
                  length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, 'arms', 'h')} 
                  width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_FOREARM, 'arms', 'w')} 
                  variant="limb-tapered" 
                  showPivots={showPivots} 
                  visible={true} 
                  colorClass="fill-selection" // Use fill-selection for bones
                  showLabel={showLabels}
                  label="L.Forearm"
                >
                  <Bone 
                    rotation={getRotation('l_hand')} 
                    length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND, 'hand', 'h')} 
                    width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND_WIDTH, 'hand', 'w')} 
                    variant="hand-foot-arrowhead-shape" 
                    showPivots={showPivots} 
                    visible={true} 
                    colorClass="fill-selection" // Use fill-selection for bones
                    showLabel={showLabels}
                    label="L.Hand"
                  />
                </Bone>
              </Bone>
            </g>
          </Bone>
        </Bone>
      </Bone>
      
      {/* LEGS (attached at the same conceptual root as Waist) */}
      <g>
        <Bone 
          rotation={getRotation('l_hip')} 
          length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, 'legs', 'h')} 
          width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_THIGH, 'legs', 'w')} 
          variant="limb-tapered" 
          showPivots={showPivots} 
          visible={true} 
          offset={{x: -ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST_WIDTH * 0.4 * baseUnitH, y: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST * baseUnitH * 0.2}}
          colorClass="fill-selection" // Use fill-selection for bones
          showLabel={showLabels}
          label="L.Thigh"
        >
          <Bone 
            rotation={getRotation('l_knee')} 
            length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, 'legs', 'h')} 
            width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_CALF, 'legs', 'w')} 
            variant="limb-tapered" 
            showPivots={showPivots} 
            visible={true} 
            colorClass="fill-selection" // Use fill-selection for bones
            showLabel={showLabels}
            label="L.Calf"
          >
            <Bone 
              rotation={getRotation('l_foot')} 
              length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, 'foot', 'h')} 
              width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT_WIDTH, 'foot', 'w')} 
              variant="hand-foot-arrowhead-shape" 
              showPivots={showPivots} 
              visible={true} 
              colorClass="fill-selection" // Use fill-selection for bones
              showLabel={showLabels}
              label="L.Foot"
            />
          </Bone>
        </Bone>
      </g>

      <g>
        <Bone 
          rotation={getRotation('r_hip')} 
          length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, 'legs', 'h')} 
          width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_THIGH, 'legs', 'w')} 
          variant="limb-tapered" 
          showPivots={showPivots} 
          visible={true} 
          offset={{x: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST_WIDTH * 0.4 * baseUnitH, y: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST * baseUnitH * 0.2}}
          colorClass="fill-selection" // Use fill-selection for bones
          showLabel={showLabels}
          label="R.Thigh"
        >
          <Bone 
            rotation={getRotation('r_knee')} 
            length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, 'legs', 'h')} 
            width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_CALF, 'legs', 'w')} 
            variant="limb-tapered" 
            showPivots={showPivots} 
            visible={true} 
            colorClass="fill-selection" // Use fill-selection for bones
            showLabel={showLabels}
            label="R.Calf"
          >
            <Bone 
              rotation={getRotation('r_foot')} 
              length={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, 'foot', 'h')} 
              width={getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT_WIDTH, 'foot', 'w')} 
              variant="hand-foot-arrowhead-shape" 
              showPivots={showPivots} 
              visible={true} 
              colorClass="fill-selection" // Use fill-selection for bones
              showLabel={showLabels}
              label="R.Foot"
            />
          </Bone>
        </Bone>
      </g>
    </g>
  );
};
