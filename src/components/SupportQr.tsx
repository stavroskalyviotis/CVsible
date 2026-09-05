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
  const quietZone = 4;
  const total = count + quietZone * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code"
    >
      <rect width={total} height={total} fill="#ffffff" />
      {cells.map((line, row) =>
        line.map(
          (isDark, col) =>
            isDark && (
              <rect
                key={`${row}-${col}`}
                x={col + quietZone}
                y={row + quietZone}
                width={1}
                height={1}
                fill="#1c1a1f"
              />
            )
        )
      )}
    </svg>
  );
}
