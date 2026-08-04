import React, { useEffect, useRef, useState } from "react";

interface EyeTrackingChatAvatarProps {
  isOpen?: boolean;
  className?: string;
}

export const EyeTrackingChatAvatar: React.FC<EyeTrackingChatAvatarProps> = ({
  isOpen = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pupil offset from eye center (in pixels)
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  // Interactive states
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Lerp animation loop for smooth organic eye movement
  useEffect(() => {
    let animFrameId: number;

    const updatePosition = () => {
      const ease = 0.22;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      setPupilPos({
        x: currentPos.current.x,
        y: currentPos.current.y,
      });

      animFrameId = requestAnimationFrame(updatePosition);
    };

    animFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Track global mouse coordinates to calculate pupil angle and offset
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const avatarCenterX = rect.left + rect.width / 2;
      const avatarCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - avatarCenterX;
      const dy = e.clientY - avatarCenterY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const maxDistance = 450;
      // Offset limits tuned for vertical oval eyes
      const maxPupilOffsetX = 7.2;
      const maxPupilOffsetY = 11.5;

      const clampedDist = Math.min(distance / maxDistance, 1);

      targetPos.current = {
        x: Math.cos(angle) * clampedDist * maxPupilOffsetX,
        y: Math.sin(angle) * clampedDist * maxPupilOffsetY,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Periodic natural blinking
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);

      const nextBlink = Math.random() * 3500 + 2500;
      timer = setTimeout(triggerBlink, nextBlink);
    };

    timer = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timer);
  }, []);

  const pupilX = 16 + pupilPos.x;
  const pupilY = 22 + pupilPos.y;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`vertical-oval-eye-avatar ${isHovered ? "hovered" : ""} ${isOpen ? "open" : ""} ${className}`}
    >
      {/* Ambient background glow border */}
      <div className="vertical-oval-eye-glow" />

      {/* Main Squircle Container */}
      <div className="vertical-oval-eye-card">
        {/* Content Row: Dual Vertical Oval Eyes */}
        <div className="vertical-oval-eyes-row">
          {/* Left Vertical Oval Eye */}
          <div className={`vertical-eye-wrapper ${isBlinking ? "blink" : ""}`}>
            <svg viewBox="0 0 32 44" className="vertical-eye-svg">
              <defs>
                <clipPath id="vertical-left-eye-clip">
                  <ellipse cx="16" cy="22" rx="14" ry="20" />
                </clipPath>
              </defs>

              {/* White Sclera Vertical Oval Base */}
              <ellipse cx="16" cy="22" rx="14" ry="20" fill="#ffffff" />

              {/* Clipped Black Pupil */}
              <g clipPath="url(#vertical-left-eye-clip)">
                <circle
                  cx={pupilX}
                  cy={pupilY}
                  r={isHovered ? 5.8 : 5.0}
                  className="vertical-pupil-circle"
                />
              </g>
            </svg>
          </div>

          {/* Right Vertical Oval Eye */}
          <div className={`vertical-eye-wrapper ${isBlinking ? "blink" : ""}`}>
            <svg viewBox="0 0 32 44" className="vertical-eye-svg">
              <defs>
                <clipPath id="vertical-right-eye-clip">
                  <ellipse cx="16" cy="22" rx="14" ry="20" />
                </clipPath>
              </defs>

              {/* White Sclera Vertical Oval Base */}
              <ellipse cx="16" cy="22" rx="14" ry="20" fill="#ffffff" />

              {/* Clipped Black Pupil */}
              <g clipPath="url(#vertical-right-eye-clip)">
                <circle
                  cx={pupilX}
                  cy={pupilY}
                  r={isHovered ? 5.8 : 5.0}
                  className="vertical-pupil-circle"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
