# Publishing and scheduling workflow

This workflow keeps LinkedIn posts consistent from idea to publish. It covers human checks, scheduling rules, publish-day steps, and failure handling. Use it for every planned post, whether the copy comes from an AI assistant, a human draft, or a repurposed article.

## Workflow states

| State | Owner | Exit criteria |
| --- | --- | --- |
| Idea | Content owner | Topic, audience, and objective are clear. |
| Draft | Writer or agent | Post copy, hook, body, call to action, and asset notes are present. |
| Review | Editor | Brand, factual, compliance, and formatting checks pass. |
| Ready to schedule | Content owner | Approved copy, publish window, owner, and backup owner are recorded. |
| Scheduled | Publisher | Post is queued for the approved date and time in the scheduling tool. |
| Published | Publisher | Live post URL, publish timestamp, and first-hour engagement notes are recorded. |
| Archived | Content owner | Results and reuse notes are added after the monitoring window. |

Do not skip a state. If a post changes after approval, move it back to Review.

## Step 1: intake

Create a post record before drafting. Include:

- Working title.
- Campaign or theme.
- Target audience.
- Objective, such as awareness, lead capture, recruiting, or community engagement.
- Source material links.
- Target publish date.
- Primary owner and backup owner.
- Distribution channel. Default to LinkedIn company page unless the post record says otherwise.

Reject intake if the objective is unclear, the source material is missing, or no owner is assigned.

## Step 2: draft

Draft the post in this structure:

1. Hook. One or two lines that earn the next line.
2. Body. The main point, with one clear idea per paragraph.
3. Proof. A concrete example, metric, quote, or observation.
4. Call to action. Ask for one response, click, or next step.
5. Asset notes. Image, carousel, video, link preview, or no asset.

Drafting checks:

- The first 140 characters make sense without the rest of the post.
- The post has one main idea.
- Claims tie back to source material or first-hand experience.
- The call to action matches the objective.
- Any link uses the approved destination URL and tracking parameters.
- The post can stand alone if LinkedIn suppresses link previews.

## Step 3: review

Run these checks before scheduling:

### Brand and editorial checks

- Voice matches the account style: direct, useful, and specific.
- No generic AI phrases, filler, or unsupported hype.
- Paragraphs are short enough for mobile reading.
- Spelling, grammar, and punctuation pass review.
- Mentions, hashtags, and names are accurate.

### Factual checks

- Every metric, quote, customer name, and product claim has a source.
- Dates, amounts, percentages, and comparison language are verified.
- Any regulated, legal, financial, medical, or security claim has explicit approval.
- Screenshots and examples do not expose private customer, employee, or system data.

### Platform checks

- Copy fits LinkedIn formatting and character limits.
- Images and videos meet LinkedIn size, ratio, caption, and accessibility requirements.
- Alt text is included for images when the scheduler supports it.
- Hashtags are limited to the approved set for the campaign.
- External links open successfully in a private browser session.

If any check fails, send the post back to Draft with a specific note.

## Step 4: schedule

Schedule only posts in Ready to schedule.

Scheduling rules:

- Use the profile timezone stored on the post owner or campaign. If no timezone is available, default to the company's operating timezone and record that choice.
- Schedule at least 24 hours before publish time unless the post is marked timely or urgent.
- Do not schedule two primary posts for the same account within the same two-hour window.
- Avoid weekends and local holidays unless the campaign specifically calls for them.
- Assign a backup owner for posts scheduled outside the primary owner's working hours.
- Record the scheduler job ID or URL after queueing the post.

Required fields before a post can move to Scheduled:

- Approved copy.
- Approved asset or asset waiver.
- Publish date and time with timezone.
- Channel.
- Primary owner.
- Backup owner.
- Review approver.
- Scheduler job ID or URL.

## Step 5: pre-publish check

Run the pre-publish check on the business day before publishing.

- Confirm the post still fits current news, product status, and company messaging.
- Re-open all links.
- Preview the post on desktop and mobile if the scheduler supports previews.
- Confirm assets still load.
- Confirm no higher-priority post conflicts with the publish window.
- Confirm the primary or backup owner can monitor replies for the first hour.

If context changed, pause the post and move it back to Review.

## Step 6: publish

At publish time:

1. Confirm the scheduler marks the post as sent.
2. Open LinkedIn and verify the post is live.
3. Record the live URL and actual publish timestamp.
4. Check the first rendered version for broken formatting, missing assets, or incorrect link previews.
5. Notify the owner and backup owner that monitoring has started.

If the scheduler fails, publish manually only when the approved copy and asset are still current. Record the manual publish action in the post record.

## Step 7: monitor and archive

Monitor for the first hour, then archive after the campaign reporting window.

First-hour checks:

- Reply to high-intent comments.
- Flag negative, legal, security, or support-sensitive replies to the right owner.
- Confirm employees or advocates have the correct live URL if amplification is planned.
- Record unusual engagement patterns.

Archive fields:

- Final post URL.
- Actual publish timestamp.
- Engagement snapshot.
- Notes about what worked.
- Notes about reuse, follow-up posts, or topics to avoid.

## Exception handling

| Issue | Action |
| --- | --- |
| Scheduler outage | Publish manually from the approved post record, then record the outage and manual timestamp. |
| Broken asset after publish | Edit or remove the asset if the platform allows it. If not, delete and republish only with owner approval. |
| Wrong copy published | Delete or correct the post based on severity. Record the incident and root cause. |
| Link is broken | Edit the link when possible. Otherwise add a corrective comment and update the archive notes. |
| Sensitive reply appears | Do not improvise. Route to the assigned legal, security, support, or executive owner. |
| Timely post becomes stale | Pause it, add the reason, and send it back to Review. |

## Consistency checklist

Before scheduling:

- [ ] Intake fields are complete.
- [ ] Draft follows hook, body, proof, call-to-action, and asset notes structure.
- [ ] Brand and editorial checks pass.
- [ ] Factual checks pass.
- [ ] Platform checks pass.
- [ ] Publish date, time, and timezone are recorded.
- [ ] Owner and backup owner are assigned.
- [ ] Scheduler job ID or URL is recorded.

Before publish:

- [ ] News, product status, and messaging still fit.
- [ ] Links and assets work.
- [ ] Preview matches approved copy.
- [ ] No account-level scheduling conflict exists.
- [ ] Monitoring owner is available.

After publish:

- [ ] Live URL is recorded.
- [ ] Actual publish timestamp is recorded.
- [ ] First-hour monitoring notes are recorded.
- [ ] Archive fields are completed after reporting.
