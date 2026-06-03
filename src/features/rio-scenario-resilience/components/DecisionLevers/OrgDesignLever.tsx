import type { DecisionLeverShellProps } from "./leverTypes";
import {
  orgDesignCompensationAliases,
  orgDesignStructure,
  scenarioOfferRoleActivationSourceContract,
  type OrgDesignStructureOption,
} from "../../data";
import { Badge, Card } from "../../../../components/common";

type OrgDesignLeverProps = DecisionLeverShellProps & {
  options?: readonly OrgDesignStructureOption[];
};

export function OrgDesignLever({ selectedValue, onChange, options = orgDesignStructure }: OrgDesignLeverProps) {
  return (
    <Card
      title="Org Design Structure"
      subtitle="Structural package"
      actions={<Badge variant="warning">Structure only</Badge>}
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-600">
          Scenario Offer role activation is blocked because the source is narrative-only. These options do not activate payroll.
        </p>
        <div className="grid gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selectedValue === option.id}
              className={
                `rounded-2xl border px-3 py-3 text-left transition-all ${
                  selectedValue === option.id
                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`
              }
            >
              <div className="text-sm font-semibold">{option.label}</div>
              <div className={`mt-1 text-xs leading-5 ${selectedValue === option.id ? "text-slate-200" : "text-slate-500"}`}>{option.description}</div>
              <div className={`mt-2 text-[10px] uppercase tracking-widest ${selectedValue === option.id ? "text-slate-200" : "text-slate-400"}`}>
                {option.additionalRoleIds.length > 0
                  ? option.additionalRoleIds.join(" · ")
                  : "Role activation mapping blocked"}
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
            {scenarioOfferRoleActivationSourceContract.status}
          </div>
          <div className="mt-2 grid gap-1">
            {orgDesignCompensationAliases.map((role) => (
              <div key={role.roleId} className="text-xs leading-5 text-amber-900">
                <span className="font-semibold">{role.displayRole}</span>
                {" -> "}
                {role.compensationRole.roleName}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
