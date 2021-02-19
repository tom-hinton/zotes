// const testHtml = `<h2>## This is a heading</h2>
// <p>Here we have some body text <strong>**in bold**</strong> and *in italic.</p>
// <p>And finally*, <strong>**another**</strong> paragraph **here.</p>
// <p>indented # Oops! Another heading</p>
// <h3>### Where are these coming from?</h3>`



/****    REGEX RULES    ****/
const test = (string, regex) => {
	// console.log('string', string)
	// console.log('regex', regex)
	console.log('match', string.match(regex))
	return string
}
const breaks = (string, regex) => {
	return string.replace(regex, (match, offset, fullString) =>{
		// console.log({match, offset, fullString})
		return fullString === '<br>' ? '' : '\n'
	})
}
const consecutive = (string, regex) => {
	return string.replace(regex, (match, p1, p2) => {
		if (p2 === '<br>' || p1 === '<br>') {
			return match
		}
		return p1 + '\n' + p2
	})
}
const rules = [
	{ regex: /<p>(.*)<\/p><p>(.*)<\/p>/igm, rule: consecutive },
	{ regex: /<h\d><br><\/h\d>/igm, rule: '' },
	{ regex: /<a.*><br><\/a>/igm, rule: '' },
	{ regex: /^<p><br><\/p>$/igm, rule: '' },
	{ regex: /<a data-redirectid="(.*?)".*?>\[(.*?)\](.*?)<\/a>/igm, rule: '[$2]($1)$3' },
	{ regex: /<a.*?>(.*?)<\/a>/igm, rule: '$1' },
	{ regex: /<em>(.*?)<\/em>/igm, rule: '$1' },
	{ regex: /<strong>(.*?)<\/strong>/igm, rule: '$1' },
	{ regex: /<h\d>(.*?)<\/h\d>/igm, rule: '$1' },
	{ regex: /<p>(.*?)<\/p>/igm, rule: '$1' },
	{ regex: /<div>(.*?)<\/div>/igm, rule: '$1' },
	{ regex: /<br><br>/igm, rule: '' },
	{ regex: /<br>/igm, rule: '\n' },
]




/****    PARSER LOGIC    ****/
export const HtmlToMarkdownParser = (html) => {
	let string = html
	if (string === '<p><br></p>') {
		return ''
	}
	// console.log('html:', string)
	rules.forEach((i) => {
		if(typeof i.rule === 'function') {
			return string = i.rule(string, i.regex)
		}
		else if(typeof i.rule === 'string') {
			return string = string.replace(i.regex, i.rule)
		}
	})
	// console.log('markdown:', string)
	// console.log('newline count', string.match(/\n/g))
	return string
}

// console.log(HtmlToMarkdownParser(testHtml))