import fetch from 'node-fetch'
import cheerio from 'cheerio'
import * as fs from 'fs'

async function getResultsByDate({ year, month, day }) {
	var todayResult = { date: '', results: [] }
	let baseURL = `https://portalbrasil.net/jogodobicho/${year}/${month}/${day}/resultado-do-jogo-do-bicho-deu-no-poste-de-hoje-${day}-${month}-${year}/`
	let response = await fetch(baseURL)
	try {
		console.log("\tFetching...")
		response = await response.text()
		let $ = cheerio.load(response)
		todayResult.date = { year, month, day }

		$('h4').each((i, elm) => {
			if ($(elm).next().get(0).tagName == 'ul') {
				let items = $(elm).next().children()
				let time = $(elm).text()
				time = time.split(" ")
				time = [time[1], time[2]]
				let results = { time, groups: [] }
				for (let i = 0; i < items.length; i++) {
					let re = $(items[i]).text()
					re = re.split(' ')
					let novo = { number: re[0], animal: re[1] }
					results.groups.push(novo)
				}
				todayResult.results.push(results)
			}
		})
		return (todayResult)
	} catch (error) {
		console.log(`error:${baseURL}`);
	}

}
async function scrape(date) {
	try {
		let curr = await getResultsByDate(date)
		if(curr.results.length == 0)
			throw new Error("No Data")
		console.log("\tWriting")

		fs.appendFileSync('results.json', JSON.stringify(curr)+',')

	} catch (error) {
		console.error("\t\tErro", error.message)
		fs.appendFileSync('error.log', JSON.stringify(date)+",")
	}
}
function pad(num, size) {
	num = num.toString();
	while (num.length < size) num = "0" + num;
	return num;
}

async function startScrape(){

	for(let month = 1; month <= 12; month++){
		for(let day = 1; day <= 31; day++){
			console.log(` looking for: ${day}/${month}/2020 `);
			await scrape({ 'year': '2020', 'month': pad(month, 2) , 'day': pad(day, 2)  })
		}
		
	}
}



startScrape()