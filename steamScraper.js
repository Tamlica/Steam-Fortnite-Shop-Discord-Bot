const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getSteamSales() {
    try {
        const url = 'https://store.steampowered.com/search/?sort_by=Price_ASC&supportedlang=english&specials=1&ndl=1';
        const response = await axios.get(url);
        const html = response.data;

        // Save the raw HTML response to a file
        fs.writeFileSync('steam_sales.html', html, 'utf-8');
        console.log(`HTML response has been written to steam_sales.html`);

        const $ = cheerio.load(html);
        const sales = [];

        $('.search_result_row').each((i, el) => {
            const title = $(el).find('.title').text().trim();
            const discount = $(el).find('.discount_pct').text().trim();
            const originalPrice = $(el).find('.discount_original_price').text().trim();
            const salePrice = $(el).find('.discount_final_price').text().trim();
            const link = $(el).attr('href');

            sales.push({
                title,
                discount,
                originalPrice: originalPrice !== salePrice ? originalPrice : 'N/A',
                salePrice,
                link
            });
        });

        // Write the sales data to a JSON file
        fs.writeFileSync('parsed_steam_sales.json', JSON.stringify(sales, null, 2), 'utf-8');
        console.log(`Sales data has been written to parsed_steam_sales.json`);
    } catch (error) {
        console.error('Error parsing Steam sales:', error.message);
    }
}

// Fetch and write the sales
getSteamSales();
