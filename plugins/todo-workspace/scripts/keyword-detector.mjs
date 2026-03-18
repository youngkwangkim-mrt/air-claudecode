#!/usr/bin/env node

/**
 * UserPromptSubmit hook: detects todo-workspace keywords in user prompts
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
  td: [
    "td",
    "td today",
    "td 오늘",
    "오늘 할일",
    "today tasks",
    "투두",
    "투두 오늘",
    "td add",
    "td 추가",
    "할일 추가",
    "add task",
    "투두 추가",
    "td done",
    "td 완료",
    "할일 완료",
    "task done",
    "투두 완료",
    "td memo",
    "td 메모",
    "메모 추가",
    "할일 메모",
    "td search",
    "td 검색",
    "할일 검색",
    "투두 검색",
    "td help",
    "td 도움말",
    "투두 도움말",
  ],
  "td-setup": [
    "td setup",
    "td 설정",
    "todo workspace setup",
    "투두 워크스페이스 설정",
  ],
  "td-report": [
    "td report",
    "td week",
    "td 주간",
    "주간 현황",
    "td progress",
    "td 진행률",
    "진행 현황",
    "투두 진행",
  ],
  "td-backlog": ["td backlog", "td 백로그", "백로그"],
  "td-jira": ["td jira", "td 지라", "지라 연동", "jira link", "jira sync"],
  "td-slack": [
    "td slack",
    "td 슬랙",
    "슬랙 전송",
    "slack digest",
    "slack standup",
  ],
  "td-recurring": [
    "td recurring",
    "td 반복",
    "반복 할일 추가",
    "반복 할일 설정",
    "반복 할일 관리",
    "반복 할일",
    "recurring task",
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
  // Check longer/more specific keywords first by sorting entries by keyword length desc
  const entries = Object.entries(SKILL_KEYWORDS).flatMap(([skill, keywords]) =>
    keywords.map((kw) => ({ skill, keyword: kw })),
  );
  entries.sort((a, b) => b.keyword.length - a.keyword.length);

  for (const { skill, keyword } of entries) {
    if (matchesKeyword(userPrompt, keyword)) {
      return skill;
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
  if (userPrompt.startsWith("/todo-workspace:")) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const skill = detectSkill(userPrompt);
  if (!skill) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const message = `Detected relevant skill: **${skill}**. Use the \`/todo-workspace:${skill}\` skill for this task. Invoke: Skill(skill="todo-workspace:${skill}", args="${userPrompt.replace(/"/g, '\\"').slice(0, 150)}")`;

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
