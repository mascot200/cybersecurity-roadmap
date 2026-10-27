# How to Study This Course

You are a developer. That is a big advantage: most security weaknesses are **software bugs with
consequences**, and most fixes are **code or configuration changes**. This guide shows you how to
turn 8–12 hours a week into real skill.

## 1. The weekly routine

| Block | Time | What you do | Output |
|---|---|---|---|
| Structured learning | 2 h | Read the week's lesson + linked official docs. Take concise notes. | Notes in your journal repo |
| Hands-on labs | 4 h | Do the 🧪 Lab steps and external labs (PortSwigger, Bandit, Juice Shop…) | Screenshots, commands, observations |
| Portfolio project | 3 h | Do the 📝 Assignment and push work toward the month's project | Code, tests, configs, diagrams |
| Review & write-up | 1 h | Weekly log, drill, update docs | Issue comment + drill score |

**Suggested calendar (10 h week):**

```
Mon  1h  Read lesson, part 1
Tue  2h  Lab
Wed  1h  Read lesson, part 2 + official docs
Thu  2h  Lab / external labs
Sat  3h  Assignment / project
Sun  1h  Drill + weekly log on the month issue
```

## 2. The four questions (answer them for every concept)

1. **How does it work?** — explain it to a non-security developer in 3 sentences.
2. **How could it be abused?** — in an authorized lab, what does an attacker send / change / exploit?
3. **How is it detected or prevented?** — which control stops it; which log/alert shows it happened?
4. **How do I prove the fix?** — a failing test that turns green, a scan result, a config check, a screenshot.

If you can't answer all four, you haven't finished the topic.

## 3. Set up your learning journal repo

Create a **separate** repository (the roadmap calls it `cybersecurity-journey`) for your own work:

```
cybersecurity-journey/
├── notes/            # one markdown file per week: week-01.md, week-02.md ...
├── labs/             # code you write to reproduce & fix vulnerabilities
├── projects/         # the monthly portfolio projects (or links to their own repos)
├── diagrams/         # draw.io / Excalidraw / Mermaid exports
└── reports/          # assessment & incident reports
```

Weekly note template (`notes/week-NN.md`):

```markdown
# Week NN — <topic>
## Key ideas (my own words)
## The four questions
1. How it works:
2. How it's abused:
3. Prevention / detection:
4. Proof of fix:
## Commands I used
## What confused me / questions to investigate
## Drill score: __/__ — weak areas:
```

## 4. How to read a lesson

1. Skim **🎯 Objectives** and **🌍 Why it matters** first — know *why* before *how*.
2. Read **📖 Concepts** with a terminal open. Type every command; don't copy-paste blindly.
3. Do the **🧪 Lab** step by step. Compare your output to the *expected output*. If it differs, investigate — that's where learning happens.
4. Do the **📝 Assignment**. Check every acceptance criterion.
5. Take the **🥊 Drill** *without* looking at the answers. Then reveal and score yourself honestly.

## 5. Getting unstuck (15-minute rule)

- Stuck for 15 minutes? Write down exactly what you tried and what you saw.
- Read the error message *slowly*. Search the exact message.
- Check the official docs (links in each lesson).
- Ask for help with your notes attached (a Claude session, a forum, a study partner).
- Still stuck after an hour? Mark it in your log under "questions to investigate" and move on — come back later.

## 6. When to move on

Move to the next week when **all** are true:

- [ ] Every acceptance criterion of the assignment is met
- [ ] Drill score ≥ 80%
- [ ] You can answer the four questions out loud without notes

If not — repeat the weak parts. Extending a week is normal and expected. Rushing is the most common
reason people stall at month 4.

## 7. Spaced repetition

At the start of every week, spend 10 minutes re-taking **two random questions** from earlier drills.
At the end of each month, the monthly drill mixes questions from all previous months.
