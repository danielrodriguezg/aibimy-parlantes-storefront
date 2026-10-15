import { notFound } from "next/navigation";
import { HarnessStage } from "@/components/three/harness-stage";

type Props = { searchParams: Promise<{ handle?: string; angle?: string }> };

/** Dev-only render page used to compare the 3D models against product photos. */
export default async function EstudioPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const { handle = "parlante-aibimy-my274bt-bluetooth-40w", angle = "tresCuartos" } = await searchParams;
  return <HarnessStage handle={handle} angle={angle} />;
}
