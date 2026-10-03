import { useId, useMemo } from 'react';
import { useImageErrorCapture } from '../../hooks/useImageErrorCapture';
import { useMediaStore } from '../../store/useMediaStore';

const reportCardImageFailure = (src: string) => useMediaStore.getState().reportFailedUrl(src);

export interface SvgCardProps {
  svgContent: string;
  width: number;
  height: number;
  scale?: number;
  fill?: boolean;
  cover?: boolean;
}

export const SvgCard = ({ svgContent, width, height, scale = 1, fill = false, cover = false }: SvgCardProps) => {
  const captureImageErrors = useImageErrorCapture(reportCardImageFailure);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const dedupedSvg = useMemo(() => svgContent
    .replace(/\bid="([^"]+)"/g, `id="${uid}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${uid}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${uid}-$1"`),
  [svgContent, uid]);

  if (fill) {
    let filledSvg = dedupedSvg
      .replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1 width="100%"')
      .replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1 height="100%"');
    if (cover) {
      filledSvg = filledSvg.replace(/preserveAspectRatio="[^"]*"/, 'preserveAspectRatio="xMidYMid slice"');
    }
    return (
      <div ref={captureImageErrors} style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: filledSvg }} />
    );
  }
  return (
    <div
      ref={captureImageErrors}
      style={{ width: width * scale, height: height * scale, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: dedupedSvg }}
    />
  );
};
