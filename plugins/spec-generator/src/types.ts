/**
 * types.ts -- Spec Generator
 * ----------------------------------------------------------------
 * Types for the structured specification output.
 */

export interface SpecResult {
  summary: string
  requirements: Array<{
    id: string
    title: string
    description: string
    priority: 'must' | 'should' | 'could' | 'wont'
  }>
  acceptanceCriteria: string[]
  testScenarios: Array<{
    name: string
    steps: string[]
    expected: string
  }>
}
