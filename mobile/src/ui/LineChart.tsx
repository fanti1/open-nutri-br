import { useState } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { formatNumber, formatShortDate } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';

// No navegador o <text> do SVG cairia na fonte serifada padrão; usa a mesma fonte do sistema do restante da UI.
const FONT_FAMILY = Platform.OS === 'web' ? 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' : undefined;

export interface ChartPoint {
  date: string;
  value: number;
}

/** Gráfico de linha simples para evolução de uma medida ao longo dos atendimentos. */
export function LineChart({ points, unit, height = 170 }: { points: ChartPoint[]; unit: string; height?: number }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const padding = { top: 20, right: 16, bottom: 26, left: 16 };
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (index: number) => padding.left + (points.length === 1 ? (width - padding.left - padding.right) / 2 : (index / (points.length - 1)) * (width - padding.left - padding.right));
  // Série constante (ou ponto único) fica centralizada na vertical, em vez de colada no eixo.
  const y = (value: number) => padding.top + (max === min ? 0.5 : 1 - (value - min) / range) * (height - padding.top - padding.bottom);

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');
  const area = `${path} L ${x(points.length - 1)} ${height - padding.bottom} L ${x(0)} ${height - padding.bottom} Z`;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke={colors.border} />
          {points.length > 1 && <Path d={area} fill={colors.primary} opacity={0.08} />}
          <Path d={path} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {points.map((point, index) => (
            <Circle key={index} cx={x(index)} cy={y(point.value)} r={4} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />
          ))}
          {points.map((point, index) =>
            index === 0 || index === points.length - 1 ? (
              <SvgText
                key={`v${index}`}
                x={x(index)}
                y={y(point.value) - 10}
                fontSize={11}
                fontFamily={FONT_FAMILY}
                fontWeight="600"
                fill={colors.text}
                textAnchor={points.length === 1 ? 'middle' : index === 0 ? 'start' : 'end'}
              >
                {`${formatNumber(point.value)} ${unit}`}
              </SvgText>
            ) : null,
          )}
          {[0, points.length - 1].filter((v, i, arr) => arr.indexOf(v) === i).map((index) => (
            <SvgText
              key={`d${index}`}
              x={x(index)}
              y={height - 8}
              fontSize={11}
              fontFamily={FONT_FAMILY}
              fill={colors.textSubtle}
              textAnchor={points.length === 1 ? 'middle' : index === 0 ? 'start' : 'end'}
            >
              {formatShortDate(points[index].date)}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}
