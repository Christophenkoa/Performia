import { Logger } from '@nestjs/common';
import { LoggingContactNotifier } from './contact-notifier.js';

describe('LoggingContactNotifier', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs who wrote and in which language, but no phone, subject or message', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    await new LoggingContactNotifier().notify({
      name: 'Awa Nkoa',
      email: 'awa@example.com',
      phone: '+237 600 000 000',
      subject: 'SECRET-SUBJECT',
      message: 'SECRET-MESSAGE-BODY',
      lang: 'fr',
      receivedAt: new Date('2026-10-04T10:00:00Z'),
    });

    const output = log.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('Awa Nkoa');
    expect(output).toContain('awa@example.com');
    expect(output).toContain('lang=fr');
    expect(output).not.toContain('+237 600 000 000');
    expect(output).not.toContain('SECRET-SUBJECT');
    expect(output).not.toContain('SECRET-MESSAGE-BODY');
  });

  it('cannot be tricked into forging log lines through a name with newlines', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    await new LoggingContactNotifier().notify({
      name: 'Eve\nLOG FORGED line',
      email: 'eve@example.com',
      phone: '+237 600 000 000',
      subject: 'subject',
      message: 'message body',
      lang: 'fr',
      receivedAt: new Date('2026-10-04T10:00:00Z'),
    });

    const output = log.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).not.toMatch(/[\r\n]/);
  });
});
