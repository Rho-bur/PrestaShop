require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

class Groups extends BOBasePage {
  constructor() {
    super();

    this.pageTitle = 'Groups •';

    this.alertSuccessBlockParagraph = '.alert-success';

    // Header selectors
    this.newGroupLink = '#page-header-desc-group-new_group';

    // Form selectors
    this.gridForm = '#form-group';
    this.gridTableHeaderTitle = `${this.gridForm} .panel-heading`;
    this.gridTableNumberOfTitlesSpan = `${this.gridTableHeaderTitle} span.badge`;

    // Table selectors
    this.gridTable = '#table-group';

    // Filter selectors
    this.filterRow = `${this.gridTable} tr.filter`;
    this.filterColumn = filterBy => `${this.filterRow} [name='groupFilter_${filterBy}']`;
    this.filterSearchButton = '#submitFilterButtongroup';
    this.filterResetButton = 'button[name=\'submitResetgroup\']';

    // Table body selectors
    this.tableBody = `${this.gridTable} tbody`;
    this.tableBodyRows = `${this.tableBody} tr`;
    this.tableBodyRow = row => `${this.tableBodyRows}:nth-child(${row})`;
    this.tableBodyColumns = row => `${this.tableBodyRow(row)} td`;
  }

  /* Header methods */
  /**
   * Go to new group page
   * @param page
   * @return {Promise<void>}
   */
  async goToNewGroupPage(page) {
    await this.clickAndWaitForNavigation(page, this.newGroupLink);
  }

  /* Filter methods */

  /**
   * Get Number of groups
   * @param page
   * @return {Promise<number>}
   */
  getNumberOfElementInGrid(page) {
    return this.getNumberFromText(page, this.gridTableNumberOfTitlesSpan);
  }

  /**
   * Reset all filters
   * @param page
   * @return {Promise<void>}
   */
  async resetFilter(page) {
    if (!(await this.elementNotVisible(page, this.filterResetButton, 2000))) {
      await this.clickAndWaitForNavigation(page, this.filterResetButton);
    }
    await this.waitForVisibleSelector(page, this.filterSearchButton, 2000);
  }

  /**
   * Reset and get number of groups
   * @param page
   * @return {Promise<number>}
   */
  async resetAndGetNumberOfLines(page) {
    await this.resetFilter(page);
    return this.getNumberOfElementInGrid(page);
  }

  /**
   * Filter groups
   * @param page
   * @param filterType
   * @param filterBy
   * @param value
   * @return {Promise<void>}
   */
  async filterTable(page, filterType, filterBy, value) {
    switch (filterType) {
      case 'input':
        await this.setValue(page, this.filterColumn(filterBy), value.toString());
        await this.clickAndWaitForNavigation(page, this.filterSearchButton);
        break;

      case 'select':
        await Promise.all([
          page.waitForNavigation({waitUntil: 'networkidle'}),
          this.selectByVisibleText(page, this.filterColumn(filterBy), value ? 'Yes' : 'No'),
        ]);
        break;

      default:
        throw new Error(`Filter ${filterBy} was not found`);
    }
  }

  /* Column methods */

  /**
   * Get text from column in table
   * @param page
   * @param row
   * @param columnName
   * @return {Promise<string>}
   */
  async getTextColumn(page, row, columnName) {
    // Get all text columns
    const textColumns = await page.$$eval(
      `${this.tableBodyColumns(row)}:not(.row-selector)`,
      els => els.map(el => el.textContent.trim()),
    );

    switch (columnName) {
      case 'id_group':
        return textColumns[0];

      case 'b!name':
        return textColumns[1];

      case 'reduction':
        return textColumns[2];

      case 'nb':
        return textColumns[3];

      case 'show_prices':
        return textColumns[4];

      default:
        throw new Error(`Column ${columnName} was not found`);
    }
  }
}

module.exports = new Groups();