// Run with: node -r esbuild-register --test scripts/guest-application.test.cjs
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { NextRequest } = require("next/server");
const { google } = require("googleapis");
const { POST } = require("../app/api/submit-guest-application/route.ts");

const fields = {
  name: "Test Guest é & Co",
  email: "guest+test@example.com",
  twitter: "https://example.com/guest",
  description: "Developer tools & APIs\nA second line.",
};

test("guest application form submissions", async (t) => {
  const append = t.mock.fn(async () => ({}));
  t.mock.method(google, "sheets", () => ({
    spreadsheets: { values: { append } },
  }));

  async function submit(values) {
    return POST(new NextRequest("https://www.devtools.fm/api/submit-guest-application", {
      method: "POST",
      body: new URLSearchParams(values),
    }));
  }

  await t.test("saves decoded form fields once and redirects with 303", async () => {
    const response = await submit(fields);
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://www.devtools.fm/thank-you");
    assert.equal(append.mock.callCount(), 1);
    assert.deepEqual(append.mock.calls[0].arguments[0].requestBody.values, [
      [fields.name, fields.email, fields.twitter, fields.description],
    ]);
  });

  await t.test("allows an omitted Twitter URL", async () => {
    const { twitter, ...values } = fields;
    const response = await submit(values);
    assert.equal(response.status, 303);
    assert.deepEqual(append.mock.calls[1].arguments[0].requestBody.values, [
      [fields.name, fields.email, "", fields.description],
    ]);
  });

  for (const field of ["name", "email", "description"]) {
    for (const value of [undefined, ""]) {
      await t.test(`rejects ${field} when ${value === undefined ? "missing" : "empty"}`, async () => {
        const values = { ...fields };
        if (value === undefined) delete values[field];
        else values[field] = value;
        const count = append.mock.callCount();
        const response = await submit(values);
        assert.equal(response.status, 400);
        assert.match((await response.json()).data, /Missing a required field/);
        assert.equal(append.mock.callCount(), count);
      });
    }
  }
});
