import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const exporter = new OTLPLogExporter({
      url: `${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'}/otlp/v1/logs`,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
      },
    })

    const loggerProvider = new LoggerProvider({
      resource: resourceFromAttributes({
        'service.name': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME || 'Vela',
      }),
      processors: [new SimpleLogRecordProcessor(exporter)],
    })

    // make the logger available globally
    globalThis.__posthogLogger = loggerProvider.getLogger(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME || 'Vela')
  }
}
