import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { SUPPORT_URL } from "../lib/support";

export function SupportQr({ size = 76 }: { size?: number }) {
  const cells = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(SUPPORT_URL);
    qr.make();
    const count = qr.getModuleCount();
    const modules: boolean[][] = [];
    for (let row = 0; row < count; row++) {
      const line: boolean[] = [];
      for (let col = 0; col < count; col++) {
        line.push(qr.isDark(row, col));
      }
      modules.push(line);
    }
    return modules;
  }, []);

  const count = cells.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${count} ${count}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code"
    >
      <rect width={count} height={count} fill="#ffffff" />
      {cells.map((line, row) =>
        line.map(
          (isDark, col) =>
            isDark && <rect key={`${row}-${col}`} x={col} y={row} width={1} height={1} fill="#1c1a1f" />
        )
      )}
    </svg>
  );
}
