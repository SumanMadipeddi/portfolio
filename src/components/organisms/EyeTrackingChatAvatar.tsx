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
      const ease = 0.2;
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
      const maxPupilOffsetX = 7.0;
      const maxPupilOffsetY = 4.8;

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

  const pupilX = 18 + pupilPos.x;
  const pupilY = 11 + pupilPos.y;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pill-eye-avatar ${isHovered ? "hovered" : ""} ${isOpen ? "open" : ""} ${className}`}
    >
      {/* Outer ambient border ring */}
      <div className="pill-eye-border-glow" />

      {/* Top Glass Surface Reflection */}
      <div className="pill-eye-gloss" />

      {/* Content Row: ONLY Eyes Centered */}
      <div className="pill-eye-content">
        {/* Left Almond Eye */}
        <div className={`almond-eye-wrapper ${isBlinking ? "blink" : ""}`}>
          <svg viewBox="0 0 36 22" className="almond-eye-svg">
            <defs>
              <clipPath id="left-eye-clip">
                <path d="M 2 11 C 7 3 29 3 34 11 C 29 19 7 19 2 11 Z" />
              </clipPath>
            </defs>

            {/* Sclera White Base */}
            <path
              d="M 2 11 C 7 3 29 3 34 11 C 29 19 7 19 2 11 Z"
              fill="#ffffff"
            />

            {/* Clipped Pupil & Catchlight */}
            <g clipPath="url(#left-eye-clip)">
              {/* Pupil */}
              <circle
                cx={pupilX}
                cy={pupilY}
                r={isHovered ? 5.6 : 4.8}
                className="eye-pupil-circle"
              />
              {/* Catchlight */}
              <circle
                cx={pupilX - 1.6}
                cy={pupilY - 1.6}
                r={1.6}
                fill="#ffffff"
              />
            </g>
          </svg>
        </div>

        {/* Right Almond Eye */}
        <div className={`almond-eye-wrapper ${isBlinking ? "blink" : ""}`}>
          <svg viewBox="0 0 36 22" className="almond-eye-svg">
            <defs>
              <clipPath id="right-eye-clip">
                <path d="M 2 11 C 7 3 29 3 34 11 C 29 19 7 19 2 11 Z" />
              </clipPath>
            </defs>

            {/* Sclera White Base */}
            <path
              d="M 2 11 C 7 3 29 3 34 11 C 29 19 7 19 2 11 Z"
              fill="#ffffff"
            />

            {/* Clipped Pupil & Catchlight */}
            <g clipPath="url(#right-eye-clip)">
              {/* Pupil */}
              <circle
                cx={pupilX}
                cy={pupilY}
                r={isHovered ? 5.6 : 4.8}
                className="eye-pupil-circle"
              />
              {/* Catchlight */}
              <circle
                cx={pupilX - 1.6}
                cy={pupilY - 1.6}
                r={1.6}
                fill="#ffffff"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
