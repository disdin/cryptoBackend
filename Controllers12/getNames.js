import puppeteer from "puppeteer";


const getNames = async(req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      'https://coinmarketcap.com/'
    );


    await page.waitForSelector(
      'div[class="sc-66133f36-2 cgmess"] table tbody tr'
    );

    const namesOFCurrency = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        'div[class="sc-66133f36-2 cgmess"] table tbody tr'
      );

      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        let data = Array.from(columns, (column) => column.textContent.trim());
        // const originalArray = data;
        // const specificIndices = [2];
        // const filteredArray = specificIndices.map(index => originalArray[index]);
        // data= filteredArray;

        return data[2];
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
