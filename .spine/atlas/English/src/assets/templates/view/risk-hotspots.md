# Risk Hotspots Report – ArchSpine

## Why This Document Exists

The Risk Hotspots Report surfaces the files in the ArchSpine codebase that carry the highest composite risk scores. It exists to turn raw risk metrics into a prioritised, actionable list so that teams can focus refactoring, testing, and review efforts where they matter most. The report is auto-generated and reflects the current state risk profile of the codebase.

## Who Should Read It

Developers, technical leads, and maintainers of the ArchSpine project. Anyone responsible for deciding _where_ to invest code improvement time should start here. The report is designed to be consumed both by humans during planning sessions and by AI agents that assist with maintenance triage.

## Decisions & Workflows It Anchors

- **Maintenance prioritisation**: Files ranked by a composite score of risk factors and impact. The highest-scoring files are listed first and receive detailed analysis.
- **Refactoring and testing assignments**: The detailed analysis for each hotspot explains why the file was flagged and suggests areas that need attention.
- **On‑demand refresh**: The report is an experimental view. Run `spine sync` to regenerate it with the latest codebase state. Do not treat it as a permanent audit – always refresh before making decisions.

---

*Generated from the ArchSpine semantic model. For questions, see the project’s risk documentation.*