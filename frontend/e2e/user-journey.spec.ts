import { test, expect } from "@playwright/test";

test.describe("Complete User Journey & Authoritative Game State Verification", () => {
  test("Homepage displays authoritative individual competition state with zero outdated remnants", async ({
    page,
  }) => {
    // 1. Arrive on Homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/BB Telugu Fans/);

    // Verify H1
    const h1 = page.locator("h1");
    await expect(h1).toContainText("INDIVIDUAL");
    await expect(h1).toContainText("SEASON 10");

    // Verify Authoritative Game State elements on Homepage
    await expect(page.locator("text=14 Active").first()).toBeVisible();
    await expect(page.locator("text=2 Eliminated").first()).toBeVisible();
    await expect(page.locator("text=Auto Ram Prasad").first()).toBeVisible();
    await expect(page.locator("text=Task Winner").first()).toBeVisible();
    await expect(page.locator("text=HIGH RISK ZONE").first()).toBeVisible();
    await expect(page.locator("text=Aman").first()).toBeVisible();
    await expect(page.locator("text=Sudheer").first()).toBeVisible();
    await expect(page.locator("text=Chaitra Rai").first()).toBeVisible();
    await expect(page.locator("text=Charan").first()).toBeVisible();

    // Verify negative assertions (No abolished team leaders)
    const pageContent = await page.content();
    expect(pageContent).not.toContain("Red Team Leader");
    expect(pageContent).not.toContain("Blue Team Leader");
    expect(pageContent).not.toContain("Captain Auto Ram Prasad");
    expect(pageContent).not.toContain("Captain Rohit Naidu");
    expect(pageContent).not.toContain("NO TEAM WON");
  });

  test("Contestant directory reflects individual housemates, High Risk Zone, and eliminations", async ({
    page,
  }) => {
    await page.goto("/contestants");
    await expect(page.locator("h1")).toContainText("Contestant Directory");

    // Check filter tabs
    await expect(page.locator("button:has-text('All Housemates (16)')")).toBeVisible();
    await expect(page.locator("button:has-text('Active Nominated (14)')")).toBeVisible();
    await expect(page.locator("button:has-text('HIGH RISK ZONE (3)')")).toBeVisible();
    await expect(page.locator("button:has-text('Eliminated (2)')")).toBeVisible();

    // Check Auto Ram Prasad has TASK WINNER badge and NOT High Risk Zone
    const ramCard = page.locator("a[href*='auto-ram-prasad']");
    await expect(ramCard).toBeVisible();
    await expect(ramCard).toContainText("TASK WINNER");
    await expect(ramCard).not.toContainText("HIGH RISK ZONE");

    // Check Aman has HIGH RISK ZONE badge
    const amanCard = page.locator("a[href*='aman']").first();
    await expect(amanCard).toBeVisible();
    await expect(amanCard).toContainText("HIGH RISK ZONE");

    // Check Sudheer Kumar Reddy has HIGH RISK ZONE badge
    const sudheerCard = page.locator("a[href*='sudheer-kumar-reddy']").first();
    await expect(sudheerCard).toBeVisible();
    await expect(sudheerCard).toContainText("HIGH RISK ZONE");

    // Check Varshini Sounderajan has HIGH RISK ZONE badge
    const varshiniCard = page.locator("a[href*='varshini-sounderajan']").first();
    await expect(varshiniCard).toBeVisible();
    await expect(varshiniCard).toContainText("HIGH RISK ZONE");

    // Check Charan and Chaitra Rai have ELIMINATED badge
    const charanCard = page.locator("a[href*='charan']").first();
    await expect(charanCard).toBeVisible();
    await expect(charanCard).toContainText("ELIMINATED");

    const chaitraCard = page.locator("a[href*='chaitra-rai']").first();
    await expect(chaitraCard).toBeVisible();
    await expect(chaitraCard).toContainText("ELIMINATED");

    // Filter by HIGH RISK ZONE (3) -> exactly Aman, Sudheer Kumar Reddy & Varshini Sounderajan
    await page.click("button:has-text('HIGH RISK ZONE (3)')");
    await expect(page.locator("a[href*='aman']")).toBeVisible();
    await expect(page.locator("a[href*='sudheer-kumar-reddy']")).toBeVisible();
    await expect(page.locator("a[href*='varshini-sounderajan']")).toBeVisible();
    await expect(page.locator("a[href*='auto-ram-prasad']")).not.toBeVisible();
    await expect(page.locator("a[href*='charan']")).not.toBeVisible();
    await expect(page.locator("a[href*='chaitra-rai']")).not.toBeVisible();

    // Filter by Eliminated (2) -> exactly Charan & Chaitra Rai
    await page.click("button:has-text('Eliminated (2)')");
    await expect(page.locator("a[href*='charan']")).toBeVisible();
    await expect(page.locator("a[href*='chaitra-rai']")).toBeVisible();
    await expect(page.locator("a[href*='aman']")).not.toBeVisible();

    // Navigate to Charan's detail profile
    await page.goto("/contestants/charan");
    await expect(page.locator("h1")).toContainText("Charan");
    await expect(page.locator("text=ELIMINATED").first()).toBeVisible();
    await expect(page.locator("text=VOTING DISABLED — ELIMINATED")).toBeVisible();

    // Navigate to Chaitra Rai's detail profile
    await page.goto("/contestants/chaitra-rai");
    await expect(page.locator("h1")).toContainText("Chaitra Rai");
    await expect(page.locator("text=ELIMINATED").first()).toBeVisible();
    await expect(page.locator("text=VOTING DISABLED — ELIMINATED")).toBeVisible();

    // Navigate to Auto Ram Prasad's detail profile
    await page.goto("/contestants/auto-ram-prasad");
    await expect(page.locator("h1")).toContainText("Auto Ram Prasad");
    await expect(page.locator("text=TASK WINNER").first()).toBeVisible();
  });

  test("Polls and news dispatches reflect 14 active nominated contestants and eliminations", async ({
    page,
  }) => {
    // 1. Check Polls page
    await page.goto("/polls");
    await expect(page.locator("h1")).toContainText("WHO SHOULD BE SAVED?");
    await expect(page.locator("text=14 Housemates Nominated")).toBeVisible();

    // Verify exactly Aman, Sudheer Kumar Reddy, and Varshini Sounderajan have High Risk Zone badge on polls
    const pollCards = page.locator("div.group:has(h3)");
    await expect(pollCards).toHaveCount(14);
    await expect(pollCards.filter({ hasText: "Aman" })).toContainText("HIGH RISK ZONE");
    await expect(pollCards.filter({ hasText: "Sudheer" })).toContainText("HIGH RISK ZONE");
    await expect(pollCards.filter({ hasText: "Varshini" })).toContainText("HIGH RISK ZONE");

    // Excluded from active voting
    await expect(pollCards.filter({ hasText: "Charan" })).toHaveCount(0);
    await expect(pollCards.filter({ hasText: "Chaitra Rai" })).toHaveCount(0);

    // Auto Ram Prasad is nominated, NOT High Risk Zone
    await expect(pollCards.filter({ hasText: "Auto Ram Prasad" })).not.toContainText("HIGH RISK ZONE");

    // 2. Check News dispatches
    await page.goto("/news");
    await expect(page.locator("h1")).toContainText("Editorial News");
    await expect(page.locator("text=CHAITRA RAI AND CHARAN ELIMINATED").first()).toBeVisible();
    await expect(page.locator("text=AUTO RAM PRASAD NAMED TASK WINNER").first()).toBeVisible();
    await expect(page.locator("text=AMAN, SUDHEER KUMAR REDDY, AND VARSHINI SOUNDERAJAN").first()).toBeVisible();
  });

  test("Production authentication UI and admin login operate cleanly", async ({
    page,
  }) => {
    // 1. Visit /login
    await page.goto("/login");

    // Verify Header
    await expect(page.locator("text=BB TELUGU").first()).toBeVisible();
    await expect(page.locator("text=FANS").first()).toBeVisible();
    await expect(page.locator("h1")).toContainText("SIGN IN");

    // Verify Form Fields
    await expect(page.locator("label:has-text('EMAIL ADDRESS')")).toBeVisible();
    await expect(page.locator("label:has-text('PASSWORD')")).toBeVisible();
    await expect(page.locator("button:has-text('SIGN IN')")).toBeVisible();
    await expect(page.locator("a:has-text('CREATE ACCOUNT')")).toBeVisible();

    // 2. Visit /admin without authentication -> shows Restricted Access
    await page.goto("/admin");
    await expect(page.locator("text=Restricted Access")).toBeVisible();

    // 3. Visit dedicated /admin/login portal
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText("ADMIN CONSOLE");

    // 4. Authenticate as real administrator 'nikhil'
    await page.fill("input[placeholder='Username or email']", "nikhil");
    await page.fill("input[placeholder='••••••••']", "AdminBBTelugu2026!");
    await page.click("button:has-text('AUTHENTICATE CONSOLE')");

    // Verify redirection to /admin dashboard
    await page.waitForURL("**/admin");
    await expect(page.locator("h1:has-text('BB Telugu Operations')")).toBeVisible();
    await expect(page.locator("main strong:has-text('nikhil')")).toBeVisible();
  });

  test("Unauthenticated user sees sign in prompt on polls and voting requires authentication", async ({
    page,
  }) => {
    // Clear any existing localStorage
    await page.goto("/polls");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // When not logged in, should show SIGN IN OR SIGN UP prompt
    const prompt = page.locator("[data-testid='auth-prompt']").first();
    await expect(prompt).toBeVisible();
    await expect(prompt.locator("a:has-text('Sign In')")).toBeVisible();
    await expect(prompt.locator("a:has-text('Sign Up')")).toBeVisible();
  });
});