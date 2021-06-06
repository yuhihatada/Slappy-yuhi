const { App, ExpressReceiver } = require('@slack/bolt');
const serverlessExpress = require('@vendia/serverless-express');

// Initialize your custom receiver
const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

// Listens to incoming messages that contain "hello"
app.message('hatada', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `うるせっぞ <@${message.user}>! `
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "編集"
          },
          "action_id": "button_click"
        }
      }
    ]
  });
});

app.event('app_home_opened', async ({ event, client }) => {
  try {
    // 組み込みの API クライアントを使って views.publish を呼び出す
    const result = await client.views.publish({
      // イベントに紐づけられたユーザー ID を指定
      user_id: event.user,
      view: {
        "type": "home",
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "⚠️こちらのアプリはテスト運用中です。お問い合わせには対応できません",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "用語を検索する",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "input",
            "block_id": "input0",
            "label": {
              "type": "plain_text",
              "text": " "
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "plain_input",
              "placeholder": {
                "type": "plain_text",
                "text": "検索内容を入力してください"
              }
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "検索",
                  "emoji": true
                },
                "value": "click_me_123",
                "action_id": "actionId-0",
                "style": "primary"
              }
            ]
          },
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "用語を追加する",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "input",
            "block_id": "input2",
            "label": {
              "type": "plain_text",
              "text": "正式名称 (※必須)"
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "plain_input",
              "placeholder": {
                "type": "plain_text",
                "text": "正式名称を入力してください(1~25文字)"
              }
            }
          },
          {
            "type": "input",
            "block_id": "input1",
            "label": {
              "type": "plain_text",
              "text": "読み方 (※必須)"
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "plain_input",
              "placeholder": {
                "type": "plain_text",
                "text": "その用語の読み方をひらがなで入力してください(1~25文字)"
              }
            }
          },
          {
            "type": "input",
            "block_id": "input11",
            "label": {
              "type": "plain_text",
              "text": "その他の呼称 (例:A,Bのようにカンマで区切ってください)"
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "plain_input",
              "placeholder": {
                "type": "plain_text",
                "text": "例:呼称A,呼称B"
              }
            }
          },
          {
            "type": "input",
            "element": {
              "type": "checkboxes",
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "社内用語",
                    "emoji": true
                  },
                  "value": "value-0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "一般用語",
                    "emoji": true
                  },
                  "value": "value-1"
                }
              ],
              "action_id": "checkboxes-action"
            },
            "label": {
              "type": "plain_text",
              "text": "タグ(※1つ以上選択してください)",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "input133",
            "label": {
              "type": "plain_text",
              "text": "説明(※必須)"
            },
            "element": {
              "type": "plain_text_input",
              "multiline": true,
              "action_id": "plain_input",
              "placeholder": {
                "type": "plain_text",
                "text": "説明を入力してください(5~300文字)"
              }
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "追加",
                  "emoji": true
                },
                "value": "click_me_123",
                "action_id": "actionId-0",
                "style": "danger"
              }
            ]
          }
        ]
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// Listens for an action from a button click
app.action('button_click', async ({ body, ack, say }) => {
  await say(`<@${body.user.id}> ボタン押してくれてありがっと！`);

  // Acknowledge the action after say() to exit the Lambda process
  await ack();
});

// Listens to incoming messages that contain "goodbye"
app.message('yuhi', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`おやすみ〜, <@${message.user}> :wave:`);
});

// Handle the Lambda function event
module.exports.handler = serverlessExpress({
  app: expressReceiver.app
});


//ハッシュ定義
var hash = {};
hash['りんご'] = '果物。赤くて甘い。';
hash['レモン'] = '柑橘類。おそらく柑橘類。';
hash['シス開'] = '正式名称：システム開発部。わいの故郷や';
hash['MP'] = 'MPはカッスやな！';
hash['slappy'] = '最強生物。王の資質を持ってるやっちゃな';
hash['山崎さん'] = 'まあまあやな';


app.command('/echo', async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  await ack();
  await say('あなた今「' + `${command.text}` + '」と言いったかい？');
  await say(hash[`${command.text}`]);
});


app.command('/ask', async ({ command, ack, say}) => {
  await ack();
  await say(
    {
      "attachments": [
        {
          "color": "#2D785B",
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "用語:*システム開発*\n 読み方:しすてむかいはつ\n その他の呼称:シス開\n 意味:バイトルやはたらこをはじめとしたサービスを生み出してきたエンジニア集団\n `社内用語` `一般用語`"
              }
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "編集",
                    "emoji": true
                  },
                  "style": "primary",
                  "action_id": "open_modal",
                  "value": "click_me_123"
                }
              ]
            }
          ]
        }
      ]
    }
  );
});


app.action("open_modal", async ({body, ack, context }) => {
  console.log(body);
  ack();
    app.client.views.open({
    token: context.botToken,
    trigger_id: body.trigger_id,
    view: {
      "type": "modal",
      "title": {
        "type": "plain_text",
        "text": "編集",
        "emoji": true
      },
      "submit": {
        "type": "plain_text",
        "text": "決定",
        "emoji": true
      },
      "close": {
        "type": "plain_text",
        "text": "キャンセル",
        "emoji": true
      },
      "blocks": [
        {
          "dispatch_action": true,
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "dispatch_action_config": {
              "trigger_actions_on": [
                "on_character_entered"
              ]
            },
            "action_id": "plain_text_input-action"
          },
          "label": {
            "type": "plain_text",
            "text": "正式名称",
            "emoji": true
          }
        },
        {
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "action_id": "plain_text_input-action"
          },
          "label": {
            "type": "plain_text",
            "text": "読み方",
            "emoji": true
          }
        },
        {
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "action_id": "plain_text_input-action"
          },
          "label": {
            "type": "plain_text",
            "text": "その他の呼称",
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "タグ"
          },
          "accessory": {
            "type": "checkboxes",
            "options": [
              {
                "text": {
                  "type": "mrkdwn",
                  "text": "*社内用語*"
                },
                "value": "value-0"
              },
              {
                "text": {
                  "type": "mrkdwn",
                  "text": "*一般用語*"
                },
                "value": "value-1"
              }
            ],
            "action_id": "checkboxes-action"
          }
        },
        {
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "multiline": true,
            "action_id": "plain_text_input-action"
          },
          "label": {
            "type": "plain_text",
            "text": "説明",
            "emoji": true
          }
        }
      ]
    }
  });
});
