// ValueFunctionLoader stub for ATLAS continuous-learning integration
export class ValueFunctionLoader {
  private currentVersion: string | null = null;
  private model: any = null;
  constructor(
    private manifestPath: string,
    private modelStore: any,
    private auditEmitter: any,
  ) {}
  async refresh(): Promise<void> {}
  evaluate(state: number[], action: number[]): number {
    if (!this.model) throw new Error("Value function not loaded");
    return 0;
  }
}
