/**
 * RegenHub / Techne — Google Sheets → GitHub Sync
 *
 * Reads key financial ranges from this spreadsheet and pushes a structured
 * data.json to the techne.institute GitHub repo, which the lunch-presentation
 * pages load on startup.
 *
 * SETUP (one time):
 *   1. Extensions → Apps Script → paste this file
 *   2. Project Settings → Script Properties → Add property:
 *        GITHUB_TOKEN = <your token with repo write access>
 *   3. Run syncToGitHub() once manually to authorize and test
 *   4. Add a time-based trigger: syncToGitHub, every 2 hours (or "on edit")
 */

const SPREADSHEET_ID = '1Hk9PA7cY8bbLnoA7Jnj86r5pBR_Eru12_WYzFEBC0DA';
const GITHUB_REPO    = 'RegenHub-Boulder/techne.institute';
const GITHUB_FILE    = 'lunch-presentation/data.json';
const GITHUB_BRANCH  = 'main';

// ─── Main entry point ────────────────────────────────────────────────────────

function syncToGitHub() {
  const data   = buildDataJson();
  const json   = JSON.stringify(data, null, 2);
  const sha    = getCurrentFileSha();
  pushToGitHub(json, sha);
  Logger.log('Sync complete: ' + data.lastSync);
}

// ─── Build the data object from sheet ranges ──────────────────────────────────

function buildDataJson() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Income Statement (12M) - Full
  // Row 11 = headers (months), rows 12-19 = revenue lines, row 28 = total
  const incomeSheet = ss.getSheetByName('Income Statement (12M) - Full');
  const months      = incomeSheet.getRange('D11:I11').getValues()[0].map(String);
  const revRows     = incomeSheet.getRange('D12:I19').getValues();
  const totalRevRow = incomeSheet.getRange('D28:I28').getValues()[0];

  // Operating Expenditures
  const opexSheet   = ss.getSheetByName('Operating Expenditures (Roadmap)');
  const opexTotal   = opexSheet.getRange('D10:I10').getValues()[0];
  const personnel   = opexSheet.getRange('D13:I13').getValues()[0];
  const lease2nd    = opexSheet.getRange('D14:I14').getValues()[0];
  const lease3rd    = opexSheet.getRange('D15:I15').getValues()[0];

  const clean = (arr) => arr.map(v => {
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v).replace(/[$, ]/g, ''));
    return isNaN(n) ? 0 : n;
  });

  const rev    = revRows.map(clean);
  const totRev = clean(totalRevRow);
  const totOp  = clean(opexTotal);
  const net    = totRev.map((r, i) => Math.round(r - totOp[i]));

  return {
    lastSync:      new Date().toISOString(),
    spreadsheetId: SPREADSHEET_ID,
    months:        months,
    revenue: {
      vipDesks:       rev[0],
      hotDesk:        rev[1],
      nodes:          rev[2],
      learnVibeBuild: rev[3],
      accelerator:    rev[4],
      total:          totRev
    },
    opex: {
      total:     totOp,
      personnel: clean(personnel),
      lease2nd:  clean(lease2nd),
      lease3rd:  clean(lease3rd)
    },
    net: net,
    assumptions: {
      committedCapital:       130000,
      thirdFloorLeaseTarget:  5500,
      coworkingBaseRevenue:   4500,
      breakevenMonth:         breakevenMonth(net, months),
      personnelRetainer:      clean(personnel)[0]
    }
  };
}

function breakevenMonth(net, months) {
  for (let i = 0; i < net.length; i++) {
    if (net[i] > 0) return months[i];
  }
  return null;
}

// ─── GitHub API helpers ───────────────────────────────────────────────────────

function getCurrentFileSha() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const url   = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`;
  const res   = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() === 404) return null;
  return JSON.parse(res.getContentText()).sha;
}

function pushToGitHub(jsonContent, sha) {
  const token   = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const url     = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
  const payload = {
    message: 'chore: sync financial data from Google Sheets',
    content: Utilities.base64Encode(jsonContent),
    branch:  GITHUB_BRANCH
  };
  if (sha) payload.sha = sha;

  const res = UrlFetchApp.fetch(url, {
    method:  'PUT',
    headers: {
      Authorization:  'Bearer ' + token,
      Accept:         'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  if (code !== 200 && code !== 201) {
    throw new Error('GitHub push failed: ' + res.getContentText());
  }
}
