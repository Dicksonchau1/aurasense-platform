// Block Kit templates for Slack messages
// Each template returns the full message payload Slack expects

type Block = any;

const SEVERITY_COLOR: Record<string, string> = {
  high:   '#dc2626',  // red
  medium: '#f59e0b',  // amber
  low:    '#737373',  // neutral
};
const BAND_EMOJI: Record<string, string> = {
  critical: ':rotating_light:',
  at_risk:  ':warning:',
  healthy:  ':white_check_mark:',
};

export function bandDowngradeBlocks(p: {
  customer_id: string; from_band: string; to_band: string; score: number;
  signals: Array<{ severity: string; metric: string; message: string }>;
  monthly_revenue: number; drilldown_url: string; alert_id: number;
}): { blocks: Block[]; text: string } {
  const isCritical = p.to_band === 'critical';
  const emoji = BAND_EMOJI[p.to_band] ?? ':grey_question:';

  const blocks: Block[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} Band downgrade — ${p.customer_id}`,
        emoji: true
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*From → To*\n\`${p.from_band}\` → \`${p.to_band}\`` },
        { type: 'mrkdwn', text: `*Health score*\n\`${p.score.toFixed(1)}\`` },
        { type: 'mrkdwn', text: `*Monthly revenue*\nHK$${p.monthly_revenue.toLocaleString()}` },
        { type: 'mrkdwn', text: `*Recommended action*\n${isCritical ? 'Exec review ≤ 48h' : 'Outreach ≤ 7d'}` },
      ]
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Signals*\n' + p.signals.slice(0, 5).map(s => {
          const icon = s.severity === 'high' ? ':red_circle:' : s.severity === 'medium' ? ':large_yellow_circle:' : ':white_circle:';
          return `${icon} ${s.message}`;
        }).join('\n')
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          style: 'primary',
          text: { type: 'plain_text', text: ':eyes: Acknowledge', emoji: true },
          action_id: 'csm_acknowledge',
          value: String(p.alert_id),
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Open Account Manager', emoji: false },
          action_id: 'open_drilldown',
          url: p.drilldown_url,
        },
      ]
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `Alert ID: \`${p.alert_id}\` · Generated from ATLAS audit substrate · Same numbers as Compliance dashboard` }
      ]
    }
  ];

  return {
    text: `Band downgrade: ${p.customer_id} → ${p.to_band} (${p.score.toFixed(1)})`, // fallback for notifications
    blocks
  };
}

export function creditIssuedBlocks(p: {
  site_id: string; skill_id: string; credit_pct: number; credit_amount_hkd: number;
  breach_measurement_id: number;
}) {
  return {
    text: `Credit issued: ${p.site_id} · HK$${p.credit_amount_hkd.toLocaleString()}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:money_with_wings: *Service credit issued* — \`${p.site_id}\` / \`${p.skill_id}\``
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Credit*\n${p.credit_pct}% · HK$${p.credit_amount_hkd.toLocaleString()}` },
          { type: 'mrkdwn', text: `*Breach measurement*\n\`${p.breach_measurement_id}\`` },
        ]
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Auto-issued by SLO breach engine. Will appear on next invoice.' }]
      }
    ]
  };
}

export function emailDeadLetterBlocks(p: {
  queue_id: string; template: string; to_customer: string; attempts: number; last_error: string;
}) {
  return {
    text: `Email dead-letter: ${p.template} for ${p.to_customer}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:skull: *Email dead-letter* — \`${p.template}\` to \`${p.to_customer}\``
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Attempts*\n${p.attempts}` },
          { type: 'mrkdwn', text: `*Queue ID*\n\`${p.queue_id.slice(0,8)}\`` },
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Last error*\n\${p.last_error.slice(0, 400)}\`
        }
      }
    ]
  };
}
