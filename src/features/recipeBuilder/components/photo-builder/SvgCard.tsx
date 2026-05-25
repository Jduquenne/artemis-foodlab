export interface SvgCardProps {
  svgContent: string;
  width: number;
  height: number;
  scale?: number;
}

export const SvgCard = ({ svgContent, width, height, scale = 1 }: SvgCardProps) => (
  <div
    style={{ width: width * scale, height: height * scale, flexShrink: 0 }}
    dangerouslySetInnerHTML={{ __html: svgContent }}
  />
);
