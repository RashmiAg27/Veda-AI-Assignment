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
          <span class="q-number">${q.number}.</span>
          ${q.text}
          ${
            q.options && q.options.length > 0
              ? `<ol class="options" type="a">${q.options.map((o) => `<li>${o}</li>`).join('')}</ol>`
              : ''
          }
          <span class="marks">[${q.marks} Mark${q.marks !== 1 ? 's' : ''}]</span>
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
    font-size: 10.5pt;
    color: #000;
    padding: 18px 28px;
    max-width: 210mm;
    margin: 0 auto;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 6px;
    margin-bottom: 6px;
  }
  .header .student-fields {
    text-align: left;
  }
  .school-name { font-size: 16pt; font-weight: bold; }
  .subject-line { font-size: 12pt; margin-top: 3px; }
  .meta-row {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 10.5pt;
  }
  .mandatory { text-align: center; font-style: italic; font-size: 10pt; margin-top: 4px; }
  .student-info {
    display: flex;
    gap: 30px;
    margin-top: 6px;
    font-size: 10.5pt;
  }
  .student-info span { border-bottom: 1px solid #000; min-width: 200px; }
  .section { margin-top: 10px; }
  .section-title {
    text-align: center;
    font-size: 10.5pt;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .question {
    margin-bottom: 6px;
    line-height: 1.35;
  }
  .q-number { font-weight: bold; margin-right: 3px; }
  .marks { float: right; font-weight: bold; font-size: 8.5pt; }
  .options { margin-top: 2px; margin-left: 18px; }
  .options li { margin-bottom: 1px; }
  .page-break { page-break-after: always; }
  .end-line {
    text-align: center;
    margin-top: 10px;
    margin-bottom: 8px;
    font-style: italic;
    font-size: 9pt;
    border-top: 1px solid #000;
    padding-top: 6px;
  }
  .answer-key-section {
    page-break-before: always;
    margin-top: 10px;
  }
  .answer-key-title {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .answer { margin-bottom: 5px; line-height: 1.3; font-size: 9pt; }
  @media print {
    body { padding: 18px 28px; }
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
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
