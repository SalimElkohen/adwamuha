import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

// W3 "Fading light": a large gold أدومها that fades downwards, with ADWAMUHĀ set
// across its faded lower part. Drawn as vector, so it stays sharp at any size.
export default function Logo({ width = 200, gold = '#E3C277', latin = '#F8F3E8', id = 'logo' }) {
  const h = (width * 190) / 330;
  return (
    <Svg width={width} height={h} viewBox="0 0 330 190">
      <Defs>
        <LinearGradient id={id + 'fade'} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.15" stopColor={gold} stopOpacity={0.9} />
          <Stop offset="0.95" stopColor={gold} stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      <SvgText x="165" y="128" textAnchor="middle" fontFamily="Amiri-Bold" fontSize="118" fill={`url(#${id}fade)`}>أدومها</SvgText>
      <SvgText x="165" y="152" textAnchor="middle" fontFamily="System" fontWeight="600" fontSize="24" letterSpacing="10" fill={latin}>ADWAMUHĀ</SvgText>
    </Svg>
  );
}
