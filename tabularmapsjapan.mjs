
// import util from 'https://tabularmaps.github.io/areamap/util.mjs'
import util from 'https://taisukef.github.io/util/util.mjs'

const showJapan = async (setCellContent, colorTabularMaps, onlypref) => {
	let cities = null;
	if (!onlypref) {
		const url_citiesjp = 'https://code4fukui.github.io/localgovjp/localgovjp-utf8.csv'
		cities = await util.fetchCSVtoJSON(url_citiesjp)
		// console.log(cities)
	}
	const getCityData = function(pref, city) {
		for (const d of cities) {
			if (d.pref == pref && d.city == city) {
				return d
			}
		}
		return null
	}

	const area = await util.fetchCSVtoJSON("https://tabularmaps.github.io/areamap/tabularmaps_japan.csv");
	// console.log(area);

	const show = function(name) {
		let tmapdata = area[0]
		for (const d of area) {
			if (d.name == name) {
				tmapdata = d
				break
			}
		}
		if (!onlypref) {
			back.style.display = tmapdata == area[0] ? 'none' : 'inline-block'
		}
		
		const tmap = util.makeGrids(tmapdata.tabularmap)
		tmapc.innerHTML = ''
		tmapc.appendChild(tmap)
		if (!onlypref) {
			tmtitle.textContent = tmapdata.name_ja
		}
		
		for (const c of tmap.children) {
			const name = c.textContent;
			c.cellname = name;
			if (name !== '-') {
				setCellContent(c, tmapdata.name_ja, name);
				if (!onlypref) {
					c.onclick = () => {
						const name = c.cellname;
						const data = getCityData(tmapdata.name_ja, name)
						if (data) {
							window.open(data.url, '_blank')
							return
						}
						// pref
						for (const d of area) {
							if (d.name_ja == name) {
								show(d.name)
								document.location.hash = '#' + d.name
								break
							}
						}
					}
				}
			}
		}
		colorTabularMaps(tmapdata.name_ja, tmap);
	}

	const onhashchange = function() {
		const hash = document.location.hash
		if (hash.length > 1) {
			show(hash.substring(1))
		} else {
			show('Japan')
		}
	}
	onhashchange()
	if (!onlypref) {
		window.onhashchange = onhashchange

		back.onclick = function() {
			document.location.hash = ''
		}
	}
}

export default { showJapan };
