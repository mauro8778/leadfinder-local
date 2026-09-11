export type DemoDesignId =
  | "editorial"
  | "noir"
  | "warm"
  | "power"
  | "structure"
  | "care"
  | "clinical"
  | "pure"
  | "counsel"
  | "ledger"
  | "campus"
  | "pulse"
  | "folio"
  | "market";

export interface DemoTheme {
  id: DemoDesignId;
  label: string;
}

export const DEMO_DESIGNS: Record<DemoDesignId, DemoTheme> = {
  editorial: { id: "editorial", label: "Editorial claro" },
  noir: { id: "noir", label: "Oscuro premium" },
  warm: { id: "warm", label: "Cálido orgánico" },
  power: { id: "power", label: "Deportivo bold" },
  structure: { id: "structure", label: "Corporativo grid" },
  care: { id: "care", label: "Salud suave" },
  clinical: { id: "clinical", label: "Farmacia limpia" },
  pure: { id: "pure", label: "Odontología pure" },
  counsel: { id: "counsel", label: "Estudio jurídico" },
  ledger: { id: "ledger", label: "Estudio contable" },
  campus: { id: "campus", label: "Colegio" },
  pulse: { id: "pulse", label: "Sistema de ventas" },
  folio: { id: "folio", label: "Cuentas pyme" },
  market: { id: "market", label: "Ecommerce" },
};
