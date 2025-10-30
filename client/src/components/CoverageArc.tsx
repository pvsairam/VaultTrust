import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

interface CoverageArcProps {
  percentage: number;
  size?: number;
}

export function CoverageArc({ percentage, size = 120 }: CoverageArcProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = size / 2 - 10;
    const arcWidth = 12;

    const arc = d3
      .arc()
      .innerRadius(radius - arcWidth)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .cornerRadius(6);

    const g = svg
      .append("g")
      .attr("transform", `translate(${size / 2}, ${size / 2})`);

    g.append("path")
      .datum({ endAngle: Math.PI / 2 })
      .attr("d", arc as any)
      .attr("fill", "currentColor")
      .attr("opacity", 0.2);

    const foregroundArc = g
      .append("path")
      .datum({ endAngle: -Math.PI / 2 })
      .attr("d", arc as any)
      .attr("fill", "url(#gradient)")
      .attr("filter", "url(#glow)");

    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", -radius)
      .attr("x2", 0)
      .attr("y2", radius);

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4");

    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const targetAngle = -Math.PI / 2 + (percentage / 100) * Math.PI;

    foregroundArc
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attrTween("d", function () {
        const interpolate = d3.interpolate(-Math.PI / 2, targetAngle);
        return function (t) {
          return arc({ endAngle: interpolate(t) } as any) || "";
        };
      });
  }, [percentage, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex items-center justify-center"
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="text-primary drop-shadow-lg"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-mono text-2xl font-bold"
        >
          {percentage}%
        </motion.span>
        <span className="text-xs text-muted-foreground">Coverage</span>
      </div>
    </motion.div>
  );
}
