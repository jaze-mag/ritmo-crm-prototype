async function completeOverview(app) {
  if (await app.locator('.customer').first().isDisabled()) {
    await app.locator('#open-overview').click();
    await app.locator('#complete-overview').click();
  }
}
async function reviewAllBriefs(app) {
  for (const id of ['maya-patel','daniel-brooks','renee-alvarez']) {
    await app.locator(`[data-customer="${id}"]`).click();
    await app.locator('#customer-brief').waitFor();
    await app.locator('#back-customers').click();
  }
}
module.exports={completeOverview,reviewAllBriefs};
