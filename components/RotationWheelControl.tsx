

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Vector2D } from '../types';

interface RotationWheelControlProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (newValue: number) => void;
  isDisabled: boolean;
  className?: string;
}

const WHEEL_SIZE = 120; // Diameter of the wheel
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 5; // Radius for the draggable area

export const RotationWheelControl: React.FC<RotationWheelControlProps> = ({
  value,
  min,
  max,
  step,
  onChange,
  isDisabled,
  className = '',
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartAngle = useRef<number>(0);
  const dragStartValue = useRef<number>(0);
  const wheelCenter = useRef<Vector2D>({ x: 0, y: 0 });

  const clampValue = useCallback((val: number) => {
    return Math.max(min, Math.min(max, val));
  }, [min, max]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    setIsDragging(true);

    const rect = wheelRef.current?.getBoundingClientRect();
    if (rect) {
      wheelCenter.current = { x: rect.left + CENTER, y: rect.top + CENTER };
      dragStartValue.current = value;

      const dx = e.clientX - wheelCenter.current.x;
      const dy = e.clientY - wheelCenter.current.y;
      dragStartAngle.current = Math.atan2(dy, dx) * 180 / Math.PI;
    }
  }, [isDisabled, value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isDisabled) return;

    const dx = e.clientX - wheelCenter.current.x;
    const dy = e.clientY - wheelCenter.current.y;
    const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;

    let angleDelta = currentAngle - dragStartAngle.current;

    // Handle angle wrap-around
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    let newValue = dragStartValue.current + angleDelta;
    newValue = clampValue(newValue);
    onChange(newValue);
  }, [isDragging, isDisabled, onChange, clampValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleStepChange = useCallback((increment: boolean) => {
    if (isDisabled) return;
    let newValue = increment ? value + step : value - step;
    newValue = clampValue(newValue);
    onChange(newValue);
  }, [isDisabled, value, step, onChange, clampValue]);

  const currentAngleForIndicator = useMemo(() => {
    // Normalize value to be within 0-360 range for display on wheel
    // This assumes min/max could be outside 0-360, but the indicator
    // just needs to represent where it is within a full circle.
    // Let's map min/max range to a 360 degree sweep for the indicator.
    const range = max - min;
    if (range === 0) return 0; // Prevent division by zero
    const normalizedValue = (value - min) / range; // 0 to 1
    return normalizedValue * 360; // 0 to 360 degrees
  }, [value, min, max]);

  const indicatorCoords = useMemo(() => {
    // Position indicator at 0 degrees (top) when value is at its lower bound,
    // and sweep clockwise. 0 degrees in SVG is positive X, 90 deg is positive Y.
    // We want 0 degrees to be straight up (-Y axis).
    const indicatorAngleRad = (currentAngleForIndicator - 90) * Math.PI / 180;
    const x = CENTER + RADIUS * Math.cos(indicatorAngleRad);
    const y = CENTER + RADIUS * Math.sin(indicatorAngleRad);
    return { x, y };
  }, [currentAngleForIndicator]);

  return null; // This component is effectively removed by returning null
};
