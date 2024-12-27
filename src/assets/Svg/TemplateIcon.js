import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
import { memo } from "react";

const TemplateIcon = ({ width = 24, height = 24, color = '#000', ...props }) => (
  <Svg
    {...props}
    xmlSpace="preserve"
    width={width}
    height={height}
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
    viewBox="0 0 512 512"
  >
    <G
      style={{
        display: "inline",
      }}
    >
      <Path
        d="M0 452.002V0h259.03v20.581h-42.84c-8.284 0-15 6.716-15 15v221.845c0 8.284 6.716 15 15 15h115.67c8.284 0 15-6.716 15-15V123.995h23.93v328.007ZM289.03 93.995V24.047l63.046 69.948zm-15 30h42.83v118.431h-85.67V50.581h27.84v58.414c0 8.284 6.716 15 15 15m122.901-25.043L285.171-25.043A14.999 14.999 0 0 0 274.03-30H-15c-8.284 0-15 6.716-15 15v482.002c0 8.284 6.716 15 15 15h400.79c8.284 0 15-6.716 15-15V108.995c0-3.709-1.374-7.287-3.859-10.043"
        style={{
          fillRule: "nonzero",
        }}
        fill={color}
        transform="translate(70.61 30)"
      />
      <Path
        d="M2258.2 1296.37h-85.67v-191.84h85.67zm15-221.84h-115.67c-8.28 0-15 6.71-15 15v221.84c0 8.29 6.72 15 15 15h115.67c8.28 0 15-6.71 15-15v-221.84c0-8.29-6.72-15-15-15"
        style={{
          fillRule: "nonzero",
        }}
        fill={color}
        transform="translate(-2048 -864.95)"
      />
      <Path
        d="M2258.2 1455.37h-85.67v-66.83h85.67zm15-96.83h-115.67c-8.28 0-15 6.71-15 15v96.83c0 8.28 6.72 15 15 15h115.67c8.28 0 15-6.72 15-15v-96.83c0-8.29-6.72-15-15-15"
        style={{
          fillRule: "nonzero",
        }}
        fill={color}
        transform="translate(-2048 -1307.96)"
      />
      <Path
        d="M2435.46 1171.36h-85.66v-66.83h85.66zm15-96.83H2334.8c-8.29 0-15 6.71-15 15v96.83c0 8.28 6.71 15 15 15h115.66c8.28 0 15-6.72 15-15v-96.83c0-8.29-6.72-15-15-15"
        style={{
          fillRule: "nonzero",
        }}
        fill={color}
        transform="translate(-2048 -739.94)"
      />
    </G>
  </Svg>
);

const Memo = memo(TemplateIcon);
export default Memo;
