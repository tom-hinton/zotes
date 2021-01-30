// const testHtml = `<h2>## This is a heading</h2>
// <p>Here we have some body text <strong>**in bold**</strong> and *in italic.</p>
// <p>And finally*, <strong>**another**</strong> paragraph **here.</p>
// <p>indented # Oops! Another heading</p>
// <h3>### Where are these coming from?</h3>`



/****    REGEX RULES    ****/
const test = (string, regex) => {
	// console.log('string', string)
	// console.log('regex', regex)
	// console.log('match', string.match(regex))
	return string
}
const breaks = (string, regex) => {
	return string.replace(regex, (match, offset, fullString) =>{
		// console.log({match, offset, fullString})
		return fullString === '<br>' ? '' : '\n'
	})
}
const rules = [
	// { regex: /<p><\/p><p>(<br>)+<\/p>/, rule: test},
	{ regex: /<em>(.*?)<\/em>/igm, rule: '$1' },
	{ regex: /<strong>(.*?)<\/strong>/igm, rule: '$1' },
	{ regex: /<h\d>(.*?)<\/h\d>/igm, rule: '$1' },
	{ regex: /<p>(.*?)<\/p>/igm, rule: '$1' },
	{ regex: /<div>(.*?)<\/div>/igm, rule: '$1' },
	{ regex: /<br><br>/igm, rule: '' },
	{ regex: /<br>/igm, rule: breaks },
	// { regex: /<div><br><\/div>/igm, rule: '\n' },
	// { regex: /(?<=.)<br>/igm, rule: '\n' },
]




/****    PARSER LOGIC    ****/
export const HtmlToMarkdownParser = (html) => {
	let string = html
	if (string === '<br>') {
		return ''
	}
	console.log('html:', string)
	rules.forEach((i) => {
		if(typeof i.rule === 'function') {
			return string = i.rule(string, i.regex)
		}
		else if(typeof i.rule === 'string') {
			return string = string.replace(i.regex, i.rule)
		}
	})
	console.log('markdown:', string)
	return string
}

// console.log(HtmlToMarkdownParser(testHtml))