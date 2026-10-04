const { test } = require("node:test");
const assert = require("node:assert/strict");
const { canAccessDocumentRecord, canDeleteDocumentRecord } = require("../services/authorization.rules");

test("personal document access rules", () => {
  const personal = { scope: "PERSONAL", owner_user_id: 1, team_id: null };
  assert.equal(canAccessDocumentRecord(1, personal, []), true);
  assert.equal(canAccessDocumentRecord(2, personal, []), false);
});

test("team document access rules", () => {
  const teamDoc = { scope: "TEAM", owner_user_id: 1, team_id: 10 };
  assert.equal(canAccessDocumentRecord(1, teamDoc, [10]), true);
  assert.equal(canAccessDocumentRecord(2, teamDoc, [10]), true);
  assert.equal(canAccessDocumentRecord(3, teamDoc, []), false);
});

test("team document deletion rules", () => {
  const teamDoc = { scope: "TEAM", owner_user_id: 1, team_id: 10 };
  assert.equal(canDeleteDocumentRecord(1, teamDoc, "OWNER"), true);
  assert.equal(canDeleteDocumentRecord(2, teamDoc, "MEMBER"), false);
});
