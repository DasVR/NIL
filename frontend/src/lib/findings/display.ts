export function formatCvss(cvss: number | null | undefined): string {
  if (cvss == null || Number.isNaN(cvss)) return 'n/a';
  return cvss.toFixed(1);
}

export function findingConfirmed(status: string | undefined): boolean {
  return status === 'confirmed';
}
