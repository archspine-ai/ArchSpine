<!-- spine-content-hash:741ad1a0fca2030fd6caa3c5eeab135f62d359202ab6f0ebb31894abad9e66fd -->
# ArchSpine Task State Unit Tests

## Role
Vitest unit test suite for ArchSpine's core task state management, runtime cache, and telemetry statistics.

## Key Responsibilities
- Tests the creation, reset, and artifact state of task state objects (`createTaskState`, `resetTaskState`, `createTaskArtifactsState`).
- Validates telemetry statistics accumulation and stage metrics recording (`recordTaskStageMetric`, `incrementTaskFailed`, `incrementTaskSkipped`).
- Verifies runtime cache behavior for skeletons, unsupported files, and pending commits.
- Ensures task usage tracking and commit queuing functions operate correctly (`addTaskUsage`, `queueTaskCommit`).

## Out of Scope
- Integration testing of the full pipeline execution.
- End-to-end testing of CLI commands.
- Performance or load testing of task state operations.

## Notable Invariants
- Test files must end with `.test.ts` or `.spec.ts` (rule: `test-file-suffix`).

## Public Surface
- `describe('task-state')`
- `beforeEach`
- `afterEach`
- `it('should create task state')`
- `it('should reset task state')`
- `it('should create task artifacts state')`
- `it('should record stage metrics')`
- `it('should increment failed tasks')`
- `it('should increment skipped tasks')`
- `it('should handle runtime cache')`
- `it('should track task usage')`
- `it('should queue task commits')`