export type SpaceTemplate = {
  name: string;
  label: string;
  scope: string;
};

export const SPACE_TEMPLATES: SpaceTemplate[] = [
  { name: 'external-pt', label: 'External pentest', scope: '10.0.0.0/24, example.com' },
  { name: 'internal-net', label: 'Internal network', scope: '192.168.1.0/24' },
  { name: 'web-app', label: 'Web application', scope: 'https://app.example.com' },
  { name: 'wireless', label: 'Wireless audit', scope: 'SSID: CorpNet' }
];
