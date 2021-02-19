// Test markdown
// const testMarkdown = '## This is a heading\nHere we have some body text **in bold** and *in italic.\nAnd finally*, **another** paragraph **here.\nindented # Oops! Another heading\n### Where are these coming from?'



/****    REGEX HANDLING FUNCTIONS ****/
const heading = (markdown, regex) => {
	const string = markdown.replace(regex, (match, p1, p2) => {
		const lvl = p1.length.toString()
		return `<h${lvl}>${p1+p2}</h${lvl}>`
	})
	return string
}



/****    REGEX RULES    ****/
const rules = [
	{ regex: /^(?!#)(.*)/igm, rule: '<p>$1</p>' },
	{ regex: /^(#+)(.*)/igm, rule: heading },
	{ regex: /\*\*(.*?)\*\*/igm, rule: '<strong>**$1**</strong>' },
	{ regex: /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/igm, rule: '<em>*$1*</em>' },
	{ regex: /\[(.*?)\]\((.*?)\)/igm, rule: '<a data-redirectid="$2" data-linktype="note" onclick="window.handleInternalLink(\'$2\')">[$1]</a>' },
	{ regex: / (#\w*)(?!\w)/igm, rule: ' <a data-linktype="tag" onclick="window.searchNotes(\'$1\')">$1</a>' },
]




/****    PARSER LOGIC    ****/
export const MarkdownToHtmlParser = (markdown) => {
	let string = markdown
	// console.log('markdown:', string)
	rules.forEach((i) => {
		if(typeof i.rule === 'function') {
			return string = i.rule(string, i.regex)
		}
		else if(typeof i.rule === 'string') {
			return string = string.replace(i.regex, i.rule)
		}
	})
	// console.log('html:', string)
	return string
}

// console.log(MarkdownToHtmlParser(testMarkdown))