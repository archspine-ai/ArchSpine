import { Manifest } from '../infra/manifest.js';
import { defaultRuntimeIO, RuntimeIO } from '../infra/runtime-io.js';

export async function runUsageReport(
  rootDir: string,
  runtimeIO: RuntimeIO = defaultRuntimeIO,
): Promise<void> {
  const manifest = Manifest.open(rootDir);

  const total = manifest.getTotalUsage();
  const summary = manifest.getUsageSummary();
  const violations = manifest.getActiveViolations();

  runtimeIO.info('\n========================================');
  runtimeIO.info(' ArchSpine Usage & Audit Report');
  runtimeIO.info('========================================\n');

  if (!total || total.session_count === 0) {
    runtimeIO.info('No usage data recorded yet. Run `spine sync` or `spine check` first.');
  } else {
    const inputCost = (total.input_tokens / 1_000_000) * 0.14;
    const outputCost = (total.output_tokens / 1_000_000) * 0.28;
    const totalCost = inputCost + outputCost;

    runtimeIO.info(`📊 All-Time Token Summary (${total.session_count} sessions):`);
    runtimeIO.info(`   Input Tokens:  ${total.input_tokens.toLocaleString()}`);
    runtimeIO.info(`   Output Tokens: ${total.output_tokens.toLocaleString()}`);
    runtimeIO.info(`   Total Tokens:  ${total.total_tokens.toLocaleString()}`);
    runtimeIO.info(`   Estimated Cost: $${totalCost.toFixed(4)} USD (DeepSeek Pricing)`);
    runtimeIO.info('');

    if (summary.length > 0) {
      runtimeIO.info('📅 Recent Daily Breakdown (last 30 days):');
      runtimeIO.info('   Date        | Mode        | Input    | Output   | Total');
      runtimeIO.info('   ------------|-------------|----------|----------|----------');
      for (const row of summary) {
        const date = row.date.padEnd(12);
        const mode = row.sync_mode.padEnd(12);
        runtimeIO.info(
          `   ${date}| ${mode}| ${String(row.input_tokens).padEnd(9)}| ${String(row.output_tokens).padEnd(9)}| ${row.total_tokens}`,
        );
      }
      runtimeIO.info('');
    }
  }

  if (violations.length > 0) {
    runtimeIO.info(`🚨 Active Architecture Violations (${violations.length} total):`);
    runtimeIO.info('   Severity | Rule ID         | File                         | Detected At');
    runtimeIO.info(
      '   ---------|-----------------|------------------------------|-------------------',
    );
    for (const v of violations) {
      const sev = v.severity.toUpperCase().padEnd(8);
      const rule = v.rule_id.padEnd(16);
      const file = v.file_path.slice(-30).padEnd(30);
      const ts = v.detected_at.slice(0, 19);
      runtimeIO.info(`   ${sev} | ${rule}| ${file}| ${ts}`);
      runtimeIO.info(`            ↳ ${v.reason}`);
    }
  } else {
    runtimeIO.info('✅ No active architecture violations on record.');
  }

  runtimeIO.info('\n========================================\n');
}
