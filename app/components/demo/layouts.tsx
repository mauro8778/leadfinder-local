import type { ReactNode } from "react";
import type { DemoDesignId } from "@/lib/demo-themes";
import type { DemoLayoutContext } from "./shared";
import { CampusLayout } from "./layouts/campus";
import { CareLayout } from "./layouts/care";
import { ClinicalLayout } from "./layouts/clinical";
import { CounselLayout } from "./layouts/counsel";
import { EditorialLayout } from "./layouts/editorial";
import { FolioLayout } from "./layouts/folio";
import { LedgerLayout } from "./layouts/ledger";
import { MarketLayout } from "./layouts/market";
import { NoirLayout } from "./layouts/noir";
import { PowerLayout } from "./layouts/power";
import { PulseLayout } from "./layouts/pulse";
import { PureLayout } from "./layouts/pure";
import { StructureLayout } from "./layouts/structure";
import { WarmLayout } from "./layouts/warm";

const LAYOUTS: Record<DemoDesignId, (ctx: DemoLayoutContext) => ReactNode> = {
  editorial: EditorialLayout,
  noir: NoirLayout,
  warm: WarmLayout,
  power: PowerLayout,
  structure: StructureLayout,
  care: CareLayout,
  clinical: ClinicalLayout,
  pure: PureLayout,
  counsel: CounselLayout,
  ledger: LedgerLayout,
  campus: CampusLayout,
  pulse: PulseLayout,
  folio: FolioLayout,
  market: MarketLayout,
};

export function renderDemoLayout(ctx: DemoLayoutContext) {
  const Layout = LAYOUTS[ctx.design] ?? EditorialLayout;
  return <Layout {...ctx} />;
}
