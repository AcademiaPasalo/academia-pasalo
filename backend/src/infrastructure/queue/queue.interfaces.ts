export interface JobScheduler {
  name: string;
  cron?: string;
  pattern?: string;
}
