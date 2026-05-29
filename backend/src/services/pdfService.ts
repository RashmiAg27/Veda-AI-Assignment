import puppeteer from 'puppeteer';
import { IGeneratedPaper } from '../models/GeneratedPaper';

const TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice Question',
  short: 'Short Answer Question',
  long: 'Long Answer Question',
  fill: 'Fill in the Blanks',
  true_false: 'True or False',
  truefalse: 'True or False',
  essay: 'Essay Question',
  diagram: 'Diagram/Graph-Based Question',
  numerical: 'Numerical Problem',
};

const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function buildPaperHTML(paper: IGeneratedPaper): string {
  const sectionsHTML = paper.sections
    .map((section, idx) => {
      const letter = SECTION_LETTERS[idx] || String(idx + 1);
      const typeLabel = TYPE_LABELS[section.type?.toLowerCase()] || section.type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Question';
      const questionsHTML = section.questions
        .map(
          (q) => `
        <div class="question">
          <div class="question-row">
            <div class="question-body">
              <span class="q-number">${q.number}.</span>
              ${q.text}
              ${
                q.options && q.options.length > 0
                  ? `<ol class="options" type="a">${q.options.map((o) => `<li>${o}</li>`).join('')}</ol>`
                  : ''
              }
            </div>
            <span class="marks">[${q.marks} Mark${q.marks !== 1 ? 's' : ''}]</span>
          </div>
        </div>
      `
        )
        .join('');

      return `
      <div class="section">
        <h2 class="section-title">Section ${letter}: ${typeLabel}</h2>
        ${questionsHTML}
      </div>
    `;
    })
    .join('');

  const answerKeyHTML = paper.answerKey
    .map((a) => `<div class="answer"><strong>${a.number}.</strong> ${a.answer}</div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    padding: 24px 36px;
    max-width: 210mm;
    margin: 0 auto;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
  .header .student-fields {
    text-align: left;
  }
  .school-name { font-size: 18pt; font-weight: bold; }
  .subject-line { font-size: 13pt; margin-top: 4px; }
  .meta-row {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 12pt;
  }
  .mandatory { text-align: center; font-style: italic; font-size: 11pt; margin-top: 5px; }
  .student-info {
    display: flex;
    gap: 30px;
    margin-top: 8px;
    font-size: 12pt;
  }
  .student-info span { border-bottom: 1px solid #000; min-width: 200px; }
  .section { margin-top: 14px; }
  .section-title {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .question {
    margin-bottom: 10px;
    line-height: 1.5;
  }
  .question-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .question-body { flex: 1; }
  .q-number { font-weight: bold; margin-right: 4px; }
  .marks { font-weight: bold; font-size: 11pt; white-space: nowrap; padding-top: 1px; }
  .options { margin-top: 4px; margin-left: 22px; }
  .options li { margin-bottom: 3px; }
  .page-break { page-break-after: always; }
  .end-line {
    text-align: center;
    margin-top: 14px;
    margin-bottom: 10px;
    font-style: italic;
    font-size: 11pt;
    border-top: 1px solid #000;
    padding-top: 8px;
  }
  .answer-key-section {
    page-break-before: always;
    margin-top: 14px;
  }
  .answer-key-title {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .answer { margin-bottom: 6px; line-height: 1.5; font-size: 11pt; }
  @media print {
    body { padding: 24px 36px; }
    .page-break { page-break-after: always; }
    .answer-key-section { page-break-before: always; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">${paper.schoolName}</div>
  <div class="subject-line">Subject: ${paper.subject} &nbsp;&nbsp;|&nbsp;&nbsp; Class: ${paper.className}</div>
  <div class="meta-row">
    <span>Time Allowed: ${paper.timeAllowed}</span>
    <span>Maximum Marks: ${paper.metadata.totalMarks}</span>
  </div>
  <div class="mandatory">All questions are compulsory unless stated otherwise.</div>
  <div class="student-fields" style="margin-top:8px;font-size:10.5pt;">
    <div style="margin-bottom:6px;">
      Name: <span style="border-bottom:1px solid #000;display:inline-block;width:180px;">&nbsp;</span>
    </div>
    <div style="margin-bottom:6px;">
      Roll Number: <span style="border-bottom:1px solid #000;display:inline-block;width:180px;">&nbsp;</span>
    </div>
    <div>
      Class: ${paper.className} &nbsp;&nbsp;&nbsp; Section: <span style="border-bottom:1px solid #000;display:inline-block;width:150px;">&nbsp;</span>
    </div>
  </div>
</div>

${sectionsHTML}

<div class="end-line">End of Question Paper</div>

<div class="answer-key-section">
  <div class="answer-key-title">Answer Key</div>
  ${answerKeyHTML}
</div>
</body>
</html>`;
}

export async function generatePDF(paper: IGeneratedPaper): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const html = buildPaperHTML(paper);
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
