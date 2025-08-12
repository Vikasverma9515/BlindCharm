/* DecayCard.tsx */
import React, { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";

interface DecayCardProps {
	width?: number;
	height?: number;
	image?: string;
	children?: ReactNode;
}

const DecayCard: React.FC<DecayCardProps> = ({
	width = 300,
	height = 700,
	image = "https://picsum.photos/300/700",
	children,
}) => {
	// unique id to avoid duplicate SVG filter ids when multiple cards are rendered
	const idRef = useRef(`decay-${Math.random().toString(36).slice(2, 9)}`);

	// container ref (we animate this with GSAP)
	const containerRef = useRef<HTMLDivElement | null>(null);
	const displacementMapRef = useRef<SVGFEDisplacementMapElement | null>(null);

	// safe window fallbacks for SSR
	const initialW = typeof window !== "undefined" ? window.innerWidth : 1200;
	const initialH = typeof window !== "undefined" ? window.innerHeight : 800;

	const cursor = useRef<{ x: number; y: number }>({
		x: initialW / 2,
		y: initialH / 2,
	});
	const cachedCursor = useRef<{ x: number; y: number }>({ ...cursor.current });
	const winsize = useRef<{ width: number; height: number }>({
		width: initialW,
		height: initialH,
	});

	useEffect(() => {
		const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
		const map = (x: number, a: number, b: number, c: number, d: number) =>
			((x - a) * (d - c)) / (b - a) + c;
		const distance = (x1: number, x2: number, y1: number, y2: number) =>
			Math.hypot(x1 - x2, y1 - y2);

		const handleResize = () => {
			winsize.current = { width: window.innerWidth, height: window.innerHeight };
		};
		const handleMouseMove = (ev: MouseEvent) => {
			cursor.current = { x: ev.clientX, y: ev.clientY };
		};

		window.addEventListener("resize", handleResize);
		window.addEventListener("mousemove", handleMouseMove);

		const imgValues = {
			imgTransforms: { x: 0, y: 0, rz: 0 },
			displacementScale: 0,
		};

		const render = () => {
			let targetX = lerp(
				imgValues.imgTransforms.x,
				map(cursor.current.x, 0, winsize.current.width, -120, 120),
				0.1
			);
			let targetY = lerp(
				imgValues.imgTransforms.y,
				map(cursor.current.y, 0, winsize.current.height, -120, 120),
				0.1
			);
			let targetRz = lerp(
				imgValues.imgTransforms.rz,
				map(cursor.current.x, 0, winsize.current.width, -10, 10),
				0.1
			);

			const bound = 50;
			if (targetX > bound) targetX = bound + (targetX - bound) * 0.2;
			if (targetX < -bound) targetX = -bound + (targetX + bound) * 0.2;
			if (targetY > bound) targetY = bound + (targetY - bound) * 0.2;
			if (targetY < -bound) targetY = -bound + (targetY + bound) * 0.2;

			imgValues.imgTransforms.x = targetX;
			imgValues.imgTransforms.y = targetY;
			imgValues.imgTransforms.rz = targetRz;

			if (containerRef.current) {
				gsap.set(containerRef.current, {
					x: imgValues.imgTransforms.x,
					y: imgValues.imgTransforms.y,
					rotateZ: imgValues.imgTransforms.rz,
				});
			}

			const cursorTravelledDistance = distance(
				cachedCursor.current.x,
				cursor.current.x,
				cachedCursor.current.y,
				cursor.current.y
			);
			imgValues.displacementScale = lerp(
				imgValues.displacementScale,
				map(cursorTravelledDistance, 0, 200, 0, 400),
				0.06
			);

			if (displacementMapRef.current) {
				gsap.set(displacementMapRef.current, {
					attr: { scale: imgValues.displacementScale },
				});
			}

			cachedCursor.current = { ...cursor.current };
			requestAnimationFrame(render);
		};

		render();

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	// container inline style (rounded corners + border + shadow + overflow hidden)
	const borderWidth = 4;
	const borderRadius = 28;
	const containerStyle: React.CSSProperties = {
		width: `${width}px`,
		height: `${height}px`,
		borderRadius: borderRadius, // px
		overflow: "hidden", // this clips the SVG/image to rounded corners
		border: `${borderWidth}px solid black`,
		boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
		position: "relative",
		background: "#f8f9fa", // Light background to show if image doesn't fill completely
		margin: "0 auto",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	// Calculate inner dimensions (accounting for border)
	const innerWidth = width - (borderWidth * 2);
	const innerHeight = height - (borderWidth * 2);
	const innerBorderRadius = borderRadius - borderWidth;

	return (
		<div ref={containerRef} style={containerStyle}>
			<svg
				width={innerWidth}
				height={innerHeight}
				viewBox={`0 0 ${innerWidth} ${innerHeight}`}
				preserveAspectRatio="xMidYMid meet"
				className="block [will-change:transform]"
				style={{
					position: 'absolute',
					top: borderWidth,
					left: borderWidth,
					width: innerWidth,
					height: innerHeight,
				}}
			>
				<defs>
					<clipPath id={`roundedCorners-${idRef.current}`}>
						<rect 
							width={innerWidth} 
							height={innerHeight} 
							rx={innerBorderRadius} 
							ry={innerBorderRadius} 
						/>
					</clipPath>
					<filter id={`shadowFilter-${idRef.current}`} x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="black" floodOpacity="0.4" />
					</filter>
					<filter id={`imgFilter-${idRef.current}`}>
						<feTurbulence
							type="turbulence"
							baseFrequency="0.015"
							numOctaves="5"
							seed="4"
							stitchTiles="stitch"
							x="0%"
							y="0%"
							width="100%"
							height="100%"
							result="turbulence1"
						/>
						<feDisplacementMap
							ref={displacementMapRef}
							in="SourceGraphic"
							in2="turbulence1"
							scale="0"
							xChannelSelector="R"
							yChannelSelector="B"
						/>
					</filter>
				</defs>

				{/* Image with clipPath applied */}
				<image
					href={image}
					width={innerWidth}
					height={innerHeight}
					clipPath={`url(#roundedCorners-${idRef.current})`}
					filter={`url(#imgFilter-${idRef.current})`}
					preserveAspectRatio="xMidYMid meet"
				/>
			</svg>


			{/* children overlay (text) */}
			{children && (
				<div
					style={{
						position: "absolute",
						bottom: 18,
						left: 16,
						right: 16,
						textAlign: "center",
						fontWeight: 900,
						fontSize: 28,
						lineHeight: 1,
						pointerEvents: "none",
					}}
				>
					{children}
				</div>
			)}
		</div>
	);
};

export default DecayCard;
