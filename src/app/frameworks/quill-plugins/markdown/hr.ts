import Quill from 'quill'
const BlockEmbed = Quill.import('blots/block/embed')

class HorizontalRule extends BlockEmbed {
  static blotName: string
  static tagName: string
}
HorizontalRule.blotName = 'hr'
HorizontalRule.tagName = 'hr'
Quill.register('formats/horizontal', HorizontalRule)
export default HorizontalRule
