import { test, expect } from "@playwright/test";

test.describe("Complete User Journey & Authoritative Game State Verification", () => {
  test("Homepage displays authoritative Season 10 housemate state with team leaders and task winners", async ({
    page,
  }) => {
    // 1. Arrive on Homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/BB Telugu Fans/);

    // Verify H1
    const h1 = page.locator("h1");
    await expect(h1).toContainText("HOUSEMATE");
    await expect(h1).toContainText("SEASON 10");

    // Verify Authoritative Game State elements on Homepage
    await expect(page.locator("text=14 Active Housemates").first()).toBeVisible();
    await expect(page.locator("text=2 Eliminated").first()).toBeVisible();
    await expect(page.locator("text=No Re-entry").first()).toBeVisible();
    await expect(page.locator("text=Auto Ram Prasad").first()).toBeVisible();
    await expect(page.locator("text=Rohit Naidu").first()).toBeVisible();
    await expect(page.locator("text=Temper Vamsi").first()).toBeVisible();
    await expect(page.locator("text=TASK WINNER").first()).toBeVisible();
    await expect(page.locator("text=HIGH RISK ZONE (3)").first()).toBeVisible();
    await expect(page.locator("text=Aman").first()).toBeVisible();
    await expect(page.locator("text=Sudheer").first()).toBeVisible();
    await expect(page.locator("text=Chaitra Rai").first()).toBeVisible();
    await expect(page.locator("text=Charan").first()).toBeVisible();

    // Verify Team Leaders & Latest Team Task
    const pageContent = await page.content();
    expect(pageContent).toContain("Red Team Leader");
    expect(pageContent).toContain("Blue Team Leader");
    expect(pageContent).toContain("Krishnudu");
  });

  test("Housemates directory reflects 16 housemates, High Risk Zone (3), Task Winners, and eliminations with No Re-entry", async ({
    page,
  }) => {
    await page.goto("/contestants");
    await expect(page.locator("h1")).toContainText("Housemates Directory");

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

    // Check Charan and Chaitra Rai have ELIMINATED and NO RE-ENTRY
    const charanCard = page.locator("a[href*='charan']").first();
    await expect(charanCard).toBeVisible();
    await expect(charanCard).toContainText("ELIMINATED");
    await expect(charanCard).toContainText("NO RE-ENTRY");

    const chaitraCard = page.locator("a[href*='chaitra-rai']").first();
    await expect(chaitraCard).toBeVisible();
    await expect(chaitraCard).toContainText("ELIMINATED");
    await expect(chaitraCard).toContainText("NO RE-ENTRY");

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
    await expect(page.locator("text=NO RE-ENTRY").first()).toBeVisible();
    await expect(page.locator("text=VOTING DISABLED — NO RE-ENTRY")).toBeVisible();

    // Navigate to Chaitra Rai's detail profile
    await page.goto("/contestants/chaitra-rai");
    await expect(page.locator("h1")).toContainText("Chaitra Rai");
    await expect(page.locator("text=ELIMINATED").first()).toBeVisible();
    await expect(page.locator("text=NO RE-ENTRY").first()).toBeVisible();
    await expect(page.locator("text=VOTING DISABLED — NO RE-ENTRY")).toBeVisible();

    // Navigate to Auto Ram Prasad's detail profile
    await page.goto("/contestants/auto-ram-prasad");
    await expect(page.locator("h1")).toContainText("Auto Ram Prasad");
    await expect(page.locator("text=TASK WINNER").first()).toBeVisible();
  });

  test("Polls page shows Sunday closed status with live results, and News reflects 5 official stories", async ({
    page,
  }) => {
    // 1. Check Polls page
    await page.goto("/polls");
    await expect(page.locator("h1")).toContainText("WHO SHOULD BE SAVED?");
    await expect(page.locator("text=14 Housemates Nominated")).toBeVisible();

    // Verify voting closed indicators
    await expect(page.locator("text=Voting is Currently Closed").first()).toBeVisible();
    await expect(page.locator("[data-testid='live-vote-results']")).toBeVisible();

    // Verify exactly Aman, Sudheer Kumar Reddy, and Varshini Sounderajan have High Risk Zone badge on polls
    const pollCards = page.locator("div.group:has(h3)");
    await expect(pollCards).toHaveCount(14);
    await expect(pollCards.filter({ hasText: "Aman" })).toContainText("HIGH RISK ZONE");
    await expect(pollCards.filter({ hasText: "Sudheer" })).toContainText("HIGH RISK ZONE");
    await expect(pollCards.filter({ hasText: "Varshini" })).toContainText("HIGH RISK ZONE");

    // Charan and Chaitra Rai excluded from ballot
    await expect(pollCards.filter({ hasText: "Charan" })).toHaveCount(0);
    await expect(pollCards.filter({ hasText: "Chaitra Rai" })).toHaveCount(0);

    // Auto Ram Prasad is nominated, NOT High Risk Zone
    await expect(pollCards.filter({ hasText: "Auto Ram Prasad" })).not.toContainText("HIGH RISK ZONE");

    // 2. Check News dispatches - 5 official stories
    await page.goto("/news");
    await expect(page.locator("h1")).toContainText("Editorial News");
    await expect(page.locator("text=No Elimination on Sunday").first()).toBeVisible();
    await expect(page.locator("text=Srushti Vyakaranam lost the Power Key").first()).toBeVisible();
    await expect(page.locator("text=Sudheer Kumar Reddy won").first()).toBeVisible();
    await expect(page.locator("text=Krishnudu's team won the task against Naresh's team").first()).toBeVisible();
    await expect(page.locator("text=No re-entry for Chaitra Rai and Charan").first()).toBeVisible();
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

  test("Unauthenticated user sees sign in prompt on polls", async ({
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