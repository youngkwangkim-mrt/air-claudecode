#!/usr/bin/env node

/**
 * UserPromptSubmit hook: detects ticket-workspace keywords in user prompts
 * and suggests the corresponding skill.
 */

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

/**
 * Skill keyword mapping.
 * Each key is a skill name, values are trigger keywords.
 */
const SKILL_KEYWORDS = {
  "tw-setup": [
    "tw setup",
    "tw 설정",
    "ticket workspace setup",
    "워크스페이스 설정",
  ],
  "tw-open": [
    "티켓 열기",
    "작업 시작",
    "open ticket",
    "open workspace",
    "워크스페이스 열기",
    "tw open",
    "tw 열기",
  ],
  "tw-log": [
    "작업 로그",
    "로그 추가",
    "work log",
    "add log",
    "워크로그",
    "tw log",
    "tw 로그",
  ],
  "tw-status": [
    "작업 상태",
    "상태 확인",
    "work status",
    "진행 상황",
    "tw status",
    "tw 상태",
  ],
  "tw-transition": [
    "상태 변경",
    "트랜지션",
    "jira transition",
    "status change",
    "tw transition",
  ],
  "tw-close": [
    "워크스페이스 닫기",
    "close workspace",
    "작업 완료",
    "close ticket",
    "ticket done",
    "tw close",
    "tw 닫기",
  ],
  "tw-list": [
    "워크스페이스 목록",
    "list workspace",
    "workspace list",
    "열린 티켓",
    "tw list",
    "tw 목록",
  ],
};

function matchesKeyword(text, keyword) {
  const hasAsciiLetter = /[a-zA-Z]/.test(keyword);
  if (hasAsciiLetter) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(text);
  }
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function detectSkill(userPrompt) {
  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (matchesKeyword(userPrompt, keyword)) {
        return skill;
      }
    }
  }
  return null;
}

async function main() {
  const input = await readStdin();
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const userPrompt = data.user_prompt || data.userPrompt || data.prompt || "";
  if (!userPrompt) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  // Don't interfere with explicit skill invocations
  if (userPrompt.startsWith("/ticket-workspace:")) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const skill = detectSkill(userPrompt);
  if (!skill) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const message = `Detected relevant skill: **${skill}**. Use the \`/ticket-workspace:${skill}\` skill for this task. Invoke: Skill(skill="ticket-workspace:${skill}", args="${userPrompt.replace(/"/g, '\\"').slice(0, 150)}")`;

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: message,
      },
    }),
  );
}

main().catch(() => {
  console.log(JSON.stringify({ continue: true }));
});
