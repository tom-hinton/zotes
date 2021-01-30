/**    IMPORTS    **/
import React, { Component } from 'react'
import deepEqual from 'fast-deep-equal'
import * as PropTypes from 'prop-types'



/**    UTILS    **/

// Normalise space character implementation
function normalizeHtml(str) {
  return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ')
}

// Replace cursor in correct position
function getChildNode(containerEl, containerOffset) {
   let count = 0
   let i = 0
   let el
   let offset = 0
   while (count <= containerOffset) {
      el = containerEl.childNodes[i]
      const range = document.createRange()
      if(el !== undefined) {
         range.selectNodeContents(el)
         offset = containerOffset - count
         count += range.toString().length
      } else {
         // console.log('count:', count)
         // console.log('container offset:', containerOffset)
         // console.log(containerEl)
         // console.log(el)
         count++
      }
      i++
   }
   console.log({ containerEl, containerOffset, el, offset })
   return { el, offset }
}
function replaceCaret(containerEl, containerOffset) {
   const sel = window.getSelection()

   // console.log('offset:', offset)
   let el = containerEl
   let offset = containerOffset
   while (el !== undefined && el.nodeType !== 3 && el.childNodes.length > 0) {
      const res = getChildNode(el, offset)
      el = res.el
      offset = res.offset
   }

   // console.log(el)
   // console.log(offset)
   if(el === undefined) {
      el = document.createTextNode('')
      containerEl.appendChild(el)
      offset = 0
   }

   const range = document.createRange()
   range.setStart(el, offset)
   range.collapse(true)
   sel.removeAllRanges()
   sel.addRange(range)
}



/**   CONTENT EDITABLE CLASS    **/
export default class ContentEditable extends Component {
	lastHtml = this.props.html
	el = typeof this.props.innerRef === 'function' ? { current: null } : React.createRef()
   caretOffset = 0

	getEl = () => (this.props.innerRef && typeof this.props.innerRef !== 'function' ? this.props.innerRef : this.el).current

	render() {
		const { tagName, html, innerRef, ...props } = this.props

		return React.createElement(
			tagName || 'div',
			{
				...props,
				ref: typeof innerRef === 'function' ? (current) => {
					innerRef(current)
					this.el.current = current
				} : innerRef || this.el,
				onInput: this.emitChange,
				// onBlur: this.props.onBlur || this.emitChange,
				onKeyUp: this.onKeyUp,
				// onKeyDown: this.props.onKeyDown || this.emitChange,
				contentEditable: !this.props.disabled,
				dangerouslySetInnerHTML: { __html: html }
			},
			this.props.children)
	}

	shouldComponentUpdate(nextProps) {
		const { props } = this;
		const el = this.getEl();

		// We need not rerender if the change of props simply reflects the user's edits.
		// Rerendering in this case would make the cursor/caret jump
		if ( normalizeHtml(nextProps.html) !== normalizeHtml(el.innerHTML) ) {
         let caretOffset = 0
         let sel = window.getSelection()
         if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            const preCaretRange = range.cloneRange()
            preCaretRange.selectNodeContents(el)
            preCaretRange.setEnd(range.endContainer, range.endOffset)
            caretOffset = preCaretRange.toString().length
         }
         this.caretOffset = caretOffset
			return true
		};

		// ...or if html really changed... (programmatically, not by user edit)

		// Handle additional properties
		return props.disabled !== nextProps.disabled ||
			props.tagName !== nextProps.tagName ||
			props.className !== nextProps.className ||
			props.innerRef !== nextProps.innerRef ||
			!deepEqual(props.style, nextProps.style)
	}

	componentDidUpdate() {
		const el = this.getEl()
		if (!el) {
         return
      }

		// Perhaps React (whose VDOM gets outdated because we often prevent
		// rerendering) did not update the DOM. So we update it manually now.
		if (this.props.html !== el.innerHTML) {
			el.innerHTML = this.props.html
		}
		this.lastHtml = this.props.html
		replaceCaret(el, this.caretOffset)
	}

	emitChange = (originalEvt) => {
      // console.log(originalEvt)
		const el = this.getEl()
		if (!el) {
			return
		}

		const html = el.innerHTML
		if (this.props.onChange && html !== this.lastHtml) {
			// Clone event with Object.assign to avoid
			// "Cannot assign to read only property 'target' of object"
			const evt = Object.assign({}, originalEvt, {
				target: {
					value: html
				}
			})
			this.props.onChange(evt)
		}
		this.lastHtml = html
	}

   onKeyUp = (evt) => {

   }

	static propTypes = {
		html: PropTypes.string.isRequired,
		onChange: PropTypes.func,
		disabled: PropTypes.bool,
		tagName: PropTypes.string,
		className: PropTypes.string,
		style: PropTypes.object,
		innerRef: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.func,
		])
	}
}