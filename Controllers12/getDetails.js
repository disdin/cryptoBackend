import puppeteer from "puppeteer";


const getDetails = async (req, res) => {
  try {
    var id = req.params.id;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      `https://coinmarketcap.com/currencies/${id}/historical-data/`
    );


    await page.waitForSelector(
      'div[class="sc-a63f8491-2 cgpSFv"] table tbody tr'
    );

    let start = Date.now();
    const historicalData = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        'div[class="sc-a63f8491-2 cgpSFv"] table tbody tr'
      );

      return Array.from(rows, (row) => {

        const columns = row.querySelectorAll("td");
        let data = Array.from(columns, (column) => column.textContent.trim());
        const originalArray = data;
        const specificIndices = [0, 6];
        const filteredArray = specificIndices.map(index => originalArray[index]);
        data= filteredArray;

        return data;
      });
    });

    const elapsedTime = Date.now() - start;


    const payload = {
      success: true,
      message: "all rows retrieved successfully",
      body: historicalData,
      time: elapsedTime
    }
    res.status(200).send(JSON.stringify(payload), null, 2);
    await browser.close();
  } catch (err) {
    console.log("error in getDetails ", err);
    const payload = {
      success: false,
      message: "error occured ",
      body: null,
    }
  res.status(200).send(JSON.stringify(payload));
  }
}

export default getDetails;
