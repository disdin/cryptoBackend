import puppeteer from "puppeteer";


const getNames = async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new'});
    const page = await browser.newPage();


    await page.goto(
      'https://coinmarketcap.com/',{waitUntil: 'load', timeout: 0}
    );


    await page.waitForSelector(
      'div[class="sc-66133f36-2 cgmess"] table tbody tr', {timeout:0}
    );

    const namesOFCurrency = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        'div[class="sc-66133f36-2 cgmess"] table tbody tr'
      );
      const firstFiftyItems = [];
      for (let i = 0; i < 50 && i < rows.length; i++) {
        firstFiftyItems.push(rows[i]);
      }
      return Array.from(firstFiftyItems, (row) => {
        const link = row.querySelector('a');
        const columns = row.querySelectorAll("td");
        let data = Array.from(columns, (column) => column.textContent.trim());
        return {label:data[2],value:link.getAttribute('href').split('/')[2]};
      });
    });


    const payload = {
      success: true,
      message: "all rows retrieved successfully",
      body: namesOFCurrency,
    }
    res.status(200).send(JSON.stringify(payload));
    await browser.close();
  } catch (err) {
    console.log("error in getNames ", err);
    const payload = {
      success: false,
      message: "error occured ",
      body: null,
    }
    res.status(200).send(JSON.stringify(payload));
  }
}

export default getNames;
