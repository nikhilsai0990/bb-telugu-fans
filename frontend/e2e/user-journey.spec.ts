import { test, expect } from "@playwright/test";

test.describe("Complete User Journey & Official Game State Verification", () => {
  test("Homepage displays official Season 10 state with zero old state remnants", async ({
    page,
  }) => {
    // 1. Arrive on Homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/BB Telugu Fans/);

    // Verify H1
    const h1 = page.locator("h1");
    await expect(h1).toContainText("RED");
    await expect(h1).toContainText("BLUE");
    await expect(h1).toContainText("SEASON 10");

    // Verify Official Game State elements on Homepage
    await expect(page.locator("text=15 Active").first()).toBeVisible();
    await expect(page.locator("text=1 Eliminated").first()).toBeVisible();
    await expect(page.locator("text=Debjani Modak").first()).toBeVisible();
    await expect(page.locator("text=Rohit Naidu").first()).toBeVisible();
    await expect(page.locator("text=Blue Team Leader").first()).toBeVisible();
    await expect(page.locator("text=Red Team Leader").first()).toBeVisible();
    await expect(page.locator("text=HIGH RISK ZONE").first()).toBeVisible();
    await expect(page.locator("text=Auto Ram Prasad").first()).toBeVisible();
    await expect(page.locator("text=Chaitra Rai").first()).toBeVisible();
    await expect(page.locator("text=Red Team won Task 1").first()).toBeVisible();
    await expect(page.locator("text=Charan has been ELIMINATED").first()).toBeVisible();

    // Verify dual showcase images for both leaders
    const debjaniImg = page.locator("img[src*='debjani-modak.webp']").first();
    await expect(debjaniImg).toBeVisible();
    const rohitImg = page.locator("img[src*='rohit-naidu.webp']").first();
    await expect(rohitImg).toBeVisible();

    // Verify negative assertions
    const pageContent = await page.content();
    expect(pageContent).not.toContain("Captain Auto Ram Prasad");
    expect(pageContent).not.toContain("Captain Rohit Naidu");
    expect(pageContent).not.toContain("Blue Team won the first task");
    expect(pageContent).not.toContain("First Task: CANCELLED");
    expect(pageContent).not.toContain("NO TEAM WON");
  });

  test("Contestant directory reflects official leaders, High Risk Zone, and Task 1 winners", async ({
    page,
  }) => {
    await page.goto("/contestants");
    await expect(page.locator("h1")).toContainText("Contestant Directory");

    // Verify Audience Rating is 0% for contestants and NO fake numbers exist
    await expect(page.locator("text=Audience Rating").first()).toBeVisible();
    await expect(page.locator("text=0%").first()).toBeVisible();
    const contestantsContent = await page.content();
    expect(contestantsContent).not.toContain("86.2%");
    expect(contestantsContent).not.toContain("84.5%");
    expect(contestantsContent).not.toContain("83.1%");
    expect(contestantsContent).not.toContain("79.4%");

    // Check tabs
    await expect(page.locator("button:has-text('Active Nominated (15)')")).toBeVisible();
    await expect(page.locator("button:has-text('HIGH RISK ZONE (2)')")).toBeVisible();
    await expect(page.locator("button:has-text('Eliminated (1)')")).toBeVisible();

    // Check Debjani Modak has Team Leader badge
    const debjaniCard = page.locator("a[href*='debjani-modak']");
    await expect(debjaniCard).toBeVisible();
    await expect(debjaniCard).toContainText("Team Leader");

    // Check Rohit Naidu has Team Leader badge and Task 1 Win badge
    const rohitCard = page.locator("a[href*='rohit-naidu']");
    await expect(rohitCard).toBeVisible();
    await expect(rohitCard).toContainText("Team Leader");
    await expect(rohitCard).toContainText("Task 1 Win");

    // Check Temper Vamsi has Task 1 Win badge
    const vamsiCard = page.locator("a[href*='temper-vamsi']");
    await expect(vamsiCard).toBeVisible();
    await expect(vamsiCard).toContainText("Task 1 Win");

    // Check Auto Ram Prasad has HIGH RISK ZONE badge and NOT Leader
    const ramCard = page.locator("a[href*='auto-ram-prasad']");
    await expect(ramCard).toBeVisible();
    await expect(ramCard).toContainText("HIGH RISK ZONE • ACTIVE");
    await expect(ramCard).not.toContainText("Team Leader");

    // Check Chaitra Rai has HIGH RISK ZONE badge
    const chaitraCard = page.locator("a[href*='chaitra-rai']");
    await expect(chaitraCard).toBeVisible();
    await expect(chaitraCard).toContainText("HIGH RISK ZONE • ACTIVE");

    // Check Charan has ELIMINATED badge and NOT High Risk Zone
    const charanCard = page.locator("a[href*='charan']").first();
    await expect(charanCard).toBeVisible();
    await expect(charanCard).toContainText("ELIMINATED");
    await expect(charanCard).not.toContainText("HIGH RISK ZONE");

    // VERIFY AMAN AND MUKESH GOWDA DO NOT HAVE HIGH RISK ZONE BADGE
    const amanCard = page.locator("a[href*='aman']").first();
    await expect(amanCard).toBeVisible();
    await expect(amanCard).not.toContainText("HIGH RISK ZONE");

    const mukeshCard = page.locator("a[href*='mukesh-gowda']").first();
    await expect(mukeshCard).toBeVisible();
    await expect(mukeshCard).not.toContainText("HIGH RISK ZONE");

    // Filter by HIGH RISK ZONE (2)
    await page.click("button:has-text('HIGH RISK ZONE (2)')");
    await expect(page.locator("a[href*='auto-ram-prasad']")).toBeVisible();
    await expect(page.locator("a[href*='chaitra-rai']")).toBeVisible();
    await expect(page.locator("a[href*='charan']")).not.toBeVisible();
    await expect(page.locator("a[href*='aman']")).not.toBeVisible();
    await expect(page.locator("a[href*='mukesh-gowda']")).not.toBeVisible();

    // Navigate to Charan's detail profile
    await page.goto("/contestants/charan");
    await expect(page.locator("h1")).toContainText("Charan");
    await expect(page.locator("text=ELIMINATED").first()).toBeVisible();
    await expect(page.locator("text=Evicted from Bigg Boss House (Week 1)").first()).toBeVisible();
    await expect(page.locator("text=VOTING DISABLED — ELIMINATED")).toBeVisible();
    await expect(page.locator("text=Audience Rating").first()).toBeVisible();
    await expect(page.locator("text=0%").first()).toBeVisible();

    // Navigate to Debjani Modak's detail profile
    await page.goto("/contestants/debjani-modak");
    await expect(page.locator("h1")).toContainText("Debjani Modak");
    await expect(page.locator("text=Blue Team Leader").first()).toBeVisible();
    await expect(page.locator("text=Team Leader").first()).toBeVisible();

    // Navigate to Rohit Naidu's detail profile
    await page.goto("/contestants/rohit-naidu");
    await expect(page.locator("h1")).toContainText("Rohit Naidu");
    await expect(page.locator("text=Red Team Leader").first()).toBeVisible();
    await expect(page.locator("text=Team Leader").first()).toBeVisible();
    await expect(page.locator("text=Task 1 Winner").first()).toBeVisible();
  });

  test("Polls and news dispatches reflect 15 active nominated contestants and Task 1 win", async ({
    page,
  }) => {
    // 1. Check Polls page
    await page.goto("/polls");
    await expect(page.locator("h1")).toContainText("WHO SHOULD BE SAVED?");
    await expect(page.locator("text=15 Housemates Nominated")).toBeVisible();

    // Verify exactly Auto Ram Prasad and Chaitra Rai have High Risk Zone badge on polls
    const pollCards = page.locator("div.group:has(h3)");
    await expect(pollCards).toHaveCount(15);
    await expect(pollCards.filter({ hasText: "Auto Ram Prasad" })).toContainText("HIGH RISK ZONE • ACTIVE");
    await expect(pollCards.filter({ hasText: "Chaitra Rai" })).toContainText("HIGH RISK ZONE • ACTIVE");
    await expect(pollCards.filter({ hasText: "Charan" })).toHaveCount(0); // Charan excluded
    await expect(pollCards.filter({ hasText: "Aman" })).not.toContainText("HIGH RISK ZONE");
    await expect(pollCards.filter({ hasText: "Mukesh Gowda" })).not.toContainText("HIGH RISK ZONE");

    // 2. Check News dispatches
    await page.goto("/news");
    await expect(page.locator("h1")).toContainText("Editorial News");
    await expect(page.locator("text=CHARAN ELIMINATED FROM BIGG BOSS").first()).toBeVisible();
    await expect(page.locator("text=RED TEAM WINS TASK 1").first()).toBeVisible();
    await expect(page.locator("text=AUTO RAM PRASAD AND CHAITRA RAI ENTER HIGH RISK ZONE").first()).toBeVisible();
    await expect(page.locator("text=DEBJANI MODAK AND ROHIT NAIDU LEAD BLUE AND RED TEAMS").first()).toBeVisible();
  });

  test("Production authentication UI has zero demo buttons and provides clean fan & admin login", async ({
    page,
  }) => {
    // 1. Visit /login
    await page.goto("/login");

    // Verify Header
    await expect(page.locator("text=BB TELUGU").first()).toBeVisible();
    await expect(page.locator("text=FANS").first()).toBeVisible();
    await expect(page.locator("h1")).toContainText("SIGN IN");
    await expect(page.locator("text=Access your fan profile, votes and discussions.")).toBeVisible();

    // Verify Form Fields
    await expect(page.locator("label:has-text('EMAIL ADDRESS')")).toBeVisible();
    await expect(page.locator("label:has-text('PASSWORD')")).toBeVisible();
    await expect(page.locator("button:has-text('SIGN IN')")).toBeVisible();
    await expect(page.locator("a:has-text('CREATE ACCOUNT')")).toBeVisible();

    // ZERO DEMO REMNANTS
    const loginContent = await page.content();
    expect(loginContent).not.toContain("Instant Test Logins");
    expect(loginContent).not.toContain("Demo Fan User");
    expect(loginContent).not.toContain("Demo Admin");

    // 2. Visit /admin without authentication -> shows Restricted Access with link to /admin/login
    await page.goto("/admin");
    await expect(page.locator("text=Restricted Access")).toBeVisible();
    await expect(page.locator("a:has-text('Authenticate Administrator')")).toBeVisible();

    // 3. Visit dedicated /admin/login portal
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText("ADMIN CONSOLE");
    await expect(page.locator("text=Security Clearance Required")).toBeVisible();

    // 4. Authenticate as real administrator 'nikhil'
    await page.fill("input[placeholder='Username or email']", "nikhil");
    await page.fill("input[placeholder='••••••••']", "AdminBBTelugu2026!");
    await page.click("button:has-text('AUTHENTICATE CONSOLE')");

    // Verify redirection to /admin dashboard
    await page.waitForURL("**/admin");
    await expect(page.locator("h1:has-text('BB Telugu Operations')")).toBeVisible();
    await expect(page.locator("main strong:has-text('nikhil')")).toBeVisible();
  });

  test("Voting flow shows live results for all 15 active contestants and prevents duplicate voting on refresh", async ({
    page,
  }) => {
    // 1. Visit /polls
    await page.goto("/polls");
    await expect(page.locator("h1")).toContainText("WHO SHOULD BE SAVED?");

    // Verify 15 contestant cards exist
    const cards = page.locator(".editorial-panel .grid > div.group");
    await expect(cards).toHaveCount(15);

    // Find Debjani Modak card and click it
    const debjaniCard = cards.filter({ hasText: "Debjani Modak" }).first();
    await expect(debjaniCard).toBeVisible();
    await debjaniCard.click();

    // Verify button says "Vote to Save Debjani Modak"
    const voteBtn = page.locator("button:has-text('Vote to Save Debjani Modak')");
    await expect(voteBtn).toBeVisible();
    await expect(voteBtn).toBeEnabled();

    // Cast vote
    await voteBtn.click();

    // Verify immediate vote success, already-cast banner and disabled button
    await expect(page.locator("text=✓ YOUR VOTE IS ALREADY CAST")).toBeVisible();
    await expect(page.locator("text=You voted for Debjani Modak.")).toBeVisible();
    await expect(page.locator("button:has-text('VOTE ALREADY SUBMITTED')")).toBeVisible();
    await expect(page.locator("button:has-text('VOTE ALREADY SUBMITTED')")).toBeDisabled();

    // Verify Live Vote Results section appeared BELOW contestant selection area
    const liveResults = page.locator("[data-testid='live-vote-results']");
    await expect(liveResults).toBeVisible();
    await expect(liveResults.locator("h2")).toContainText("LIVE VOTE RESULTS");

    // Verify all 15 active contestants are listed in the results
    const resultCards = liveResults.locator(".grid > div");
    await expect(resultCards).toHaveCount(15);

    // Verify Debjani Modak has at least 1 vote
    await expect(liveResults.locator("text=DEBJANI MODAK")).toBeVisible();
    await expect(liveResults.locator("text=/\\d+ VOTE/").first()).toBeVisible();

    // Refresh the browser page
    await page.reload();

    // Verify persistent detection after refresh
    await expect(page.locator("text=✓ YOUR VOTE IS ALREADY CAST")).toBeVisible();
    await expect(page.locator("text=You voted for Debjani Modak.")).toBeVisible();

    // Verify button remains disabled
    const disabledBtn = page.locator("button:has-text('VOTE ALREADY SUBMITTED')");
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toBeDisabled();

    // Verify live results remain visible below after refresh
    const liveResultsAfterRefresh = page.locator("[data-testid='live-vote-results']");
    await expect(liveResultsAfterRefresh).toBeVisible();
    const resultCardsAfterRefresh = liveResultsAfterRefresh.locator(".grid > div");
    await expect(resultCardsAfterRefresh).toHaveCount(15);
  });
});